const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");

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
    const { status, paymentStatus, paymentMethod, search, hasPreOrder, itemStatus } = req.query;
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
    console.error(error);
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
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi lấy chi tiết đơn hàng",
      error: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        message: "Không thể cập nhật đơn hàng đã hủy",
      });
    }

    if (orderStatus) {
      const validStatuses = ["processing", "partially_shipped", "shipped", "delivered", "cancelled"];
      if (!validStatuses.includes(orderStatus)) {
        return res.status(400).json({ message: "Trạng thái không hợp lệ" });
      }
      order.orderStatus = orderStatus;

      if (orderStatus === "cancelled" && order.paymentStatus !== "paid") {
        for (const item of order.cartItems) {
          // Only refund stock for non-preorder items
          if (!item.isPreOrder) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { quantity: item.quantity },
            });
          }
        }
      }
    }

    if (paymentStatus) {
      const validPaymentStatuses = ["pending", "paid", "failed"];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res
          .status(400)
          .json({ message: "Trạng thái thanh toán không hợp lệ" });
      }
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    res.status(200).json({
      message: "Cập nhật trạng thái đơn hàng thành công",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi cập nhật trạng thái đơn hàng",
      error: error.message,
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { reason } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (
      userRole !== "Admin" &&
      userRole !== "Staff" &&
      order.customer.toString() !== userId
    ) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền hủy đơn hàng này" });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({ message: "Đơn hàng đã bị hủy trước đó" });
    }

    if (order.orderStatus === "delivered") {
      return res
        .status(400)
        .json({ message: "Không thể hủy đơn hàng đã giao" });
    }

    if (
      userRole !== "Admin" &&
      userRole !== "Staff" &&
      order.orderStatus !== "processing"
    ) {
      return res.status(400).json({
        message: "Chỉ có thể hủy đơn hàng đang xử lý. Vui lòng liên hệ hỗ trợ.",
      });
    }

    order.orderStatus = "cancelled";
    if (reason) {
      order.note = order.note
        ? `${order.note}\n\nLý do hủy: ${reason}`
        : `Lý do hủy: ${reason}`;
    }

    if (order.paymentStatus !== "paid" || order.paymentMethod === "cod") {
      for (const item of order.cartItems) {
        // Only refund stock for non-preorder items
        if (!item.isPreOrder) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { quantity: item.quantity },
          });
        }
      }
    }

    await order.save();

    res.status(200).json({
      message: "Hủy đơn hàng thành công",
      order,
    });
  } catch (error) {
    console.error(error);
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
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi xác nhận nhận hàng",
      error: error.message,
    });
  }
};

const updateItemStatus = async (req, res) => {
  try {
    const { orderId, itemIndex } = req.params;
    const { itemStatus } = req.body;

    const validItemStatuses = ["available", "preorder_pending", "preorder_ready", "shipped"];
    if (!validItemStatuses.includes(itemStatus)) {
      return res.status(400).json({ message: "Trạng thái item không hợp lệ" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (!order.cartItems[itemIndex]) {
      return res.status(404).json({ message: "Không tìm thấy item trong đơn hàng" });
    }

    order.cartItems[itemIndex].itemStatus = itemStatus;
    await order.save();

    res.status(200).json({
      message: "Cập nhật trạng thái item thành công",
      order,
    });
  } catch (error) {
    console.error(error);
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
      .populate("cartItems.product", "name images")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Lấy danh sách đơn hàng pre-order thành công",
      orders,
      total: orders.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách đơn hàng pre-order",
      error: error.message,
    });
  }
};

const notifyPreOrderReady = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("customer", "fullname email");
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (!order.hasPreOrderItems) {
      return res.status(400).json({ message: "Đơn hàng này không có sản phẩm pre-order" });
    }

    // Kiểm tra xem có item nào preorder_ready không
    const hasReadyItems = order.cartItems.some(
      (item) => item.itemStatus === "preorder_ready"
    );

    if (!hasReadyItems) {
      return res.status(400).json({
        message: "Không có sản phẩm pre-order nào sẵn sàng để thông báo",
      });
    }

    // TODO: Gửi email/notification cho khách hàng
    // Có thể tích hợp với mailer service
    // await sendEmail(order.customer.email, 'Pre-order ready', ...)

    res.status(200).json({
      message: "Thông báo đã được gửi cho khách hàng",
      customerEmail: order.customer.email,
      customerName: order.customer.fullname,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi gửi thông báo pre-order",
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
  // Pre-order functions
  updateItemStatus,
  getPreOrderOrders,
  notifyPreOrderReady,
};
