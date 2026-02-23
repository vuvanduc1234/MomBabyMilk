import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Loader2 } from "lucide-react";
import { getHierarchicalCategories } from "../../services/categoryService";

export function CategorySidebar() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const data = await getHierarchicalCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <aside className="w-64 bg-card rounded-lg border border-border shadow-sm hidden lg:block relative h-fit">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-card rounded-lg border border-border shadow-sm hidden lg:block relative h-fit">
      <nav className="py-2">
        <ul className="space-y-0.5">
          {categories.map((item) => (
            <li
              key={item._id}
              className="relative"
              onMouseEnter={() => setActiveCategory(item._id)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <Link
                to={`/products?category=${item._id}`}
                className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                  activeCategory === item._id
                    ? "bg-muted/50 text-primary"
                    : "text-foreground hover:bg-muted/50 hover:text-primary"
                }`}
              >
                <span>{item.name}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              {/* Submenu */}
              {activeCategory === item._id &&
                (item.subcategories?.length > 0 || item.brands?.length > 0) && (
                  <div
                    className="absolute left-full top-0 ml-0 w-100 bg-card border border-border rounded-lg shadow-lg z-50 p-4"
                    onMouseEnter={() => setActiveCategory(item._id)}
                    onMouseLeave={() => setActiveCategory(null)}
                  >
                    {/* Category Title */}
                    <h3 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border">
                      {item.name}
                    </h3>

                    {/* Subcategories */}
                    {item.subcategories && item.subcategories.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          Danh mục con
                        </h4>
                        <ul className="space-y-1.5">
                          {item.subcategories.map((subcat) => (
                            <li key={subcat._id}>
                              <Link
                                to={`/products?category=${subcat._id}`}
                                className="text-sm text-foreground hover:text-primary block py-1"
                              >
                                {subcat.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* View All Link */}
                    <Link
                      to={`/products?category=${item._id}`}
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
                              key={brand._id}
                              to={`/products?brand=${brand._id}`}
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
