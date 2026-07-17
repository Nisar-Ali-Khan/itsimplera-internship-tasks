import { useState } from 'react';
import { toast } from 'react-toastify';
import { Reply, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as commentService from '../services/commentService';
import { getErrorMessage } from '../utils/validators';
import { resolveMediaUrl } from '../utils/media';

const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  const units = [
    ['year', 31536000], ['month', 2592000], ['day', 86400],
    ['hour', 3600], ['minute', 60],
  ];
  for (const [name, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${name}${value > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

const CommentItem = ({ comment, postId, onChanged, depth = 0 }) => {
  const { user, isAuthenticated } = useAuth();
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(comment.content);
  const [submitting, setSubmitting] = useState(false);

  const isOwner = user && comment.user?._id === user._id;
  const initials = comment.user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await commentService.createComment(postId, { content: replyText, parentComment: comment._id });
      setReplyText('');
      setReplying(false);
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    setSubmitting(true);
    try {
      await commentService.updateComment(comment._id, { content: editText });
      setEditing(false);
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment and its replies?')) return;
    try {
      await commentService.deleteComment(comment._id);
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className={depth > 0 ? 'pl-6 border-l border-ink/10 mt-3' : 'mt-4'}>
      <div className="flex gap-2.5">
        {comment.user?.profilePicUrl ? (
          <img src={resolveMediaUrl(comment.user.profilePicUrl)} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
        ) : (
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
            style={{ backgroundColor: comment.user?.avatarColor || '#1B4332' }}
          >
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="bg-paper rounded-lg px-3.5 py-2.5">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-medium">{comment.user?.name}</span>
              <span className="text-xs text-inkmuted">{timeAgo(comment.createdAt)}</span>
            </div>
            {editing ? (
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="input-field text-sm mt-1"
                rows={2}
              />
            ) : (
              <p className="text-sm text-ink whitespace-pre-wrap">{comment.content}</p>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1.5 px-1">
            {isAuthenticated && !editing && (
              <button onClick={() => setReplying((r) => !r)} className="inline-flex items-center gap-1 text-xs text-inkmuted hover:text-forest-500">
                <Reply size={12} /> Reply
              </button>
            )}
            {isOwner && !editing && (
              <>
                <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1 text-xs text-inkmuted hover:text-forest-500">
                  <Pencil size={12} /> Edit
                </button>
                <button onClick={handleDelete} className="inline-flex items-center gap-1 text-xs text-inkmuted hover:text-coral-500">
                  <Trash2 size={12} /> Delete
                </button>
              </>
            )}
            {editing && (
              <>
                <button onClick={handleEdit} disabled={submitting} className="text-xs font-medium text-forest-500">
                  Save
                </button>
                <button onClick={() => { setEditing(false); setEditText(comment.content); }} className="text-xs text-inkmuted">
                  Cancel
                </button>
              </>
            )}
          </div>

          {replying && (
            <div className="mt-2 flex gap-2">
              <input
                autoFocus
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.user?.name}…`}
                className="input-field text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleReply()}
              />
              <button onClick={handleReply} disabled={submitting} className="btn-primary shrink-0 px-3.5">
                Post
              </button>
            </div>
          )}

          {comment.replies?.map((reply) => (
            <CommentItem key={reply._id} comment={reply} postId={postId} onChanged={onChanged} depth={depth + 1} />
          ))}
        </div>
      </div>
    </div>
  );
};

const CommentThread = ({ comments, postId, onChanged }) => {
  if (comments.length === 0) {
    return <p className="text-sm text-inkmuted py-6 text-center">No comments yet — be the first to share your thoughts.</p>;
  }

  return (
    <div>
      {comments.map((comment) => (
        <CommentItem key={comment._id} comment={comment} postId={postId} onChanged={onChanged} />
      ))}
    </div>
  );
};

export default CommentThread;
