const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Allow guest users
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        suggestedProducts: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
        ],
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    metadata: {
      userAge: String,
      babyAge: String,
      preferences: [String],
      budget: Number,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
chatHistorySchema.index({ user: 1, createdAt: -1 });
chatHistorySchema.index({ sessionId: 1, createdAt: -1 });

module.exports = mongoose.model("ChatHistory", chatHistorySchema);
