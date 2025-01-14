const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Lütfen giriş yapın' });
  }
};

// Dosya yükleme ayarları
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/profile');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    console.log('Upload path:', uploadPath);
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'profile-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Profil bilgilerini getir
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

// Profil resmi yükleme
router.post('/profile/image', auth, upload.single('profileImage'), async (req, res) => {
  try {
    console.log('Profil resmi yükleme isteği alındı');
    console.log('Request file:', req.file);

    if (!req.file) {
      return res.status(400).json({ message: 'Lütfen bir resim yükleyin' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Eski profil resmini sil (varsayılan resim değilse)
    if (user.profileImage && user.profileImage !== 'default-avatar.png') {
      const oldImagePath = path.join(__dirname, '../../uploads/profile', user.profileImage);
      console.log('Eski resim yolu:', oldImagePath);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log('Eski resim silindi');
      }
    }

    user.profileImage = req.file.filename;
    await user.save();
    console.log('Kullanıcı profil resmi güncellendi:', user.profileImage);

    res.json({
      message: 'Profil resmi güncellendi',
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Profil resmi yükleme hatası:', error);
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Hata sonrası yüklenen dosya silindi');
      } catch (e) {
        console.error('Yüklenen dosya silinirken hata:', e);
      }
    }
    res.status(500).json({ message: 'Profil resmi yüklenirken bir hata oluştu' });
  }
});

// Kayıt ol
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Bu email veya kullanıcı adı zaten kullanılıyor'
      });
    }

    const user = new User({
      username,
      email,
      password,
      isAdmin: false,
      isBlocked: false,
      balance: 0,
      level: 1,
      xp: 0,
      nextLevelXp: 100,
      profileImage: 'default-avatar.png'
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        isBlocked: user.isBlocked,
        balance: user.balance,
        level: user.level,
        xp: user.xp,
        nextLevelXp: user.nextLevelXp,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

// Giriş yap
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email veya şifre hatalı' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email veya şifre hatalı' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Hesabınız engellenmiş durumda' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        isBlocked: user.isBlocked,
        balance: user.balance,
        level: user.level,
        xp: user.xp,
        nextLevelXp: user.nextLevelXp,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 