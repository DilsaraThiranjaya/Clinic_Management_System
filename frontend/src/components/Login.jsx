import React, { useState } from 'react';
import api from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('staff');
  const [password, setPassword] = useState('staff123');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuickSelect = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        // Find default role based on quick select or default to STAFF
        let role = 'STAFF';
        if (username.toLowerCase().includes('admin')) role = 'ADMIN';
        else if (username.toLowerCase().includes('patient')) role = 'PATIENT';

        await api.post('/auth/register', { username, password, email, role });
        
        // Auto-login after registration
        const loginResponse = await api.post('/auth/login', { username, password });
        const data = loginResponse.data;

        localStorage.setItem('clinic_jwt_token', data.token);
        localStorage.setItem('clinic_user', JSON.stringify({
          id: data.id,
          username: data.username,
          role: data.role
        }));

        onLoginSuccess(data);
      } else {
        const response = await api.post('/auth/login', { username, password });
        const data = response.data;

        localStorage.setItem('clinic_jwt_token', data.token);
        localStorage.setItem('clinic_user', JSON.stringify({
          id: data.id,
          username: data.username,
          role: data.role
        }));

        onLoginSuccess(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-icon">🦷</div>
          <h2>Sunrise Dental Clinic</h2>
          <p>Appointment & Patient Management System</p>
        </div>

        <div className="role-chips">
          <span
            className={`role-chip ${username === 'staff' ? 'active' : ''}`}
            onClick={() => handleQuickSelect('staff', 'staff123')}
          >
            Staff (Receptionist)
          </span>
          <span
            className={`role-chip ${username === 'admin' ? 'active' : ''}`}
            onClick={() => handleQuickSelect('admin', 'admin123')}
          >
            Admin
          </span>
          <span
            className={`role-chip ${username === 'patient' ? 'active' : ''}`}
            onClick={() => handleQuickSelect('patient', 'patient123')}
          >
            Patient
          </span>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '16px', fontWeight: '500' }}>
            ⚠️ {error}
          </div>
        )}

        <div className="form-toggle" style={{ marginBottom: '16px', textAlign: 'center' }}>
          <button 
            type="button"
            className="btn btn-secondary" 
            style={{ width: '100%', marginBottom: '16px' }}
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? 'Already have an account? Log In' : 'Need an account? Register'}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          {isRegistering && (
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required={isRegistering}
              />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Processing...' : (isRegistering ? 'Register Account' : 'Sign In to System')}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
          Protected by JWT Role-Based Access Control (RBAC)
        </div>
      </div>
    </div>
  );
}
