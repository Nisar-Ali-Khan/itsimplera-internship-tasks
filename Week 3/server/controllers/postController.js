const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Bookmark = require('../models/Bookmark');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sanitizeRichText } = require('../utils/sanitize');

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  mostViewed: { viewCount: -1 },
  mostLiked: { likeCountSort: -1 }, // resolved via aggregation-friendly field below
};

// Attaches isLiked / isBookmarked flags for the current viewer, if any
const decoratePost = async (postDoc, viewerId) => {
  const post = postDoc.toObject ? postDoc.toObject() : postDoc;
  post.isLiked = viewerId ? post.likedBy.some((id) => id.toString() === viewerId.toString()) : false;
  if (viewerId) {
    const bookmarked = await Bookmark.exists({ user: viewerId, post: post._id });
    post.isBookmarked = !!bookmarked;
  } else {
    post.isBookmarked = false;
  }
  delete post.likedBy; // don't leak the full list of likers to every viewer
  return post;
};

// @desc    Create a new post (draft or published)
// @route   POST /api/posts
// @access  Private (author only)
const createPost = asyncHandler(async (req, res) => {
  const { title, content, category, tags, status, coverImageUrl } = req.body;

  const post = await Post.create({
    title,
    content: sanitizeRichText(content),
    category,
    tags,
    status: status === 'published' ? 'published' : 'draft',
    coverImageUrl: coverImageUrl || '',
    author: req.user._id,
  });

  res.status(201).json({ success: true, message: 'Post created successfully', post });
});

// @desc    Get published posts (public feed) — search, filter, sort, paginate
// @route   GET /api/posts
// @access  Public (attaches viewer context if logged in)
const getPosts = asyncHandler(async (req, res) => {
  const { search, category, tag, sort = 'newest', page = 1, limit = 9, author } = req.query;

  const query = { status: 'published' };
  if (search) query.$text = { $search: search };
  if (category) query.category = category;
  if (tag) query.tags = tag.toLowerCase();
  if (author) query.author = author;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 9, 1), 50);
  const skip = (pageNum - 1) * limitNum;

  let sortStage = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;
  let postsQuery = Post.find(query).populate('author', 'name avatarColor profilePicUrl');

  if (sort === 'mostLiked') {
    // likeCount is a virtual (array length), so sort in-memory after an
    // aggregation-friendly $addFields pass rather than via .sort()
    const allMatching = await Post.aggregate([
      { $match: query },
      { $addFields: { likeCountSort: { $size: '$likedBy' } } },
      { $sort: { likeCountSort: -1 } },
      { $skip: skip },
      { $limit: limitNum },
    ]);
    const populated = await Post.populate(allMatching, { path: 'author', select: 'name avatarColor profilePicUrl' });
    const total = await Post.countDocuments(query);
    const decorated = await Promise.all(populated.map((p) => decoratePost(p, req.user?._id)));
    return res.status(200).json({
      success: true,
      posts: decorated,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) || 1 },
    });
  }

  const [posts, total] = await Promise.all([
    postsQuery.sort(sortStage).skip(skip).limit(limitNum),
    Post.countDocuments(query),
  ]);

  const decorated = await Promise.all(posts.map((p) => decoratePost(p, req.user?._id)));

  res.status(200).json({
    success: true,
    posts: decorated,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) || 1 },
  });
});

// @desc    Get the logged-in author's own posts (includes drafts)
// @route   GET /api/posts/mine
// @access  Private (author only)
const getMyPosts = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { author: req.user._id };
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
  const skip = (pageNum - 1) * limitNum;

  const [posts, total] = await Promise.all([
    Post.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limitNum),
    Post.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    posts,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) || 1 },
  });
});

// @desc    Get a single post by id or slug. Increments view count for
//          published posts viewed by someone other than the author.
// @route   GET /api/posts/:id
// @access  Public (drafts only visible to their author)
const getPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };

  const post = await Post.findOne(query).populate('author', 'name avatarColor profilePicUrl bio');
  if (!post) throw new ApiError(404, 'Post not found');

  const isOwner = req.user && post.author._id.toString() === req.user._id.toString();

  if (post.status === 'draft' && !isOwner) {
    throw new ApiError(404, 'Post not found');
  }

  if (post.status === 'published' && !isOwner) {
    post.viewCount += 1;
    await post.save();
  }

  const decorated = await decoratePost(post, req.user?._id);
  res.status(200).json({ success: true, post: decorated });
});

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (post owner only)
const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found');

  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only edit your own posts');
  }

  const { title, content, category, tags, status, coverImageUrl } = req.body;

  if (title !== undefined) post.title = title;
  if (content !== undefined) post.content = sanitizeRichText(content);
  if (category !== undefined) post.category = category;
  if (tags !== undefined) post.tags = tags;
  if (status !== undefined) post.status = status;
  if (coverImageUrl !== undefined) post.coverImageUrl = coverImageUrl;

  await post.save();

  res.status(200).json({ success: true, message: 'Post updated successfully', post });
});

// @desc    Upload / replace a post's cover image
// @route   PUT /api/posts/:id/cover-image
// @access  Private (post owner only)
const uploadCoverImage = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found');
  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only edit your own posts');
  }
  if (!req.file) throw new ApiError(400, 'No image file was provided');

  if (post.coverImageUrl && post.coverImageUrl.startsWith('/uploads/posts/')) {
    const oldPath = path.join(__dirname, '..', post.coverImageUrl);
    fs.unlink(oldPath, () => {});
  }

  post.coverImageUrl = `/uploads/posts/${req.file.filename}`;
  await post.save();

  res.status(200).json({ success: true, message: 'Cover image updated', post });
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (post owner only)
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found');

  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only delete your own posts');
  }

  await post.deleteOne();
  await Bookmark.deleteMany({ post: post._id });

  res.status(200).json({ success: true, message: 'Post deleted successfully' });
});

// @desc    Toggle like on a post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found');

  const userId = req.user._id.toString();
  const alreadyLiked = post.likedBy.some((id) => id.toString() === userId);

  if (alreadyLiked) {
    post.likedBy = post.likedBy.filter((id) => id.toString() !== userId);
  } else {
    post.likedBy.push(req.user._id);
  }
  await post.save();

  res.status(200).json({
    success: true,
    message: alreadyLiked ? 'Post unliked' : 'Post liked',
    isLiked: !alreadyLiked,
    likeCount: post.likedBy.length,
  });
});

// @desc    Toggle bookmark on a post
// @route   POST /api/posts/:id/bookmark
// @access  Private
const toggleBookmark = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found');

  const existing = await Bookmark.findOne({ user: req.user._id, post: post._id });

  if (existing) {
    await existing.deleteOne();
    return res.status(200).json({ success: true, message: 'Bookmark removed', isBookmarked: false });
  }

  await Bookmark.create({ user: req.user._id, post: post._id });
  res.status(200).json({ success: true, message: 'Post bookmarked', isBookmarked: true });
});

// @desc    Get the logged-in user's bookmarked posts
// @route   GET /api/users/bookmarks
// @access  Private
const getMyBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await Bookmark.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: 'post',
      populate: { path: 'author', select: 'name avatarColor profilePicUrl' },
    });

  const posts = bookmarks.filter((b) => b.post).map((b) => b.post);
  res.status(200).json({ success: true, posts });
});

module.exports = {
  createPost,
  getPosts,
  getMyPosts,
  getPostById,
  updatePost,
  uploadCoverImage,
  deletePost,
  toggleLike,
  toggleBookmark,
  getMyBookmarks,
};
