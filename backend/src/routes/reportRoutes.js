const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminOnly");

const {
  getReports,
  getSalesReport,
  getAverageTransactionReport,
  getTopProductsReport,
  getActiveCustomersReport,
  getLowStockReport,
  getRevenueByCategoryReport,
} = require("../controllers/reportController");

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Get all KPIs and analytics (Admin only)
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *         description: Number of days back (default 30)
 *     responses:
 *       200:
 *         description: KPIs and analytics data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get("/", auth, adminOnly, getReports);

/**
 * @swagger
 * /reports/sales:
 *   get:
 *     summary: Get total sales KPI (Admin only)
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Total sales data
 */
router.get("/sales", auth, adminOnly, getSalesReport);

/**
 * @swagger
 * /reports/average-transaction:
 *   get:
 *     summary: Get average transaction value KPI (Admin only)
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Average transaction data
 */
router.get("/average-transaction", auth, adminOnly, getAverageTransactionReport);

/**
 * @swagger
 * /reports/top-products:
 *   get:
 *     summary: Get most purchased products KPI (Admin only)
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Top products data
 */
router.get("/top-products", auth, adminOnly, getTopProductsReport);

/**
 * @swagger
 * /reports/active-customers:
 *   get:
 *     summary: Get active customers KPI (Admin only)
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Active customers data
 */
router.get("/active-customers", auth, adminOnly, getActiveCustomersReport);

/**
 * @swagger
 * /reports/low-stock:
 *   get:
 *     summary: Get low stock products KPI (Admin only)
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Low stock products data
 */
router.get("/low-stock", auth, adminOnly, getLowStockReport);

/**
 * @swagger
 * /reports/revenue-by-category:
 *   get:
 *     summary: Get revenue by category KPI (Admin only)
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Revenue by category data
 */
router.get("/revenue-by-category", auth, adminOnly, getRevenueByCategoryReport);

module.exports = router;
