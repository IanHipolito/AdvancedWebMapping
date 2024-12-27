import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from '../services/Axios';
import '../styles/stylesheet.css';


const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await Axios.post('/login/', { username, password });
            console.log(response);
            const token = response.data.token;
        
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
