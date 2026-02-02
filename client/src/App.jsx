// App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { PreOrderProvider } from "./context/PreOrderContext";

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
import BlogList from "./pages/blog/BlogList";
import BlogPost from "./pages/blog/BlogPost";
import PreOrderList from "./pages/PreOrder/PreOrderList";
import AccountPage from "./pages/Account";

import { StaffLayout } from "./components/layouts/StaffLayout";
import StaffDashboard from "./pages/staff/Dashboard";
import StaffOrders from "./pages/staff/Orders";
import StaffProducts from "./pages/staff/products/Products";
import StaffInventory from "./pages/staff/Inventory";
import NotFound from "./pages/NotFound";
import Articles from "./pages/staff/Articles";
import Customers from "./pages/staff/Customers";
import Vouchers from "./pages/staff/Vouchers";
import Complaints from "./pages/staff/Complaints";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Staff routes - separate layout */}
            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<StaffDashboard />} />
              <Route path="orders" element={<StaffOrders />} />
              <Route path="products" element={<StaffProducts />} />
              <Route path="inventory" element={<StaffInventory />} />
              <Route path="articles" element={<Articles />}/>
              <Route path="customers" element={<Customers />}/>
              <Route path="vouchers" element={<Vouchers />}/>
              <Route path="complaints" element={<Complaints />}/>
            </Route>

            {/* Public routes - with Header/Footer */}
            <Route
              path="/*"
              element={
                <div className="min-h-screen bg-gray-50 flex flex-col relative">
                  {/* <SakuraFalling />  */}
                  <Header />
                  <main className="flex-1 relative z-10">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/products" element={<ProductListing />} />
                      <Route
                        path="/product/:slug"
                        element={<ProductDetail />}
                      />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/blog" element={<BlogList />} />
                      <Route path="/blog/:id" element={<BlogPost />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
