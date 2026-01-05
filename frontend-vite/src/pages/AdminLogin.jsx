import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/pages/AdminLogin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, loading, error: authError } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate('/admin');
    } catch (err) {
      setError(authError || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">🛒</div>
          <h1>Admin Login</h1>
          <p>Manage your grocery store</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {(error || authError) && (
            <div className="alert alert-error">
              {error || authError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Not an admin? <a href="/">Return to store</a></p>
        </div>
      </div>

      <div className="login-side-info">
        <h2>Welcome Back!</h2>
        <p>Access your admin dashboard to manage products, orders, and more.</p>
      </div>
    </div>
  );
}
