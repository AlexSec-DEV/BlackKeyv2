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