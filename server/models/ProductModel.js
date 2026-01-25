const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true},
    quantity: { type: Number, default: 0 },
    imageUrl: { type: String },
    manufacture: { type: String },
    expiry: { type: String },
    storageInstructions: { type: String },
    instructionsForUse: { type: String },
    warning: { type: String },
    manufacturer: { type: String },
    appropriateAge: { type: String },
    weight: { type: Number }
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
