import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';

const RoleGuard = ({ children, allowedRoles }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    const roleRoutes = {
      admin: '/admin',
      employee: '/employee',
      client: '/client',
      applicant: '/employee',
    };
    return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
  }

  return children;
};

export default RoleGuard;
