const express = require("express");
const router = express.Router();

const { handlePayPalWebhook, verifyWebhookSignature } = require("../services/paypalService");

/**
 * @swagger
 * /payments/paypal/webhook:
 *   post:
 *     summary: PayPal webhook endpoint
 *     tags:
 *       - Payments
 *     description: Receives and logs PayPal webhook notifications. No real payment processing.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event_type:
 *                 type: string
 *                 example: PAYMENT.CAPTURE.COMPLETED
 *               resource:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   amount:
 *                     type: object
 *                     properties:
 *                       value:
 *                         type: string
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       500:
 *         description: Error processing webhook
 */
router.post("/paypal/webhook", verifyWebhookSignature, handlePayPalWebhook);

module.exports = router;
