import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" data-testid="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>🎓 PlacementPro</h1>
          <p>Placement Recruitment Management System</p>
        </div>
        <form onSubmit={handleSubmit} data-testid="login-form">
          {error && <div className="error-alert" data-testid="login-error">{error}</div>}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              data-testid="email-input"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              data-testid="password-input"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary" data-testid="login-btn">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="login-hint">
          <small>Admin: admin@test.com / admin123 | Student: student email / student ID</small>
        </div>
      </div>
    </div>
  );
}
