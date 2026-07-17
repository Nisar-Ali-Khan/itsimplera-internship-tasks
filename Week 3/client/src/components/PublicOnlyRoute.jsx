import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loader full label="Loading" />;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return children;
};

export default PublicOnlyRoute;
