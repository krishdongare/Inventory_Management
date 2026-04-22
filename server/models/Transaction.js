const mongoose = require('mongoose');

/**
 * Transaction Schema — payment records (FR4.x)
 * Payment DB equivalent from SRS DFD
 */
const transactionSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank_transfer', 'other'],
      required: [true, 'Payment method is required'],
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'refunded', 'pending'],
      default: 'success',
    },
    transactionReference: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
