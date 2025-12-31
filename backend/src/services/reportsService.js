const Invoice = require("../models/Invoice");
const Product = require("../models/Product");
const User = require("../models/User");
const { sequelize } = require("../config/db");

/**
 * KPI 1: Total Sales in last X days
 */
exports.getTotalSales = async (daysBack = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const result = await Invoice.findAll({
      attributes: [
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "totalSales"],
        [sequelize.fn("COUNT", sequelize.col("id")), "invoiceCount"],
      ],
      where: {
        createdAt: { [sequelize.Op.gte]: startDate },
        paymentStatus: "completed",
      },
      raw: true,
    });

    return {
      totalSales: parseFloat(result[0].totalSales) || 0,
      invoiceCount: parseInt(result[0].invoiceCount) || 0,
      period: `Last ${daysBack} days`,
    };
  } catch (error) {
    console.error("Error calculating total sales:", error.message);
    return { totalSales: 0, invoiceCount: 0, period: `Last ${daysBack} days` };
  }
};

/**
 * KPI 2: Average Transaction Value
 */
exports.getAverageTransactionValue = async (daysBack = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const result = await Invoice.findAll({
      attributes: [
        [sequelize.fn("AVG", sequelize.col("totalAmount")), "avgValue"],
      ],
      where: {
        createdAt: { [sequelize.Op.gte]: startDate },
        paymentStatus: "completed",
      },
      raw: true,
    });

    return {
      averageTransactionValue: parseFloat(result[0].avgValue) || 0,
      period: `Last ${daysBack} days`,
    };
  } catch (error) {
    console.error("Error calculating average transaction value:", error.message);
    return { averageTransactionValue: 0, period: `Last ${daysBack} days` };
  }
};

/**
 * KPI 3: Most Purchased Products
 */
exports.getMostPurchasedProducts = async (limit = 10, daysBack = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const invoices = await Invoice.findAll({
      where: {
        createdAt: { [sequelize.Op.gte]: startDate },
        paymentStatus: "completed",
      },
      attributes: ["items"],
      raw: true,
    });

    // Aggregate items
    const productSales = {};

    invoices.forEach((invoice) => {
      if (invoice.items && Array.isArray(invoice.items)) {
        invoice.items.forEach((item) => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = {
              productId: item.productId,
              productName: item.productName,
              totalQuantity: 0,
              totalRevenue: 0,
            };
          }
          productSales[item.productId].totalQuantity += item.quantity;
          productSales[item.productId].totalRevenue += item.subtotal;
        });
      }
    });

    // Sort by total quantity and limit
    const sorted = Object.values(productSales)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);

    return {
      topProducts: sorted,
      period: `Last ${daysBack} days`,
    };
  } catch (error) {
    console.error("Error calculating most purchased products:", error.message);
    return { topProducts: [], period: `Last ${daysBack} days` };
  }
};

/**
 * KPI 4: Number of Active Customers
 */
exports.getActiveCustomers = async (daysBack = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const result = await Invoice.findAll({
      attributes: [[sequelize.fn("DISTINCT", sequelize.col("userId")), "uniqueUsers"]],
      where: {
        createdAt: { [sequelize.Op.gte]: startDate },
        paymentStatus: "completed",
      },
      raw: true,
    });

    // Count total customers
    const totalCustomers = await User.count({
      where: { role: "customer" },
    });

    return {
      activeCustomers: result.length,
      totalCustomers: totalCustomers,
      period: `Last ${daysBack} days`,
    };
  } catch (error) {
    console.error("Error calculating active customers:", error.message);
    return { activeCustomers: 0, totalCustomers: 0, period: `Last ${daysBack} days` };
  }
};

/**
 * KPI 5: Low Stock Products
 */
exports.getLowStockProducts = async (threshold = 10) => {
  try {
    const products = await Product.findAll({
      where: {
        quantityInStock: { [sequelize.Op.lte]: threshold },
      },
      attributes: ["id", "name", "category", "quantityInStock", "price"],
      order: [["quantityInStock", "ASC"]],
      raw: true,
    });

    return {
      lowStockProducts: products,
      threshold: threshold,
      count: products.length,
    };
  } catch (error) {
    console.error("Error calculating low stock products:", error.message);
    return { lowStockProducts: [], threshold: threshold, count: 0 };
  }
};

/**
 * KPI 6: Revenue by Category
 */
exports.getRevenueByCategory = async (daysBack = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const invoices = await Invoice.findAll({
      where: {
        createdAt: { [sequelize.Op.gte]: startDate },
        paymentStatus: "completed",
      },
      attributes: ["items"],
      raw: true,
    });

    // Need to match products to get categories
    const categoryRevenue = {};

    for (const invoice of invoices) {
      if (invoice.items && Array.isArray(invoice.items)) {
        for (const item of invoice.items) {
          const product = await Product.findByPk(item.productId);
          if (product) {
            if (!categoryRevenue[product.category]) {
              categoryRevenue[product.category] = {
                category: product.category,
                revenue: 0,
                quantity: 0,
              };
            }
            categoryRevenue[product.category].revenue += item.subtotal;
            categoryRevenue[product.category].quantity += item.quantity;
          }
        }
      }
    }

    const sorted = Object.values(categoryRevenue).sort((a, b) => b.revenue - a.revenue);

    return {
      revenueByCategory: sorted,
      period: `Last ${daysBack} days`,
    };
  } catch (error) {
    console.error("Error calculating revenue by category:", error.message);
    return { revenueByCategory: [], period: `Last ${daysBack} days` };
  }
};

/**
 * Get all KPIs at once
 */
exports.getAllKPIs = async (daysBack = 30) => {
  try {
    const [totalSales, avgTransaction, topProducts, activeCustomers, lowStock, revenueByCategory] = await Promise.all([
      exports.getTotalSales(daysBack),
      exports.getAverageTransactionValue(daysBack),
      exports.getMostPurchasedProducts(5, daysBack),
      exports.getActiveCustomers(daysBack),
      exports.getLowStockProducts(10),
      exports.getRevenueByCategory(daysBack),
    ]);

    return {
      summary: {
        totalSales: totalSales.totalSales,
        invoiceCount: totalSales.invoiceCount,
        averageTransactionValue: avgTransaction.averageTransactionValue,
        activeCustomers: activeCustomers.activeCustomers,
        totalCustomers: activeCustomers.totalCustomers,
      },
      details: {
        totalSales,
        avgTransaction,
        topProducts,
        activeCustomers,
        lowStock,
        revenueByCategory,
      },
      period: `Last ${daysBack} days`,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error calculating all KPIs:", error.message);
    return { error: error.message };
  }
};
