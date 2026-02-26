const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const {
  confirmPendingPoints,
  cancelPendingPoints,
} = require("../services/pointService");
const { createNotification } = require("./NotificationController");
const { createMomoUrl, createVnpayUrl } = require("./CheckoutController");

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { status } = req.query;
    const query = { customer: userId };

    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate("cartItems.product", "name imageUrl")
      .populate("voucherUsed", "code discountPercentage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Lấy danh sách đơn hàng thành công",
      orders,
      total: orders.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách đơn hàng",
      error: error.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      paymentMethod,
      search,
      hasPreOrder,
      itemStatus,
    } = req.query;
    const query = {};

    if (status) {
      query.orderStatus = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (hasPreOrder === "true" || hasPreOrder === true) {
      query.hasPreOrderItems = true;
    }

    if (itemStatus) {
      query["cartItems.itemStatus"] = itemStatus;
    }

    if (search) {
      query.$or = [
        { phone: { $regex: search, $options: "i" } },
        { shippingAddress: { $regex: search, $options: "i" } },
      ];
    }

    const orders = await Order.find(query)
      .populate("customer", "fullname email phone")
      .populate("cartItems.product", "name imageUrl")
      .populate("voucherUsed", "code discountPercentage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Lấy danh sách đơn hàng thành công",
      orders,
      total: orders.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách đơn hàng",
      error: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const order = await Order.findById(id)
      .populate("customer", "fullname email phone address")
      .populate("cartItems.product", "name imageUrl price")
      .populate("voucherUsed", "code discountPercentage minOrderValue");

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (
      userRole !== "Admin" &&
      userRole !== "Staff" &&
      order.customer._id.toString() !== userId
    ) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xem đơn hàng này" });
    }

    res.status(200).json({
      message: "Lấy chi tiết đơn hàng thành công",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy chi tiết đơn hàng",
      error: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  const session = await require("mongoose").startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(id).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.orderStatus === "cancelled") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Không thể cập nhật đơn hàng đã hủy",
      });
    }

    if (orderStatus) {
      const validStatuses = [
        "processing",
        "partially_shipped",
        "shipped",
        "delivered",
        "cancelled",
      ];
      if (!validStatuses.includes(orderStatus)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Trạng thái không hợp lệ" });
      }
      order.orderStatus = orderStatus;

      // ✅ FIX 3: Hoàn stock trong transaction khi cancel
      if (orderStatus === "cancelled") {
        for (const item of order.cartItems) {
          // Only refund stock for non-preorder items and items in preorder_ready status
          if (
            !item.isPreOrder ||
            (item.isPreOrder && item.itemStatus === "preorder_ready")
          ) {
            await Product.findByIdAndUpdate(
              item.product,
              { $inc: { quantity: item.quantity } },
              { session },
            );
          }
        }
      }
    }

    if (paymentStatus) {
      const validPaymentStatuses = ["pending", "paid", "failed"];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: "Trạng thái thanh toán không hợp lệ" });
      }
      order.paymentStatus = paymentStatus;
    }

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Xử lý điểm sau khi commit transaction
    const userId = order.customer._id || order.customer;

    // Xác nhận điểm khi order delivered
    if (orderStatus === "delivered") {
      try {
        await confirmPendingPoints(userId, order._id);
      } catch (pointError) {
        // Log error but don't fail the request
      }
    }

    // Hủy pending points khi order cancelled
    if (orderStatus === "cancelled") {
      try {
        await cancelPendingPoints(userId, order._id);
      } catch (pointError) {
        // Log error but don't fail the request
      }
    }

    // Create notification for order status change
    if (orderStatus) {
      try {
        const statusMessages = {
          processing: "Đơn hàng đang được xử lý",
          shipped: "Đơn hàng đang được giao tới bạn",
          delivered: "Đơn hàng đã được giao thành công",
          cancelled: "Đơn hàng đã bị hủy",
          partially_shipped: "Đơn hàng đã giao một phần",
        };

        await createNotification({
          userId: userId,
          type: "order_status_changed",
          title: "Trạng thái đơn hàng thay đổi",
          message: `${statusMessages[orderStatus] || "Đơn hàng đã cập nhật"}. Mã đơn: #${order._id.toString().slice(-6).toUpperCase()}`,
          orderId: order._id,
          data: {
            oldStatus: order.orderStatus,
            newStatus: orderStatus,
          },
          link: `/track-order`,
        });
      } catch (notifError) {
        console.error("Failed to create notification:", notifError);
      }
    }

    res.status(200).json({
      message: "Cập nhật trạng thái đơn hàng thành công",
      order,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      message: "Lỗi khi cập nhật trạng thái đơn hàng",
      error: error.message,
    });
  }
};

