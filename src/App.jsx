import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useRights } from './context/UserRightsContext';

import ProtectedRoute from './router/ProtectedRoute';
import AdminRoute from './router/AdminRoute';
import AuthPage from './pages/AuthPage';
import AuthCallBack from './pages/AuthCallBack';
import MainLayout from './components/MainLayout';
import ProductListPage from './pages/ProductListPage';
import DeletedItemsPage from './pages/DeletedItemsPage';
import UserManagementPage from './pages/UserManagementPage';

const ReportsPage = () => (
  <div className="p-4">
    <h1 className="text-xl font-bold text-[#31511E] mb-1">Reports</h1>
    <p className="text-xs text-[#859F3D]">View system reports here.</p>
  </div>
);

function App() {
  const { currentUser, initialized } = useAuth();
  const { rightsLoading } = useRights();

  const isAuthCallback = window.location.pathname === '/auth/callback';

  // ✅ Wait until EVERYTHING is ready
  if ((!initialized || rightsLoading) && !isAuthCallback) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallBack />} />

        {/* Protected */}
        <Route path="/products" element={
          <ProtectedRoute>
            <MainLayout user={currentUser}>
              <ProductListPage />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute>
            <MainLayout user={currentUser}>
              <ReportsPage />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <AdminRoute>
            <MainLayout user={currentUser}>
              <UserManagementPage />
            </MainLayout>
          </AdminRoute>
        } />

        <Route path="/deleted-items" element={
          <AdminRoute>
            <MainLayout user={currentUser}>
              <DeletedItemsPage />
            </MainLayout>
          </AdminRoute>
        } />

        {/* Root */}
        <Route path="/" element={
          <const { session } = useAuth();

          <Navigate to={session ? '/products' : '/login'} replace />
        } />

        {/* Fallback (safe) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
