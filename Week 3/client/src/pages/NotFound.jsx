import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-paper px-4 text-center">
    <div className="h-12 w-12 rounded-xl bg-forest-50 flex items-center justify-center mb-5">
      <BookOpen size={22} className="text-forest-500" />
    </div>
    <h1 className="font-display font-bold text-5xl mb-2">404</h1>
    <p className="text-inkmuted mb-6">This page doesn't exist.</p>
    <Link to="/" className="btn-primary">Back to the Feed</Link>
  </div>
);

export default NotFound;
