import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from '../services/Axios';

interface LoginResponse {
    token: string;
  }

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      // Tell Axios the expected response type is LoginResponse
      const response = await Axios.post<LoginResponse>('/login/', {
        username,
        password,
      });
  
      // Now TypeScript knows response.data has 'token'
      const token = response.data.token;
      localStorage.setItem('token', token);
      navigate('/map'); // Redirect to map page
    } catch (err: any) {
      console.error('Error:', err.response?.data || err.message);
      setError('Invalid credentials or server error.');
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
