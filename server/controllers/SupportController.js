const Conversation = require("../models/ConversationModel");
const Message = require("../models/MessageModel");
const { getIO } = require("../config/socket");

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Emit a new message to the appropriate Socket.IO rooms.
 * @param {Object} conversation - Mongoose document
 * @param {Object} message      - Mongoose document (populated sender)
 */
const emitMessage = (conversation, message) => {
  try {
    const io = getIO();
    const convRoom = `conversation:${conversation._id}`;
    const payload = { conversation: conversation._id, message };

    // Always notify the conversation room (both parties if connected)
    io.to(convRoom).emit("support:new_message", payload);

    if (conversation.staff) {
      // Notify staff user room (staff may be in another tab)
      io.to(`user:${conversation.staff}`).emit("support:new_message", payload);
    } else {
      // Unassigned — broadcast to the staff pool
      io.to("support:staff").emit("support:unassigned_message", payload);
    }
  } catch (_) {
    // Socket not yet initialised in tests — silently skip
  }
};

// ─── 1. User creates ticket ──────────────────────────────────────────────────

/**
 * POST /api/support/conversations
 * Body: { subject, firstMessage }
 */
const createConversation = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { subject, firstMessage } = req.body;
    if (!subject || !firstMessage) {
      return res
        .status(400)
        .json({ message: "subject và firstMessage là bắt buộc." });
    }

    const conversation = await Conversation.create({
      user: userId,
      subject: subject.trim(),
      status: "open",
      unreadByStaff: 1,
      lastMessageAt: new Date(),
    });

    const message = await Message.create({
      conversation: conversation._id,
      sender: userId,
      senderRole: "user",
      content: firstMessage.trim(),
    });

    await message.populate("sender", "fullname email role");

    emitMessage(conversation, message);

    return res.status(201).json({
      message: "Tạo ticket thành công",
      conversation,
      firstMessage: message,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi tạo ticket", error: error.message });
  }
};

// ─── 2. List conversations ───────────────────────────────────────────────────

/**
 * GET /api/support/conversations
 * Query:
 *   ?unassigned=true          → only unassigned (staff inbox)
 *   ?status=open|in_progress  → filter by status
 *   ?page=1&limit=20
 * - Staff/Admin: sees all (or filtered)
 * - User: sees only own conversations
 */
const getConversations = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const isStaff = role === "Staff" || role === "Admin";

    const {
      unassigned,
      status,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (isStaff) {
      if (unassigned === "true") {
        filter.staff = null;
      } else if (role === "Staff") {
        // Staff sees own assigned + unassigned
        filter.$or = [{ staff: userId }, { staff: null }];
      }
      // Admin sees all unless filtered
    } else {
      filter.user = userId;
    }

    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [conversations, total] = await Promise.all([
      Conversation.find(filter)
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("user", "fullname email")
        .populate("staff", "fullname email"),
      Conversation.countDocuments(filter),
    ]);

    return res.status(200).json({
      conversations,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi lấy danh sách", error: error.message });
  }
};

// ─── 3. Get single conversation ──────────────────────────────────────────────

/**
 * GET /api/support/conversations/:id
 */
const getConversationById = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const isStaff = role === "Staff" || role === "Admin";

    const conversation = await Conversation.findById(req.params.id)
      .populate("user", "fullname email")
      .populate("staff", "fullname email");

    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy ticket" });
    }

    // Access control: user can only see own conversation
    if (!isStaff && conversation.user._id.toString() !== userId) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    // Clear unread counters when party opens the conversation
    if (isStaff && conversation.unreadByStaff > 0) {
      await Conversation.findByIdAndUpdate(req.params.id, {
        unreadByStaff: 0,
      });
      conversation.unreadByStaff = 0;
    }
    if (!isStaff && conversation.unreadByUser > 0) {
      await Conversation.findByIdAndUpdate(req.params.id, { unreadByUser: 0 });
      conversation.unreadByUser = 0;
    }

    return res.status(200).json({ conversation });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi lấy ticket", error: error.message });
  }
};

// ─── 4. Staff assigns conversation ───────────────────────────────────────────

/**
 * PATCH /api/support/conversations/:id/assign
 */