const cancelOrder = async (req, res) => {
  const session = await require("mongoose").startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { reason } = req.body;

    const order = await Order.findById(id).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (
      userRole !== "Admin" &&
      userRole !== "Staff" &&
      order.customer.toString() !== userId
    ) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(403)
        .json({ message: "Bạn không có quyền hủy đơn hàng này" });
    }

    if (order.orderStatus === "cancelled") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Đơn hàng đã bị hủy trước đó" });
    }

    if (order.orderStatus === "delivered") {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Không thể hủy đơn hàng đã giao" });
    }

    // User chỉ có thể hủy đơn hàng khi chưa ở trạng thái "Đang Giao" hoặc "Đã Giao"
    if (
      userRole !== "Admin" &&
      userRole !== "Staff" &&
      (order.orderStatus === "shipped" || order.orderStatus === "delivered")
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message:
          "Không thể hủy đơn hàng đang giao hoặc đã giao. Vui lòng liên hệ hỗ trợ.",
      });
    }

    order.orderStatus = "cancelled";
    if (reason) {
      order.note = order.note
        ? `${order.note}\n\nLý do hủy: ${reason}`
        : `Lý do hủy: ${reason}`;
    }

    // ✅ FIX 3: Hoàn stock trong transaction - luôn hoàn stock khi hủy đơn
    for (const item of order.cartItems) {
      // Only refund stock for non-preorder items and items not in preorder_pending status
      if (
        !item.isPreOrder ||
        (item.isPreOrder && item.itemStatus === "preorder_ready")
      ) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { quantity: item.quantity } },
          { session },
        );
      }
    }

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Hủy pending points
    try {
      await cancelPendingPoints(userId, order._id);
    } catch (pointError) {
      // Log error but don't fail the request
    }

    res.status(200).json({
      message: "Hủy đơn hàng thành công",
      order,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      message: "Lỗi khi hủy đơn hàng",
      error: error.message,
    });
  }
};

const confirmDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.customer.toString() !== userId) {
      return res.status(403).json({
        message: "Bạn không có quyền xác nhận đơn hàng này",
      });
    }

    if (order.orderStatus !== "shipped") {
      return res.status(400).json({
        message: "Chỉ có thể xác nhận đơn hàng đang được giao",
      });
    }

    order.orderStatus = "delivered";

    if (order.paymentMethod === "cod") {
      order.paymentStatus = "paid";
    }

    await order.save();

    res.status(200).json({
      message: "Xác nhận nhận hàng thành công",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xác nhận nhận hàng",
      error: error.message,
    });
  }
};

const updateItemStatus = async (req, res) => {
  const session = await require("mongoose").startSession();
  session.startTransaction();

  try {
    const { orderId, itemIndex } = req.params;
    const { itemStatus } = req.body;

    const validItemStatuses = [
      "available",
      "preorder_pending",
      "preorder_ready",
      "shipped",
    ];
    if (!validItemStatuses.includes(itemStatus)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Trạng thái item không hợp lệ" });
    }

    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (!order.cartItems[itemIndex]) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ message: "Không tìm thấy item trong đơn hàng" });
    }

    const item = order.cartItems[itemIndex];
    const oldStatus = item.itemStatus;

    // ✅ FIX 5: Trừ stock khi chuyển từ preorder_pending → preorder_ready
    if (
      oldStatus === "preorder_pending" &&
      itemStatus === "preorder_ready" &&
      item.isPreOrder
    ) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      }

      if (product.quantity < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: `Sản phẩm "${product.name}" không đủ tồn kho để chuyển sang trạng thái ready (cần ${item.quantity}, còn ${product.quantity})`,
        });
      }

      // Trừ tồn kho
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { quantity: -item.quantity } },
        { session },
      );
    }

    order.cartItems[itemIndex].itemStatus = itemStatus;
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Cập nhật trạng thái item thành công",
      order,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      message: "Lỗi khi cập nhật trạng thái item",
      error: error.message,
    });
  }
};

