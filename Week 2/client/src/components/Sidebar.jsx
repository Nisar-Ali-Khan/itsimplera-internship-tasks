import { NavLink } from 'react-router-dom';
import { LayoutGrid, ListChecks, UserRound, PlusCircle, X, CheckSquare } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/tasks', label: 'All Tasks', icon: ListChecks },
  { to: '/tasks/new', label: 'Create Task', icon: PlusCircle },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

const Sidebar = ({ open, onClose }) => {
  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
    }`;

  const content = (
    <>
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div className="h-8 w-8 rounded-lg bg-teal-500 flex items-center justify-center shrink-0">
          <CheckSquare size={17} className="text-white" />
        </div>
        <span className="font-display font-semibold text-lg tracking-tight">Ledger</span>
        <button
          onClick={onClose}
          className="ml-auto md:hidden h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-white/5"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClasses} onClick={onClose} end={item.to === '/tasks'}>
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-6 px-2">
        <p className="text-[11px] font-mono text-slate-400 dark:text-slate-600">Ledger v1.0.0</p>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-slate-200 dark:border-white/10 bg-paperraised dark:bg-inkraised px-4 py-6 h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-paperraised dark:bg-inkraised px-4 py-6 flex flex-col shadow-raised">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
