import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';

const RoleBasedRedirect = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'employee':
      return <Navigate to="/employee" replace />;
    case 'client':
      return <Navigate to="/client" replace />;
    case 'applicant':
      return <Navigate to="/employee" replace />; // or create an applicant portal
    default:
      return <Navigate to="/admin" replace />;
  }
};

export default RoleBasedRedirect;
