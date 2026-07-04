const express = require('express');
const { body } = require('express-validator');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // all task routes require authentication

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description too long'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']).withMessage('Invalid status'),
  body('dueDate').notEmpty().withMessage('Due date is required').isISO8601().withMessage('Invalid due date'),
];

router.route('/')
  .get(getTasks)
  .post(taskValidation, validate, createTask);

router.route('/:id')
  .get(getTaskById)
  .put(
    [
      body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
      body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description too long'),
      body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
      body('status').optional().isIn(['Pending', 'In Progress', 'Completed']).withMessage('Invalid status'),
      body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
    ],
    validate,
    updateTask
  )
  .delete(deleteTask);

module.exports = router;
