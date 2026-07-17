import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Heart, Bookmark, Clock, Eye, Pencil, Trash2 } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import Loader from '../components/Loader';
import ConfirmDialog from '../components/ConfirmDialog';
import CommentThread from '../components/CommentThread';
import { useAuth } from '../context/AuthContext';
import * as postService from '../services/postService';
import * as commentService from '../services/commentService';
import { getErrorMessage } from '../utils/validators';
import { resolveMediaUrl } from '../utils/media';

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      const { post: fetched } = await postService.getPostById(id);
      setPost(fetched);
    } catch (err) {
      toast.error(getErrorMessage(err));
      navigate('/');
    }
  }, [id, navigate]);

  const fetchComments = useCallback(async () => {
    try {
      const { comments: fetched } = await commentService.getComments(post?._id || id);
      setComments(fetched);
    } catch {
      // Non-fatal — comments section just stays empty
    }
  }, [id, post?._id]);

  useEffect(() => {
    setLoading(true);
    fetchPost().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (post?._id) fetchComments();
  }, [post?._id, fetchComments]);

  const handleLike = async () => {
    if (!isAuthenticated) return navigate('/login');
    try {
      const res = await postService.toggleLike(post._id);
      setPost((p) => ({ ...p, isLiked: res.isLiked, likeCount: res.likeCount }));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) return navigate('/login');
    try {
      const res = await postService.toggleBookmark(post._id);
      setPost((p) => ({ ...p, isBookmarked: res.isBookmarked }));
      toast.success(res.message);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await commentService.createComment(post._id, { content: newComment });
      setNewComment('');
      fetchComments();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await postService.deletePost(post._id);
      toast.success('Post deleted');
      navigate('/my-posts');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !post) {
    return (
      <PageLayout>
        <Loader />
      </PageLayout>
    );
  }

  const isOwner = user && post.author?._id === user._id;

  return (
    <PageLayout>
      {post.status === 'draft' && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-gold-100 text-gold-500 text-sm font-medium text-center">
          This post is a draft — only visible to you
        </div>
      )}

      {post.coverImageUrl && (
        <div className="rounded-card overflow-hidden mb-6 aspect-[16/9] bg-forest-50">
          <img src={resolveMediaUrl(post.coverImageUrl)} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <span className="tag-pill">{post.category}</span>
        {post.tags?.map((t) => (
          <span key={t} className="text-xs text-inkmuted">#{t}</span>
        ))}
      </div>

      <h1 className="font-display font-bold text-3xl md:text-4xl leading-tight mb-4">{post.title}</h1>

      <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-6 border-b border-ink/10">
        <Link to={`/`} className="flex items-center gap-2.5">
          {post.author?.profilePicUrl ? (
            <img src={resolveMediaUrl(post.author.profilePicUrl)} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-semibold text-white"
              style={{ backgroundColor: post.author?.avatarColor || '#1B4332' }}
            >
              {post.author?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-medium">{post.author?.name}</p>
            <p className="text-xs text-inkmuted">{formatDate(post.createdAt)}</p>
          </div>
        </Link>

        <div className="flex items-center gap-3 text-sm text-inkmuted font-mono">
          <span className="inline-flex items-center gap-1"><Clock size={14} />{post.readingTimeMinutes} min read</span>
          <span className="inline-flex items-center gap-1"><Eye size={14} />{post.viewCount}</span>
        </div>
      </div>

      <div className="prose-content" dangerouslySetInnerHTML={{ __html: post.content }} />

      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-ink/10">
        <button
          onClick={handleLike}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            post.isLiked ? 'border-coral-400 bg-coral-100 text-coral-500' : 'border-ink/15 text-inkmuted hover:bg-paper'
          }`}
        >
          <Heart size={16} className={post.isLiked ? 'fill-coral-500' : ''} /> {post.likeCount}
        </button>
        <button
          onClick={handleBookmark}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            post.isBookmarked ? 'border-forest-500 bg-forest-50 text-forest-500' : 'border-ink/15 text-inkmuted hover:bg-paper'
          }`}
        >
          <Bookmark size={16} className={post.isBookmarked ? 'fill-forest-500' : ''} />
          {post.isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </button>

        {isOwner && (
          <div className="ml-auto flex gap-2">
            <button onClick={() => navigate(`/posts/${post._id}/edit`)} className="btn-secondary">
              <Pencil size={15} /> Edit
            </button>
            <button onClick={() => setDeleteOpen(true)} className="btn-danger">
              <Trash2 size={15} /> Delete
            </button>
          </div>
        )}
      </div>

      {post.status === 'published' && (
        <div className="mt-8">
          <h2 className="font-display font-semibold text-xl mb-4">Comments ({comments.length})</h2>

          {isAuthenticated ? (
            <div className="flex gap-2 mb-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts…"
                className="input-field"
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <button onClick={handleAddComment} disabled={submittingComment} className="btn-primary shrink-0">
                Post
              </button>
            </div>
          ) : (
            <p className="text-sm text-inkmuted">
              <Link to="/login" className="text-forest-500 font-medium hover:underline">Log in</Link> to join the discussion.
            </p>
          )}

          <CommentThread comments={comments} postId={post._id} onChanged={fetchComments} />
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete this post?"
        message={`"${post.title}" will be permanently removed, along with its comments. This can't be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        loading={deleting}
      />
    </PageLayout>
  );
};

export default PostDetail;
