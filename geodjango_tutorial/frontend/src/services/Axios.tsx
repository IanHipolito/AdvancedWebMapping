import axios from 'axios';

// Create Axios instance
const Axios = axios.create({
    baseURL: 'http://127.0.0.1:8001/hospital/',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    // Knox does NOT require CSRF cookies
    withCredentials: false,
});

// Add a request interceptor
Axios.interceptors.request.use(
    (config) => {
        // Retrieve Knox token from localStorage
        const token = localStorage.getItem('token');

        // Include token only if not logging in or signing up
        if (token && !config.url?.endsWith('/login/') && !config.url?.endsWith('/signup/')) {
            config.headers['Authorization'] = `Token ${token}`;
        }

        // Proceed with request
        return config;
    },
    // Handle request errors
    (error) => Promise.reject(error)
);

// Handle errors in response
Axios.interceptors.response.use(
    // Pass successful responses
    (response) => response,
    (error) => {
        console.error('API Error:', error.response || error.message);

        // Redirect to login if unauthorized
        if (error.response && error.response.status === 401) {
            alert('Session expired. Please log in again.');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        // Pass errors further
        return Promise.reject(error);
    }
);

export default Axios;
