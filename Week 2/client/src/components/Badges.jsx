export const PRIORITY_COLORS = {
  Low: { dot: 'bg-teal-400', text: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500/10' },
  Medium: { dot: 'bg-amber-400', text: 'text-amber-500', bg: 'bg-amber-400/10' },
  High: { dot: 'bg-rose-400', text: 'text-rose-500', bg: 'bg-rose-500/10' },
};

export const STATUS_COLORS = {
  Pending: { text: 'text-slate-500 dark:text-slate-300', bg: 'bg-slate-500/10' },
  'In Progress': { text: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500/10' },
  Completed: { text: 'text-amber-500', bg: 'bg-amber-400/10' },
};

export const PriorityBadge = ({ priority }) => {
  const c = PRIORITY_COLORS[priority] || PRIORITY_COLORS.Medium;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${c.text} ${c.bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {priority}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS.Pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${c.text} ${c.bg}`}>
      {status}
    </span>
  );
};
