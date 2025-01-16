const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// Geçici depolama için multer ayarları
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Sadece resim dosyaları yüklenebilir!'));
    }
    cb(null, true);
  }
});

// Para yatırma işlemi
router.post('/deposit', auth, upload.single('receipt'), async (req, res) => {
  try {
    console.log('Deposit request received');
    console.log('Request body:', req.body);
    console.log('File:', req.file);

    const { amount, paymentMethod } = req.body;

    // Miktar kontrolü
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Düzgün məbləğ daxil edin' });
    }

    // Dosya kontrolü
    if (!req.file) {
      return res.status(400).json({ message: 'Ödəniş qəbzi tələb olunur' });
    }

    // Ödeme yöntemi kontrolü
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Ödəniş üsulu seçin' });
    }

    console.log('Converting file to base64');
    const base64File = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64File}`;

    console.log('Uploading to Cloudinary');
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'receipts',
      resource_type: 'image'
    });
    console.log('Cloudinary upload result:', result);

    console.log('Creating transaction');
    const transaction = new Transaction({
      user: req.user._id, // _id kullanıyoruz, id değil
      type: 'DEPOSIT',
      amount: parseFloat(amount),
      paymentMethod,
      receiptUrl: result.secure_url,
      status: 'PENDING'
    });

    console.log('Saving transaction:', transaction);
    await transaction.save();
    console.log('Transaction saved successfully');

    res.status(201).json({
      message: 'Balans artırma tələbiniz qəbul edildi',
      transaction
    });
  } catch (error) {
    console.error('Para yatırma hatası:', error);
    res.status(500).json({ 
      message: 'Balans artırma zamanı xəta baş verdi',
      error: error.message
    });
  }
});

// Para çekme işlemi
router.post('/withdraw', auth, async (req, res) => {
  try {
    console.log('Withdraw request received:', req.body);
    const { amount, paymentMethod, transactionDetails } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'İstifadəçi tapılmadı' });
    }

    if (user.balance < amount) {
      return res.status(400).json({ message: 'Balansınız kifayət deyil' });
    }

    if (amount < 10) {
      return res.status(400).json({ message: 'Minimum məbləğ 10 AZN olmalıdır' });
    }

    const transaction = new Transaction({
      user: req.user._id,
      type: 'WITHDRAWAL',
      amount: parseFloat(amount),
      paymentMethod,
      transactionDetails,
      status: 'PENDING'
    });

    await transaction.save();
    res.status(201).json({
      message: 'Pul çəkmə tələbiniz qəbul edildi',
      transaction
    });
  } catch (error) {
    console.error('Para çekme hatası:', error);
    res.status(500).json({ message: 'Çıxarma prosesi zamanı xəta baş verdi' });
  }
});

// Para çekme işlemini onayla/reddet
router.post('/withdraw/:withdrawalId/:action', auth, async (req, res) => {
  try {
    const { withdrawalId, action } = req.params;
    const withdrawal = await Transaction.findById(withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({ message: 'Əməliyyat tapılmadı' });
    }

    if (withdrawal.status !== 'PENDING') {
      return res.status(400).json({ message: 'Bu əməliyyat artıq təsdiqlənib və ya rədd edilib' });
    }

    const user = await User.findById(withdrawal.user);
    if (!user) {
      return res.status(404).json({ message: 'İstifadəçi tapılmadı' });
    }

    if (action === 'approve') {
      if (user.balance < withdrawal.amount) {
        return res.status(400).json({ message: 'İstifadəçinin balansı kifayət deyil' });
      }
      user.balance -= withdrawal.amount;
      withdrawal.status = 'APPROVED';
      await user.save();
    } else if (action === 'reject') {
      withdrawal.status = 'REJECTED';
    } else {
      return res.status(400).json({ message: 'Yanlış əməliyyat' });
    }

    withdrawal.processedAt = Date.now();
    withdrawal.processedBy = req.user._id;
    await withdrawal.save();

    res.json({
      message: action === 'approve' ? 'Pul çəkmə tələbi təsdiqləndi' : 'Pul çəkmə tələbi rədd edildi',
      withdrawal
    });
  } catch (error) {
    console.error('Para çekme onay/red hatası:', error);
    res.status(500).json({ message: 'Əməliyyat zamanı xəta baş verdi' });
  }
});

// Kullanıcının işlemlerini getir
router.get('/history', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('İşlem geçmişi getirme hatası:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 