const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PaymentInfo = require('../models/PaymentInfo');

console.log('Payment routes being initialized...');

// Admin middleware
const isAdmin = async (req, res, next) => {
  try {
    console.log('Admin check in payment routes');
    console.log('User:', req.user);
    
    if (!req.user.isAdmin) {
      console.log('User is not admin');
      return res.status(403).json({ message: 'Admin yetkisi gerekiyor' });
    }
    
    console.log('Admin check passed');
    next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Aktif ödeme bilgilerini getir
router.get('/info', auth, async (req, res) => {
  try {
    console.log('Fetching payment info...');
    const paymentInfo = await PaymentInfo.find({ isActive: true });
    console.log('Found payment info:', paymentInfo);
    res.json(paymentInfo);
  } catch (error) {
    console.error('Error fetching payment info:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Ödeme bilgilerini güncelle (sadece admin)
router.post('/info', auth, isAdmin, async (req, res) => {
  try {
    console.log('Updating payment info...');
    console.log('Request body:', req.body);

    const { type, ...details } = req.body;
    
    // Varolan aktif ödeme bilgisini deaktif et
    await PaymentInfo.updateMany(
      { type, isActive: true },
      { $set: { isActive: false } }
    );

    // Yeni ödeme bilgisi oluştur
    const paymentInfo = new PaymentInfo({
      type,
      ...details,
      isActive: true
    });

    await paymentInfo.save();
    console.log('Payment info saved:', paymentInfo);
    res.json(paymentInfo);
  } catch (error) {
    console.error('Error updating payment info:', error);
    res.status(500).json({ message: error.message });
  }
});

console.log('Payment routes initialized successfully');

module.exports = router; 