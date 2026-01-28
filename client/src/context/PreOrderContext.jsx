// src/context/PreOrderContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const PreOrderContext = createContext();

export const usePreOrder = () => {
  const context = useContext(PreOrderContext);
  if (!context) {
    throw new Error("usePreOrder must be used within PreOrderProvider");
  }
  return context;
};

export const PreOrderProvider = ({ children }) => {
  const [preOrderItems, setPreOrderItems] = useState(() => {
    const saved = localStorage.getItem("preOrders");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("preOrders", JSON.stringify(preOrderItems));
  }, [preOrderItems]);

  // Thêm sản phẩm vào danh sách đặt trước
  const addToPreOrder = (product, preOrderType, paymentOption = null) => {
    setPreOrderItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);

      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        return [
          ...prev,
          {
            ...product,
            quantity: 1,
            preOrderType, // 'OUT_OF_STOCK' hoặc 'COMING_SOON'
            paymentOption, // 'PAY_NOW', 'PAY_LATER', hoặc null (cho COMING_SOON)
            orderedAt: new Date().toISOString(),
            status:
              preOrderType === "OUT_OF_STOCK"
                ? "PREORDER_OUT_OF_STOCK"
                : "PREORDER_COMING_SOON",
          },
        ];
      }
    });
  };

  // Cập nhật số lượng
  const updatePreOrderQuantity = (id, quantity) => {
    if (quantity < 1) return;
    setPreOrderItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  // Xóa sản phẩm đặt trước
  const removeFromPreOrder = (id) => {
    setPreOrderItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Xóa toàn bộ danh sách đặt trước
  const clearPreOrders = () => {
    setPreOrderItems([]);
  };

  // Tính tổng số lượng sản phẩm đặt trước
  const getTotalPreOrderItems = () => {
    return preOrderItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Tính tổng giá đặt trước (chỉ tính những đơn cần thanh toán ngay)
  const getTotalPreOrderPrice = () => {
    return preOrderItems
      .filter((item) => item.paymentOption === "PAY_NOW")
      .reduce(
        (total, item) =>
          total + (item.sale_price || item.price) * item.quantity,
        0,
      );
  };

  // Lấy danh sách đặt trước theo loại
  const getPreOrdersByType = (type) => {
    return preOrderItems.filter((item) => item.preOrderType === type);
  };

  // Cập nhật trạng thái thanh toán
  const updatePaymentOption = (id, paymentOption) => {
    setPreOrderItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, paymentOption } : item)),
    );
  };

  const value = {
    preOrderItems,
    addToPreOrder,
    updatePreOrderQuantity,
    removeFromPreOrder,
    clearPreOrders,
    getTotalPreOrderItems,
    getTotalPreOrderPrice,
    getPreOrdersByType,
    updatePaymentOption,
  };

  return (
    <PreOrderContext.Provider value={value}>
      {children}
    </PreOrderContext.Provider>
  );
};
