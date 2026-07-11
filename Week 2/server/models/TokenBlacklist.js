const mongoose = require('mongoose');

// Stores JWTs that have been explicitly logged out before their natural
// expiry. A TTL index automatically removes each entry once the token
// would have expired anyway, so this collection never grows unbounded.
const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);
