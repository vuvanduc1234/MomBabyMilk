const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");
const moment = require("moment");

const getRevenueOverview = async (req, res) => {
  try {
    const { startDate, endDate, period = "day" } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter.createdAt = { $gte: thirtyDaysAgo };
    }

    const orders = await Order.find({
      ...dateFilter,
      paymentStatus: "paid",
    });

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const totalWithVoucher = orders.filter((o) => o.voucherUsed).length;

    const paymentMethodBreakdown = {
      cod: orders.filter((o) => o.paymentMethod === "cod").length,
      momo: orders.filter((o) => o.paymentMethod === "momo").length,
      vnpay: orders.filter((o) => o.paymentMethod === "vnpay").length,
    };

    const orderStatusBreakdown = {
      processing: orders.filter((o) => o.orderStatus === "processing").length,
      shipped: orders.filter((o) => o.orderStatus === "shipped").length,
      delivered: orders.filter((o) => o.orderStatus === "delivered").length,
      cancelled: orders.filter((o) => o.orderStatus === "cancelled").length,
    };

    const preOrderStats = {
      totalWithPreOrder: orders.filter((o) => o.hasPreOrderItems).length,
      preOrderRevenue: orders
        .filter((o) => o.hasPreOrderItems)
        .reduce((sum, order) => sum + order.totalAmount, 0),
    };

    const previousPeriodFilter = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diff = end - start;
      previousPeriodFilter.createdAt = {
        $gte: new Date(start - diff),
        $lt: start,
      };
    } else {
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      previousPeriodFilter.createdAt = {
        $gte: sixtyDaysAgo,
        $lt: thirtyDaysAgo,
      };
    }

    const previousOrders = await Order.find({
      ...previousPeriodFilter,
      paymentStatus: "paid",
    });

    const previousRevenue = previousOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );

    const revenueGrowth =
      previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    res.status(200).json({
      message: "Lấy thống kê doanh thu thành công",
      data: {
        overview: {
          totalRevenue,
          totalOrders,
          averageOrderValue: Math.round(averageOrderValue),
          revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
        },
        paymentMethods: paymentMethodBreakdown,
        orderStatus: orderStatusBreakdown,
        promotions: {
          ordersWithVoucher: totalWithVoucher,
        },
        preOrder: preOrderStats,
        period: {
          startDate:
            startDate || moment().subtract(30, "days").format("YYYY-MM-DD"),
          endDate: endDate || moment().format("YYYY-MM-DD"),
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi lấy thống kê doanh thu",
      error: error.message,
    });
  }
};

const getRevenueChart = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;

    let start = startDate ? new Date(startDate) : new Date();
    let end = endDate ? new Date(endDate) : new Date();

    if (!startDate) {
      start.setDate(start.getDate() - 30);
    }

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      paymentStatus: "paid",
    }).sort({ createdAt: 1 });

    const chartData = [];
    let groupFormat, dateFormat;

    switch (groupBy) {
      case "hour":
        groupFormat = "YYYY-MM-DD HH:00";
        dateFormat = "HH:00";
        break;
      case "day":
        groupFormat = "YYYY-MM-DD";
        dateFormat = "DD/MM";
        break;
      case "week":
        groupFormat = "YYYY-[W]WW";
        dateFormat = "[Tuần] WW";
        break;
      case "month":
        groupFormat = "YYYY-MM";
        dateFormat = "MM/YYYY";
        break;
      case "year":
        groupFormat = "YYYY";
        dateFormat = "YYYY";
        break;
      default:
        groupFormat = "YYYY-MM-DD";
        dateFormat = "DD/MM";
    }

    const groupedData = {};

    orders.forEach((order) => {
      const key = moment(order.createdAt).format(groupFormat);
      if (!groupedData[key]) {
        groupedData[key] = {
          revenue: 0,
          orders: 0,
          date: key,
          displayDate: moment(order.createdAt).format(dateFormat),
        };
      }
      groupedData[key].revenue += order.totalAmount;
      groupedData[key].orders += 1;
    });

    const sortedKeys = Object.keys(groupedData).sort();
    sortedKeys.forEach((key) => {
      chartData.push(groupedData[key]);
    });

    res.status(200).json({
      message: "Lấy biểu đồ doanh thu thành công",
      data: chartData,
      summary: {
        totalRevenue: chartData.reduce((sum, item) => sum + item.revenue, 0),
        totalOrders: chartData.reduce((sum, item) => sum + item.orders, 0),
        dataPoints: chartData.length,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi lấy biểu đồ doanh thu",
      error: error.message,
    });
  }
};

