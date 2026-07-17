import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Search, X } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import * as postService from '../services/postService';
import { getErrorMessage } from '../utils/validators';
import { BookOpen } from 'lucide-react';

const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const SORT_LABELS = {
  newest: 'Newest',
  oldest: 'Oldest',
  mostViewed: 'Most Viewed',
  mostLiked: 'Most Liked',
};

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 9, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await postService.getPosts({
        search: debouncedSearch || undefined,
        category: category || undefined,
        tag: tag || undefined,
        sort,
        page,
        limit: 9,
      });
      setPosts(res.posts);
      setPagination(res.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, tag, sort, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, tag, sort]);

  const hasFilters = search || category || tag;

  return (
    <PageLayout wide>
      <div className="mb-6">
        <h1 className="font-display font-semibold text-3xl mb-1.5">The Feed</h1>
        <p className="text-inkmuted">Fresh posts from Chronicle's authors.</p>
      </div>

      <div className="card p-4 mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkmuted" />
          <input
            type="text"
            placeholder="Search posts by title or content…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-field md:w-40"
        />
        <input
          type="text"
          placeholder="Tag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="input-field md:w-36"
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field md:w-44">
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {hasFilters && (
          <button onClick={() => { setSearch(''); setCategory(''); setTag(''); }} className="btn-secondary md:w-auto">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No posts found"
          description="Nothing matches yet. Try adjusting your search or filters."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onChange={setPage}
          />
        </>
      )}
    </PageLayout>
  );
};

export default Feed;
