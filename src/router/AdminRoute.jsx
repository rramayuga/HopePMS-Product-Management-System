// src/router/AdminRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  
  const { currentUser, session, loading, initialized } = useAuth();

if (!initialized || loading) return null;

if (!session) {
  return <Navigate to="/login" replace />;
}

if (!currentUser) {
  return null; // wait for profile hydration
}

  // Logged in but USER — redirect to products
  if (!['ADMIN', 'SUPERADMIN'].includes(currentUser.user_type)) {
    return <Navigate to="/products" replace />;
  }

  // ADMIN or SUPERADMIN — allow through
  return children;
};

export default AdminRoute;
