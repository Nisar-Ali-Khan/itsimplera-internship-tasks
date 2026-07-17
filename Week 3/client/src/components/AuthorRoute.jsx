import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const AuthorRoute = ({ children }) => {
  const { isAuthenticated, isAuthor, loading } = useAuth();

  if (loading) return <Loader full label="Checking session" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAuthor) return <Navigate to="/" replace />;

  return children;
};

export default AuthorRoute;
