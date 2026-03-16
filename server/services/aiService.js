const { GoogleGenAI } = require("@google/genai");
const Product = require("../models/ProductModel");
const Blog = require("../models/BlogModel");
const Order = require("../models/OrderModel");

class AIService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.error(
        "GEMINI_API_KEY is not configured in environment variables",
      );
    }
    this.genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  /**
   * Get relevant products based on user query
   */
  async getRelevantProducts(query, limit = 10) {
    try {
      // Extract keywords and search for products
      const keywords = this.extractKeywords(query);

      // Determine if query is asking for highly rated products
      const isAskingForRating = query.match(/(đánh giá|sao|star|tốt|cao|review|chất lượng)/i);
      let minRating = 0;
      if (isAskingForRating) {
        const starMatch = query.match(/(\d([\.,]\d)?)\s*(sao|star)/i);
        if (starMatch) {
          minRating = parseFloat(starMatch[1].replace(',', '.'));
        } else if (query.match(/(tốt|cao|chất lượng|5 sao)/i)) {
          minRating = 4; // default minimum for "good"
        }
      }

      let products = [];
      let baseFilters = [];

      // Try keyword search first
      if (keywords.length > 0) {
        baseFilters.push({
          $or: [
            { name: { $regex: keywords.join("|"), $options: "i" } },
            { description: { $regex: keywords.join("|"), $options: "i" } },
            { tags: { $regex: keywords.join("|"), $options: "i" } },
            { appropriateAge: { $regex: keywords.join("|"), $options: "i" } },
          ],
        });
      }

      // Add minimum rating filter if requested
      if (minRating > 0) {
        baseFilters.push({
          $expr: {
            $gte: [
              {
                $cond: {
                  if: { $gt: [{ $size: { $ifNull: ["$comments", []] } }, 0] },
                  then: { $avg: "$comments.rating" },
                  else: 0,
                },
              },
              minRating,
            ],
          },
        });
      }

      const searchQuery = baseFilters.length > 0 ? { $and: baseFilters } : { quantity: { $gt: 0 } };

      products = await Product.find(searchQuery)
        .populate("category", "name")
        .populate("brand", "name")
        .sort(minRating > 0 ? {} : { quantity: -1 })
        .limit(limit)
        .select(
          "name price description quantity appropriateAge weight imageUrl tags comments",
        )
        .lean();

      // Fallback: if no products found, get popular products or fallback highly-rated products
      if (products.length === 0) {
        const fallbackQuery = minRating > 0 ? {
          $and: [
            { quantity: { $gt: 0 } },
            {
              $expr: {
                $gte: [
                  {
                    $cond: {
                      if: { $gt: [{ $size: { $ifNull: ["$comments", []] } }, 0] },
                      then: { $avg: "$comments.rating" },
                      else: 0,
                    },
                  },
                  minRating,
                ],
              },
            },
          ],
        } : { quantity: { $gt: 0 } };

        products = await Product.find(fallbackQuery)
          .populate("category", "name")
          .populate("brand", "name")
          .sort({ quantity: -1 })
          .limit(limit)
          .select(
            "name price description quantity appropriateAge weight imageUrl tags comments",
          )
          .lean();
      }

      // Compute avgRating for standard cases too, to pass to AI
      products = products.map((p) => {
        const comments = p.comments || [];
        const avgRating =
          comments.length > 0
            ? comments.reduce((sum, c) => sum + c.rating, 0) / comments.length
            : 0;
        return { ...p, avgRating };
      });

      return products;
    } catch (error) {
      console.error("Error getting relevant products:", error);
      return [];
    }
  }

  /**
   * Get relevant blog posts
   */
  async getRelevantBlogs(query, limit = 5) {
    try {
      const keywords = this.extractKeywords(query);

      const searchQuery = {
        $or: [
          { title: { $regex: keywords.join("|"), $options: "i" } },
          { content: { $regex: keywords.join("|"), $options: "i" } },
          { tags: { $in: keywords } },
        ],
      };

      const blogs = await Blog.find(searchQuery)
        .limit(limit)
        .select("title content tags")
        .lean();

      return blogs;
    } catch (error) {
      console.error("Error getting relevant blogs:", error);
      return [];
    }
  }

  /**
   * Get user purchase history
   */
  async getUserPurchaseHistory(userId) {
    try {
      if (!userId) return [];

      const orders = await Order.find({
        customer: userId,
        orderStatus: "delivered",
      })
        .populate({
          path: "cartItems.product",
          select: "name category brand appropriateAge",
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      return orders;
    } catch (error) {
      console.error("Error getting user purchase history:", error);
      return [];
    }
  }

  /**
   * Extract keywords from query
   */
  extractKeywords(query) {
    // Only filter out truly meaningless stop words
    // KEEP important product keywords like "sữa", "bé", "mẹ", "bầu"
    const stopWords = [
      "tôi",
      "bạn",
      "của",
      "cho",
      "với",
      "trong",
      "ngoài",
      "và",
      "hoặc",
      "nhưng",
      "nếu",
      "thì",
      "là",
      "có",
      "được",
      "không",
      "các",
      "những",
      "này",
      "đó",
      "kia",
      "nào",
      "đâu",
      "sao",
      "thế",
      "vậy",
      "nên",
      "cần",
      "phải",
      "được",
      "đang",
      "về",
      "từ",
      "đến",
      "trên",
      "dưới",
      "giữa",
      "hãy",
      "xin",
    ];

    const words = query
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => {
        // Keep words longer than 2 chars and not in stop words
        return word.length > 2 && !stopWords.includes(word);
      });

    return words;
  }

  /**
   * Build context for AI
   */
  buildContext(products, blogs, purchaseHistory, userInfo) {
    let context = "";

    // Add product information
    if (products.length > 0) {
      context += "\n\n=== SẢN PHẨM CÓ SẴN ===\n";
      products.forEach((product, index) => {
        context += `\n${index + 1}. ${product.name}`;
        context += `\n   - Giá: ${product.price.toLocaleString("vi-VN")}đ`;
        context += `\n   - Đánh giá: ${product.avgRating > 0 ? product.avgRating.toFixed(1) + '/5 sao' : 'Chưa có đánh giá'}`;
        context += `\n   - Độ tuổi phù hợp: ${product.appropriateAge || "Chưa xác định"}`;
        context += `\n   - Tình trạng: ${product.quantity > 0 ? `Còn ${product.quantity} sản phẩm` : "Hết hàng"}`;
        if (product.category) {
          context += `\n   - Danh mục: ${product.category.name}`;
        }
        if (product.brand) {
          context += `\n   - Thương hiệu: ${product.brand.name}`;
        }
        if (product.description) {
          context += `\n   - Mô tả: ${product.description.substring(0, 200)}...`;
        }
      });
    }

    // Add blog information
    if (blogs.length > 0) {
      context += "\n\n=== BÀI VIẾT TƯ VẤN ===\n";
      blogs.forEach((blog, index) => {
        context += `\n${index + 1}. ${blog.title}`;
        context += `\n   - Nội dung tóm tắt: ${blog.content.substring(0, 200)}...`;
      });
    }

    // Add user purchase history
    if (purchaseHistory && purchaseHistory.length > 0) {
      context += "\n\n=== LỊCH SỬ MUA HÀNG CỦA KHÁCH ===\n";
      purchaseHistory.forEach((order, index) => {
        context += `\nĐơn hàng ${index + 1}:`;
        order.cartItems.forEach((item) => {
          if (item.product) {
            context += `\n  - ${item.product.name}`;
          }
        });
      });
    }

    // Add user information
    if (userInfo) {
      context += "\n\n=== THÔNG TIN KHÁCH HÀNG ===\n";
      if (userInfo.babyAge) {
        context += `Độ tuổi của bé: ${userInfo.babyAge}\n`;
      }
      if (userInfo.preferences && userInfo.preferences.length > 0) {
        context += `Sở thích/Nhu cầu: ${userInfo.preferences.join(", ")}\n`;
      }
      if (userInfo.budget) {
        context += `Ngân sách: ${userInfo.budget.toLocaleString("vi-VN")}đ\n`;
      }
    }

    return context;
  }

  /**
   * Generate AI response
   */
  async generateResponse(message, context, conversationHistory = []) {
    try {
      const systemPrompt = `Bạn là một chuyên gia tư vấn sữa và sản phẩm cho mẹ & bé có nhiều năm kinh nghiệm. Nhiệm vụ của bạn là:

1. Trả lời các câu hỏi về sản phẩm sữa, dinh dưỡng, chăm sóc bé một cách chuyên nghiệp, thân thiện và dễ hiểu
2. Đề xuất tối đa 3 sản phẩm phù hợp nhất dựa trên nhu cầu của khách hàng
3. KHÔNG BAO GIỜ đề xuất hoặc nói về sản phẩm không có trong danh sách "SẢN PHẨM CÓ SẴN"
4. Nếu sản phẩm hết hàng, hãy thông báo và đề xuất sản phẩm thay thế tương tự
5. Luôn ưu tiên sức khỏe và an toàn của bé
6. Giải thích rõ ràng lý do tại sao đề xuất sản phẩm đó
7. Nếu có thông tin từ lịch sử mua hàng, hãy sử dụng để cá nhân hóa đề xuất
8. Trả lời ngắn gọn, súc tích nhưng đầy đủ thông tin

LƯU Ý QUAN TRỌNG:
- Chỉ đề xuất sản phẩm có trong danh sách được cung cấp
- Nếu không có sản phẩm phù hợp, hãy giải thích và đề xuất khách tham khảo thêm
- Đưa ra lời khuyên dựa trên độ tuổi, nhu cầu và ngân sách của khách
- Luôn đề cập đến giá và tình trạng còn hàng khi đề xuất sản phẩm`;

      // Build conversation history
      let conversationText = "";
      if (conversationHistory.length > 0) {
        conversationText = "\n\n=== LỊCH SỬ HỘI THOẠI ===\n";
        conversationHistory.slice(-5).forEach((msg) => {
          conversationText += `${msg.role === "user" ? "Khách hàng" : "Tư vấn viên"}: ${msg.content}\n`;
        });
      }

      const prompt = `${systemPrompt}

${context}
${conversationText}

=== CÂU HỎI MỚI ===
Khách hàng: ${message}

Tư vấn viên:`;

      const result = await this.genAI.models.generateContent({
        model: "models/gemini-2.5-flash",
        contents: prompt,
      });
      const text = result.text;

      return text;
    } catch (error) {
      console.error("Error generating AI response:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });

      // Provide more specific error messages
      if (error.message?.includes("API key")) {
        throw new Error("API key không hợp lệ. Vui lòng kiểm tra cấu hình.");
      } else if (
        error.message?.includes("quota") ||
        error.message?.includes("rate limit")
      ) {
        throw new Error("Đã vượt quá giới hạn API. Vui lòng thử lại sau.");
      } else if (error.message?.includes("model")) {
        throw new Error(
          "Model AI không khả dụng. Vui lòng liên hệ quản trị viên.",
        );
      }

      throw new Error(`Không thể tạo phản hồi từ AI: ${error.message}`);
    }
  }

  /**
   * Extract suggested product names from AI response
   */
  extractSuggestedProducts(aiResponse, availableProducts) {
    const suggestedProducts = [];

    availableProducts.forEach((product) => {
      // Check if product name appears in the response
      if (aiResponse.toLowerCase().includes(product.name.toLowerCase())) {
        suggestedProducts.push(product);
      }
    });

    // Limit to 3 products
    return suggestedProducts.slice(0, 3);
  }

  /**
   * Main chat function
   */
  async chat(message, userId = null, sessionId = null, metadata = {}) {
    try {
      // Get relevant data
      const [products, blogs, purchaseHistory] = await Promise.all([
        this.getRelevantProducts(message),
        this.getRelevantBlogs(message),
        this.getUserPurchaseHistory(userId),
      ]);

      // Build context
      const context = this.buildContext(
        products,
        blogs,
        purchaseHistory,
        metadata,
      );

      // Get conversation history (if needed)
      const conversationHistory = []; // Can load from ChatHistory model if sessionId provided

      // Generate AI response
      const aiResponse = await this.generateResponse(
        message,
        context,
        conversationHistory,
      );

      // Extract suggested products
      const suggestedProducts = this.extractSuggestedProducts(
        aiResponse,
        products,
      );

      return {
        reply: aiResponse,
        suggestedProducts: suggestedProducts.map((p) => ({
          _id: p._id,
          name: p.name,
          price: p.price,
          imageUrl:
            Array.isArray(p.imageUrl) && p.imageUrl.length > 0
              ? p.imageUrl[0]
              : p.imageUrl || "",
          quantity: p.quantity,
          appropriateAge: p.appropriateAge,
          category: p.category,
          brand: p.brand,
        })),
        context: {
          productsFound: products.length,
          blogsFound: blogs.length,
        },
      };
    } catch (error) {
      console.error("Error in AI chat:", error);
      throw error;
    }
  }
}

module.exports = new AIService();
