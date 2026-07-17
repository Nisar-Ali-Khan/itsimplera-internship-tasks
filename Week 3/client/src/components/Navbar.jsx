import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { BookOpen, PenSquare, UserRound, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resolveMediaUrl } from '../utils/media';

const Navbar = () => {
  const { user, isAuthenticated, isAuthor, logOutUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-forest-500' : 'text-ink/70 hover:text-ink'}`;

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-forest-500 flex items-center justify-center">
            <BookOpen size={16} className="text-gold-400" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">Chronicle</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 ml-2">
          <NavLink to="/" end className={navLinkClass}>Feed</NavLink>
          {isAuthor && <NavLink to="/my-posts" className={navLinkClass}>My Posts</NavLink>}
          {isAuthenticated && <NavLink to="/bookmarks" className={navLinkClass}>Bookmarks</NavLink>}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          {isAuthor && (
            <button onClick={() => navigate('/posts/new')} className="btn-primary hidden sm:inline-flex">
              <PenSquare size={15} /> Write
            </button>
          )}

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 h-9 rounded-lg hover:bg-ink/5 transition-colors"
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                {user?.profilePicUrl ? (
                  <img
                    src={resolveMediaUrl(user.profilePicUrl)}
                    alt={user.name}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                    style={{ backgroundColor: user?.avatarColor || '#1B4332' }}
                  >
                    {initials}
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">{user?.name}</span>
                <ChevronDown size={14} className="text-inkmuted" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 card overflow-hidden py-1">
                  <div className="px-3.5 py-2 border-b border-ink/10">
                    <p className="text-xs text-inkmuted">Signed in as</p>
                    <p className="text-sm font-medium capitalize">{user?.role}</p>
                  </div>
                  <button
                    onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left hover:bg-paper"
                  >
                    <UserRound size={16} /> Profile
                  </button>
                  {isAuthor && (
                    <button
                      onClick={() => { setMenuOpen(false); navigate('/my-posts'); }}
                      className="w-full md:hidden flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left hover:bg-paper"
                    >
                      <PenSquare size={16} /> My Posts
                    </button>
                  )}
                  <button
                    onClick={async () => { setMenuOpen(false); await logOutUser(); navigate('/login'); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-coral-500 hover:bg-coral-100/40"
                  >
                    <LogOut size={16} /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button onClick={() => navigate('/login')} className="btn-secondary">Log in</button>
              <button onClick={() => navigate('/register')} className="btn-primary">Sign up</button>
            </div>
          )}

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg hover:bg-ink/5"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-ink/10 px-4 py-3 flex flex-col gap-3 bg-paper">
          <NavLink to="/" end className={navLinkClass} onClick={() => setMobileOpen(false)}>Feed</NavLink>
          {isAuthor && <NavLink to="/my-posts" className={navLinkClass} onClick={() => setMobileOpen(false)}>My Posts</NavLink>}
          {isAuthenticated && <NavLink to="/bookmarks" className={navLinkClass} onClick={() => setMobileOpen(false)}>Bookmarks</NavLink>}
          {!isAuthenticated && (
            <div className="flex gap-2 pt-2">
              <button onClick={() => { setMobileOpen(false); navigate('/login'); }} className="btn-secondary flex-1">Log in</button>
              <button onClick={() => { setMobileOpen(false); navigate('/register'); }} className="btn-primary flex-1">Sign up</button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
