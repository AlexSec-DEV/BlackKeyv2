const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['DEPOSIT', 'WITHDRAWAL'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  paymentMethod: {
    type: String,
    enum: ['CREDIT_CARD', 'M10', 'CRYPTO'],
    required: true
  },
  transactionDetails: {
    bankName: String,
    accountHolder: String,
    cardNumber: String,
    m10AccountNumber: String,
    cryptoAddress: String,
    cryptoNetwork: String
  },
  receiptUrl: {
    type: String,
    required: function() {
      return this.type === 'DEPOSIT';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  note: String
});

module.exports = mongoose.model('Transaction', transactionSchema); 