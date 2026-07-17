const Comment = require('../models/Comment');
const Post = require('../models/Post');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sanitizePlainText } = require('../utils/sanitize');

// Turns a flat list of comments into a nested reply tree
const buildCommentTree = (comments) => {
  const byId = new Map();
  comments.forEach((c) => byId.set(c._id.toString(), { ...c.toObject(), replies: [] }));

  const roots = [];
  byId.forEach((comment) => {
    if (comment.parentComment) {
      const parent = byId.get(comment.parentComment.toString());
      if (parent) {
        parent.replies.push(comment);
        return;
      }
    }
    roots.push(comment);
  });
  return roots;
};

// @desc    Add a comment (or a reply, via parentComment) to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const createComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found');
  if (post.status !== 'published') throw new ApiError(400, 'Cannot comment on an unpublished post');

  const { content, parentComment } = req.body;

  if (parentComment) {
    const parent = await Comment.findOne({ _id: parentComment, post: post._id });
    if (!parent) throw new ApiError(404, 'Parent comment not found on this post');
  }

  const comment = await Comment.create({
    content: sanitizePlainText(content),
    post: post._id,
    user: req.user._id,
    parentComment: parentComment || null,
  });

  const populated = await comment.populate('user', 'name avatarColor profilePicUrl');

  res.status(201).json({ success: true, message: 'Comment added', comment: populated });
});

// @desc    Get all comments for a post, threaded into replies
// @route   GET /api/posts/:id/comments
// @access  Public
const getCommentsForPost = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.id })
    .sort({ createdAt: 1 })
    .populate('user', 'name avatarColor profilePicUrl');

  res.status(200).json({ success: true, comments: buildCommentTree(comments) });
});

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private (comment owner only)
const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new ApiError(404, 'Comment not found');

  if (comment.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only edit your own comments');
  }

  comment.content = sanitizePlainText(req.body.content);
  await comment.save();

  res.status(200).json({ success: true, message: 'Comment updated', comment });
});

// @desc    Delete a comment (and its replies, to avoid orphaned threads)
// @route   DELETE /api/comments/:id
// @access  Private (comment owner only)
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new ApiError(404, 'Comment not found');

  if (comment.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only delete your own comments');
  }

  // Cascade-delete replies to this comment (one level is enough for typical
  // threading depth, applied recursively to be safe for deeper chains)
  const deleteWithReplies = async (commentId) => {
    const replies = await Comment.find({ parentComment: commentId });
    for (const reply of replies) {
      await deleteWithReplies(reply._id);
    }
    await Comment.deleteOne({ _id: commentId });
  };

  await deleteWithReplies(comment._id);

  res.status(200).json({ success: true, message: 'Comment deleted successfully' });
});

module.exports = { createComment, getCommentsForPost, updateComment, deleteComment };
