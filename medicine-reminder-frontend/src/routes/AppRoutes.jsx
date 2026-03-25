import { Navigate, Route, Routes } from 'react-router-dom';
import AddMedicine from '../pages/AddMedicine';
import CalendarView from '../pages/CalendarView';
import Dashboard from '../pages/Dashboard';
import EditMedicine from '../pages/EditMedicine';
import ForgotPassword from '../pages/ForgotPassword';
import Login from '../pages/Login';
import Logout from '../pages/Logout';
import NotFound from '../pages/NotFound';
import Register from '../pages/Register';
import ResetPassword from '../pages/ResetPassword';
import Welcome from '../pages/Welcome';
import ProtectedRoute from '../components/ProtectedRoute';
import useAuth from '../hooks/useAuth';

export default function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
      />
      <Route
        path="/reset-password"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPassword />}
      />
      <Route path="/logout" element={<Logout />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-medicine"
        element={
          <ProtectedRoute>
            <AddMedicine />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-medicine/:id"
        element={
          <ProtectedRoute>
            <EditMedicine />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarView />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
