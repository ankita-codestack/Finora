
const express = require("express");
const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");
const Chat = require("../models/Chat");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get user's chat history
router.get("/conversations", protect, async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.userId })
      .select("title createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      conversations: chats,
    });
  } catch (error) {
    console.error("Chat history error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load chat history.",
    });
  }
});

// Get a particular conversation
router.get("/conversations/:id", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID.",
      });
    }

    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.userId,
    }).lean();

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    return res.status(200).json({
      success: true,
      conversation: chat,
    });
  } catch (error) {
    console.error("Open conversation error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to open conversation.",
    });
  }
});

// Delete a conversation
router.delete("/conversations/:id", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID.",
      });
    }

    const chat = await Chat.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Conversation deleted successfully.",
    });
  } catch (error) {
    console.error("Delete conversation error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete conversation.",
    });
  }
});

// AI Chat
router.post("/chat", protect, async (req, res) => {
  try {
    const { message, chatId } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message.",
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message is too long. Keep it under 2000 characters.",
      });
    }

    if (chatId && !mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID.",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({
        success: false,
        message: "AI service is not configured. Please add GROQ_API_KEY.",
      });
    }

    let chat = null;

    if (chatId) {
      chat = await Chat.findOne({
        _id: chatId,
        user: req.userId,
      });

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found.",
        });
      }
    }

    const invoices = await Invoice.find({
      user: req.userId,
      isActive: true,
    })
      .populate("client", "name email company")
      .sort({ createdAt: -1 })
      .lean();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currencySummary = {};

    const invoiceData = invoices.map((invoice) => {
      const dueDate = invoice.dueDate
        ? new Date(invoice.dueDate)
        : null;

      const isOverdue =
        invoice.status === "Pending" &&
        dueDate &&
        dueDate < today;

      const status = isOverdue ? "Overdue" : invoice.status;
      const currency = invoice.currency || "USD";
      const total = Number(invoice.total) || 0;

      if (!currencySummary[currency]) {
        currencySummary[currency] = {
          paid: 0,
          pending: 0,
          overdue: 0,
          paidCount: 0,
          pendingCount: 0,
          overdueCount: 0,
        };
      }

      if (status === "Paid") {
        currencySummary[currency].paid += total;
        currencySummary[currency].paidCount += 1;
      } else if (status === "Overdue") {
        currencySummary[currency].overdue += total;
        currencySummary[currency].overdueCount += 1;
      } else if (status === "Pending") {
        currencySummary[currency].pending += total;
        currencySummary[currency].pendingCount += 1;
      }

      return {
        invoiceNumber: invoice.invoiceNumber,
        title: invoice.title,
        client: invoice.client?.name || "Unknown client",
        currency,
        total,
        status,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        paidAt: invoice.paidAt,
      };
    });

    const financialContext = {
      totalInvoices: invoices.length,
      currencySummary,
      invoices: invoiceData,
    };

    const systemPrompt = `You are Finora, an intelligent and friendly AI financial assistant for freelancers and small businesses.

LANGUAGE AND TYPO TOLERANCE:
- Understand English, Hindi, Hinglish and mixed-language messages.
- Automatically understand common spelling mistakes, typing errors, missing letters, grammatical mistakes and informal abbreviations.
- Interpret the user's intended meaning instead of rejecting a message because of spelling errors.
- Do not ask the user to correct spelling when the intended meaning is reasonably clear.
- Understand informal queries such as "show my revnue", "kitna paisa aya", "pending invoces", and "analize my finacial perfomance".
- Reply in the same language or style the user uses.
- If the meaning is genuinely unclear, politely ask one specific clarification question.

FINANCIAL ACCURACY:
- Answer financial questions using ONLY the supplied invoice data.
- Report paid revenue, pending payments and overdue amounts accurately.
- Never combine different currencies into one total.
- Clearly mention the currency beside every amount.
- Distinguish paid invoices from pending and overdue invoices.
- Give practical cash-flow suggestions when requested.
- If there are no pending or overdue invoices, say so, but still answer the other parts of the question.
- Never invent financial figures, clients or transactions.
- If there are no invoices, explain that the user should create invoices first.

GENERAL RESPONSE RULES:
- Be friendly, helpful and professional.
- Keep answers clear and concise.
- Understand the context of previous messages in the conversation.
- Do not unnecessarily reject valid questions.
- For general questions, answer helpfully without inventing personal financial information.

Today's date: ${today.toISOString().slice(0, 10)}

Invoice data:
${JSON.stringify(financialContext)}`;

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];

    // Include previous messages to maintain conversation context
    if (chat && chat.messages.length > 0) {
      const previousMessages = chat.messages.slice(-10).map((item) => ({
        role: item.role,
        content: item.text,
      }));

      messages.push(...previousMessages);
    }

    messages.push({
      role: "user",
      content: message.trim(),
    });

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
          messages,
          temperature: 0.3,
          max_completion_tokens: 1200,
        }),
      }
    );

    const result = await groqResponse.json();

    if (!groqResponse.ok) {
      console.error("Groq API error:", result);

      return res.status(502).json({
        success: false,
        message:
          result.error?.message || "AI service could not generate a response.",
      });
    }

    const reply = result.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(502).json({
        success: false,
        message: "AI returned an empty response. Please try again.",
      });
    }

    // Create a new conversation if this is the first message
    if (!chat) {
      chat = new Chat({
        user: req.userId,
        title:
          message.trim().length > 50
            ? `${message.trim().slice(0, 50)}...`
            : message.trim(),
        messages: [],
      });
    }

    // Save both user message and AI response
    chat.messages.push(
      {
        role: "user",
        text: message.trim(),
      },
      {
        role: "assistant",
        text: reply,
      }
    );

    await chat.save();

    return res.status(200).json({
      success: true,
      reply,
      chatId: chat._id,
      summary: financialContext.currencySummary,
    });
  } catch (error) {
    console.error("AI assistant error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process your request right now.",
    });
  }
});

module.exports = router;
