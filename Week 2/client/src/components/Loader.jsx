const Loader = ({ full = false, label = 'Loading' }) => {
  const spinner = (
    <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
      <div className="h-8 w-8 rounded-full border-[3px] border-teal-500/25 border-t-teal-500 animate-spin" />
      <span className="text-xs font-mono uppercase tracking-widest text-slate-400">{label}</span>
    </div>
  );

  if (full) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-ink">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-16">{spinner}</div>;
};

export default Loader;
