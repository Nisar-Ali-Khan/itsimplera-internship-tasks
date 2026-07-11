import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, UserRound, ChevronDown } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onMenuClick, title }) => {
  const { user, logOutUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 h-16 border-b border-slate-200 dark:border-white/10 bg-paper/90 dark:bg-ink/90 backdrop-blur">
      <button
        onClick={onMenuClick}
        className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <h1 className="font-display font-semibold text-lg md:text-xl">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <div
              className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
              style={{ backgroundColor: user?.avatarColor || '#0F766E' }}
            >
              {initials}
            </div>
            <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">{user?.name}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 card overflow-hidden py-1">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <UserRound size={16} /> Profile
              </button>
              <button
                onClick={async () => {
                  setMenuOpen(false);
                  await logOutUser();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-rose-500 hover:bg-rose-500/5"
              >
                <LogOut size={16} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
