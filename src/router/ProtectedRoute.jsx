import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { session, currentUser, loading, initialized } = useAuth();

  // ⛔ Wait until auth system is fully ready
  if (!initialized || loading) return null;

  // ❌ Not logged in
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // ⏳ Logged in but user profile still loading → WAIT (do NOT redirect)
  if (session && !currentUser) return null;

  // ⏳ User exists but still pending DB validation
  if (currentUser?.record_status === 'PENDING') return null;

  // ❌ Inactive account
  if (currentUser?.record_status !== 'ACTIVE') {
    return <Navigate to="/login?error=inactive" replace />;
  }

  // ✅ Fully authenticated + validated
  return children;
};

export default ProtectedRoute;
