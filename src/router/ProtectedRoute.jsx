import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../db/supabase';

const ProtectedRoute = ({ children }) => {

    const { currentUser, session, loading, initialized } = useAuth();

  if (!initialized || loading) return null;

if (!session) {
  return <Navigate to="/login" replace />;
}

if (!currentUser) {
  return null; // wait for profile hydration
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
