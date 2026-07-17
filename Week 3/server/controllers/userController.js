const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Get logged in user's profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// @desc    Update logged in user's profile (name, bio)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, 'User not found');

  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;

  await user.save();

  res.status(200).json({ success: true, message: 'Profile updated', user });
});

// @desc    Upload / replace profile picture
// @route   PUT /api/users/profile/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No image file was provided');
  }

  const user = await User.findById(req.user._id);

  // Clean up the previous avatar file from disk, if it was a local upload
  if (user.profilePicUrl && user.profilePicUrl.startsWith('/uploads/avatars/')) {
    const oldPath = path.join(__dirname, '..', user.profilePicUrl);
    fs.unlink(oldPath, () => {}); // best-effort, ignore errors
  }

  user.profilePicUrl = `/uploads/avatars/${req.file.filename}`;
  await user.save();

  res.status(200).json({ success: true, message: 'Profile picture updated', user });
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password changed successfully' });
});

// @desc    Author dashboard statistics — total posts, views, comments, likes
// @route   GET /api/users/dashboard-stats
// @access  Private (author only)
const getDashboardStats = asyncHandler(async (req, res) => {
  if (req.user.role !== 'author') {
    throw new ApiError(403, 'Only authors have a dashboard');
  }

  const authorId = req.user._id;

  const [totals, statusBreakdown, myPostIds] = await Promise.all([
    Post.aggregate([
      { $match: { author: authorId } },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalViews: { $sum: '$viewCount' },
          totalLikes: { $sum: { $size: '$likedBy' } },
        },
      },
    ]),
    Post.aggregate([
      { $match: { author: authorId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Post.find({ author: authorId }).distinct('_id'),
  ]);

  const totalComments = await Comment.countDocuments({ post: { $in: myPostIds } });

  const stats = totals[0] || { totalPosts: 0, totalViews: 0, totalLikes: 0 };
  const breakdown = { draft: 0, published: 0 };
  statusBreakdown.forEach((s) => {
    breakdown[s._id] = s.count;
  });

  res.status(200).json({
    success: true,
    stats: {
      totalPosts: stats.totalPosts,
      totalViews: stats.totalViews,
      totalLikes: stats.totalLikes,
      totalComments,
      statusBreakdown: breakdown,
    },
  });
});

module.exports = { getProfile, updateProfile, uploadAvatar, changePassword, getDashboardStats };
