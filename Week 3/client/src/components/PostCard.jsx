import { Link } from 'react-router-dom';
import { Heart, Eye, Clock } from 'lucide-react';
import { resolveMediaUrl } from '../utils/media';

const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const PostCard = ({ post }) => {
  const excerpt = stripHtml(post.content).slice(0, 140);

  return (
    <Link to={`/posts/${post.slug || post._id}`} className="card overflow-hidden flex flex-col group">
      <div className="aspect-[16/9] bg-forest-50 overflow-hidden">
        {post.coverImageUrl ? (
          <img
            src={resolveMediaUrl(post.coverImageUrl)}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-forest-400 font-display text-3xl">
            {post.title?.[0]?.toUpperCase()}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="tag-pill">{post.category || 'General'}</span>
          {post.status === 'draft' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gold-100 text-gold-500">
              Draft
            </span>
          )}
        </div>

        <h3 className="font-display font-semibold text-lg leading-snug mb-1.5 group-hover:text-forest-500 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-inkmuted line-clamp-2 mb-3">{excerpt}</p>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-ink/10">
          <div className="flex items-center gap-2 min-w-0">
            {post.author?.profilePicUrl ? (
              <img src={resolveMediaUrl(post.author.profilePicUrl)} alt="" className="h-6 w-6 rounded-full object-cover shrink-0" />
            ) : (
              <div
                className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-semibold text-white shrink-0"
                style={{ backgroundColor: post.author?.avatarColor || '#1B4332' }}
              >
                {post.author?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-xs text-inkmuted truncate">{post.author?.name}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-inkmuted font-mono shrink-0">
            <span className="inline-flex items-center gap-1"><Clock size={12} />{post.readingTimeMinutes}m</span>
            <span className="inline-flex items-center gap-1"><Eye size={12} />{post.viewCount}</span>
            <span className="inline-flex items-center gap-1"><Heart size={12} className={post.isLiked ? 'fill-coral-400 text-coral-400' : ''} />{post.likeCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
