import axios from 'axios';

// Create an instance of axios with a custom configuration
const Axios = axios.create({
    baseURL: 'http://127.0.0.1:8001/hospital/',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    withCredentials: true,
});

// Add a request interceptor to include the Knox token
Axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        // Exclude Authorization header for login and signup endpoints
        if (token && !config.url?.includes('/login') && !config.url?.includes('/signup')) {
            config.headers['Authorization'] = `Token ${token}`;
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