const getTopProducts = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const orders = await Order.find({
      ...dateFilter,
      paymentStatus: "paid",
    }).populate("cartItems.product", "name imageUrl category brand");

    const productStats = {};

    orders.forEach((order) => {
      order.cartItems.forEach((item) => {
        const productId = item.product?._id?.toString();
        if (!productId) return;

        if (!productStats[productId]) {
          productStats[productId] = {
            productId,
            name: item.name,
            image: item.product?.imageUrl?.[0] || null,
            category: item.product?.category || null,
            brand: item.product?.brand || null,
            totalQuantity: 0,
            totalRevenue: 0,
            orderCount: 0,
            isPreOrder: item.isPreOrder || false,
          };
        }

        productStats[productId].totalQuantity += item.quantity;
        productStats[productId].totalRevenue += item.price * item.quantity;
        productStats[productId].orderCount += 1;
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, parseInt(limit));

    res.status(200).json({
      message: "Lấy top sản phẩm bán chạy thành công",
      data: topProducts,
      total: topProducts.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi lấy top sản phẩm",
      error: error.message,
    });
  }
};

const getOrdersStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const allOrders = await Order.find(dateFilter);

    const stats = {
      total: allOrders.length,
      byStatus: {
        processing: allOrders.filter((o) => o.orderStatus === "processing")
          .length,
        shipped: allOrders.filter((o) => o.orderStatus === "shipped").length,
        delivered: allOrders.filter((o) => o.orderStatus === "delivered")
          .length,
        cancelled: allOrders.filter((o) => o.orderStatus === "cancelled")
          .length,
      },
      byPaymentStatus: {
        pending: allOrders.filter((o) => o.paymentStatus === "pending").length,
        paid: allOrders.filter((o) => o.paymentStatus === "paid").length,
        failed: allOrders.filter((o) => o.paymentStatus === "failed").length,
      },
      byPaymentMethod: {
        cod: allOrders.filter((o) => o.paymentMethod === "cod").length,
        momo: allOrders.filter((o) => o.paymentMethod === "momo").length,
        vnpay: allOrders.filter((o) => o.paymentMethod === "vnpay").length,
      },
      preOrders: {
        total: allOrders.filter((o) => o.hasPreOrderItems).length,
        percentage:
          allOrders.length > 0
            ? (
                (allOrders.filter((o) => o.hasPreOrderItems).length /
                  allOrders.length) *
                100
              ).toFixed(2)
            : 0,
      },
      averageOrderValue:
        allOrders.length > 0
          ? Math.round(
              allOrders.reduce((sum, o) => sum + o.totalAmount, 0) /
                allOrders.length,
            )
          : 0,
    };

    res.status(200).json({
      message: "Lấy thống kê đơn hàng thành công",
      data: stats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi lấy thống kê đơn hàng",
      error: error.message,
    });
  }
};

const getCustomersStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const totalUsers = await User.countDocuments({ role: "User" });
    const newUsers = await User.countDocuments({
      role: "User",
      ...dateFilter,
    });

    const orders = await Order.find({
      ...dateFilter,
      paymentStatus: "paid",
    });

    const uniqueCustomers = new Set(orders.map((o) => o.customer.toString()))
      .size;

    const customerOrderCount = {};
    orders.forEach((order) => {
      const customerId = order.customer.toString();
      customerOrderCount[customerId] =
        (customerOrderCount[customerId] || 0) + 1;
    });

    const returningCustomers = Object.values(customerOrderCount).filter(
      (count) => count > 1,
    ).length;

    const customerRetentionRate =
      uniqueCustomers > 0 ? (returningCustomers / uniqueCustomers) * 100 : 0;

    const topCustomers = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          ...(startDate && endDate
            ? {
                createdAt: {
                  $gte: new Date(startDate),
                  $lte: new Date(endDate),
                },
              }
            : {}),
        },
      },
      {
        $group: {
          _id: "$customer",
          totalSpent: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "customerInfo",
        },
      },
      { $unwind: "$customerInfo" },
      {
        $project: {
          customerId: "$_id",
          fullname: "$customerInfo.fullname",
          email: "$customerInfo.email",
          phone: "$customerInfo.phone",
          totalSpent: 1,
          orderCount: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      message: "Lấy thống kê khách hàng thành công",
      data: {
        total: totalUsers,
        newCustomers: newUsers,
        activeCustomers: uniqueCustomers,
        returningCustomers,
        customerRetentionRate: parseFloat(customerRetentionRate.toFixed(2)),
        topCustomers,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi lấy thống kê khách hàng",
      error: error.message,
    });
  }
};

const getRevenueByCategory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const orders = await Order.find({
      ...dateFilter,
      paymentStatus: "paid",
    }).populate({
      path: "cartItems.product",
      populate: {
        path: "category",
        select: "name",
      },
    });

    const categoryStats = {};

    orders.forEach((order) => {
      order.cartItems.forEach((item) => {
        if (!item.product?.category) return;

        const categoryId = item.product.category._id.toString();
        const categoryName = item.product.category.name;

        if (!categoryStats[categoryId]) {
          categoryStats[categoryId] = {
            categoryId,
            categoryName,
            totalRevenue: 0,
            totalQuantity: 0,
            orderCount: 0,
          };
        }

        categoryStats[categoryId].totalRevenue += item.price * item.quantity;
        categoryStats[categoryId].totalQuantity += item.quantity;
        categoryStats[categoryId].orderCount += 1;
      });
    });

    const categoryData = Object.values(categoryStats).sort(
      (a, b) => b.totalRevenue - a.totalRevenue,
    );

    const totalRevenue = categoryData.reduce(
      (sum, cat) => sum + cat.totalRevenue,
      0,
    );

    categoryData.forEach((cat) => {
      cat.percentage =
        totalRevenue > 0
          ? parseFloat(((cat.totalRevenue / totalRevenue) * 100).toFixed(2))
          : 0;
    });

    res.status(200).json({
      message: "Lấy doanh thu theo danh mục thành công",
      data: categoryData,
      summary: {
        totalCategories: categoryData.length,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi lấy doanh thu theo danh mục",
      error: error.message,
    });
  }
};

const getRevenueSummary = async (req, res) => {
  try {
    const today = moment().startOf("day");
    const thisWeekStart = moment().startOf("week");
    const thisMonthStart = moment().startOf("month");
    const thisYearStart = moment().startOf("year");

    const getTotalRevenue = async (startDate) => {
      const orders = await Order.find({
        createdAt: { $gte: startDate.toDate() },
        paymentStatus: "paid",
      });
      return {
        revenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
        orders: orders.length,
      };
    };

    const [todayStats, weekStats, monthStats, yearStats, allTimeStats] =
      await Promise.all([
        getTotalRevenue(today),
        getTotalRevenue(thisWeekStart),
        getTotalRevenue(thisMonthStart),
        getTotalRevenue(thisYearStart),
        Order.find({ paymentStatus: "paid" }).then((orders) => ({
          revenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
          orders: orders.length,
        })),
      ]);

    res.status(200).json({
      message: "Lấy tổng quan doanh thu thành công",
      data: {
        today: todayStats,
        thisWeek: weekStats,
        thisMonth: monthStats,
        thisYear: yearStats,
        allTime: allTimeStats,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi lấy tổng quan doanh thu",
      error: error.message,
    });
  }
};

module.exports = {
  getRevenueOverview,
  getRevenueChart,
  getTopProducts,
  getOrdersStats,
  getCustomersStats,
  getRevenueByCategory,
  getRevenueSummary,
};
