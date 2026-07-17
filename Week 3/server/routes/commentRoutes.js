const express = require('express');
const { body } = require('express-validator');
const { updateComment, deleteComment } = require('../controllers/commentController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.put(
  '/:id',
  [
    body('content').trim().notEmpty().withMessage('Comment cannot be empty')
      .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
  ],
  validate,
  updateComment
);

router.delete('/:id', deleteComment);

module.exports = router;
