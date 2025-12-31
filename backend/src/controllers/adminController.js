const Invoice = require("../models/Invoice");
const User = require("../models/User");
const { sequelize } = require("../config/db");

/**
 * GET /admin/dashboard/summary
 * Get dashboard summary stats
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    const totalOrders = await Invoice.count();
    const totalInvoices = await Invoice.count();
    
    // Count unique users who placed orders (both registered and guests)
    const usersWithOrders = await sequelize.query(
      `SELECT COUNT(DISTINCT "userId") as count FROM invoices`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    const totalUsersWithOrders = usersWithOrders[0]?.count || 0;

    res.json({
      totalOrders,
      totalInvoices,
      totalUsersWithOrders,
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching dashboard summary", 
      error: error.message 
    });
  }
};

/**
 * GET /admin/dashboard/orders
 * Get all orders with user details and payment status
 */
exports.getDashboardOrders = async (req, res) => {
  try {
    const orders = await Invoice.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "email", "isGuest"],
        },
      ],
      order: [["createdAt", "DESC"]],
      raw: false,
    });

    // Format response with required fields
    const formattedOrders = orders.map((order) => {
      const plain = order.toJSON();
      return {
        orderId: plain.id,
        invoiceId: plain.invoiceNumber,
        userId: plain.userId,
        userName: plain.User?.email?.split("@")[0] || "Guest",
        userEmail: plain.User?.email || "guest@example.com",
        isGuest: plain.User?.isGuest || false,
        orderDate: plain.createdAt,
        paymentStatus: plain.paymentStatus,
        totalAmount: plain.totalAmount,
        status: plain.status,
      };
    });

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching dashboard orders", 
      error: error.message 
    });
  }
};
