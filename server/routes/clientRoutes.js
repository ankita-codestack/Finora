
const express = require("express");
const Client = require("../models/Client");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create Client
router.post("/", protect, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      address,
      notes,
      status,
      isActive,
    } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Client name is required.",
      });
    }

    const client = await Client.create({
      user: req.userId,
      name: name.trim(),
      email,
      phone,
      company,
      address,
      notes,
      status: status || "Active",
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return res.status(201).json({
      success: true,
      message: "Client created successfully.",
      client,
    });
  } catch (error) {
    console.error("Create client error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create client.",
    });
  }
});

// Get All Clients
router.get("/", protect, async (req, res) => {
  try {
    const clients = await Client.find({
      user: req.userId,
      isActive: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: clients.length,
      clients,
    });
  } catch (error) {
    console.error("Get clients error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch clients.",
    });
  }
});

// Update Client
router.put("/:id", protect, async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "email",
      "phone",
      "company",
      "address",
      "notes",
      "status",
      "isActive",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (
      updates.name !== undefined &&
      (typeof updates.name !== "string" || !updates.name.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Client name cannot be empty.",
      });
    }

    if (typeof updates.name === "string") {
      updates.name = updates.name.trim();
    }

    if (updates.isActive !== undefined) {
      updates.isActive = Boolean(updates.isActive);
    }

    if (
      updates.status !== undefined &&
      !["Active", "Inactive"].includes(updates.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid client status.",
      });
    }

    const client = await Client.findOneAndUpdate(
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
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Client updated successfully.",
      client,
    });
  } catch (error) {
    console.error("Update client error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update client.",
    });
  }
});

// Delete Client (Soft Delete)
router.delete("/:id", protect, async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId,
        isActive: true,
      },
      { isActive: false },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Client deleted successfully.",
    });
  } catch (error) {
    console.error("Delete client error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete client.",
    });
  }
});

module.exports = router;
