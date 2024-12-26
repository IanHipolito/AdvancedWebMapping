import axios from 'axios';

// Create an instance of axios with a custom configuration
const Axios = axios.create({
//   baseURL: 'https://c21436494.xyz/hospital/', // Base URL for your API
    baseURL: 'http://127.0.0.1:8001/hospital/',
  timeout: 10000, // Request timeout (10 seconds)
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// CSRF token configuration
Axios.defaults.xsrfCookieName = "csrftoken";
Axios.defaults.xsrfHeaderName = "X-CSRFToken";

// Add a request interceptor to include the Knox token
Axios.interceptors.request.use(
  (config) => {
    // Add Knox token to Authorization header if available
    const token = localStorage.getItem('token'); // Replace 'localStorage' with 'sessionStorage' or another store if needed
    if (token) {
      if (config.headers) {
        config.headers['Authorization'] = `Token ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

Axios.interceptors.response.use(
  (response) => response, // Pass successful responses through
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default Axios;