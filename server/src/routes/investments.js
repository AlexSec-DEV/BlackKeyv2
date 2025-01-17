const express = require('express');
const router = express.Router();
const Investment = require('../models/Investment');
const User = require('../models/User');
const PackageSettings = require('../models/PackageSettings');
const auth = require('../middleware/auth');

// Süresi biten yatırımları kontrol et ve tamamla
async function checkAndCompleteInvestments(userId) {
  try {
    // Süresi biten aktif yatırımları bul
    const expiredInvestments = await Investment.find({
      user: userId,
      status: 'active',
      endDate: { $lte: new Date() }
    });

    if (expiredInvestments.length === 0) {
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error('Kullanıcı bulunamadı:', userId);
      return;
    }

    for (const investment of expiredInvestments) {
      // Toplam kazancı hesapla (ana para + aylık kazanç)
      const totalReturn = investment.amount + (investment.dailyReturn * 30);
      
      // Kullanıcı bakiyesini güncelle
      user.balance += totalReturn;
      
      console.log(`Investment completed - User: ${userId}, Amount: ${investment.amount}, Total Return: ${totalReturn}`);
      
      // Yatırımı sil
      await Investment.findByIdAndDelete(investment._id);
    }

    // Kullanıcı bakiyesini kaydet
    await user.save();
    
    console.log(`User balance updated - User: ${userId}, New Balance: ${user.balance}`);
  } catch (error) {
    console.error('Yatırım tamamlama hatası:', error);
  }
}

// Kullanıcının yatırımlarını getir
router.get('/my', auth, async (req, res) => {
  try {
    console.log('Fetching investments for user:', req.user._id);
    
    // Önce süresi biten yatırımları kontrol et ve tamamla
    await checkAndCompleteInvestments(req.user._id);
    
    // Güncel yatırımları getir
    const investments = await Investment.find({ user: req.user._id });
    console.log('Found investments:', investments);
    
    // Güncel kullanıcı bilgilerini getir
    const user = await User.findById(req.user._id);
    
    res.json({
      investments,
      balance: user.balance
    });
  } catch (error) {
    console.error('Yatırımları getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

// Yatırım yap
router.post('/', auth, async (req, res) => {
  try {
    const { type, amount } = req.body;
    console.log('Investment request:', { type, amount });

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    if (user.balance < amount) {
      return res.status(400).json({ message: 'Yetersiz bakiye' });
    }

    // Kasa ayarlarını veritabanından al
    const packageSetting = await PackageSettings.findOne({ type });
    if (!packageSetting) {
      return res.status(400).json({ message: 'Geçersiz paket' });
    }

    if (amount < packageSetting.minAmount || amount > packageSetting.maxAmount) {
      return res.status(400).json({
        message: `Yatırım tutarı ${packageSetting.minAmount} AZN ile ${packageSetting.maxAmount} AZN arasında olmalıdır`
      });
    }

    const investment = new Investment({
      user: user._id,
      type,
      amount,
      interestRate: packageSetting.interestRate,
      dailyReturn: (amount * packageSetting.interestRate) / 100 / 30,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'active'
    });

    user.balance -= amount;

    // XP ve Level hesaplama
    const xpGain = 18; // Her yatırımda kazanılan XP
    const xpForNextLevel = 100; // Her level için gereken XP

    // Yeni toplam XP'yi hesapla
    const totalXP = user.xp + xpGain;

    // Level artışını ve kalan XP'yi hesapla
    const levelIncrease = Math.floor(totalXP / xpForNextLevel);
    const remainingXP = totalXP % xpForNextLevel;

    // Level ve XP'yi güncelle
    user.level += levelIncrease;
    user.xp = remainingXP;

    await Promise.all([investment.save(), user.save()]);

    console.log('Investment created:', investment);
    console.log('User updated:', user);

    res.status(201).json({
      message: 'Yatırım başarıyla yapıldı',
      investment,
      user: {
        balance: user.balance,
        xp: user.xp,
        level: user.level
      }
    });
  } catch (error) {
    console.error('Yatırım yapma hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

// Kasa ayarlarını getir
router.get('/packages', auth, async (req, res) => {
  try {
    const settings = await PackageSettings.find().sort({ type: 1 });
    res.json(settings);
  } catch (error) {
    console.error('Kasa ayarları getirilirken hata:', error);
    res.status(500).json({ message: 'Kasa ayarları getirilirken bir hata oluştu' });
  }
});

module.exports = router; 