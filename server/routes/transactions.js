const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Makbuz yükleme ayarları
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = path.join(__dirname, '../uploads/receipts');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Sadece resim dosyaları yüklenebilir!'));
  }
});

// Para yatırma işlemi
router.post('/deposit', auth, upload.single('receipt'), async (req, res) => {
  try {
    console.log('Deposit request received:', req.body);
    console.log('File:', req.file);

    const { amount, paymentMethod } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Makbuz yüklemesi gerekli' });
    }

    const transaction = new Transaction({
      user: req.user.id,
      type: 'DEPOSIT',
      amount: parseFloat(amount),
      paymentMethod,
      receiptUrl: '/receipts/' + req.file.filename,
      status: 'PENDING'
    });

    console.log('Created transaction:', transaction);
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Para yatırma hatası:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Para çekme işlemi
router.post('/withdraw', auth, async (req, res) => {
  try {
    console.log('Withdraw request received:', req.body);
    const { amount, paymentMethod, transactionDetails } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    if (user.balance < amount) {
      return res.status(400).json({ message: 'Yetersiz bakiye' });
    }

    if (amount < 10) {
      return res.status(400).json({ message: 'Minimum çekim miktarı 10 AZN' });
    }

    const transaction = new Transaction({
      user: req.user.id,
      type: 'WITHDRAWAL',
      amount: parseFloat(amount),
      paymentMethod: paymentMethod,
      transactionDetails: transactionDetails,
      status: 'PENDING'
    });

    // Bakiyeyi şimdi düşürmüyoruz, admin onayladığında düşecek
    console.log('Created transaction:', transaction);
    await transaction.save();
    res.json(transaction);
  } catch (error) {
    console.error('Para çekme hatası:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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