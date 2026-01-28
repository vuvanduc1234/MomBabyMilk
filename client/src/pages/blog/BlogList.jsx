// src/pages/BlogList.jsx
import { Link } from "react-router-dom";

// Dữ liệu mẫu (sau này bạn có thể fetch từ API hoặc dùng CMS)
const posts = [
  {
    id: 1,
    title: "Top 10 sữa tăng cân tốt nhất cho bé 2025",
    excerpt:
      "Những loại sữa giúp bé tăng cân đều, khỏe mạnh và phát triển chiều cao tối ưu. Đánh giá chi tiết từ chuyên gia dinh dưỡng...",
    date: "15/01/2025",
    // Ví dụ trong posts array hoặc object
    image:
      "https://cdn.creazilla.com/cliparts/27711/milk-cookies-clipart-xl.png", // hoặc link bạn tải về từ Pngtree
  },
  {
    id: 2,
    title: "Cách chọn sữa cho mẹ sau sinh để nhiều sữa và khỏe mạnh",
    excerpt:
      "Bí quyết chọn sữa bầu/sữa mẹ sau sinh giúp mẹ hồi phục nhanh, sữa về nhiều và chất lượng tốt cho bé...",
    date: "10/01/2025",
    // Ví dụ trong posts array hoặc object
    image:
      "https://cdn.creazilla.com/cliparts/27711/milk-cookies-clipart-xl.png", // hoặc link bạn tải về từ Pngtree
  },
  {
    id: 3,
    title: "Bé biếng ăn nên uống sữa gì? Mẹ cần lưu ý gì?",
    excerpt:
      "Các loại sữa dành riêng cho trẻ biếng ăn, kèm mẹo kích thích vị giác và cải thiện tình trạng biếng ăn hiệu quả...",
    date: "05/01/2025",
    // Ví dụ trong posts array hoặc object
    image:
      "https://cdn.creazilla.com/cliparts/27711/milk-cookies-clipart-xl.png", // hoặc link bạn tải về từ Pngtree
  },
  // Thêm bài khác nếu muốn
];

export default function BlogList() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
        Blog Mẹ & Bé
      </h1>

      <div className="max-w-3xl mx-auto space-y-10">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.id}`}
            className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100"
          >
            <div className="md:flex">
              <div className="md:w-1/3">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-6 md:w-2/3 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 group-hover:text-pink-600 transition mb-3">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
                <div className="text-sm text-gray-500">{post.date}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
