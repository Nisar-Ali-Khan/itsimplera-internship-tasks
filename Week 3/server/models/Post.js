const mongoose = require('mongoose');
const slugify = require('slugify');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      // Sanitized HTML (rich text) — XSS-stripped in the controller before save
    },
    coverImageUrl: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) => (Array.isArray(tags) ? tags.map((t) => t.trim().toLowerCase()).filter(Boolean) : []),
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published'],
        message: 'Status must be draft or published',
      },
      default: 'draft',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  { timestamps: true }
);

// Text index to support search on title/content
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ category: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ status: 1, createdAt: -1 });

// Virtual — never stored, always computed from current content
postSchema.virtual('likeCount').get(function () {
  return this.likedBy ? this.likedBy.length : 0;
});
postSchema.virtual('readingTimeMinutes').get(function () {
  if (!this.content) return 1;
  const words = this.content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200)); // ~200 wpm average reading speed
});

postSchema.set('toJSON', { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } });
postSchema.set('toObject', { virtuals: true });

// Auto-generate a unique, URL-safe slug from the title
postSchema.pre('validate', async function (next) {
  if (!this.isModified('title') && this.slug) return next();

  const base = slugify(this.title || 'post', { lower: true, strict: true }).slice(0, 100);
  let candidate = base;
  let counter = 1;

  const Post = mongoose.model('Post');
  while (await Post.exists({ slug: candidate, _id: { $ne: this._id } })) {
    candidate = `${base}-${counter++}`;
  }
  this.slug = candidate;
  next();
});

module.exports = mongoose.model('Post', postSchema);
