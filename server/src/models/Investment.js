const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  type: {
    type: String,
    enum: ['SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'ELITE'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  dailyReturn: {
    type: Number,
    required: true
  },
  totalReturn: {
    type: Number,
    required: true
  },
  lockPeriod: {
    type: Number,
    default: 30 // 30 günlük kilit süresi
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED'],
    default: 'ACTIVE'
  }
});

// Kasa tipleri ve özellikleri
investmentSchema.statics.PACKAGES = {
  SILVER: {
    minAmount: 5,
    maxAmount: 100,
    dailyReturn: 5,
    xpReward: 18
  },
  GOLD: {
    minAmount: 50,
    maxAmount: 500,
    dailyReturn: 15,
    xpReward: 18
  },
  PLATINUM: {
    minAmount: 100,
    maxAmount: 1000,
    dailyReturn: 40,
    xpReward: 18
  },
  DIAMOND: {
    minAmount: 1000,
    maxAmount: 5000,
    dailyReturn: 80,
    xpReward: 18
  },
  MASTER: {
    minAmount: 5000,
    maxAmount: 10000,
    dailyReturn: 150,
    xpReward: 18
  },
  ELITE: {
    minAmount: 10000,
    maxAmount: 50000,
    dailyReturn: 1000,
    xpReward: 18
  }
};

module.exports = mongoose.model('Investment', investmentSchema); 