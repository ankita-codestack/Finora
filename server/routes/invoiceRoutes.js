
const express = require("express");
const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");
const Client = require("../models/Client");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create Invoice
router.post("/", protect, async (req, res) => {
  try {
    const {
      client,
      invoiceNumber,
      title,
      items,
      subtotal,
      tax,
      total,
      currency,
      issueDate,
      dueDate,
      notes,
      paymentTerms,
      aiGenerated,
    } = req.body;

    if (
      !client ||
      !mongoose.Types.ObjectId.isValid(client) ||
      !invoiceNumber?.trim() ||
      !title?.trim() ||
      !Array.isArray(items) ||
      items.length === 0 ||
      subtotal === undefined ||
      total === undefined ||
      !issueDate ||
      !dueDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required invoice details.",
      });
    }

    const clientExists = await Client.findOne({
      _id: client,
      user: req.userId,
      isActive: true,
    });

    if (!clientExists) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    const invoice = await Invoice.create({
      user: req.userId,
      client,
      invoiceNumber,
      title,
      items,
      subtotal,
      tax,
      total,
      currency,
      issueDate,
      dueDate,
      notes,
      paymentTerms,
      aiGenerated: aiGenerated === true,
    });

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully.",
      invoice,
    });
  } catch (error) {
    console.error("Create invoice error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Invoice number already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create invoice.",
    });
  }
});

// Get All Invoices
router.get("/", protect, async (req, res) => {
  try {
    const invoices = await Invoice.find({
      user: req.userId,
      isActive: true,
    })
      .populate("client", "name email company")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    console.error("Get invoices error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch invoices.",
    });
  }
});

// Get Single Invoice
router.get("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID.",
      });
    }

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.userId,
      isActive: true,
    }).populate("client", "name email company");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    return res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error("Get invoice error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch invoice.",
    });
  }
});

// Update Invoice
router.put("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID.",
      });
    }

    const allowedFields = [
      "client",
      "title",
      "items",
      "subtotal",
      "tax",
      "total",
      "currency",
      "issueDate",
      "dueDate",
      "status",
      "notes",
      "paymentTerms",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.client) {
      if (!mongoose.Types.ObjectId.isValid(updates.client)) {
        return res.status(400).json({
          success: false,
          message: "Invalid client ID.",
        });
      }

      const clientExists = await Client.findOne({
        _id: updates.client,
        user: req.userId,
        isActive: true,
      });

      if (!clientExists) {
        return res.status(404).json({
          success: false,
          message: "Client not found.",
        });
      }
    }

    const invoice = await Invoice.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId,
        isActive: true,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).populate("client", "name email company");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully.",
      invoice,
    });
  } catch (error) {
    console.error("Update invoice error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update invoice.",
    });
  }
});

// Delete Invoice (Soft Delete)
router.delete("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID.",
      });
    }

    const invoice = await Invoice.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId,
        isActive: true,
      },
      { isActive: false },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Invoice deleted successfully.",
    });
  } catch (error) {
    console.error("Delete invoice error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete invoice.",
    });
  }
});

module.exports = router;
