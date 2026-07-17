const express = require('express');
const { body } = require('express-validator');
const {
  createPost,
  getPosts,
  getMyPosts,
  getPostById,
  updatePost,
  uploadCoverImage,
  deletePost,
  toggleLike,
  toggleBookmark,
} = require('../controllers/postController');
const { createComment, getCommentsForPost } = require('../controllers/commentController');
const validate = require('../middleware/validate');
const { protect, attachUserIfPresent } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { uploadCoverImage: uploadCoverImageMiddleware } = require('../middleware/upload');

const router = express.Router();

const postValidation = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 150 }).withMessage('Title must be 3-150 characters'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('category').optional().trim().isLength({ max: 50 }).withMessage('Category too long'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
];

const commentValidation = [
  body('content').trim().notEmpty().withMessage('Comment cannot be empty')
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
  body('parentComment').optional().isMongoId().withMessage('Invalid parent comment id'),
];

// --- Collection routes ---
router.get('/', attachUserIfPresent, getPosts);
router.post('/', protect, authorize('author'), postValidation, validate, createPost);
router.get('/mine', protect, authorize('author'), getMyPosts);

// --- Single post routes ---
router.get('/:id', attachUserIfPresent, getPostById);
router.put('/:id', protect, authorize('author'), postValidation, validate, updatePost);
router.put('/:id/cover-image', protect, authorize('author'), uploadCoverImageMiddleware, uploadCoverImage);
router.delete('/:id', protect, authorize('author'), deletePost);

// --- Engagement routes ---
router.post('/:id/like', protect, toggleLike);
router.post('/:id/bookmark', protect, toggleBookmark);

// --- Nested comment routes ---
router.get('/:id/comments', getCommentsForPost);
router.post('/:id/comments', protect, commentValidation, validate, createComment);

module.exports = router;
