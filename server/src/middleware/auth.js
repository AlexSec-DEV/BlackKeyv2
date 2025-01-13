const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  console.log('Auth middleware executing...');
  console.log('Headers:', req.headers);
  
  try {
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
    console.log('Token found:', token ? 'Yes' : 'No');

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No authentication token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecrettoken');
      console.log('Token decoded successfully. User ID:', decoded.id);

      const user = await User.findById(decoded.id);
      if (!user) {
        console.log('No user found with decoded ID');
        return res.status(401).json({ message: 'Invalid token - User not found' });
      }

      console.log('User found:', {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin
      });

      req.user = user;
      next();
    } catch (err) {
      console.error('Token verification error:', err);
      res.status(401).json({ message: 'Invalid token', error: err.message });
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 