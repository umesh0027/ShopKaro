const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Protect route middleware
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verify token and get user ID from payload

    // Check if user still exists and is active
    const user = await User.findById(decoded.id);  // Find user by ID from token payload  yeh kha se verify krega database se? yaha pe hum User model ka use kar rahe hai jisse hum database me user ko find kar sakte hai, aur decoded.id me wo user ID hoti hai jo token generate karte waqt payload me daali thi, to yeh line basically database me se us user ko find kar rahi hai jiska ID token me diya gaya hai, aur agar wo user mil jata hai to usko req.user me store kar diya jayega taki aage ke middleware ya controllers me us user ki information use kar sake, aur agar user nahi milta ya user ka account deactivate ho chuka hai to us case me bhi unauthorized error return kar diya jayega taki protected routes ko access na kar sake
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// Admin middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Admin only' });
  }
};

// Optional auth (for public routes that can optionally have user)
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { generateToken, protect, adminOnly, optionalAuth };
