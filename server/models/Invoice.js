
const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    items: [
      {
        description: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },

    issueDate: {
      type: Date,
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Draft", "Pending", "Paid", "Overdue", "Cancelled"],
      default: "Draft",
    },

    notes: {
      type: String,
      trim: true,
    },

    paymentTerms: {
      type: String,
      trim: true,
    },

    aiGenerated: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    paypalOrderId: {
      type: String,
      default: null,
    },

    paypalCaptureId: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    // Public invoice sharing
    publicToken: {
      type: String,
      trim: true,
    },

    sentTo: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },

    sentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

invoiceSchema.index(
  { user: 1, invoiceNumber: 1 },
  { unique: true }
);

invoiceSchema.index(
  { publicToken: 1 },
  {
    unique: true,
    partialFilterExpression: {
      publicToken: { $type: "string" },
    },
  }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
