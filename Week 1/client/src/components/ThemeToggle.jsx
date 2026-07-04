import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-300 dark:border-white/15 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
    >
      {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
};

export default ThemeToggle;
