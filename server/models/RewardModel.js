const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['earn', 'redeem'], required: true },
    amount: { type: Number, required: true },
    reason: { type: String },
    meta: { type: Object },
  },
  { timestamps: true },
);

const rewardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    balance: { type: Number, default: 0 },
    transactions: [transactionSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model('Reward', rewardSchema);
