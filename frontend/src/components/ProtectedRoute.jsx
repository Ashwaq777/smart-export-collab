import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRole, excludeRole }) => {
  const { user, token } = useAuth();
  
  if (!token) return <Navigate to="/login" replace />;
  
  // Check if user role should be excluded
  if (excludeRole && user?.role === excludeRole) {
    return <Navigate to="/admin" replace />;
  }
  
  // Check if user has required role
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};
