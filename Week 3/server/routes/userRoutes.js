const express = require('express');
const { body } = require('express-validator');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  getDashboardStats,
} = require('../controllers/userController');
const { getMyBookmarks } = require('../controllers/postController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { uploadAvatar: uploadAvatarMiddleware } = require('../middleware/upload');

const router = express.Router();

router.use(protect); // all user routes require authentication

router.get('/profile', getProfile);

router.put(
  '/profile',
  [
    body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('bio').optional().trim().isLength({ max: 280 }).withMessage('Bio cannot exceed 280 characters'),
  ],
  validate,
  updateProfile
);

router.put('/profile/avatar', uploadAvatarMiddleware, uploadAvatar);

router.put(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  changePassword
);

router.get('/dashboard-stats', getDashboardStats);
router.get('/bookmarks', getMyBookmarks);

module.exports = router;
