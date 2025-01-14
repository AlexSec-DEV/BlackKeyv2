const express = require('express');
const router = express.Router();
const Investment = require('../models/Investment');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Kullanıcının yatırımlarını getir
router.get('/my', auth, async (req, res) => {
  try {
    console.log('Fetching investments for user:', req.user._id);
    const investments = await Investment.find({ user: req.user._id });
    console.log('Found investments:', investments);
    res.json(investments);
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