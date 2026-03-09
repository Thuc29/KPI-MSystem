import { Navigate, Outlet } from 'react-router-dom';
import { storage } from '../../infrastructure/utils';

export const ProtectedRoute = () => {
  const isAuthenticated = !!storage.getToken();
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
