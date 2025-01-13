const mongoose = require('mongoose');

const paymentInfoSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['CREDIT_CARD', 'M10', 'CRYPTO'],
    required: true
  },
  creditCard: {
    number: String,
    holderName: String,
    bank: String
  },
  m10: {
    phoneNumber: String
  },
  crypto: {
    address: String,
    currency: {
      type: String,
      default: 'BTC'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PaymentInfo', paymentInfoSchema); 