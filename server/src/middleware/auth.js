const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BlockedIP = require('../models/BlockedIP');

const auth = async (req, res, next) => {
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

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Giriş etmək lazımdır' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Zəhmət olmasa yenidən giriş edin' });
  }
};

module.exports = auth; 