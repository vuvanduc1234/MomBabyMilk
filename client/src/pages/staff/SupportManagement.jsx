// src/pages/staff/SupportManagement.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  Send,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  Headphones,
  User,
  UserCheck,
  ChevronDown,
  Inbox,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getConversations,
  getMessages,
  sendMessage,
  assignConversation,
  updateStatus,
} from "@/services/supportService";
import { formatDateTime } from "@/lib/formatters";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  open: {
    label: "Chờ xử lý",
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

// ─── Sidebar Item ─────────────────────────────────────────────────────────────
function ConvItem({ conv, selected, onClick }) {
  return (
    <button
      onClick={() => onClick(conv)}
      className={cn(
        "w-full text-left px-4 py-3 transition-colors hover:bg-gray-50 border-b last:border-b-0",
        selected && "bg-blue-50 border-l-2 border-l-blue-500",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground line-clamp-1 flex-1">
          {conv.subject}
        </p>
        {conv.unreadByStaff > 0 && (
          <span className="flex-shrink-0 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {conv.unreadByStaff}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mt-1.5 gap-2 flex-wrap">
        <StatusBadge status={conv.status} />
        {!conv.staff ? (
          <span className="text-xs text-orange-500 font-medium">Chưa nhận</span>
        ) : (
          <span className="text-xs text-muted-foreground truncate max-w-[100px]">
            {conv.staff.fullname}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-muted-foreground truncate">
          KH: {conv.user?.fullname}
        </p>
        <p className="text-xs text-muted-foreground flex-shrink-0">
          {formatDateTime(conv.lastMessageAt)}
        </p>
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SupportManagement() {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [assigningId, setAssigningId] = useState(null);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterUnassigned, setFilterUnassigned] = useState(false);

  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const lastMsgIdRef = useRef(null);
  const convPollRef = useRef(null);

  // scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── fetch conversations ────────────────────────────────────────────────
  const fetchConversations = useCallback(
    async (silent = false) => {
      if (!silent) setLoadingConvs(true);
      try {
        const params = {};
        if (filterStatus) params.status = filterStatus;
        if (filterUnassigned) params.unassigned = true;
        const data = await getConversations(params);
        setConversations(data.conversations || []);
      } catch {
        // silent fail
      } finally {
        setLoadingConvs(false);
      }
    },
    [filterStatus, filterUnassigned],
  );

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Poll conversation list every 5s
  useEffect(() => {
    if (convPollRef.current) clearInterval(convPollRef.current);
    convPollRef.current = setInterval(() => fetchConversations(true), 5000);
    return () => clearInterval(convPollRef.current);
  }, [fetchConversations]);

  // Sync selectedConv from list updates
  useEffect(() => {
    if (selectedConv) {
      const updated = conversations.find((c) => c._id === selectedConv._id);
      if (updated) setSelectedConv(updated);
    }
  }, [conversations]); // eslint-disable-line

  // ── fetch messages ────────────────────────────────────────────────────
  const fetchMessages = useCallback(async (convId, silent = false) => {
    if (!convId) return;
    if (!silent) setLoadingMsgs(true);
    try {
      const data = await getMessages(convId, { limit: 100 });
      const msgs = data.messages || [];
      setMessages(msgs);
      if (msgs.length > 0)
        lastMsgIdRef.current = msgs[msgs.length - 1]._id;
    } catch {
      // silent
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  // Poll messages every 3s when conversation is active
  useEffect(() => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (selectedConv && selectedConv.status !== "closed") {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const data = await getMessages(selectedConv._id, { limit: 100 });
          const msgs = data.messages || [];
          const newLast = msgs.length > 0 ? msgs[msgs.length - 1]._id : null;
          if (newLast && newLast !== lastMsgIdRef.current) {
            lastMsgIdRef.current = newLast;
            setMessages(msgs);
          }
        } catch {
          // silent
        }
      }, 3000);
    }
    return () => clearInterval(pollIntervalRef.current);
  }, [selectedConv]);

  // ── select ────────────────────────────────────────────────────────────
  const handleSelectConv = useCallback(
    (conv) => {
      setSelectedConv(conv);
      setMessages([]);
      lastMsgIdRef.current = null;
      fetchMessages(conv._id);
    },
    [fetchMessages],
  );

  // ── send message ──────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConv) return;
    if (selectedConv.status === "closed") return;

    const text = inputText.trim();
    setInputText("");
    setSendingMsg(true);

    const optimistic = {
      _id: `opt-${Date.now()}`,
      content: text,
      senderRole: "staff",
      sender: { fullname: user?.fullname, _id: user?._id },
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await sendMessage(selectedConv._id, text);
      await fetchMessages(selectedConv._id, true);
      fetchConversations(true);
    } catch (err) {
      toast.error(err?.message || "Gửi tin nhắn thất bại");
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      setInputText(text);
    } finally {
      setSendingMsg(false);
    }
  };

  // ── assign ticket ─────────────────────────────────────────────────────
  const handleAssign = async (convId) => {
    setAssigningId(convId);
    try {
      const data = await assignConversation(convId);
      toast.success("Đã nhận hộp thoại thành công!");
      setSelectedConv(data.conversation);
      fetchConversations(true);
    } catch (err) {
      toast.error(err?.message || "Không thể nhận hộp thoại");
    } finally {
      setAssigningId(null);
    }
  };

  // ── update status ─────────────────────────────────────────────────────
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedConv) return;
    try {
      const data = await updateStatus(selectedConv._id, newStatus);
      toast.success(`Đã cập nhật trạng thái → ${STATUS_CONFIG[newStatus]?.label}`);
      setSelectedConv(data.conversation);
      fetchConversations(true);
    } catch (err) {
      toast.error(err?.message || "Không thể cập nhật trạng thái");
    }
  };

  const isAssignedToMe =
    selectedConv?.staff?._id?.toString() === user?.id?.toString() ||
    selectedConv?.staff?.toString() === user?.id?.toString();

  const canAssign = selectedConv && !isAssignedToMe && selectedConv.status !== "closed";
  const canSend = selectedConv && selectedConv.status !== "closed" && isAssignedToMe;
  const canUpdateStatus =
    selectedConv &&
    selectedConv.status !== "closed" &&
    (isAssignedToMe || user?.role === "Admin");

  const STATUS_FILTER_OPTIONS = [
    { value: "", label: "Tất cả" },
    { value: "open", label: "Chờ xử lý" },
    { value: "in_progress", label: "Đang xử lý" },
    { value: "resolved", label: "Đã giải quyết" },
    { value: "closed", label: "Đã đóng" },
  ];

  const STATUS_UPDATE_OPTIONS = [
    { value: "open", label: "Chờ xử lý" },
    { value: "in_progress", label: "Đang xử lý" },
    { value: "resolved", label: "Đóng yêu cầu" },
  ];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
            <Headphones className="h-6 w-6 text-blue-500" />
            Hỗ trợ khách hàng
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Quản lý và xử lý yêu cầu hỗ trợ từ khách hàng
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchConversations()}
          className="gap-1.5"
        >
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </Button>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 min-h-[70vh]">
        {/* ── Left: Ticket list ── */}
        <Card className="flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b space-y-2">
            {/* Unassigned toggle */}
            <button
              onClick={() => {
                setFilterUnassigned((p) => !p);
                setLoadingConvs(true);
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                filterUnassigned
                  ? "bg-orange-100 text-orange-700"
                  : "bg-gray-100 text-muted-foreground hover:bg-gray-200",
              )}
            >
              <Inbox className="h-4 w-4" />
              Chưa được tiếp nhận
            </button>
            {/* Status filter */}
            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTER_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => {
                    setFilterStatus(f.value);
                    setFilterUnassigned(false);
                    setLoadingConvs(true);
                  }}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full border transition-colors",
                    filterStatus === f.value && !filterUnassigned
                      ? "bg-blue-500 text-white border-blue-500"
                      : "border-gray-200 text-muted-foreground hover:border-blue-300 hover:text-blue-600",
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
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <MessageSquare className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Không có hộp thoại nào
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <ConvItem
                  key={conv._id}
                  conv={conv}
                  selected={selectedConv?._id === conv._id}
                  onClick={handleSelectConv}
                />
              ))
            )}
          </ScrollArea>

          {/* Summary */}
          <div className="px-4 py-2 border-t text-xs text-muted-foreground">
            {conversations.length} hộp thoại
          </div>
        </Card>

        {/* ── Right: Chat + Actions ── */}
        <Card className="flex flex-col overflow-hidden">
          {!selectedConv ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <Headphones className="h-16 w-16 text-gray-200 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                Chọn một hộp thoại để bắt đầu
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tất cả hộp thoại từ khách hàng sẽ hiện bên trái
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-5 py-3 border-b bg-white flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-semibold text-foreground truncate">
                      {selectedConv.subject}
                    </h2>
                    <StatusBadge status={selectedConv.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      KH: {selectedConv.user?.fullname} ({selectedConv.user?.email})
                    </span>
                    {selectedConv.staff ? (
                      <span className="text-xs text-blue-600 flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        {isAssignedToMe ? "Bạn đang xử lý" : selectedConv.staff.fullname}
                      </span>
                    ) : (
                      <span className="text-xs text-orange-500 font-medium">
                        Chưa tiếp nhận
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {canAssign && (
                    <Button
                      size="sm"
                      onClick={() => handleAssign(selectedConv._id)}
                      disabled={!!assigningId}
                      className="gap-1.5 bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {assigningId ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UserCheck className="h-3.5 w-3.5" />
                      )}
                      Nhận hộp thoại
                    </Button>
                  )}

                  {canUpdateStatus && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-1.5">
                          Trạng thái
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {STATUS_UPDATE_OPTIONS.filter(
                          (o) => o.value !== selectedConv.status,
                        ).map((opt) => (
                          <DropdownMenuItem
                            key={opt.value}
                            onClick={() => handleUpdateStatus(opt.value)}
                          >
                            <StatusBadge status={opt.value} />
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                      const isStaff = msg.senderRole === "staff";
                      return (
                        <div
                          key={msg._id}
                          className={cn(
                            "flex",
                            isStaff ? "justify-end" : "justify-start",
                          )}
                        >
                          <div
                            className={cn(
                              "flex items-end gap-2 max-w-[75%]",
                              isStaff && "flex-row-reverse",
                            )}
                          >
                            {/* Avatar */}
                            <div
                              className={cn(
                                "flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold",
                                isStaff
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-pink-100 text-pink-600",
                              )}
                            >
                              {isStaff ? "NV" : "KH"}
                            </div>
                            <div>
                              <div
                                className={cn(
                                  "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                                  isStaff
                                    ? "bg-blue-500 text-white rounded-br-sm"
                                    : "bg-gray-100 text-gray-800 rounded-bl-sm",
                                )}
                              >
                                {msg.content}
                              </div>
                              <p
                                className={cn(
                                  "text-xs text-muted-foreground mt-1",
                                  isStaff ? "text-right" : "text-left",
                                )}
                              >
                                {msg.sender?.fullname} •{" "}
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
                  Hộp thoại đã đóng.
                </div>
              )}

              {/* Must assign first notice */}
              {selectedConv.status !== "closed" && !isAssignedToMe && (
                <div className="px-5 py-3 bg-amber-50 border-t text-center text-sm text-amber-700">
                  Nhấn <strong>Nhận hộp thoại</strong> để có thể trả lời khách hàng
                </div>
              )}

              {/* Input */}
              {canSend && (
                <div className="px-5 py-3 border-t bg-white">
                  <form onSubmit={handleSend} className="flex items-end gap-2">
                    <Textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Nhập tin nhắn trả lời..."
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
                      className="bg-blue-500 hover:bg-blue-600 text-white h-10 w-10 p-0 flex-shrink-0"
                    >
                      {sendingMsg ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Enter để gửi, Shift+Enter xuống dòng
                  </p>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