const assignConversation = async (req, res) => {
  try {
    const { id: staffId, role } = req.user;
    if (role !== "Staff" && role !== "Admin") {
      return res.status(403).json({ message: "Chỉ Staff/Admin mới có thể nhận ticket" });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy ticket" });
    }
    if (conversation.status === "closed") {
      return res.status(400).json({ message: "Ticket đã đóng" });
    }
    if (
      conversation.staff &&
      conversation.staff.toString() !== staffId
    ) {
      return res
        .status(400)
        .json({ message: "Ticket đã được assign cho staff khác" });
    }

    conversation.staff = staffId;
    conversation.status = "in_progress";
    await conversation.save();

    await conversation.populate([
      { path: "user", select: "fullname email" },
      { path: "staff", select: "fullname email" },
    ]);

    try {
      const io = getIO();
      io.to(`conversation:${conversation._id}`).emit("support:assigned", {
        conversation,
      });
      io.to("support:staff").emit("support:assigned", { conversation });
    } catch (_) {}

    return res.status(200).json({
      message: "Đã nhận ticket",
      conversation,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi assign ticket", error: error.message });
  }
};

// ─── 5. Get messages ─────────────────────────────────────────────────────────

/**
 * GET /api/support/conversations/:id/messages?page=1&limit=50
 */
const getMessages = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const isStaff = role === "Staff" || role === "Admin";

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy ticket" });
    }
    if (!isStaff && conversation.user.toString() !== userId) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [messages, total] = await Promise.all([
      Message.find({ conversation: conversation._id })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("sender", "fullname email role"),
      Message.countDocuments({ conversation: conversation._id }),
    ]);

    return res.status(200).json({
      messages,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi lấy tin nhắn", error: error.message });
  }
};

// ─── 6. Send message ─────────────────────────────────────────────────────────

/**
 * POST /api/support/conversations/:id/messages
 * Body: { content }
 */
const sendMessage = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const isStaff = role === "Staff" || role === "Admin";
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Nội dung tin nhắn là bắt buộc" });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy ticket" });
    }

    // Access check
    if (!isStaff && conversation.user.toString() !== userId) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    if (isStaff && conversation.staff && conversation.staff.toString() !== userId && role !== "Admin") {
      return res
        .status(403)
        .json({ message: "Ticket này không được assign cho bạn" });
    }
    if (conversation.status === "closed") {
      return res
        .status(400)
        .json({ message: "Ticket đã đóng, không thể gửi thêm tin nhắn" });
    }

    // If user replies after resolved → reopen to in_progress
    if (!isStaff && conversation.status === "resolved") {
      conversation.status = "in_progress";
    }

    // Update unread counters
    if (isStaff) {
      conversation.unreadByUser += 1;
    } else {
      conversation.unreadByStaff += 1;
    }
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const message = await Message.create({
      conversation: conversation._id,
      sender: userId,
      senderRole: isStaff ? "staff" : "user",
      content: content.trim(),
    });

    await message.populate("sender", "fullname email role");

    emitMessage(conversation, message);

    return res.status(201).json({ message });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi gửi tin nhắn", error: error.message });
  }
};

// ─── 7. Staff updates status ──────────────────────────────────────────────────

/**
 * PATCH /api/support/conversations/:id/status
 * Body: { status: "resolved" }
 */
const updateStatus = async (req, res) => {
  try {
    const { id: staffId, role } = req.user;
    if (role !== "Staff" && role !== "Admin") {
      return res.status(403).json({ message: "Chỉ Staff/Admin mới có quyền" });
    }

    const { status } = req.body;
    const allowed = ["open", "in_progress", "resolved"];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ message: `status phải là một trong: ${allowed.join(", ")}` });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy ticket" });
    }
    if (conversation.status === "closed") {
      return res.status(400).json({ message: "Ticket đã đóng" });
    }
    if (
      role === "Staff" &&
      conversation.staff &&
      conversation.staff.toString() !== staffId
    ) {
      return res.status(403).json({ message: "Ticket này không được assign cho bạn" });
    }

    // Khi staff đánh dấu resolved → tự động đóng ticket
    const finalStatus = status === "resolved" ? "closed" : status;
    conversation.status = finalStatus;
    await conversation.save();

    try {
      const io = getIO();
      io.to(`conversation:${conversation._id}`).emit(
        "support:status_changed",
        { conversationId: conversation._id, status: finalStatus },
      );
    } catch (_) {}

    return res.status(200).json({
      message: `Đã cập nhật status → ${finalStatus}`,
      conversation,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi cập nhật status", error: error.message });
  }
};

// ─── 8. User closes ticket ───────────────────────────────────────────────────

/**
 * PATCH /api/support/conversations/:id/close
 */
const closeConversation = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const isStaff = role === "Staff" || role === "Admin";

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy ticket" });
    }

    // Chủ conversation hoặc Admin có thể đóng
    if (conversation.user.toString() !== userId && role !== "Admin") {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    if (conversation.status === "closed") {
      return res.status(400).json({ message: "Hộp thoại đã đóng rồi" });
    }

    conversation.status = "closed";
    await conversation.save();

    try {
      const io = getIO();
      io.to(`conversation:${conversation._id}`).emit(
        "support:status_changed",
        { conversationId: conversation._id, status: "closed" },
      );
    } catch (_) {}

    return res.status(200).json({
      message: "Đã đóng hộp thoại",
      conversation,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi đóng hộp thoại", error: error.message });
  }
};

// ─── 9. User rates conversation ──────────────────────────────────────────────

/**
 * POST /api/support/conversations/:id/rate
 * Body: { score, comment }
 */
const rateConversation = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const { score, comment } = req.body;
    if (!score || score < 1 || score > 5) {
      return res
        .status(400)
        .json({ message: "score phải là số nguyên từ 1 đến 5" });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy ticket" });
    }
    if (conversation.user.toString() !== userId) {
      return res.status(403).json({ message: "Không có quyền đánh giá" });
    }
    if (!["resolved", "closed"].includes(conversation.status)) {
      return res
        .status(400)
        .json({ message: "Chỉ được đánh giá khi ticket resolved hoặc closed" });
    }
    if (conversation.rating) {
      return res.status(400).json({ message: "Bạn đã đánh giá ticket này rồi" });
    }

    conversation.rating = {
      score: parseInt(score),
      comment: comment ? comment.trim() : undefined,
      ratedAt: new Date(),
    };
    await conversation.save();

    return res.status(200).json({
      message: "Đánh giá thành công",
      rating: conversation.rating,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi đánh giá", error: error.message });
  }
};

module.exports = {
  createConversation,
  getConversations,
  getConversationById,
  assignConversation,
  getMessages,
  sendMessage,
  updateStatus,
  closeConversation,
};
