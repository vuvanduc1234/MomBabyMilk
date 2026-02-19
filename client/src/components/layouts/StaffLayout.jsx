import { useState } from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  Menu,
  Users,
  TicketPercent,
  MessageCircleWarning,
  User,
  Tag,
  List,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/staff" },
  { icon: ShoppingCart, label: "Đơn hàng", href: "/staff/orders" },
  { icon: TicketPercent, label: "Voucher", href: "/staff/vouchers" },
  { icon: Package, label: "Sản phẩm", href: "/staff/products" },
  { icon: Tag, label: "Thương hiệu", href: "/staff/brands" },
  { icon: List, label: "Danh mục", href: "/staff/categories" },
];

// MobileSidebar component extracted to avoid re-creation on each render
function MobileSidebar({ user, location, setMobileOpen, handleLogout }) {
  return (
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
                  "flex items-center gap-3 px-4 py-3 text-sm",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon strokeWidth={1.75} />
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
            className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-foreground">{user?.username || "User"}</p>
              <p className="text-xs">{user?.role || "Staff"}</p>
            </div>
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.75} />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

export function StaffLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Horizontal Top Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="container mx-auto">
          <div className="flex py-3 items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/staff" className="flex items-center gap-3 shrink-0">
              <img src="/nura-logo-accent.svg" className="max-h-8" alt="Logo" />
              <div className="h-6 w-px bg-gray-300" />
              <span className="text-xs text-secondary-foreground hidden sm:block">
                Dành cho nhân viên
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2 flex-1 justify-center">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "px-3 py-2 text-sm rounded-full transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon
                      className="h-6 w-6 xl:hidden"
                      strokeWidth={1.75}
                    />
                    <div className="hidden xl:block">{item.label}</div>
                  </Link>
                );
              })}
            </nav>

            {/* Desktop User Menu */}
            <div className="hidden lg:flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm">{user?.name || "User"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">{user?.name || "User"}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.role || "Staff"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/staff/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Trang cá nhân
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <MobileSidebar
                  user={user}
                  location={location}
                  setMobileOpen={setMobileOpen}
                  handleLogout={handleLogout}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex py-4 gap-4">
        <div className="w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
