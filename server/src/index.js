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

// CORS ayarları
const corsOptions = {
  origin: ['https://black-keyv2-frontend.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

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

// 404 handler
app.use((req, res) => {
  console.log('404 Error for path:', req.path);
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
  console.log(`Server URL: http://localhost:${PORT}`);
}); 