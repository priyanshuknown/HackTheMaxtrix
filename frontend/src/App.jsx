import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
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
    <>
      <Navbar />
      <main className="relative z-10">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student routes */}
          <Route path="/student/request" element={
            <ProtectedRoute roles={['student']}>
              <StudentRequest />
            </ProtectedRoute>
          } />
          <Route path="/student/dashboard" element={
            <ProtectedRoute roles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          {/* Funder / Admin routes */}
          <Route path="/funder/dashboard" element={
            <ProtectedRoute roles={['funder', 'admin']}>
              <FunderDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Status tracker */}
          <Route path="/status/:id" element={
            <ProtectedRoute roles={['student', 'funder', 'admin']}>
              <StatusTracker />
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
        </Routes>
      </main>
    </>
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
                background: '#FFFFFF',
                color: '#0F172A',
                border: '1px solid #E2E8F0',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                fontFamily: "'Inter', sans-serif",
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              },
              success: {
                iconTheme: { primary: '#10B981', secondary: '#FFFFFF' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
              },
            }}
          />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
