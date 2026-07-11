import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Calendar } from 'lucide-react';
import { PriorityBadge, StatusBadge, PRIORITY_COLORS } from './Badges';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const TaskTable = ({ tasks, onDelete }) => {
  const navigate = useNavigate();

  if (tasks.length === 0) {
    return (
      <div className="card py-16 px-6 text-center">
        <p className="font-display font-semibold text-lg mb-1.5">No tasks here</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          Nothing matches yet. Create a task or adjust your filters.
        </p>
        <button className="btn-primary" onClick={() => navigate('/tasks/new')}>
          Create a task
        </button>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Desktop table */}
      <table className="w-full hidden md:table">
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/10 text-left">
            <th className="label-text py-3 pl-5">Task</th>
            <th className="label-text py-3">Priority</th>
            <th className="label-text py-3">Status</th>
            <th className="label-text py-3">Due Date</th>
            <th className="label-text py-3 pr-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task._id}
              className="border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
            >
              <td className="py-3.5 pl-5 pr-3">
                <div className="flex items-stretch gap-3">
                  <span className={`w-1 rounded-full ${PRIORITY_COLORS[task.priority]?.dot || 'bg-slate-300'}`} />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate max-w-xs">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{task.description}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-3.5"><PriorityBadge priority={task.priority} /></td>
              <td className="py-3.5"><StatusBadge status={task.status} /></td>
              <td className="py-3.5 text-sm font-mono text-slate-500 dark:text-slate-400">{formatDate(task.dueDate)}</td>
              <td className="py-3.5 pr-5">
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={() => navigate(`/tasks/${task._id}/edit`)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-300"
                    aria-label={`Edit ${task.title}`}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(task)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-rose-500/10 text-rose-500"
                    aria-label={`Delete ${task.title}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-white/5">
        {tasks.map((task) => (
          <div key={task._id} className="flex items-stretch gap-3 p-4">
            <span className={`w-1 rounded-full shrink-0 ${PRIORITY_COLORS[task.priority]?.dot || 'bg-slate-300'}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm">{task.title}</p>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => navigate(`/tasks/${task._id}/edit`)}
                    className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500"
                    aria-label={`Edit ${task.title}`}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(task)}
                    className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-rose-500/10 text-rose-500"
                    aria-label={`Delete ${task.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {task.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{task.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
                <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-400">
                  <Calendar size={12} /> {formatDate(task.dueDate)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskTable;
