const router = require('express').Router();
const User = require('../models/User');
const Investment = require('../models/Investment');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Fake istatistikler için bir değişken
let fakeStats = {
  totalUsers: 5698,
  activeUsers: 1756,
  totalInvestment: 96854,
  totalPayout: 25356
};

// Gerçek istatistikleri getir
router.get('/stats', auth, admin, async (req, res) => {
  try {
    const users = await User.find();
    const investments = await Investment.find();
    
    res.json({
      totalUsers: users.length,
      totalInvestments: investments.length,
      activeInvestments: investments.filter(inv => !inv.isCompleted).length,
      totalInvestmentAmount: investments.reduce((total, inv) => total + inv.amount, 0)
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fake istatistikleri getir
router.get('/fake-stats', auth, async (req, res) => {
  try {
    res.json(fakeStats);
  } catch (err) {
    console.error('Fake stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fake istatistikleri güncelle
router.put('/fake-stats', auth, admin, async (req, res) => {
  try {
    const { totalUsers, activeUsers, totalInvestment, totalPayout } = req.body;
    
    fakeStats = {
      totalUsers: Number(totalUsers),
      activeUsers: Number(activeUsers),
      totalInvestment: Number(totalInvestment),
      totalPayout: Number(totalPayout)
    };

    res.json(fakeStats);
  } catch (err) {
    console.error('Fake stats update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 