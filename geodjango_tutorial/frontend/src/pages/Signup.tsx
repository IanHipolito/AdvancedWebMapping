import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from '../services/Axios';
import '../styles/stylesheet.css';

interface AxiosError {
    message: string;
    response?: {
      data: any;
      status: number;
    };
}

interface ErrorResponse {
    error: string;
}

const Signup: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirm_password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match.');
            return;
        }
        try {
            await Axios.post('http://localhost:8001/hospital/signup/', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                confirm_password: formData.confirm_password,
            });
            setSuccess('Registration successful! Redirecting...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            const err = error as AxiosError;
            setError(Array.isArray(err.response?.data.error) 
                ? err.response?.data.error.join(', ') 
                : err.response?.data.error || 'Registration failed.');

        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Create Your <span className="highlight">Hospital Locator</span> Account</h2>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="auth-button">Register</button>
                <p className="redirect-link">
                    Already have an account? <a href="/login">Login here</a>
                </p>
            </form>
        </div>
    );
};

export default Signup;
