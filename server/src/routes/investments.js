const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Investment = require('../models/Investment');
const User = require('../models/User');

// Yeni yatırım oluşturma
router.post('/', auth, async (req, res) => {
  try {
    const { type, amount } = req.body;
    const user = await User.findById(req.user.id);

    // Kasa bilgilerini al
    const packageInfo = Investment.PACKAGES[type];
    if (!packageInfo) {
      return res.status(400).json({ message: 'Geçersiz kasa tipi' });
    }

    // Miktar kontrolü
    if (amount < packageInfo.minAmount || amount > packageInfo.maxAmount) {
      return res.status(400).json({ 
        message: `Bu kasa için yatırım miktarı ${packageInfo.minAmount} - ${packageInfo.maxAmount} AZN arasında olmalıdır` 
      });
    }

    // Bakiye kontrolü
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Yetersiz bakiye' });
    }

    // Günlük getiri hesaplama (yatırımın %30'u)
    const dailyReturn = (amount * 0.30) / 30;
    const totalReturn = dailyReturn * 30;

    // Bitiş tarihini hesapla (30 gün sonrası)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Yeni yatırım oluştur
    const investment = new Investment({
      user: req.user.id,
      type,
      amount,
      dailyReturn,
      totalReturn,
      endDate
    });

    // Kullanıcı bakiyesini güncelle
    user.balance -= amount;
    
    // XP ekle
    user.xp += packageInfo.xpReward;
    
    // Level kontrolü
    if (user.xp >= 100) {
      user.level += 1;
      user.xp = user.xp - 100;
    }

    await investment.save();
    await user.save();

    res.json(investment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Kullanıcının yatırımlarını getirme
router.get('/my', auth, async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user.id });
    res.json(investments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Yatırım detaylarını getirme
router.get('/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    
    if (!investment) {
      return res.status(404).json({ message: 'Yatırım bulunamadı' });
    }

    // Yatırımın sahibi olup olmadığını kontrol et
    if (investment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Yetkisiz erişim' });
    }

    res.json(investment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Yatırım durumunu güncelleme (30 gün sonra)
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    
    if (!investment) {
      return res.status(404).json({ message: 'Yatırım bulunamadı' });
    }

    // Yatırımın sahibi olup olmadığını kontrol et
    if (investment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Yetkisiz erişim' });
    }

    // Süre kontrolü
    const now = new Date();
    if (now < investment.endDate) {
      return res.status(400).json({ 
        message: 'Bu yatırım henüz tamamlanmadı',
        remainingDays: Math.ceil((investment.endDate - now) / (1000 * 60 * 60 * 24))
      });
    }

    if (investment.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Bu yatırım zaten tamamlandı' });
    }

    // Kullanıcıyı bul ve bakiyesini güncelle
    const user = await User.findById(req.user.id);
    user.balance += investment.amount + investment.totalReturn;
    
    // Yatırım durumunu güncelle
    investment.status = 'COMPLETED';

    await investment.save();
    await user.save();

    res.json(investment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Test için yatırım süresini kısaltma (sadece test amaçlı)
router.post('/test/speed-up/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    
    if (!investment) {
      return res.status(404).json({ message: 'Yatırım bulunamadı' });
    }

    // Yatırımın sahibi olup olmadığını kontrol et
    if (investment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Yetkisiz erişim' });
    }

    // Başlangıç tarihini 29 dakika öncesine ayarla (1 dakika kalsın)
    const newStartDate = new Date(Date.now() - (29 * 60 * 1000)); // 29 dakika önce
    investment.startDate = newStartDate;

    // Bitiş tarihini 1 dakika sonraya ayarla
    const newEndDate = new Date(Date.now() + (1 * 60 * 1000)); // 1 dakika sonra
    investment.endDate = newEndDate;

    await investment.save();
    
    res.json({ 
      message: 'Yatırım süresi güncellendi',
      newStartDate,
      newEndDate,
      remainingMinutes: 1,
      progress: '96.67%' // (29/30) * 100
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 