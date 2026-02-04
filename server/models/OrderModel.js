const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customerClerkId: { type: String, required: true }, 
    
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        color: String,
        size: String,
        quantity: { type: Number, required: true },
    }],

    shippingAddress: { type: String, required: true },

    totalAmount: { type: Number, required: true },

    voucherUsed: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher", default: null },

    paymentMethod: { 
        type: String, 
        enum: ["momo", "vnpay", "cod"], 
        default: "cod" 
    },
    
    paymentStatus: { 
        type: String, 
        enum: ["pending", "paid", "failed"], 
        default: "pending" 
    },
    
    orderStatus: { 
        type: String, 
        enum: ["processing", "shipped", "delivered", "cancelled"], 
        default: "processing" 
    },
    
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
