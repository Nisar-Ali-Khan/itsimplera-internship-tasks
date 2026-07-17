import { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FileText, Eye, Heart, MessageCircle, PenSquare, Pencil, Trash2, Clock } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import * as postService from '../services/postService';
import * as userService from '../services/userService';
import { getErrorMessage } from '../utils/validators';

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="card p-4 flex items-center gap-3">
    <div className="h-10 w-10 rounded-lg bg-forest-50 flex items-center justify-center shrink-0">
      <Icon size={18} className="text-forest-500" />
    </div>
    <div>
      <p className="text-xs text-inkmuted uppercase tracking-wide font-semibold">{label}</p>
      <p className="font-mono text-xl font-semibold">{value}</p>
    </div>
  </div>
);

const MyPosts = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, postsRes] = await Promise.all([
        userService.getDashboardStats(),
        postService.getMyPosts({ status: statusFilter || undefined }),
      ]);
      setStats(statsRes.stats);
      setPosts(postsRes.posts);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await postService.deletePost(deleteTarget._id);
      toast.success('Post deleted');
      setDeleteTarget(null);
      fetchAll();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageLayout wide>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-semibold text-2xl">My Posts</h1>
          <p className="text-sm text-inkmuted mt-0.5">Manage your drafts and published posts.</p>
        </div>
        <button onClick={() => navigate('/posts/new')} className="btn-primary">
          <PenSquare size={16} /> Write a Post
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={FileText} label="Total Posts" value={stats.totalPosts} />
          <StatCard icon={Eye} label="Total Views" value={stats.totalViews} />
          <StatCard icon={Heart} label="Total Likes" value={stats.totalLikes} />
          <StatCard icon={MessageCircle} label="Total Comments" value={stats.totalComments} />
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {['', 'draft', 'published'].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              statusFilter === s ? 'bg-forest-500 text-white' : 'bg-white border border-ink/15 text-inkmuted hover:bg-paper'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No posts yet"
          description="Start writing your first post — save it as a draft or publish it right away."
          action={
            <button className="btn-primary" onClick={() => navigate('/posts/new')}>
              <PenSquare size={16} /> Write a Post
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden divide-y divide-ink/10">
          {posts.map((post) => (
            <div key={post._id} className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <Link to={`/posts/${post.slug || post._id}`} className="font-medium hover:text-forest-500 transition-colors line-clamp-1">
                  {post.title}
                </Link>
                <div className="flex items-center gap-3 mt-1 text-xs text-inkmuted font-mono">
                  <span className={`px-2 py-0.5 rounded-full ${post.status === 'published' ? 'bg-forest-50 text-forest-500' : 'bg-gold-100 text-gold-500'}`}>
                    {post.status}
                  </span>
                  <span className="inline-flex items-center gap-1"><Eye size={12} />{post.viewCount}</span>
                  <span className="inline-flex items-center gap-1"><Heart size={12} />{post.likedBy?.length || 0}</span>
                  <span className="inline-flex items-center gap-1"><Clock size={12} />{new Date(post.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => navigate(`/posts/${post._id}/edit`)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-paper text-inkmuted"
                  aria-label={`Edit ${post.title}`}
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget(post)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-coral-100 text-coral-500"
                  aria-label={`Delete ${post.title}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this post?"
        message={`"${deleteTarget?.title}" will be permanently removed, along with its comments. This can't be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </PageLayout>
  );
};

export default MyPosts;
