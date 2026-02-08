const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: String,
    },
    tags: [String], 

    recommended_products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", 
      },
    ],

    image: String, 
  },
  {
    timestamps: true, 
  },
);


module.exports = mongoose.model("Blog", blogSchema);
