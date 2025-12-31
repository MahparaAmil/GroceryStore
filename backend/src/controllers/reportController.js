const {
  getTotalSales,
  getAverageTransactionValue,
  getMostPurchasedProducts,
  getActiveCustomers,
  getLowStockProducts,
  getRevenueByCategory,
  getAllKPIs,
} = require("../services/reportsService");

/**
 * GET /reports - Get all KPIs and analytics
 */
exports.getReports = async (req, res) => {
  try {
    const daysBack = req.query.days ? parseInt(req.query.days) : 30;

    const kpis = await getAllKPIs(daysBack);

    res.json(kpis);
  } catch (error) {
    res.status(500).json({ message: "Error generating reports", error: error.message });
  }
};

/**
 * GET /reports/sales - Total sales KPI
 */
exports.getSalesReport = async (req, res) => {
  try {
    const daysBack = req.query.days ? parseInt(req.query.days) : 30;
    const sales = await getTotalSales(daysBack);

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: "Error generating sales report", error: error.message });
  }
};

/**
 * GET /reports/average-transaction - Average transaction value KPI
 */
exports.getAverageTransactionReport = async (req, res) => {
  try {
    const daysBack = req.query.days ? parseInt(req.query.days) : 30;
    const avg = await getAverageTransactionValue(daysBack);

    res.json(avg);
  } catch (error) {
    res.status(500).json({ message: "Error generating transaction report", error: error.message });
  }
};

/**
 * GET /reports/top-products - Most purchased products KPI
 */
exports.getTopProductsReport = async (req, res) => {
  try {
    const daysBack = req.query.days ? parseInt(req.query.days) : 30;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const topProducts = await getMostPurchasedProducts(limit, daysBack);

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ message: "Error generating top products report", error: error.message });
  }
};

/**
 * GET /reports/active-customers - Active customers KPI
 */
exports.getActiveCustomersReport = async (req, res) => {
  try {
    const daysBack = req.query.days ? parseInt(req.query.days) : 30;
    const customers = await getActiveCustomers(daysBack);

    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Error generating customers report", error: error.message });
  }
};

/**
 * GET /reports/low-stock - Low stock products KPI
 */
exports.getLowStockReport = async (req, res) => {
  try {
    const threshold = req.query.threshold ? parseInt(req.query.threshold) : 10;
    const lowStock = await getLowStockProducts(threshold);

    res.json(lowStock);
  } catch (error) {
    res.status(500).json({ message: "Error generating low stock report", error: error.message });
  }
};

/**
 * GET /reports/revenue-by-category - Revenue by category KPI
 */
exports.getRevenueByCategoryReport = async (req, res) => {
  try {
    const daysBack = req.query.days ? parseInt(req.query.days) : 30;
    const revenue = await getRevenueByCategory(daysBack);

    res.json(revenue);
  } catch (error) {
    res.status(500).json({ message: "Error generating revenue report", error: error.message });
  }
};
