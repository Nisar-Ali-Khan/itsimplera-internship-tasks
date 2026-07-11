const Task = require('../models/Task');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');

const ALLOWED_SORT_FIELDS = ['createdAt', 'dueDate', 'priority', 'title', 'status'];

// Turns a query param like "-dueDate" or "priority" into a safe Mongoose
// sort object, falling back to newest-first if the field isn't whitelisted.
const buildSortOption = (sort) => {
  if (!sort) return { createdAt: -1 };
  const direction = sort.startsWith('-') ? -1 : 1;
  const field = sort.replace(/^-/, '');
  if (!ALLOWED_SORT_FIELDS.includes(field)) return { createdAt: -1 };
  return { [field]: direction };
};

// @desc    Get all tasks for logged in user (search, filter, sort, paginate)
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const { search, status, priority, page = 1, limit = 8, sort } = req.query;

  const query = { user: req.user._id, isDeleted: false };

  if (search) {
    query.$text = { $search: search };
  }
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 8, 1), 50);
  const skip = (pageNum - 1) * limitNum;
  const sortOption = buildSortOption(sort);

  const [tasks, total] = await Promise.all([
    Task.find(query).sort(sortOption).skip(skip).limit(limitNum),
    Task.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    tasks,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  });
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id, isDeleted: false });
  if (!task) throw new ApiError(404, 'Task not found');
  res.status(200).json({ success: true, task });
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, status, dueDate } = req.body;

  const task = await Task.create({
    title,
    description,
    priority,
    status,
    dueDate,
    user: req.user._id,
  });

  res.status(201).json({ success: true, message: 'Task created successfully', task });
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id, isDeleted: false });
  if (!task) throw new ApiError(404, 'Task not found');

  const { title, description, priority, status, dueDate } = req.body;

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (priority !== undefined) task.priority = priority;
  if (status !== undefined) task.status = status;
  if (dueDate !== undefined) task.dueDate = dueDate;

  await task.save();

  res.status(200).json({ success: true, message: 'Task updated successfully', task });
});

// @desc    Soft-delete a task — marks it deleted instead of removing it,
//          so it disappears from lists but can still be restored
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id, isDeleted: false });
  if (!task) throw new ApiError(404, 'Task not found');

  task.isDeleted = true;
  task.deletedAt = new Date();
  await task.save();

  res.status(200).json({ success: true, message: 'Task deleted successfully' });
});

// @desc    List soft-deleted tasks (trash)
// @route   GET /api/tasks/trash
// @access  Private
const getTrashedTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user._id, isDeleted: true }).sort({ deletedAt: -1 });
  res.status(200).json({ success: true, tasks });
});

// @desc    Restore a soft-deleted task
// @route   PATCH /api/tasks/:id/restore
// @access  Private
const restoreTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id, isDeleted: true });
  if (!task) throw new ApiError(404, 'Deleted task not found');

  task.isDeleted = false;
  task.deletedAt = null;
  await task.save();

  res.status(200).json({ success: true, message: 'Task restored successfully', task });
});

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTrashedTasks,
  restoreTask,
};
