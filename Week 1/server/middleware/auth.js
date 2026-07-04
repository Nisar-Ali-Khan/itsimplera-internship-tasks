const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

// Protect routes - verifies JWT and attaches user to req
const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'Not authorized. User no longer exists.');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Session expired. Please log in again.');
    }
    throw new ApiError(401, 'Not authorized. Invalid token.');
  }
});

module.exports = { protect };
