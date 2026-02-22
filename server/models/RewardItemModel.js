const mongoose = require('mongoose');

const rewardItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['voucher'],
      default: 'voucher',
      required: true,
    },
    pointsCost: {
      type: Number,
      required: true,
      min: 0,
    },
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Voucher',
      required: true,
    },
    quantity: {
      type: Number,
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalRedeemed: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

rewardItemSchema.index({ type: 1, isActive: 1 });
rewardItemSchema.index({ pointsCost: 1 });

module.exports = mongoose.model('RewardItem', rewardItemSchema);
