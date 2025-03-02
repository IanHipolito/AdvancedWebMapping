import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from '../services/Axios';
import '../styles/stylesheet.css';

// Login page component
const Login: React.FC = () => {
    // State variables for form fields and error message
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Send login request to API
        try {
            const response = await Axios.post('https://c21436494.xyz/hospital/login/', { username, password });
            console.log(response);
            const token = response.data.token;
            
            // Store token in localStorage and redirect to map
            localStorage.setItem('token', token);
            navigate('/map');
        } catch (err: any) {
            if (err.response && err.response.status === 401) {
                setError('Invalid username or password.');
            } else {
                setError('Server error. Please try again later.');
            }
        }
    };

    // Render login form
    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Login to <span className="highlight">Hospital Tracker</span></h2>
                {error && <p className="error-message">{error}</p>}
                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="auth-button">Login</button>
                <p className="redirect-link">
                    Don't have an account? <a href="/signup">Signup here</a>
                </p>
            </form>
        </div>
    );
};

export default Login;
