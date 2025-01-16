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

// Varsayılan kasa ayarlarını oluşturan fonksiyon
packageSettingsSchema.statics.initializeDefaultSettings = async function() {
  const defaultSettings = [
    { type: 'SILVER', interestRate: 7, minAmount: 5, maxAmount: 100 },
    { type: 'GOLD', interestRate: 10, minAmount: 100, maxAmount: 500 },
    { type: 'PLATINUM', interestRate: 16, minAmount: 500, maxAmount: 1000 },
    { type: 'DIAMOND', interestRate: 25, minAmount: 1000, maxAmount: 5000 },
    { type: 'MASTER', interestRate: 34, minAmount: 5000, maxAmount: 10000 },
    { type: 'ELITE', interestRate: 40, minAmount: 10000, maxAmount: 20000 }
  ];

  for (const settings of defaultSettings) {
    const exists = await this.findOne({ type: settings.type });
    if (!exists) {
      await this.create(settings);
    }
  }
};

const PackageSettings = mongoose.model('PackageSettings', packageSettingsSchema);

module.exports = PackageSettings; 