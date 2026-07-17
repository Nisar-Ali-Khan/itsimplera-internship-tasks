const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = (parseInt(process.env.MAX_UPLOAD_SIZE_MB, 10) || 5) * 1024 * 1024;

const makeStorage = (subfolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'uploads', subfolder));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = crypto.randomBytes(8).toString('hex');
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
    },
  });

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new ApiError(400, 'Only JPEG, PNG, WEBP, or GIF images are allowed'));
  }
  cb(null, true);
};

const buildUploader = (subfolder) =>
  multer({
    storage: makeStorage(subfolder),
    fileFilter,
    limits: { fileSize: MAX_SIZE_BYTES },
  });

const uploadAvatar = buildUploader('avatars').single('avatar');
const uploadCoverImage = buildUploader('posts').single('coverImage');

// Wraps multer's callback-style middleware so multer-specific errors (like
// "file too large") flow through the same centralized error handler.
const wrapUpload = (uploaderFn) => (req, res, next) => {
  uploaderFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(400, `File too large. Max size is ${MAX_SIZE_BYTES / 1024 / 1024}MB.`));
      }
      return next(new ApiError(400, err.message));
    }
    if (err) return next(err);
    next();
  });
};

module.exports = {
  uploadAvatar: wrapUpload(uploadAvatar),
  uploadCoverImage: wrapUpload(uploadCoverImage),
};
