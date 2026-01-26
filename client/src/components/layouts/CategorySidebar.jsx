import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const navigationItems = [
  {
    title: "Sữa cho bé",
    slug: "sua-cho-be",
    subcategories: [
      {
        title: "Theo độ tuổi",
        items: [
          { name: "0–6 tháng", slug: "0-6-thang" },
          { name: "6–12 tháng", slug: "6-12-thang" },
          { name: "1–3 tuổi", slug: "1-3-tuoi" },
          { name: "3+ tuổi", slug: "tren-3-tuoi" },
        ],
      },
      {
        title: "Theo loại",
        items: [
          { name: "Sữa bột cho bé", slug: "sua-bot-cho-be" },
          { name: "Sữa pha sẵn cho bé", slug: "sua-pha-san-cho-be" },
        ],
      },
      {
        title: "Theo công dụng",
        items: [
          { name: "Tăng cân", slug: "tang-can" },
          { name: "Phát triển trí não", slug: "tri-nao" },
          { name: "Tăng chiều cao", slug: "tang-chieu-cao" },
          { name: "Hỗ trợ tiêu hóa", slug: "tieu-hoa" },
          { name: "Không lactose", slug: "khong-lactose" },
        ],
      },
    ],
    brands: [
      { name: "Meiji", slug: "meiji" },
      { name: "Friso", slug: "friso" },
      { name: "Aptamil", slug: "aptamil" },
      { name: "NAN", slug: "nan" },
      { name: "Enfamil", slug: "enfamil" },
    ],
  },

  {
    title: "Sữa cho mẹ",
    slug: "sua-cho-me",
    subcategories: [
      {
        title: "Theo giai đoạn",
        items: [
          { name: "Sữa cho mẹ bầu", slug: "sua-me-bau" },
          { name: "Sữa cho mẹ sau sinh", slug: "sua-me-sau-sinh" },
        ],
      },
      {
        title: "Theo công dụng",
        items: [
          { name: "Bổ sung DHA & Canxi", slug: "dha-canxi" },
          { name: "Ít đường", slug: "it-duong" },
          { name: "Kiểm soát cân nặng", slug: "kiem-soat-can-nang" },
          { name: "Dễ tiêu hóa", slug: "de-tieu-hoa" },
        ],
      },
      {
        title: "Theo dạng",
        items: [
          { name: "Sữa bột", slug: "sua-bot" },
          { name: "Sữa pha sẵn", slug: "sua-pha-san" },
        ],
      },
    ],
  },

  {
    title: "Sữa tươi & sữa hạt",
    slug: "sua-tuoi-sua-hat",
    subcategories: [
      {
        title: "Sữa tươi",
        items: [
          { name: "Có đường", slug: "co-duong" },
          { name: "Ít đường", slug: "it-duong" },
          { name: "Không đường", slug: "khong-duong" },
          { name: "Tiệt trùng", slug: "tiet-trung" },
          { name: "Thanh trùng", slug: "thanh-trung" },
        ],
      },
      {
        title: "Sữa hạt",
        items: [
          { name: "Hạnh nhân", slug: "hanh-nhan" },
          { name: "Óc chó", slug: "oc-cho" },
          { name: "Yến mạch", slug: "yen-mach" },
          { name: "Đậu nành", slug: "dau-nanh" },
          { name: "Không đường", slug: "sua-hat-khong-duong" },
        ],
      },
    ],
  },

  {
    title: "Sữa chua & váng sữa",
    slug: "sua-chua-vang-sua",
    subcategories: [
      {
        title: "Loại sản phẩm",
        items: [
          { name: "Sữa chua ăn", slug: "sua-chua-an" },
          { name: "Sữa chua uống", slug: "sua-chua-uong" },
          { name: "Váng sữa cho bé", slug: "vang-sua-cho-be" },
        ],
      },
      {
        title: "Theo lợi ích",
        items: [
          { name: "Hỗ trợ tiêu hóa", slug: "ho-tro-tieu-hoa" },
          { name: "Bổ sung lợi khuẩn", slug: "loi-khuan" },
        ],
      },
    ],
  },

  {
    title: "Bơ sữa & phô mai",
    slug: "bo-sua-pho-mai",
    subcategories: [
      {
        title: "Phô mai",
        items: [
          { name: "Phô mai lát", slug: "pho-mai-lat" },
          { name: "Phô mai viên", slug: "pho-mai-vien" },
          { name: "Phô mai cho bé", slug: "pho-mai-cho-be" },
        ],
      },
      {
        title: "Bơ sữa",
        items: [
          { name: "Bơ lạt", slug: "bo-lat" },
          { name: "Bơ mặn", slug: "bo-man" },
          { name: "Dùng nấu ăn", slug: "bo-nau-an" },
        ],
      },
    ],
  },
];

export function CategorySidebar() {
  const [activeCategory, setActiveCategory] = useState(null);

  return (
    <aside className="w-64 bg-card rounded-lg border border-border shadow-sm hidden lg:block relative h-fit">
      <nav className="py-2">
        <ul className="space-y-0.5">
          {navigationItems.map((item) => (
            <li
              key={item.slug}
              className="relative"
              onMouseEnter={() => setActiveCategory(item.slug)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <Link
                to={`/san-pham?category=${item.slug}`}
                className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                  activeCategory === item.slug
                    ? "bg-muted/50 text-primary"
                    : "text-foreground hover:bg-muted/50 hover:text-primary"
                }`}
              >
                <span>{item.title}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              {/* Submenu */}
              {activeCategory === item.slug &&
                (item.subcategories || item.brands) && (
                  <div
                    className="absolute left-full top-0 ml-0 w-100 bg-card border border-border rounded-lg shadow-lg z-50 p-4"
                    onMouseEnter={() => setActiveCategory(item.slug)}
                    onMouseLeave={() => setActiveCategory(null)}
                  >
                    {/* Category Title */}
                    <h3 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border">
                      {item.title}
                    </h3>

                    {/* Subcategories Grid */}
                    {item.subcategories && (
                      <div className="grid grid-cols-2 gap-6 mb-4">
                        {item.subcategories.map((subcat) => (
                          <div key={subcat.title}>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">
                              {subcat.title}
                            </h4>
                            <ul>
                              {subcat.items.map((subItem) => (
                                <Link
                                  to={`/products?category=${item.slug}&sub=${subItem.slug}`}
                                  className="text-sm text-foreground hover:text-primary"
                                >
                                  <li key={subItem.slug} className="py-1.5">
                                    {subItem.name}
                                  </li>
                                </Link>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* View All Link */}
                    <Link
                      to={`/san-pham?category=${item.slug}`}
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-4"
                    >
                      Xem tất cả <ChevronRight className="h-3 w-3" />
                    </Link>

                    {/* Brands Section */}
                    {item.brands && item.brands.length > 0 && (
                      <div className="pt-4 border-t border-border">
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">
                          Thương hiệu
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {item.brands.map((brand) => (
                            <Link
                              key={brand.slug}
                              to={`/products?brand=${brand.slug}`}
                              className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-md text-foreground transition-colors"
                            >
                              {brand.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
