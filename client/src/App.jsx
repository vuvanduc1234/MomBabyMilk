// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

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
import ForgotPassword from "./pages/Auth/ForgotPassword";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col relative">
            <SakuraFalling /> {/* Hoa rơi toàn trang */}
            <Header /> {/* Giữ sticky top-0 z-50 */}
            <main className="flex-1 relative z-10">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<ProductListing />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
