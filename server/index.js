const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://black-keyv2-frontend.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://alex:DnulM3HXrLTI6hQZ@cluster0.oc7yv.mongodb.net/blackkey?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connection successful');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Import routes
const authRoutes = require('./src/routes/auth');
const investmentRoutes = require('./src/routes/investments');
const adminRoutes = require('./src/routes/admin');
const paymentRoutes = require('./src/routes/payment');
const balanceRoutes = require('./src/routes/balance');
const transactionRoutes = require('./src/routes/transactions');

// Route middleware
app.use('/auth', authRoutes);
app.use('/investments', investmentRoutes);
app.use('/admin', adminRoutes);
app.use('/payment', paymentRoutes);
app.use('/balance', balanceRoutes);
app.use('/transactions', transactionRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Handle 404
app.use((req, res) => {
  console.log('404 Error for path:', req.path);
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
