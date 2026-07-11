const User = require('../models/User');
const Task = require('../models/Task');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Get logged in user's profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// @desc    Update logged in user's profile
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

// @desc    Get dashboard statistics + recent activity for logged in user
// @route   GET /api/users/dashboard-stats
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const baseFilter = { user: userId, isDeleted: false };

  const [total, pending, inProgress, completed, byPriority, recent] = await Promise.all([
    Task.countDocuments(baseFilter),
    Task.countDocuments({ ...baseFilter, status: 'Pending' }),
    Task.countDocuments({ ...baseFilter, status: 'In Progress' }),
    Task.countDocuments({ ...baseFilter, status: 'Completed' }),
    Task.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Task.find(baseFilter).sort({ updatedAt: -1 }).limit(5),
  ]);

  const priorityBreakdown = { Low: 0, Medium: 0, High: 0 };
  byPriority.forEach((p) => {
    priorityBreakdown[p._id] = p.count;
  });

  const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  res.status(200).json({
    success: true,
    stats: {
      total,
      pending,
      inProgress,
      completed,
      completionPercentage,
      priorityBreakdown,
    },
    recentActivity: recent,
  });
});

module.exports = { getProfile, updateProfile, changePassword, getDashboardStats };
