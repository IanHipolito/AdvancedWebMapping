import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

// Private route component
interface PrivateRouteProps {
  element: React.ReactElement;
}

// Check if user is authenticated before rendering the route component or redirect to login page if not authenticated
const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  // State variable to store authentication status
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const token = localStorage.getItem('token');

  // Verify session on component mount
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      // Send request to validate session
      try {
        const response = await axios.get('https://c21436494.xyz/hospital/user-info/', {
          headers: {
            Authorization: `Token ${token}`
          }
        });

        // Set authentication status based on response
        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Session validation failed:', error);
        setIsAuthenticated(false);
      }
    };

    // Call verifySession function
    verifySession();
  }, [token]);

  // Render loading message while verifying session
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  // Render route component if authenticated, otherwise redirect to login page
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

export default PrivateRoute;
