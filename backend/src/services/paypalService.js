const Invoice = require("../models/Invoice");

/**
 * Handle PayPal webhook notifications
 * This is a placeholder webhook - NOT implementing real PayPal payment execution
 * Just logs incoming webhook payloads and updates invoice payment status
 */
exports.handlePayPalWebhook = async (req, res) => {
  try {
    const webhookData = req.body;

    console.log("=== PayPal Webhook Received ===");
    console.log(JSON.stringify(webhookData, null, 2));
    console.log("===============================");

    // Log webhook event type
    const eventType = webhookData.event_type;
    console.log(`Event Type: ${eventType}`);

    if (!eventType) {
      return res.status(200).json({ message: "Webhook received" });
    }

    // Handle different PayPal event types
    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED":
        await handlePaymentCaptureCompleted(webhookData);
        break;

      case "PAYMENT.CAPTURE.DENIED":
        await handlePaymentCaptureDenied(webhookData);
        break;

      case "PAYMENT.CAPTURE.REFUNDED":
        await handlePaymentCaptureRefunded(webhookData);
        break;

      case "PAYMENT.CAPTURE.PENDING":
        await handlePaymentCapturePending(webhookData);
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({ message: "Webhook processed" });
  } catch (error) {
    console.error("Error processing PayPal webhook:", error.message);
    // Still return 200 to prevent PayPal retries
    res.status(200).json({ message: "Webhook processed with error", error: error.message });
  }
};

/**
 * Handle successful payment capture
 */
async function handlePaymentCaptureCompleted(data) {
  try {
    const paymentReference = data.resource?.id;
    const amount = data.resource?.amount?.value;

    console.log(`Payment Completed: ${paymentReference} - Amount: ${amount}`);

    // Find invoice by payment reference
    const invoice = await Invoice.findOne({
      where: { paymentReference: paymentReference },
    });

    if (invoice) {
      invoice.paymentStatus = "completed";
      invoice.paidAt = new Date();
      await invoice.save();
      console.log(`Invoice ${invoice.invoiceNumber} marked as paid`);
    } else {
      console.warn(`No invoice found for payment reference: ${paymentReference}`);
    }
  } catch (error) {
    console.error("Error handling payment completion:", error.message);
  }
}

/**
 * Handle denied payment
 */
async function handlePaymentCaptureDenied(data) {
  try {
    const paymentReference = data.resource?.id;

    console.log(`Payment Denied: ${paymentReference}`);

    const invoice = await Invoice.findOne({
      where: { paymentReference: paymentReference },
    });

    if (invoice) {
      invoice.paymentStatus = "failed";
      await invoice.save();
      console.log(`Invoice ${invoice.invoiceNumber} marked as failed payment`);
    }
  } catch (error) {
    console.error("Error handling payment denial:", error.message);
  }
}

/**
 * Handle payment refund
 */
async function handlePaymentCaptureRefunded(data) {
  try {
    const paymentReference = data.resource?.id;

    console.log(`Payment Refunded: ${paymentReference}`);

    const invoice = await Invoice.findOne({
      where: { paymentReference: paymentReference },
    });

    if (invoice) {
      invoice.paymentStatus = "refunded";
      await invoice.save();
      console.log(`Invoice ${invoice.invoiceNumber} marked as refunded`);
    }
  } catch (error) {
    console.error("Error handling refund:", error.message);
  }
}

/**
 * Handle pending payment
 */
async function handlePaymentCapturePending(data) {
  try {
    const paymentReference = data.resource?.id;

    console.log(`Payment Pending: ${paymentReference}`);

    const invoice = await Invoice.findOne({
      where: { paymentReference: paymentReference },
    });

    if (invoice) {
      invoice.paymentStatus = "pending";
      await invoice.save();
      console.log(`Invoice ${invoice.invoiceNumber} payment pending`);
    }
  } catch (error) {
    console.error("Error handling pending payment:", error.message);
  }
}

/**
 * Verify webhook signature (placeholder - not implemented)
 * In production, verify the webhook signature with PayPal
 */
exports.verifyWebhookSignature = async (req, res, next) => {
  try {
    // TODO: Implement PayPal webhook signature verification
    // Use PayPal SDK to verify the X-PAYPAL-TRANSMISSION-SIG header
    console.log("Webhook signature verification skipped (placeholder)");
    next();
  } catch (error) {
    console.error("Webhook verification failed:", error.message);
    res.status(401).json({ message: "Unauthorized webhook" });
  }
};
