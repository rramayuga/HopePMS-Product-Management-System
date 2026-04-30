import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { session, currentUser, loading, initialized } = useAuth();

  if (!initialized || loading) return null;

  if (!session) return <Navigate to="/login" replace />;

  if (!currentUser) return null;

  if (!['ADMIN', 'SUPERADMIN'].includes(currentUser.user_type)) {
    return <Navigate to="/products" replace />;
  }

  return children;
};

export default AdminRoute;
