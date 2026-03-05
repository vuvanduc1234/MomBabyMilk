const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
      index: true,
    },
    unreadByStaff: { type: Number, default: 0 },
    unreadByUser: { type: Number, default: 0 },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Compound index for common queries
conversationSchema.index({ status: 1, lastMessageAt: -1 });
conversationSchema.index({ user: 1, status: 1 });
conversationSchema.index({ staff: 1, status: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);
