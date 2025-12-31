const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getOrdersByUserId,
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create new order
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 nullable: true
 *               guestInfo:
 *                 type: object
 *                 nullable: true
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               subtotal:
 *                 type: number
 *               deliveryFee:
 *                 type: number
 *               total:
 *                 type: number
 *               deliveryMethod:
 *                 type: string
 *                 enum: [standard, express, same]
 *               deliveryAddress:
 *                 type: object
 *               deliveryInstructions:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [card, cash]
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
// Create new order
router.post('/', createOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     tags:
 *       - Orders
 *     responses:
 *       200:
 *         description: List of orders
 *       500:
 *         description: Server error
 */
// Get all orders (admin only)
router.get('/', getAllOrders);

/**
 * @swagger
 * /orders/user/{userId}:
 *   get:
 *     summary: Get orders by user ID
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of orders for a user
 *       500:
 *         description: Server error
 */
// Get orders by user ID
router.get('/user/:userId', getOrdersByUserId);

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: Get order by ID
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
// Get order by ID
router.get('/:orderId', getOrderById);

/**
 * @swagger
 * /orders/{orderId}/status:
 *   patch:
 *     summary: Update order status
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, preparing, ready, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
// Update order status
router.patch('/:orderId/status', updateOrderStatus);

module.exports = router;
