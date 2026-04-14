import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ROUTES } from './constants';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminRegisterPage from './pages/auth/AdminRegisterPage';
import Notifications from './pages/client/Notifications';
import ClientDashboard from './pages/client/Dashboard';
import BookingFlow from './pages/client/BookingFlow';
import Marketplace from './pages/client/Marketplace';
import Calendar from './pages/client/Calendar';
import AdminDashboard from './pages/admin/Dashboard';
import AdminBookings from './pages/admin/Bookings';
import AdminServices from './pages/admin/Services';
import AdminTimeSlots from './pages/admin/TimeSlots';
import AdminUsers from './pages/admin/Users';
import AdminAnalytics from './pages/admin/Analytics';
import SalonOnboarding from './pages/admin/SalonOnboarding';
import PricingPage from './pages/admin/Pricing';
import LandingPage from './pages/LandingPage';

const PrivateRoute = ({ children }) => {
  const { firebaseUser } = useAuth();
  return firebaseUser ? children : <Navigate to={ROUTES.LOGIN} replace />;
};

const AdminRoute = ({ children }) => {
  const { firebaseUser, isAdmin, salonId } = useAuth();
  if (!firebaseUser) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!isAdmin) return <Navigate to={ROUTES.CLIENT_DASHBOARD} replace />;
  if (!salonId && window.location.pathname !== '/admin/onboarding') return <Navigate to="/admin/onboarding" replace />;
  return children;
};

const AppRoutes = () => {
  const { firebaseUser, isAdmin } = useAuth();
  return (
    <Routes>
      <Route path="/landing" element={<LandingPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.ADMIN_REGISTER} element={<AdminRegisterPage />} />
      <Route path={ROUTES.HOME} element={firebaseUser ? <Navigate to={isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.CLIENT_DASHBOARD} replace /> : <Navigate to={ROUTES.LOGIN} replace />} />
      <Route path={ROUTES.CLIENT_DASHBOARD} element={<PrivateRoute><ClientDashboard /></PrivateRoute>} />
      <Route path={ROUTES.CLIENT_BOOKING} element={<PrivateRoute><BookingFlow /></PrivateRoute>} />
      <Route path={ROUTES.CLIENT_MARKETPLACE} element={<PrivateRoute><Marketplace /></PrivateRoute>} />
      <Route path="/calendar" element={<PrivateRoute><Calendar /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
      <Route path="/admin/onboarding" element={<AdminRoute><SalonOnboarding /></AdminRoute>} />
      <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path={ROUTES.ADMIN_BOOKINGS} element={<AdminRoute><AdminBookings /></AdminRoute>} />
      <Route path={ROUTES.ADMIN_SERVICES} element={<AdminRoute><AdminServices /></AdminRoute>} />
      <Route path={ROUTES.ADMIN_SLOTS} element={<AdminRoute><AdminTimeSlots /></AdminRoute>} />
      <Route path={ROUTES.ADMIN_USERS} element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path={ROUTES.ADMIN_ANALYTICS} element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
      <Route path="/admin/pricing" element={<AdminRoute><PricingPage /></AdminRoute>} />
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: '10px', background: '#1c1c1e', color: '#f5f5f0', fontSize: '14px' } }} />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
