const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Giriş etmək lazımdır' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'blackkey2024secret');
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Zəhmət olmasa yenidən giriş edin' });
  }
};

module.exports = auth; 