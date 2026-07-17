const ApiError = require('../utils/ApiError');

// Restricts a route to specific roles. Must run after `protect`, since it
// relies on req.user being populated.
// Usage: router.post('/posts', protect, authorize('author'), createPost)
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized.');
  }
  if (!allowedRoles.includes(req.user.role)) {
    throw new ApiError(403, `This action requires one of these roles: ${allowedRoles.join(', ')}`);
  }
  next();
};

module.exports = authorize;
