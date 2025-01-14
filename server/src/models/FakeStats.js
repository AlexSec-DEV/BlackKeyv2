const mongoose = require('mongoose');

const fakeStatsSchema = new mongoose.Schema({
  totalUsers: {
    type: Number,
    default: 5698
  },
  activeUsers: {
    type: Number,
    default: 1756
  },
  totalInvestment: {
    type: Number,
    default: 96854
  },
  totalPayout: {
    type: Number,
    default: 25356
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Her zaman tek bir kayıt olacak
fakeStatsSchema.statics.getStats = async function() {
  let stats = await this.findOne();
  if (!stats) {
    stats = await this.create({});
  }
  return stats;
};

const FakeStats = mongoose.model('FakeStats', fakeStatsSchema);

module.exports = FakeStats; 