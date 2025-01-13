const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  cardNumber: {
    type: String,
    required: true
  },
  cardHolderName: {
    type: String,
    required: true
  },
  expiryMonth: {
    type: Number,
    required: true
  },
  expiryYear: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastFourDigits: String,
  cardType: String,
  isDefault: {
    type: Boolean,
    default: false
  }
});

// Kart numarasını kaydetmeden önce son 4 haneyi ayır
cardSchema.pre('save', function(next) {
  if (this.isModified('cardNumber')) {
    this.lastFourDigits = this.cardNumber.slice(-4);
    this.cardNumber = this.lastFourDigits; // Güvenlik için sadece son 4 haneyi sakla
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Card', cardSchema); 