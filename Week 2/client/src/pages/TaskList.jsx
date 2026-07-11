import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Search, PlusCircle, X } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import TaskTable from '../components/TaskTable';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import ConfirmDialog from '../components/ConfirmDialog';
import * as taskService from '../services/taskService';
import { getErrorMessage } from '../utils/validators';

const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const TaskList = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 8, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await taskService.getTasks({
        search: debouncedSearch || undefined,
        status: status || undefined,
        priority: priority || undefined,
        page,
        limit: 8,
      });
      setTasks(res.tasks);
      setPagination(res.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, priority, page]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, priority]);

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await taskService.deleteTask(deleteTarget._id);
      toast.success('Task deleted');
      setDeleteTarget(null);
      fetchTasks();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = search || status || priority;

  return (
    <AppLayout title="All Tasks">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="font-display font-semibold text-2xl">Tasks</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Search, filter, and manage everything.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/tasks/new')}>
          <PlusCircle size={16} /> New Task
        </button>
      </div>

      <div className="card p-4 mb-5 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field md:w-44">
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input-field md:w-40">
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        {hasFilters && (
          <button
            onClick={() => {
              setSearch('');
              setStatus('');
              setPriority('');
            }}
            className="btn-secondary md:w-auto"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <TaskTable tasks={tasks} onDelete={setDeleteTarget} />
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onChange={setPage}
          />
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this task?"
        message={`"${deleteTarget?.title}" will be permanently removed. This can't be undone.`}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </AppLayout>
  );
};

export default TaskList;
