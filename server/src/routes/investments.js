const express = require('express');
const router = express.Router();
const Investment = require('../models/Investment');
const User = require('../models/User');
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

    const packages = {
      SILVER: {
        name: 'SILVER',
        dailyReturn: 5,
        minAmount: 5,
        maxAmount: 100,
        percentage: 7,
        lockPeriod: 30,
        xpPerInvestment: 18
      },
      GOLD: {
        name: 'GOLD',
        dailyReturn: 15,
        minAmount: 50,
        maxAmount: 500,
        percentage: 10,
        lockPeriod: 30,
        xpPerInvestment: 18
      },
      PLATINUM: {
        name: 'PLATINUM',
        dailyReturn: 40,
        minAmount: 100,
        maxAmount: 1000,
        percentage: 16,
        lockPeriod: 30,
        xpPerInvestment: 18
      },
      DIAMOND: {
        name: 'DIAMOND',
        dailyReturn: 80,
        minAmount: 200,
        maxAmount: 2000,
        percentage: 25,
        lockPeriod: 30,
        xpPerInvestment: 18
      },
      MASTER: {
        name: 'MASTER',
        dailyReturn: 150,
        minAmount: 500,
        maxAmount: 5000,
        percentage: 34,
        lockPeriod: 30,
        xpPerInvestment: 18
      },
      LEGENDARY: {
        name: 'LEGENDARY',
        dailyReturn: 1000,
        minAmount: 1000,
        maxAmount: 10000,
        percentage: 40,
        lockPeriod: 30,
        xpPerInvestment: 18
      }
    };

    const selectedPackage = packages[type];
    if (!selectedPackage) {
      return res.status(400).json({ message: 'Geçersiz paket' });
    }

    if (amount < selectedPackage.minAmount || amount > selectedPackage.maxAmount) {
      return res.status(400).json({
        message: `Yatırım tutarı ${selectedPackage.minAmount} AZN ile ${selectedPackage.maxAmount} AZN arasında olmalıdır`
      });
    }

    const investment = new Investment({
      user: user._id,
      type,
      amount,
      dailyReturn: (amount * selectedPackage.percentage) / 100 / 30,
      startDate: new Date(),
      endDate: new Date(Date.now() + selectedPackage.lockPeriod * 24 * 60 * 60 * 1000),
      status: 'active'
    });

    user.balance -= amount;
    user.xp += selectedPackage.xpPerInvestment;

    // Level atlama kontrolü
    if (user.xp >= user.nextLevelXp) {
      user.level += 1;
      user.nextLevelXp = user.nextLevelXp * 2;
    }

    await Promise.all([investment.save(), user.save()]);

    console.log('Investment created:', investment);
    console.log('User updated:', user);

    res.status(201).json({
      message: 'Yatırım başarıyla yapıldı',
      investment,
      user: {
        balance: user.balance,
        xp: user.xp,
        level: user.level,
        nextLevelXp: user.nextLevelXp
      }
    });
  } catch (error) {
    console.error('Yatırım yapma hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 