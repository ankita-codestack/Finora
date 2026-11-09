const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    paypalOrderId: {
      type: String,
      unique: true,
      sparse: true,
    },

    paypalCaptureId: {
      type: String,
      unique: true,
      sparse: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      required: true,
      uppercase: true,
    },

    status: {
      type: String,
      enum: ["Created", "Pending", "Completed", "Failed", "Refunded"],
      default: "Created",
    },

    paymentMethod: {
      type: String,
      default: "PayPal",
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;