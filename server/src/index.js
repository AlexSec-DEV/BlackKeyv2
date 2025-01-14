const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const investmentRoutes = require('./routes/investments');
const adminRoutes = require('./routes/admin');
const transactionRoutes = require('./routes/transactions');
const paymentRoutes = require('./routes/payment');
const balanceRoutes = require('./routes/balance');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Uploads klasörlerini oluştur
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
const profileDir = path.join(uploadsDir, 'profile');
const receiptsDir = path.join(uploadsDir, 'receipts');

[uploadsDir, profileDir, receiptsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log('Created directory:', dir);
  }
});

// Statik dosya servis yapılandırması
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('Static file path:', path.join(__dirname, 'uploads'));

// API routes
app.use('/auth', authRoutes);
app.use('/investments', investmentRoutes);
app.use('/admin', adminRoutes);
app.use('/transactions', transactionRoutes);
app.use('/payment', paymentRoutes);
app.use('/balance', balanceRoutes);

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Sunucu hatası!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
  console.log(`Server URL: http://localhost:${PORT}`);
}); 