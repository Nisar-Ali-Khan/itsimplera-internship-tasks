import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Bookmark } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import PostCard from '../components/PostCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import * as postService from '../services/postService';
import * as userService from '../services/userService';
import { getErrorMessage } from '../utils/validators';

const Bookmarks = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    userService
      .getMyBookmarks()
      .then((res) => mounted && setPosts(res.posts))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PageLayout wide>
      <div className="mb-6">
        <h1 className="font-display font-semibold text-2xl">Bookmarks</h1>
        <p className="text-sm text-inkmuted mt-0.5">Posts you've saved to read later.</p>
      </div>

      {loading ? (
        <Loader />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No bookmarks yet"
          description="Tap the bookmark icon on any post to save it here for later."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default Bookmarks;
