const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    const error = new ApiError(400, 'Validation failed');
    error.errors = messages;
    return next(error);
  }
  next();
};

module.exports = validate;
