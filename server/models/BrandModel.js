const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
    },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Brand", brandSchema);
