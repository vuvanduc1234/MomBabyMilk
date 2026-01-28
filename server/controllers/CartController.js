const CartModel = require("../models/CartModel");
const ProductModel = require("../models/ProductModel");


const calculateTotal = (cart) => {
  let total = 0;
  if (cart && cart.items) {
    cart.items.forEach((item) => {
      if (item.productId && item.productId.price) {
        total += item.quantity * item.productId.price;
      }
    });
  }
  return total;
};

// Lấy giỏ hàng
const getCart = async (req, res) => {
  const userId = req.user.id || req.user._id;

  try {
    let cart = await CartModel.findOne({ userId }).populate({
      path: "items.productId",
      select: "name price imageUrl quantity category brand",
    });

    if (!cart) {
      return res.status(200).json({
        message: "Giỏ hàng trống",
        data: { items: [], totalPrice: 0 },
      });
    }

    cart.totalPrice = calculateTotal(cart);
    
    await cart.save();

    res.status(200).json({ message: "Lấy giỏ hàng thành công", data: cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

// Thêm vào giỏ
const addToCart = async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp productId và quantity" });
  }

  try {
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    if (quantity > product.quantity) {
      return res
        .status(400)
        .json({ message: `Kho chỉ còn ${product.quantity} sản phẩm này` });
    }

    let cart = await CartModel.findOne({ userId });

    if (cart) {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        const newQuantity = cart.items[itemIndex].quantity + quantity;
        if (newQuantity > product.quantity) {
          return res.status(400).json({
            message: "Tổng số lượng vượt quá tồn kho cho phép",
          });
        }
        cart.items[itemIndex].quantity = newQuantity;
      } else {
        cart.items.push({ productId, quantity });
      }
      await cart.save();
    } else {
      cart = new CartModel({
        userId,
        items: [{ productId, quantity }],
      });
      await cart.save();
    }

    const updatedCart = await CartModel.findOne({ userId }).populate(
      "items.productId",
      "name price imageUrl"
    );
    updatedCart.totalPrice = calculateTotal(updatedCart);
    await updatedCart.save();

    res
      .status(200)
      .json({ message: "Thêm vào giỏ thành công", data: updatedCart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};


const updateCartItem = async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { productId, quantity } = req.body;

  try {
    const cart = await CartModel.findOne({ userId });
    if (!cart)
      return res.status(404).json({ message: "Giỏ hàng không tìm thấy" });

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex === -1)
      return res.status(404).json({ message: "Sản phẩm không có trong giỏ" });

    const product = await ProductModel.findById(productId);
    if (quantity > product.quantity) {
      return res
        .status(400)
        .json({ message: `Kho chỉ còn ${product.quantity} sản phẩm` });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    const updatedCart = await CartModel.findOne({ userId }).populate(
      "items.productId",
      "name price imageUrl"
    );
    

    updatedCart.totalPrice = calculateTotal(updatedCart);
    await updatedCart.save(); 

    res.status(200).json({
      message: "Cập nhật giỏ hàng thành công",
      data: updatedCart,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

// Xóa item
const removeCartItem = async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { productId } = req.params;

  try {
    const cart = await CartModel.findOne({ userId });
    if (!cart)
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();

    const updatedCart = await CartModel.findOne({ userId }).populate(
      "items.productId",
      "name price imageUrl"
    );
    updatedCart.totalPrice = calculateTotal(updatedCart);
    await updatedCart.save();

    res
      .status(200)
      .json({ message: "Đã xóa sản phẩm khỏi giỏ", data: updatedCart });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };