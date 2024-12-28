import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  element: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  // Check if token exists in localStorage
  const token = localStorage.getItem('token');
  
  // Redirect to login if no token is found
  return token ? element : <Navigate to="/login" replace />;
};

export default PrivateRoute;
