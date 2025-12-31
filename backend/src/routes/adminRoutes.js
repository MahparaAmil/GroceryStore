const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminOnly");

const {
  getDashboardSummary,
  getDashboardOrders,
} = require("../controllers/adminController");

/**
 * @swagger
 * /admin/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary with stats
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get("/dashboard/summary", auth, adminOnly, getDashboardSummary);

/**
 * @swagger
 * /admin/dashboard/orders:
 *   get:
 *     summary: Get all orders with user details (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders with user info
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get("/dashboard/orders", auth, adminOnly, getDashboardOrders);

module.exports = router;
