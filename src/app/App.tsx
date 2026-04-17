import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CustomerLayout } from './components/CustomerLayout';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { BookAppointmentPage } from './pages/BookAppointmentPage';
import { BookingHistoryPage } from './pages/BookingHistoryPage';
import { ReceptionistDashboard } from './pages/ReceptionistDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

function DashboardRedirect() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  switch (currentUser.role) {
    case 'customer':
      return <Navigate to="/dashboard/book" replace />;
    case 'receptionist':
      return <Navigate to="/dashboard/receptionist" replace />;
    case 'doctor':
      return <Navigate to="/dashboard/doctor" replace />;
    case 'admin':
      return <Navigate to="/dashboard/admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="book" element={<BookAppointmentPage />} />
            <Route path="history" element={<BookingHistoryPage />} />
          </Route>

          <Route
            path="/dashboard/receptionist"
            element={
              <ProtectedRoute allowedRoles={['receptionist']}>
                <ReceptionistDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/doctor"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}