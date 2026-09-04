import React, { useState } from 'react';
import api from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemoHints, setShowDemoHints] = useState(false);

  const fillDemo = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        username: username.trim(),
        password: password
      });
      const data = response.data;

      localStorage.setItem('clinic_jwt_token', data.token);
      localStorage.setItem('clinic_user', JSON.stringify({
        id: data.id,
        username: data.username,
        role: data.role
      }));

      onLoginSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
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
          <p>Unified Portal &bull; Staff, Doctors &amp; Patients</p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '16px', fontWeight: '500' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your assigned username"
              required
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your account password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.8rem', color: '#64748b', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          🔒 Single secure login for all roles. Your dashboard and clinical privileges adapt automatically upon authentication.
        </div>

        {/* Subtle expandable demo accounts helper for testing & academic evaluation */}
        <div style={{ marginTop: '16px', borderTop: '1px dashed #e2e8f0', paddingTop: '12px' }}>
          <button
            type="button"
            onClick={() => setShowDemoHints(!showDemoHints)}
            style={{ background: 'none', border: 'none', color: '#0d9488', fontSize: '0.78rem', cursor: 'pointer', display: 'block', margin: '0 auto', fontWeight: '600' }}
          >
            {showDemoHints ? '▲ Hide Demo Credentials' : '▼ Quick Demo Credentials (For Evaluation)'}
          </button>

          {showDemoHints && (
            <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '6px 8px', fontSize: '0.75rem' }}
                onClick={() => fillDemo('doctor', 'doctor123')}
              >
                🩺 Dentist: doctor
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '6px 8px', fontSize: '0.75rem' }}
                onClick={() => fillDemo('staff', 'staff123')}
              >
                🏥 Staff: staff
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '6px 8px', fontSize: '0.75rem' }}
                onClick={() => fillDemo('admin', 'admin123')}
              >
                ⚙️ Admin: admin
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '6px 8px', fontSize: '0.75rem' }}
                onClick={() => fillDemo('patient', 'patient123')}
              >
                🦷 Patient: patient
              </button>
            </div>
          )}
        </div>

        <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
          Protected by JWT Role-Based Access Control (RBAC)
        </div>
      </div>
    </div>
  );
}

