// src/pages/Support/SupportPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  Plus,
  Send,
  X,
  RefreshCw,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  Headphones,
  User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  closeConversation,
} from "../../services/supportService";
import { formatDateTime } from "../../lib/formatters";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Status helpers ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  open: {
    label: "Đang chờ",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: Clock,
  },
  in_progress: {
    label: "Đang xử lý",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: AlertCircle,
  },
  resolved: {
    label: "Đã giải quyết",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle,
  },
  closed: {
    label: "Đã đóng",
    color: "bg-gray-100 text-gray-600 border-gray-200",
    icon: XCircle,
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        cfg.color,
      )}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

// ─── New Dialog ─────────────────────────────────────────────────────────────
function NewTicketDialog({ open, onClose, onCreate }) {
  const [subject, setSubject] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !firstMessage.trim()) return;
    setLoading(true);
    try {
      const data = await onCreate({ subject, firstMessage });
      setSubject("");
      setFirstMessage("");
      onClose();
      return data;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-pink-500" />
            Tạo hộp thoại hỗ trợ mới
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Tiêu đề hộp thoại <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Ví dụ: Đơn hàng #1234 chưa được giao"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Mô tả vấn đề <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
              value={firstMessage}
              onChange={(e) => setFirstMessage(e.target.value)}
              rows={4}
              maxLength={2000}
              required
            />
            <p className="text-xs text-muted-foreground text-right">
              {firstMessage.length}/2000
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading || !subject.trim() || !firstMessage.trim()}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Gửi yêu cầu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SupportPage() {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [closingConv, setClosingConv] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const lastMsgIdRef = useRef(null);

  // ── scroll to bottom ────────────────────────────────────────────────────
  const scrollBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollBottom, [messages, scrollBottom]);

  // ── fetch conversations ──────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const data = await getConversations(params);
      setConversations(data.conversations || []);
    } catch {
      // silent
    } finally {
      setLoadingConvs(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ── fetch messages for selected conversation ─────────────────────────────
  const fetchMessages = useCallback(
    async (convId, silent = false) => {
      if (!convId) return;
      if (!silent) setLoadingMsgs(true);
      try {
        const data = await getMessages(convId, { limit: 100 });
        const msgs = data.messages || [];
        setMessages(msgs);
        if (msgs.length > 0) {
          lastMsgIdRef.current = msgs[msgs.length - 1]._id;
        }
      } catch {
        // silent
      } finally {
        setLoadingMsgs(false);
      }
    },
    [],
  );

  // ── poll for new messages ────────────────────────────────────────────────
  useEffect(() => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    if (selectedConv && !["closed", "resolved"].includes(selectedConv.status)) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const data = await getMessages(selectedConv._id, { limit: 100 });
          const msgs = data.messages || [];
          const newLastId = msgs.length > 0 ? msgs[msgs.length - 1]._id : null;
          if (newLastId && newLastId !== lastMsgIdRef.current) {
            lastMsgIdRef.current = newLastId;
            setMessages(msgs);
            // Also refresh conversation list to update unread / status
            fetchConversations();
          }
        } catch {
          // silent
        }
      }, 3000);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [selectedConv, fetchConversations]);

  // ── select conversation ──────────────────────────────────────────────────
  const handleSelectConv = useCallback(
    (conv) => {
      setSelectedConv(conv);
      setMessages([]);
      lastMsgIdRef.current = null;
      fetchMessages(conv._id);
    },
    [fetchMessages],
  );

  // Refresh selected conv data from list when list updates
  useEffect(() => {
    if (selectedConv) {
      const updated = conversations.find((c) => c._id === selectedConv._id);
      if (updated) setSelectedConv(updated);
    }
  }, [conversations]); // eslint-disable-line

  // ── send message ─────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConv) return;
    if (selectedConv.status === "closed") return;

    const text = inputText.trim();
    setInputText("");
    setSendingMsg(true);

    // Optimistic update
    const optimistic = {
      _id: `opt-${Date.now()}`,
      content: text,
      senderRole: "user",
      sender: { fullname: user?.fullname, _id: user?._id },
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await sendMessage(selectedConv._id, text);
      // Fetch real messages after sending
      await fetchMessages(selectedConv._id, true);
      fetchConversations();
    } catch (err) {
      toast.error(err?.message || "Gửi tin nhắn thất bại");
      setMessages((prev) =>
        prev.filter((m) => m._id !== optimistic._id),
      );
      setInputText(text);
    } finally {
      setSendingMsg(false);
    }
  };

  // ── create new conversation ─────────────────────────────────────────────
  const handleCreate = async ({ subject, firstMessage }) => {
    try {
      const data = await createConversation({ subject, firstMessage });
      toast.success("Tạo hộp thoại thành công!");
      await fetchConversations();
      if (data.conversation) {
        handleSelectConv(data.conversation);
      }
    } catch (err) {
      toast.error(err?.message || "Tạo hộp thoại thất bại");
      throw err;
    }
  };

  // ── close conversation ────────────────────────────────────────────────────
  const handleClose = async () => {
    if (!selectedConv) return;
    setClosingConv(true);
    try {
      const data = await closeConversation(selectedConv._id);
      toast.success("Đã đóng hộp thoại");
      setSelectedConv(data.conversation);
      fetchConversations();
    } catch (err) {
      toast.error(err?.message || "Không thể đóng hộp thoại");
    } finally {
      setClosingConv(false);
      setShowCloseConfirm(false);
    }
  };

  const canClose =
    selectedConv &&
    !["closed"].includes(selectedConv.status);

  const canSend =
    selectedConv && !["closed"].includes(selectedConv.status);

  const STATUS_FILTERS = [
    { value: "", label: "Tất cả" },
    { value: "open", label: "Chờ xử lý" },
    { value: "in_progress", label: "Đang xử lý" },
    { value: "resolved", label: "Đã giải quyết" },
    { value: "closed", label: "Đã đóng" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
            <Headphones className="h-6 w-6 text-pink-500" />
            Chăm sóc khách hàng
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Gửi yêu cầu và theo dõi tình trạng hỗ trợ của bạn
          </p>
        </div>
        <Button
          onClick={() => setShowNewDialog(true)}
          className="bg-pink-500 hover:bg-pink-600 text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          Tạo hộp thoại mới
        </Button>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 min-h-[600px]">
        {/* ── Left: Conversation List ── */}
        <Card className="flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-foreground">
                Hộp thoại của tôi
              </p>
              <button
                onClick={fetchConversations}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Làm mới"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            {/* Status filter */}
            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => {
                    setFilterStatus(f.value);
                    setLoadingConvs(true);
                  }}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full border transition-colors",
                    filterStatus === f.value
                      ? "bg-pink-500 text-white border-pink-500"
                      : "border-gray-200 text-muted-foreground hover:border-pink-300 hover:text-pink-600",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1">
            {loadingConvs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <MessageSquare className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  Chưa có hộp thoại nào
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Nhấn "Tạo hộp thoại mới" để bắt đầu
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conv) => (
                  <button
                    key={conv._id}
                    onClick={() => handleSelectConv(conv)}
                    className={cn(
                      "w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors",
                      selectedConv?._id === conv._id && "bg-pink-50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm font-medium leading-snug line-clamp-1 flex-1",
                          conv.unreadByUser > 0
                            ? "text-pink-600"
                            : "text-foreground",
                        )}
                      >
                        {conv.subject}
                      </p>
                      {conv.unreadByUser > 0 && (
                        <span className="flex-shrink-0 bg-pink-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                          {conv.unreadByUser}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <StatusBadge status={conv.status} />
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    {conv.staff && (
                      <p className="text-xs text-muted-foreground mt-1">
                        NV: {conv.staff.fullname}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* ── Right: Chat Window ── */}
        <Card className="flex flex-col overflow-hidden">
          {!selectedConv ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <Headphones className="h-16 w-16 text-gray-200 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                Chọn một hộp thoại để xem nội dung
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                hoặc tạo hộp thoại mới để được hỗ trợ
              </p>
              <Button
                className="mt-4 bg-pink-500 hover:bg-pink-600 text-white gap-2"
                onClick={() => setShowNewDialog(true)}
              >
                <Plus className="h-4 w-4" />
                Tạo hộp thoại mới
              </Button>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-5 py-3 border-b flex items-center justify-between bg-white">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-semibold text-foreground truncate">
                      {selectedConv.subject}
                    </h2>
                    <StatusBadge status={selectedConv.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    {selectedConv.staff ? (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Nhân viên: {selectedConv.staff.fullname}
                      </span>
                    ) : (
                      <span className="text-yellow-600">Chưa được tiếp nhận</span>
                    )}
                    <span>
                      Tạo:{" "}
                      {formatDateTime(selectedConv.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  {canClose && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCloseConfirm(true)}
                      className="gap-1 text-red-500 border-red-200 hover:bg-red-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      Đóng hộp thoại
                    </Button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 px-5 py-4">
                {loadingMsgs ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Chưa có tin nhắn nào
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isMe = msg.senderRole === "user";
                      return (
                        <div
                          key={msg._id}
                          className={cn(
                            "flex",
                            isMe ? "justify-end" : "justify-start",
                          )}
                        >
                          <div className={cn("flex items-end gap-2 max-w-[75%]", isMe && "flex-row-reverse")}>
                            {/* Avatar */}
                            <div
                              className={cn(
                                "flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold",
                                isMe
                                  ? "bg-pink-100 text-pink-600"
                                  : "bg-blue-100 text-blue-600",
                              )}
                            >
                              {isMe ? "B" : "NV"}
                            </div>
                            <div>
                              <div
                                className={cn(
                                  "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                                  isMe
                                    ? "bg-pink-500 text-white rounded-br-sm"
                                    : "bg-gray-100 text-gray-800 rounded-bl-sm",
                                )}
                              >
                                {msg.content}
                              </div>
                              <p
                                className={cn(
                                  "text-xs text-muted-foreground mt-1",
                                  isMe ? "text-right" : "text-left",
                                )}
                              >
                                {formatDateTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Closed notice */}
              {selectedConv.status === "closed" && (
                <div className="px-5 py-3 bg-gray-50 border-t text-center text-sm text-muted-foreground">
                  Hộp thoại đã đóng. Vui lòng tạo hộp thoại mới nếu cần.
                </div>
              )}

              {/* Input */}
              {canSend && (
                <div className="px-5 py-3 border-t bg-white">
                  <form onSubmit={handleSend} className="flex items-end gap-2">
                    <Textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Nhập tin nhắn..."
                      rows={2}
                      maxLength={2000}
                      className="resize-none flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(e);
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      disabled={!inputText.trim() || sendingMsg}
                      className="bg-pink-500 hover:bg-pink-600 text-white h-10 w-10 p-0 flex-shrink-0"
                    >
                      {sendingMsg ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Nhấn Enter để gửi, Shift+Enter để xuống dòng
                  </p>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Dialogs */}
      <NewTicketDialog
        open={showNewDialog}
        onClose={() => setShowNewDialog(false)}
        onCreate={handleCreate}
      />

      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đóng hộp thoại?</AlertDialogTitle>
            <AlertDialogDescription>
              Hộp thoại sẽ được đóng và bạn sẽ không thể gửi thêm tin nhắn. Nếu cần hỗ trợ thêm vui lòng tạo hộp thoại mới.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={closingConv}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClose}
              disabled={closingConv}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {closingConv ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Xác nhận đóng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
