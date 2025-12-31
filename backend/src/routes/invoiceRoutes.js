const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminOnly");

const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  getUserInvoices,
  guestCheckout,
} = require("../controllers/invoiceController");

/**
 * @swagger
 * /invoices:
 *   get:
 *     summary: Get all invoices - Admin sees all, Customer sees own
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invoices
 *       401:
 *         description: Unauthorized
 */
router.get("/", auth, getInvoices);

/**
 * @swagger
 * /invoices/user/{userId}:
 *   get:
 *     summary: Get all invoices for a user (Admin only)
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User invoices
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: User not found
 */
router.get("/user/:userId", auth, adminOnly, getUserInvoices);

/**
 * @swagger
 * /invoices/{id}:
 *   get:
 *     summary: Get single invoice
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Invoice details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Invoice not found
 */
router.get("/:id", auth, getInvoiceById);

/**
 * @swagger
 * /invoices:
 *   post:
 *     summary: Create new invoice
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: User ID (admin only)
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *               billingAddress:
 *                 type: string
 *               billingCity:
 *                 type: string
 *               billingZipCode:
 *                 type: string
 *               billingCountry:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Invoice created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/", auth, createInvoice);

/**
 * @swagger
 * /invoices/{id}:
 *   put:
 *     summary: Update invoice (Admin only)
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               paymentStatus:
 *                 type: string
 *               paymentReference:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invoice updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Invoice not found
 */
router.put("/:id", auth, adminOnly, updateInvoice);

router.patch("/:id/status", auth, adminOnly, updateInvoiceStatus);

/**
 * @swagger
 * /invoices/{id}:
 *   delete:
 *     summary: Delete invoice (Admin only, not paid)
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Invoice deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Invoice not found
 */
router.delete("/:id", auth, adminOnly, deleteInvoice);

/**
 * @swagger
 * /invoices/guest-checkout:
 *   post:
 *     summary: Guest checkout (no authentication required)
 *     tags:
 *       - Invoices
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               guestEmail:
 *                 type: string
 *               guestName:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Guest checkout successful
 *       400:
 *         description: Invalid input
 */
router.post("/guest-checkout", guestCheckout);

module.exports = router;
