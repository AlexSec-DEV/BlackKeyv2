const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const User = mongoose.model('User');
const Investment = mongoose.model('Investment');
const Transaction = mongoose.model('Transaction');
const PaymentInfo = mongoose.model('PaymentInfo');
const FakeStats = mongoose.model('FakeStats');

console.log('Admin routes being initialized...');

// Admin middleware
const isAdmin = async (req, res, next) => {
  try {
    console.log('Admin middleware executing...');
    console.log('Request user:', req.user);
    
    if (!req.user) {
      console.log('No user found in request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!req.user.isAdmin) {
      console.log('User is not an admin');
      return res.status(403).json({ message: 'Admin yetkisi gerekiyor' });
    }

    console.log('Admin check passed');
    next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Tüm kullanıcıları getir
router.get('/users', auth, isAdmin, async (req, res) => {
  console.log('GET /admin/users endpoint hit');
  try {
    const users = await User.find({}, '-password');
    console.log(`Found ${users.length} users`);
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// İstatistikleri getir
router.get('/stats', auth, isAdmin, async (req, res) => {
  console.log('GET /admin/stats endpoint hit');
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalInvestments: await Investment.countDocuments(),
      activeInvestments: await Investment.countDocuments({ status: 'ACTIVE' }),
      totalInvestmentAmount: (await Investment.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]))[0]?.total || 0
    };
    console.log('Stats calculated:', stats);
    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Bekleyen para yatırma işlemlerini getir
router.get('/deposits', auth, isAdmin, async (req, res) => {
  console.log('GET /admin/deposits endpoint hit');
  try {
    const deposits = await Transaction.find({ 
      type: 'DEPOSIT', 
      status: 'PENDING' 
    }).populate('user', 'username email');
    
    console.log(`Found ${deposits.length} pending deposits`);
    console.log('Deposits:', deposits);
    res.json(deposits);
  } catch (err) {
    console.error('Error fetching deposits:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Bekleyen para çekme işlemlerini getir
router.get('/withdrawals', auth, isAdmin, async (req, res) => {
  try {
    const withdrawals = await Transaction.find({ 
      type: 'WITHDRAWAL'
    }).populate('user', 'username email');
    
    console.log(`Found ${withdrawals.length} withdrawals`);
    res.json(withdrawals);
  } catch (err) {
    console.error('Error fetching withdrawals:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Para yükleme işlemini onayla/reddet
router.post('/deposits/:depositId/:action', auth, isAdmin, async (req, res) => {
  console.log('POST /admin/deposits/:depositId/:action endpoint hit');
  try {
    const { depositId, action } = req.params;
    console.log('Processing deposit:', depositId, 'Action:', action);

    const deposit = await Transaction.findById(depositId);
    if (!deposit) {
      console.log('Deposit not found:', depositId);
      return res.status(404).json({ message: 'İşlem bulunamadı' });
    }

    if (deposit.status !== 'PENDING') {
      console.log('Deposit already processed:', deposit.status);
      return res.status(400).json({ message: 'Bu işlem zaten onaylanmış veya reddedilmiş' });
    }

    if (action === 'approve') {
      deposit.status = 'APPROVED';
      const user = await User.findById(deposit.user);
      if (!user) {
        console.log('User not found:', deposit.user);
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }
      console.log('Updating user balance:', user.balance, '+', deposit.amount);
      user.balance += deposit.amount;
      await user.save();
      console.log('New user balance:', user.balance);
    } else if (action === 'reject') {
      deposit.status = 'REJECTED';
    } else {
      console.log('Invalid action:', action);
      return res.status(400).json({ message: 'Geçersiz işlem' });
    }

    deposit.processedAt = Date.now();
    deposit.processedBy = req.user._id;
    await deposit.save();
    console.log('Deposit updated successfully:', deposit.status);

    res.json({ message: 'İşlem başarılı', deposit });
  } catch (error) {
    console.error('Deposit action error:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Para çekme işlemini onayla/reddet
router.post('/withdrawals/:withdrawalId/:action', auth, isAdmin, async (req, res) => {
  console.log('POST /admin/withdrawals/:withdrawalId/:action endpoint hit');
  try {
    const { withdrawalId, action } = req.params;
    console.log('Processing withdrawal:', withdrawalId, 'Action:', action);

    if (!['approve', 'reject'].includes(action.toLowerCase())) {
      return res.status(400).json({ message: 'Geçersiz işlem' });
    }

    const withdrawal = await Transaction.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ message: 'İşlem bulunamadı' });
    }

    if (withdrawal.status !== 'PENDING') {
      return res.status(400).json({ message: 'Bu işlem zaten onaylanmış veya reddedilmiş' });
    }

    const user = await User.findById(withdrawal.user);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    if (action.toLowerCase() === 'approve') {
      if (user.balance < withdrawal.amount) {
        return res.status(400).json({ message: 'Kullanıcının bakiyesi yetersiz' });
      }
      user.balance -= withdrawal.amount;
      await user.save();
      withdrawal.status = 'APPROVED';
    } else {
      withdrawal.status = 'REJECTED';
    }

    withdrawal.processedAt = Date.now();
    withdrawal.processedBy = req.user._id;
    await withdrawal.save();

    res.json({ message: 'İşlem başarılı', withdrawal });
  } catch (error) {
    console.error('Withdrawal action error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Fake istatistikleri getir
router.get('/fake-stats', auth, async (req, res) => {
  try {
    const stats = await FakeStats.getStats();
    res.json(stats);
  } catch (err) {
    console.error('Fake stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fake istatistikleri güncelle
router.put('/fake-stats', auth, isAdmin, async (req, res) => {
  try {
    const { totalUsers, activeUsers, totalInvestment, totalPayout } = req.body;
    
    const stats = await FakeStats.getStats();
    stats.totalUsers = Number(totalUsers);
    stats.activeUsers = Number(activeUsers);
    stats.totalInvestment = Number(totalInvestment);
    stats.totalPayout = Number(totalPayout);
    stats.updatedAt = Date.now();
    
    await stats.save();
    res.json(stats);
  } catch (err) {
    console.error('Fake stats update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Kullanıcı engelleme/engel kaldırma
router.post('/users/:userId/block', auth, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Admin kendini engelleyemez
    if (user.isAdmin) {
      return res.status(400).json({ message: 'Admin kullanıcısı engellenemez' });
    }

    if (action === 'block') {
      user.isBlocked = true;
    } else if (action === 'unblock') {
      user.isBlocked = false;
    } else {
      return res.status(400).json({ message: 'Geçersiz işlem' });
    }

    await user.save();
    res.json({ 
      message: action === 'block' ? 'Kullanıcı engellendi' : 'Kullanıcı engeli kaldırıldı',
      user 
    });
  } catch (error) {
    console.error('User block/unblock error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

console.log('Admin routes initialized successfully');

module.exports = router; 