// src/pages/BlogPost.jsx
import { useParams, Link } from "react-router-dom";

// Dữ liệu mẫu (thay bằng fetch API sau)
const posts = {
  1: {
    title: "Top 10 sữa tăng cân tốt nhất cho bé 2025",
    date: "15/01/2025",
    content: `
      <p>Đây là nội dung đầy đủ của bài viết...</p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <h2>Lợi ích của sữa tăng cân</h2>
      <ul class="list-disc pl-6 space-y-2">
        <li>Giúp bé tăng cân đều đặn</li>
        <li>Bổ sung vitamin và khoáng chất cần thiết</li>
        <li>Hỗ trợ hệ tiêu hóa khỏe mạnh</li>
      </ul>
      <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat...</p>
      <!-- Thêm nội dung thật của bạn ở đây -->
    `,
    image:
      "https://cdn.creazilla.com/cliparts/27711/milk-cookies-clipart-xl.png",
  },
  2: {
    title: "Cách chọn sữa cho mẹ sau sinh để nhiều sữa và khỏe mạnh",
    date: "10/01/2025",
    content: `Nội dung bài viết chi tiết về sữa cho mẹ...`,
    image:
      "https://cdn.creazilla.com/cliparts/27711/milk-cookies-clipart-xl.png",
  },
  // Thêm các bài khác
};

export default function BlogPost() {
  const { id } = useParams();
  const post = posts[id];

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Bài viết không tồn tại</h1>
        <Link to="/blog" className="text-pink-600 hover:underline">
          Quay lại Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link
        to="/blog"
        className="text-pink-600 hover:text-pink-700 mb-6 inline-block"
      >
        ← Quay lại danh sách bài viết
      </Link>

      <article className="bg-white rounded-xl shadow-sm p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          {post.title}
        </h1>
        <div className="text-gray-500 text-sm mb-8">{post.date}</div>

        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
          />
        )}

        <div
          className="prose prose-lg max-w-none prose-pink"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}