const getPreOrderOrders = async (req, res) => {
  try {
    const { itemStatus } = req.query;
    const query = { hasPreOrderItems: true };

    if (itemStatus) {
      query["cartItems.itemStatus"] = itemStatus;
    }

    const orders = await Order.find(query)
      .populate("customer", "fullname email phone")
      .populate("cartItems.product", "name imageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Lấy danh sách đơn hàng pre-order thành công",
      orders,
      total: orders.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách đơn hàng pre-order",
      error: error.message,
    });
  }
};

const notifyPreOrderReady = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate(
      "customer",
      "fullname email",
    );
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (!order.hasPreOrderItems) {
      return res
        .status(400)
        .json({ message: "Đơn hàng này không có sản phẩm pre-order" });
    }

    // Kiểm tra xem có item nào preorder_ready không
    const hasReadyItems = order.cartItems.some(
      (item) => item.itemStatus === "preorder_ready",
    );

    if (!hasReadyItems) {
      return res.status(400).json({
        message: "Không có sản phẩm pre-order nào sẵn sàng để thông báo",
      });
    }

    // Create notification for pre-order ready
    try {
      const customerId = order.customer._id || order.customer;
      await createNotification({
        userId: customerId,
        type: "preorder_ready",
        title: "Hàng đặt trước đã về",
        message: `Sản phẩm đặt trước trong đơn hàng #${order._id.toString().slice(-6).toUpperCase()} đã có sẵn và sẵn sàng giao. Vui lòng kiểm tra đơn hàng của bạn.`,
        orderId: order._id,
        data: {
          orderNumber: order._id.toString().slice(-6).toUpperCase(),
        },
        link: `/track-order`,
      });
    } catch (notifError) {
      console.error("Failed to create pre-order notification:", notifError);
    }

    res.status(200).json({
      message: "Thông báo đã được gửi cho khách hàng",
      customerEmail: order.customer.email,
      customerName: order.customer.fullname,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi gửi thông báo pre-order",
      error: error.message,
    });
  }
};

/**
 * Retry payment for failed/pending orders
 */
const retryPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Tìm đơn hàng
    const order = await Order.findById(id).populate("customer");

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Kiểm tra quyền (chỉ chủ đơn hàng hoặc Admin/Staff)
    const userRole = req.user?.role;
    if (
      userRole !== "Admin" &&
      userRole !== "Staff" &&
      order.customer._id.toString() !== userId
    ) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền truy cập đơn hàng này" });
    }

    // Kiểm tra trạng thái đơn hàng (chỉ cho phép retry nếu pending hoặc failed)
    if (order.paymentStatus !== "pending" && order.paymentStatus !== "failed") {
      return res.status(400).json({
        message:
          "Chỉ có thể thanh toán lại đơn hàng chưa thanh toán hoặc thanh toán thất bại",
        currentStatus: order.paymentStatus,
      });
    }

    // Kiểm tra phương thức thanh toán
    if (order.paymentMethod === "cod") {
      return res.status(400).json({
        message: "Đơn hàng COD không cần thanh toán online",
      });
    }

    // Kiểm tra đơn hàng đã bị hủy chưa
    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        message: "Không thể thanh toán lại đơn hàng đã hủy",
      });
    }

    // Tạo payment URL mới
    let paymentUrl;

    try {
      if (order.paymentMethod === "momo") {
        paymentUrl = await createMomoUrl(order);
      } else if (order.paymentMethod === "vnpay") {
        paymentUrl = createVnpayUrl(order, req);
      } else {
        return res.status(400).json({
          message: "Phương thức thanh toán không hợp lệ",
        });
      }

      // Cập nhật trạng thái về pending nếu đang là failed
      if (order.paymentStatus === "failed") {
        order.paymentStatus = "pending";
        order.orderStatus = "pending_payment";
        await order.save();
      }

      res.status(200).json({
        message: "Tạo link thanh toán mới thành công",
        paymentUrl,
        orderId: order._id,
        amount: order.totalAmount,
        paymentMethod: order.paymentMethod,
      });
    } catch (paymentError) {
      console.error("Payment URL generation error:", paymentError);
      return res.status(500).json({
        message: "Không thể tạo link thanh toán",
        error: paymentError.message,
      });
    }
  } catch (error) {
    console.error("Retry payment error:", error);
    res.status(500).json({
      message: "Lỗi khi tạo link thanh toán mới",
      error: error.message,
    });
  }
};

module.exports = {
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  confirmDelivery,
  retryPayment,
  // Pre-order functions
  updateItemStatus,
  getPreOrderOrders,
  notifyPreOrderReady,
};
