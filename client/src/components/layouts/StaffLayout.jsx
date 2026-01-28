import { useState } from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  LogOut,
  Menu,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/staff" },
  { icon: ShoppingCart, label: "Đơn hàng", href: "/staff/orders" },
  { icon: Package, label: "Sản phẩm", href: "/staff/products" },
  { icon: Warehouse, label: "Kho hàng", href: "/staff/inventory" },
];

export function StaffLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // TODO: Add auth check when auth is implemented
  // const { profile } = useAuth();
  // if (!profile || !["admin", "staff"].includes(profile.role)) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-muted/30">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold text-foreground mb-4">
  //           Không có quyền truy cập
  //         </h1>
  //         <p className="text-muted-foreground mb-6">
  //           Bạn cần quyền Staff để truy cập trang này.
  //         </p>
  //         <Button asChild>
  //           <Link to="/">Về trang chủ</Link>
  //         </Button>
  //       </div>
  //     </div>
  //   );
  // }

  const handleLogout = async () => {};

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6">
        <Link to="/staff" className="flex items-center gap-3">
          <img src="/nura-logo-accent.svg" className="max-h-8" />
          <div className="h-6 w-px bg-gray-300" />
          <span className="text-xs text-secondary-foreground">
            Dành cho <br /> nhân viên
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 text-sm",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      <div className="pt-1 pb-4">
        {/* Profile */}
        <div className="py-1">
          <Link
            to="/staff/profile"
            className="flex items-center gap-3 px-3 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <div className="w-10 h-10 bg-muted rounded-full"></div>
            <div>
              <p className="text-foreground">userName</p>
              <p className="text-xs">Cửa hảng trưởng</p>
            </div>
          </Link>
        </div>

        {/* <Link
          to="/"
          className="flex items-center gap-3 px-3 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Home className="h-5 w-5" strokeWidth={1.75} />
          Về trang chủ
        </Link> */}
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.75} />
          Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:m-4 lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border rounded-2xl bg-card lg:shadow-2xs">
        <Sidebar />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden p-4 sticky top-0 z-40 bg-gray-50/50 backdrop-blur-sm">
        <header className="flex items-center justify-between h-16 px-4 border rounded-2xl bg-card">
          <Link to="/staff" className="flex items-center gap-3">
            <img src="/nura-logo-accent.svg" className="max-h-8" />
            <div className="h-6 w-px bg-gray-300" />
            <span className="text-xs text-secondary-foreground">
              Dành cho nhân viên
            </span>
          </Link>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </header>
      </div>

      {/* Main Content */}
      <main className="lg:pl-68">
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
