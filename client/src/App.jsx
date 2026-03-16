// App.jsx - FIXED VERSION
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "@/components/ui/sonner";

import ProductListing from "./pages/Products/ProductListing";
import ProductDetail from "./pages/Products/ProductDetail";
import Cart from "./pages/Cart/Cart";
import Header from "./components/layouts/Header";
import Footer from "./components/layouts/Footer";
import SakuraFalling from "./components/SakuraFalling";
import Checkout from "./pages/Checkout/Checkout";
import Index from "./pages/Index";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import VerifyEmailOTP from "./pages/Auth/VerifyEmailOTP";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import PaymentResult from "./pages/PaymentResult";
import BlogList from "./pages/blog/BlogList";
import BlogPost from "./pages/blog/BlogPost";

import AccountPage from "./pages/Account";

import { StaffLayout } from "./components/layouts/StaffLayout";
import StaffDashboard from "./pages/staff/Dashboard";
import StaffOrders from "./pages/staff/orders/Orders";
import StaffPreOrders from "./pages/staff/PreOrders";
import StaffInventory from "./pages/staff/Inventory";
import StaffVouchers from "./pages/staff/VoucherManagement";
import StaffRewards from "./pages/staff/RewardsManagement";
import StaffProducts from "./pages/staff/products/Products";
import StaffBrands from "./pages/staff/brands/Brands";
import StaffCategories from "./pages/staff/categories/Categories";
import { AdminLayout } from "./components/layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AccountManagement from "./pages/admin/AccountManagement";
import RevenueStatistics from "./pages/admin/RevenueStatistics";
import { ProtectedRoute } from "./components/layouts/ProtectedRoute";
import OrderTracking from "./pages/Orders/OrderTracking";
import StaffArticles from "./pages/staff/articles/Articles";
import AIChatBox from "./components/AIChatBox";
import SupportPage from "./pages/Support/SupportPage";
import StaffSupport from "./pages/staff/SupportManagement";

// Public Layout Component
function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* <SakuraFalling />  */}
      <Header />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />
      <AIChatBox />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Staff routes - separate layout */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={["Staff"]}>
                  <StaffLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StaffDashboard />} />
              <Route path="orders" element={<StaffOrders />} />
              <Route path="preorders" element={<StaffPreOrders />} />
              <Route path="inventory" element={<StaffInventory />} />
              <Route path="profile" element={<AccountPage />} />
              <Route path="vouchers" element={<StaffVouchers />} />
              <Route path="rewards" element={<StaffRewards />} />
              <Route path="products" element={<StaffProducts />} />
              <Route path="brands" element={<StaffBrands />} />
              <Route path="categories" element={<StaffCategories />} />
              <Route path="articles" element={<StaffArticles />} />
              <Route path="support" element={<StaffSupport />} />
            </Route>

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="accounts" element={<AccountManagement />} />
              <Route path="revenue" element={<RevenueStatistics />} />
              <Route path="orders" element={<StaffOrders />} />
              <Route path="products" element={<StaffProducts />} />
              <Route path="vouchers" element={<StaffVouchers />} />
            </Route>

            {/* Public routes - with Header/Footer */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<ProductListing />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />

              {/* Protected routes - require login */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/payment-result" element={<PaymentResult />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmailOTP />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:id" element={<BlogPost />} />

              <Route path="/track-order" element={<OrderTracking />} />
              <Route
                path="/support"
                element={
                  <ProtectedRoute>
                    <SupportPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
          <Toaster position="bottom-right" richColors />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
