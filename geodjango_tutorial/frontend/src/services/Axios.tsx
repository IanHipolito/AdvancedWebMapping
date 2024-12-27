import axios from 'axios';

// Create Axios instance
const Axios = axios.create({
    baseURL: 'http://127.0.0.1:8001/hospital/', // API base URL
    timeout: 10000, // Request timeout
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    withCredentials: false, // Knox does NOT require CSRF cookies
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

        return config; // Proceed with request
    },
    (error) => Promise.reject(error) // Pass errors
);

// Handle errors in response
Axios.interceptors.response.use(
    (response) => response, // Pass successful responses
    (error) => {
        console.error('API Error:', error.response || error.message);

        // Redirect to login if unauthorized
        if (error.response && error.response.status === 401) {
            alert('Session expired. Please log in again.');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        return Promise.reject(error); // Pass errors further
    }
);

export default Axios;
