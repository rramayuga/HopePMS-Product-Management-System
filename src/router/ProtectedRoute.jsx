import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../db/supabase';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading, initialized } = useAuth();

  // ✅ Wait until auth is fully initialized
  if (!initialized || loading) return null;

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.record_status === 'PENDING') {
    return null;
  }

  if (currentUser.record_status !== 'ACTIVE') {
    supabase.auth.signOut();
    return <Navigate to="/login?error=inactive" replace />;
  }

  return children;
};

export default ProtectedRoute;
