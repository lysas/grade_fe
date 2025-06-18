import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { authService } from './authService';

const ProtectedRoute = ({ children, requiredProfileCompleted = false }) => {
  const token = localStorage.getItem('token');
  const user = authService.getCurrentUser();
  
  useEffect(() => {
    // Check and refresh token if needed when component mounts
    const checkToken = async () => {
      try {
        await authService.refreshTokenIfNeeded();
      } catch (error) {
        console.error('Error refreshing token:', error);
        authService.logout();
      }
    };
    
    checkToken();
    
    // Set up interval to check token every minute
    const intervalId = setInterval(checkToken, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp < Date.now() / 1000) {
      // Try to refresh the token before logging out
      authService.refreshToken().catch(() => {
        authService.logout();
        return <Navigate to="/login?session_expired=1" replace />;
      });
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