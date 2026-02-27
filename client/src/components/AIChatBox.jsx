import { useState, useRef, useEffect } from "react";
import { aiService } from "../services/aiService";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/formatters";
import {
  Send,
  X,
  MessageCircle,
  ShoppingCart,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

const AIChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { addToCart } = useCart();

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load session ID from localStorage
  useEffect(() => {
    const savedSessionId = localStorage.getItem("ai_chat_session_id");
    if (savedSessionId) {
      setSessionId(savedSessionId);
      loadChatHistory(savedSessionId);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async (sessionId) => {
    try {
      const response = await aiService.getChatHistory(sessionId);
      if (response.success && response.data) {
        const loadedMessages = response.data.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          suggestedProducts: msg.suggestedProducts || [],
          timestamp: msg.timestamp,
        }));
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, timestamp: new Date() },
    ]);

    setIsLoading(true);

    try {
      const response = await aiService.chat(
        userMessage,
        user?._id,
        sessionId,
        {}, // metadata can be extended
      );

      if (response.success) {
        // Save session ID
        if (!sessionId && response.data.sessionId) {
          setSessionId(response.data.sessionId);
          localStorage.setItem("ai_chat_session_id", response.data.sessionId);
        }

        // Add AI response to chat
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.data.reply,
            suggestedProducts: response.data.suggestedProducts || [],
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Đã xảy ra lỗi khi gửi tin nhắn");

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    if (product.quantity <= 0) {
      toast.error("Sản phẩm này hiện đang hết hàng");
      return;
    }

    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
    });

    toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  const handleClearChat = () => {
    if (window.confirm("Bạn có chắc muốn xóa lịch sử chat?")) {
      setMessages([]);
      if (sessionId) {
        localStorage.removeItem("ai_chat_session_id");
        aiService.deleteChatHistory(sessionId).catch(console.error);
        setSessionId(null);
      }
      toast.success("Đã xóa lịch sử chat");
    }
  };

  const renderMessage = (message, index) => {
    const isUser = message.role === "user";

    return (
      <div
        key={index}
        className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      >
        <div
          className={`max-w-[80%] rounded-lg px-4 py-2 ${
            isUser ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-800"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

          {/* Display suggested products */}
          {!isUser && message.suggestedProducts?.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-semibold text-gray-600">
                Sản phẩm đề xuất:
              </p>
              {message.suggestedProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg p-2 border border-gray-200"
                >
                  <div className="flex gap-2 items-start">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold text-gray-800 line-clamp-2">
                        {product.name}
                      </h4>
                      <p className="text-xs text-pink-600 font-bold mt-1">
                        {formatPrice(product.price)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.quantity > 0
                          ? `Còn ${product.quantity} sp`
                          : "Hết hàng"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.quantity <= 0}
                    className="w-full mt-2 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white text-xs py-1 rounded flex items-center justify-center gap-1"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    Thêm vào giỏ
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-pink-500 hover:bg-pink-600 text-white rounded-full p-4 shadow-lg z-50 transition-transform hover:scale-110"
          aria-label="Open AI Chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Box */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">AI Tư Vấn Sữa</h3>
                <p className="text-xs opacity-90">Chuyên gia tư vấn 24/7</p>
              </div>
            </div>
            <div className="flex gap-2">
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className="hover:bg-pink-600 p-1 rounded"
                  title="Xóa lịch sử chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-pink-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">
                  Xin chào! Tôi là AI tư vấn sữa cho mẹ và bé.
                </p>
                <p className="text-xs mt-2">
                  Hãy hỏi tôi về sản phẩm, độ tuổi phù hợp, dinh dưỡng...
                </p>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() =>
                      setInputMessage("Bé 2 tuổi nên dùng sữa nào?")
                    }
                    className="w-full text-left text-xs bg-white hover:bg-gray-100 p-2 rounded border"
                  >
                    💡 Bé 2 tuổi nên dùng sữa nào?
                  </button>
                  <button
                    onClick={() =>
                      setInputMessage("Sữa nào tốt cho bé táo bón?")
                    }
                    className="w-full text-left text-xs bg-white hover:bg-gray-100 p-2 rounded border"
                  >
                    💡 Sữa nào tốt cho bé táo bón?
                  </button>
                  <button
                    onClick={() =>
                      setInputMessage("Giá sữa Similac bao nhiêu?")
                    }
                    className="w-full text-left text-xs bg-white hover:bg-gray-100 p-2 rounded border"
                  >
                    💡 Giá sữa Similac bao nhiêu?
                  </button>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) =>
                  renderMessage(message, index),
                )}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t bg-white rounded-b-lg"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatBox;
