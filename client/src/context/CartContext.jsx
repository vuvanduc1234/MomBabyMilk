// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Lấy giỏ hàng từ localStorage khi khởi tạo
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Lưu giỏ hàng vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Thêm sản phẩm vào giỏ (bao gồm cả pre-order)
  const addToCart = (product, preOrderOptions = null) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);

      if (existingItem) {
        // Nếu đã có, tăng số lượng
        const quantityToAdd = preOrderOptions?.quantity || 1;
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item,
        );
      } else {
        // Nếu chưa có, thêm mới
        const newItem = {
          ...product,
          quantity: preOrderOptions?.quantity || 1,
          // Thông tin pre-order (nếu có)
          ...(preOrderOptions && {
            isPreOrder: true,
            preOrderType: preOrderOptions.preOrderType,
            paymentOption: preOrderOptions.paymentOption,
            releaseDate: preOrderOptions.releaseDate,
            addedAt: new Date().toISOString(),
          }),
        };
        return [...prev, newItem];
      }
    });
  };

  // Cập nhật số lượng
  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.min(quantity, item.stock || 999) }
          : item,
      ),
    );
  };

  // Xóa sản phẩm
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = () => {
    setCartItems([]);
  };

  // Tính tổng số lượng
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Tính tổng số loại sản phẩm (unique items)
  const getTotalUniqueItems = () => {
    return cartItems.length;
  };

  // Tính tổng giá
  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + (item.sale_price || item.price) * item.quantity,
      0,
    );
  };

  // Lấy danh sách sản phẩm thường (không phải pre-order)
  const getRegularItems = () => {
    return cartItems.filter((item) => !item.isPreOrder);
  };

  // Lấy danh sách sản phẩm pre-order
  const getPreOrderItems = () => {
    return cartItems.filter((item) => item.isPreOrder);
  };

  // Lấy danh sách pre-order theo loại
  const getPreOrdersByType = (type) => {
    return cartItems.filter(
      (item) => item.isPreOrder && item.preOrderType === type,
    );
  };

  // Tính tổng giá cần thanh toán ngay (regular + pre-order PAY_NOW)
  const getTotalPayNow = () => {
    return cartItems
      .filter((item) => !item.isPreOrder || item.paymentOption === "PAY_NOW")
      .reduce(
        (total, item) =>
          total + (item.sale_price || item.price) * item.quantity,
        0,
      );
  };

  // Cập nhật payment option cho pre-order item
  const updatePaymentOption = (id, paymentOption) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, paymentOption } : item)),
    );
  };

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalUniqueItems,
    getTotalPrice,
    getRegularItems,
    getPreOrderItems,
    getPreOrdersByType,
    getTotalPayNow,
    updatePaymentOption,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
