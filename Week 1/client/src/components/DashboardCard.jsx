const DashboardCard = ({ label, value, icon: Icon, accent = 'teal' }) => {
  const accents = {
    teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    amber: 'bg-amber-400/15 text-amber-500',
    rose: 'bg-rose-500/10 text-rose-500',
    slate: 'bg-slate-500/10 text-slate-500 dark:text-slate-300',
  };

  return (
    <div className="card p-5 flex items-start justify-between">
      <div>
        <p className="label-text mb-2">{label}</p>
        <p className="font-mono text-3xl font-semibold tabular-nums">{value}</p>
      </div>
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${accents[accent]}`}>
        <Icon size={19} />
      </div>
    </div>
  );
};

export default DashboardCard;
