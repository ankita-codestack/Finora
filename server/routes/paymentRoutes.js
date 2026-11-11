
const express = require("express");
const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");
const protect = require("../middleware/authMiddleware");

const {
  createPayPalOrder,
  capturePayPalOrder,
} = require("../services/paypalService");

const router = express.Router();

// Create PayPal Order
router.post("/create-order/:invoiceId", protect, async (req, res) => {
  try {
    const { invoiceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID.",
      });
    }

    const invoice = await Invoice.findOne({
      _id: invoiceId,
      user: req.userId,
      isActive: true,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    if (["Paid", "Cancelled"].includes(invoice.status)) {
      return res.status(400).json({
        success: false,
        message: "This invoice cannot be paid.",
      });
    }

    if (invoice.paypalOrderId) {
      return res.status(409).json({
        success: false,
        message: "A PayPal order already exists for this invoice.",
        paypalOrderId: invoice.paypalOrderId,
      });
    }

    const order = await createPayPalOrder(invoice);

    const approvalUrl = order.links?.find(
      (link) =>
        link.rel === "payer-action" ||
        link.rel === "approve"
    )?.href;

    if (!approvalUrl) {
      console.error("PayPal order links:", order.links);

      throw new Error("PayPal approval link was not returned.");
    }

    invoice.paypalOrderId = order.id;
    invoice.status = "Pending";

    await invoice.save();

    return res.status(201).json({
      success: true,
      message: "PayPal order created successfully.",
      orderId: order.id,
      approvalUrl,
    });
  } catch (error) {
    console.error("Create PayPal order error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to create PayPal order.",
    });
  }
});

// Capture PayPal Payment
router.post("/capture-order/:orderId", protect, async (req, res) => {
  try {
    const { orderId } = req.params;

    const invoice = await Invoice.findOne({
      paypalOrderId: orderId,
      user: req.userId,
      isActive: true,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice or PayPal order not found.",
      });
    }

    if (invoice.status === "Paid") {
      return res.status(400).json({
        success: false,
        message: "This invoice has already been paid.",
      });
    }

    if (invoice.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "This invoice has been cancelled.",
      });
    }

    const capture = await capturePayPalOrder(orderId);

    if (capture.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "PayPal payment is not completed.",
      });
    }

    const purchaseUnit = capture.purchase_units?.[0];
    const payment = purchaseUnit?.payments?.captures?.[0];

    if (
      purchaseUnit?.custom_id !== invoice._id.toString() ||
      payment?.status !== "COMPLETED" ||
      payment?.amount?.currency_code !== invoice.currency ||
      Number(payment?.amount?.value) !== Number(invoice.total)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details could not be verified.",
      });
    }

    invoice.paypalCaptureId = payment.id;
    invoice.paidAt = payment.create_time
      ? new Date(payment.create_time)
      : new Date();
    invoice.status = "Paid";

    await invoice.save();

    return res.status(200).json({
      success: true,
      message: "Payment completed successfully.",
      invoice,
    });
  } catch (error) {
    console.error("Capture PayPal payment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to capture PayPal payment.",
    });
  }
});

module.exports = router;
