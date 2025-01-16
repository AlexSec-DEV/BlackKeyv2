const express = require('express');
const router = express.Router();
const User = require('../models/User');
const BlockedIP = require('../models/BlockedIP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// IP bloklama kontrolü middleware
const checkBlockedIP = async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress || 
               req.ip;

    const blockedIP = await BlockedIP.findOne({ ipAddress: ip });
    if (blockedIP) {
      return res.status(403).json({ 
        message: 'Bu IP adresi yönetici tarafından engellenmiştir.',
        error: 'IP_BLOCKED'
      });
    }
    next();
  } catch (error) {
    console.error('IP kontrol hatası:', error);
    next(error);
  }
};

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'blackkey2024secret');
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

// Multer ayarları - geçici depolama için memory storage kullan
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

    // Dosyayı base64'e çevir
    const base64File = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64File}`;

    // Cloudinary'ye yükle
    console.log('Cloudinary\'ye yükleniyor...');
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'profiles',
      resource_type: 'image'
    });
    console.log('Cloudinary yükleme sonucu:', result);

    // Eski profil resmini Cloudinary'den sil (varsayılan resim değilse)
    if (user.profileImage && user.profileImage.includes('cloudinary')) {
      try {
        const publicId = user.profileImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
        console.log('Eski profil resmi Cloudinary\'den silindi');
      } catch (error) {
        console.error('Eski resim silinirken hata:', error);
      }
    }

    // Kullanıcı bilgilerini güncelle
    user.profileImage = result.secure_url;
    await user.save();
    console.log('Kullanıcı profil resmi güncellendi:', user.profileImage);

    res.json({
      message: 'Profil resmi güncellendi',
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Profil resmi yükleme hatası:', error);
    res.status(500).json({ message: 'Profil resmi yüklenirken bir hata oluştu' });
  }
});

// Profil bilgilerini güncelle
router.put('/profile', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword, phoneNumber, country, birthDate } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Şifre değişikliği varsa kontrol et
    if (newPassword) {
      // Mevcut şifreyi kontrol et
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mevcut şifre hatalı' });
      }
      user.password = newPassword;
    }

    // Diğer bilgileri güncelle
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (country) user.country = country;
    if (birthDate) user.birthDate = birthDate;

    await user.save();

    // Şifreyi hariç tutarak kullanıcı bilgilerini gönder
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Profil başarıyla güncellendi',
      user: userResponse
    });
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    res.status(500).json({ message: 'Profil güncellenirken bir hata oluştu' });
  }
});

// Kayıt ol
router.post('/register', async (req, res) => {
  try {
    // IP kontrolü
    const clientIP = req.ip || req.connection.remoteAddress;
    const isIPBlocked = await BlockedIP.findOne({ ipAddress: clientIP });
    
    if (isIPBlocked) {
      return res.status(403).json({ 
        message: 'Bu IP adresi bloklanmışdır',
        reason: isIPBlocked.reason 
      });
    }

    const { username, email, password } = req.body;

    // Kullanıcı adı kontrolü
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Bu istifadəçi adı artıq istifadə olunur' });
    }

    // Email kontrolü
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Bu email artıq istifadə olunur' });
    }

    const user = new User({
      username,
      email,
      password,
      ipAddress: clientIP,
      lastLoginIp: clientIP,
      lastLoginDate: new Date()
    });

    await user.save();
    const token = await user.generateAuthToken();

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Qeydiyyat zamanı xəta baş verdi' });
  }
});

// Giriş yap
router.post('/login', checkBlockedIP, async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress || 
               req.ip;

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

    // Son giriş bilgilerini güncelle
    user.lastLoginIp = ip;
    user.lastLoginDate = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'blackkey2024secret',
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
        profileImage: user.profileImage,
        ipAddress: user.ipAddress,
        lastLoginIp: user.lastLoginIp,
        lastLoginDate: user.lastLoginDate
      }
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 