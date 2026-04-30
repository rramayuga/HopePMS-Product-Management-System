import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { session, currentUser, loading, initialized } = useAuth();

  // Wait for auth to fully resolve
  if (!initialized || loading) return null;

  // Not logged in → redirect
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but profile still loading → WAIT (IMPORTANT)
  if (!currentUser) return null;

  // Account checks (safe here)
  if (currentUser.record_status === 'PENDING') return null;

  if (currentUser.record_status !== 'ACTIVE') {
    return <Navigate to="/login?error=inactive" replace />;
  }

  return children;
};

export default ProtectedRoute;
