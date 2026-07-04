const express = require('express');
const { body } = require('express-validator');
const {
  updateProfile,
  changePassword,
  getDashboardStats,
} = require('../controllers/userController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // all routes below require authentication

router.put(
  '/profile',
  [
    body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('bio').optional().trim().isLength({ max: 200 }).withMessage('Bio cannot exceed 200 characters'),
  ],
  validate,
  updateProfile
);

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

module.exports = router;
