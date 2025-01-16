const mongoose = require('mongoose');

const packageSettingsSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'ELITE']
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  minAmount: {
    type: Number,
    required: true,
    min: 0
  },
  maxAmount: {
    type: Number,
    required: true,
    min: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('PackageSettings', packageSettingsSchema); 