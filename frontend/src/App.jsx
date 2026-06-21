import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentRequest from './pages/StudentRequest';
import StudentDashboard from './pages/StudentDashboard';
import FunderDashboard from './pages/FunderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StatusTracker from './pages/StatusTracker';

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useAuth();

  const getDefaultRoute = () => {
    if (!user) return '/login';
    const routes = { student: '/student/dashboard', funder: '/funder/dashboard', admin: '/admin/dashboard' };
    return routes[user.role] || '/login';
  };

  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/student/request" element={
        <ProtectedRoute roles={['student']}><StudentRequest /></ProtectedRoute>
      } />
      <Route path="/student/dashboard" element={
        <ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>
      } />
      <Route path="/funder/dashboard" element={
        <ProtectedRoute roles={['funder','admin']}><FunderDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/status/:id" element={
        <ProtectedRoute roles={['student','funder','admin']}><StatusTracker /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a2e',
                color: '#e2e8f0',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontFamily: "'Inter', sans-serif",
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#1a1a2e' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#1a1a2e' } },
            }}
          />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
