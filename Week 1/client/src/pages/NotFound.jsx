import { Link } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-paper dark:bg-ink px-4 text-center">
    <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5">
      <CheckSquare size={22} className="text-teal-500" />
    </div>
    <h1 className="font-display font-bold text-5xl mb-2">404</h1>
    <p className="text-slate-500 dark:text-slate-400 mb-6">This page doesn't exist.</p>
    <Link to="/dashboard" className="btn-primary">
      Back to Dashboard
    </Link>
  </div>
);

export default NotFound;
