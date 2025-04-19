import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { authService } from './authService';

const ProtectedRoute = ({ children, requiredProfileCompleted = false }) => {
  const token = localStorage.getItem('token');
  const user = authService.getCurrentUser();
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp < Date.now() / 1000) {
      authService.logout();
      return <Navigate to="/login?session_expired=1" replace />;
    }
  } catch (error) {
    authService.logout();
    return <Navigate to="/login" replace />;
  }

  if (requiredProfileCompleted && !user.is_profile_completed) {
    return <Navigate to="/complete-profile" replace />;
  }
  
  return children;
};

export default ProtectedRoute;