const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    tags: { type: String },
    quantity: { type: Number, default: 0, required: true },
    imageUrl: [{ type: String, required: true }],
    manufacture: { type: String },
    expiry: { type: String },
    storageInstructions: { type: String },
    instructionsForUse: { type: String },
    warning: { type: String },
    manufacturer: { type: String },
    appropriateAge: { type: String },
    weight: { type: Number },
    comments: [
      {
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
