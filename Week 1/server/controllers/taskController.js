const Task = require('../models/Task');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Get all tasks for logged in user (search, filter, paginate)
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const { search, status, priority, page = 1, limit = 8, sortBy = '-createdAt' } = req.query;

  const query = { user: req.user._id };

  if (search) {
    query.$text = { $search: search };
  }
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 8, 1), 50);
  const skip = (pageNum - 1) * limitNum;

  const [tasks, total] = await Promise.all([
    Task.find(query).sort(sortBy).skip(skip).limit(limitNum),
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
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
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
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
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

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!task) throw new ApiError(404, 'Task not found');
  res.status(200).json({ success: true, message: 'Task deleted successfully' });
});

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
