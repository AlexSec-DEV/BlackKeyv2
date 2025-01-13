const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Bakiye yükleme
router.post('/deposit', [
  auth,
  [
    check('amount', 'Geçerli bir miktar girin').isFloat({ min: 1 }),
    check('transactionId', 'İşlem numarası gerekli').not().isEmpty()
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, transactionId } = req.body;
    const user = await User.findById(req.user.id);

    // Bakiyeyi güncelle
    user.balance += parseFloat(amount);
    await user.save();

    res.json({
      message: 'Bakiye başarıyla yüklendi',
      balance: user.balance
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Bakiye çekme
router.post('/withdraw', [
  auth,
  [
    check('amount', 'Geçerli bir miktar girin').isFloat({ min: 1 }),
    check('walletAddress', 'Cüzdan adresi gerekli').not().isEmpty()
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, walletAddress } = req.body;
    const user = await User.findById(req.user.id);

    // Bakiye kontrolü
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Yetersiz bakiye' });
    }

    // Minimum çekim kontrolü
    if (amount < 10) {
      return res.status(400).json({ message: 'Minimum çekim miktarı 10 AZN' });
    }

    // Bakiyeyi güncelle
    user.balance -= parseFloat(amount);
    await user.save();

    res.json({
      message: 'Çekim talebi başarıyla oluşturuldu',
      balance: user.balance
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 