const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');

// Protect routes - verifies JWT, rejects blacklisted (logged-out) tokens,
// and attaches the user + raw token to req
const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized. No token provided.');
  }

  // Reject tokens that were explicitly invalidated via logout, even if
  // they haven't reached their natural expiry yet.
  const isBlacklisted = await TokenBlacklist.findOne({ token });
  if (isBlacklisted) {
    throw new ApiError(401, 'Session has been logged out. Please log in again.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'Not authorized. User no longer exists.');
    }

    req.user = user;
    req.token = token;
    req.tokenExp = decoded.exp;
    next();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Session expired. Please log in again.');
    }
    throw new ApiError(401, 'Not authorized. Invalid token.');
  }
});

module.exports = { protect };
