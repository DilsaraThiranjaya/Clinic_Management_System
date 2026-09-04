import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterRole, setFilterRole] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STAFF');
  const [showPassword, setShowPassword] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data || []);
    } catch (err) {
      console.error('Failed to load users', err);
      setErrorMsg(err.response?.data?.message || 'Failed to fetch user directory');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let generated = '';
    for (let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    setShowPassword(true);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (role === 'ADMIN') {
      setErrorMsg('Admin registration is prohibited. Only the system-seeded administrator is permitted.');
      return;
    }

    if (!username.trim() || username.length < 3) {
      setErrorMsg('Username must be at least 3 characters.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (!email || !email.includes('@')) {
      setErrorMsg('A valid email address is required to deliver user credentials.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        username: username.trim(),
        password: password,
        role: role,
        email: email.trim()
      };

      const response = await api.post('/users/register', payload);
      const newUser = response.data;

      setSuccessMsg(`✅ Account for "${newUser.username}" (${newUser.role}) created successfully! Login credentials have been dispatched to ${newUser.email || email}.`);
      
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('STAFF');
      setShowPassword(false);

      loadUsers();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to register user. Please verify input.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const staffCount = users.filter((u) => u.role === 'STAFF').length;
  const patientCount = users.filter((u) => u.role === 'PATIENT').length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div className="user-management-container">
      {/* Stats row */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon blue">👥</div>
          <div className="stat-info">
            <h3>{users.length}</h3>
            <p>Total Registered Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">🏥</div>
          <div className="stat-info">
            <h3>{staffCount}</h3>
            <p>Active Staff & Reception</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">🦷</div>
          <div className="stat-info">
            <h3>{patientCount}</h3>
            <p>Registered Patients</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">🛡️</div>
          <div className="stat-info">
            <h3>{adminCount}</h3>
            <p>Seeded System Admin</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Form & Table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 420px) 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Registration Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ fontSize: '1.5rem', background: '#e0f2fe', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>
              👤
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>Register New User</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Provision staff or patient portal accounts</p>
            </div>
          </div>

          <div style={{ padding: '10px 12px', background: '#f1f5f9', borderLeft: '4px solid #0284c7', borderRadius: '6px', fontSize: '0.78rem', color: '#334155', marginBottom: '18px' }}>
            ℹ️ <strong>Admin Security Policy:</strong> Only Staff and Patients can be registered. Credentials will be sent directly to the provided email.
          </div>

          {errorMsg && (
            <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', fontWeight: '500' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ padding: '12px 14px', background: '#ecfdf5', color: '#065f46', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', fontWeight: '500', lineHeight: '1.4' }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit}>
            {/* Role Selection */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">User Access Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  className={`btn ${role === 'DOCTOR' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '10px 6px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  onClick={() => setRole('DOCTOR')}
                >
                  <span>🩺</span>
                  <span>Dentist</span>
                </button>
                <button
                  type="button"
                  className={`btn ${role === 'STAFF' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '10px 6px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  onClick={() => setRole('STAFF')}
                >
                  <span>🏥</span>
                  <span>Staff</span>
                </button>
                <button
                  type="button"
                  className={`btn ${role === 'PATIENT' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '10px 6px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  onClick={() => setRole('PATIENT')}
                >
                  <span>🦷</span>
                  <span>Patient</span>
                </button>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                {role === 'DOCTOR' ? 'Doctor clinical portal template email with clinical schedule access will be sent.' : role === 'STAFF' ? 'Staff template email with clinic operations guide will be sent.' : 'Patient template email with patient portal instructions will be sent.'}
              </div>
            </div>

            {/* Username */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. dr_perera or patient_kamal"
                required
              />
            </div>

            {/* Email */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Recipient Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Credentials & login link will be emailed to this address.</span>
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label className="form-label" style={{ margin: 0 }}>Account Password</label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}
                >
                  ⚡ Auto-Generate
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#64748b' }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting}
              style={{ padding: '12px' }}
            >
              {submitting ? 'Registering & Dispatching Email...' : `Register ${role === 'STAFF' ? 'Staff' : 'Patient'} & Send Email`}
            </button>
          </form>
        </div>

        {/* Directory Table Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>System User Directory</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Overview of all registered clinic accounts</p>
            </div>
            <button
              className="btn btn-secondary"
              onClick={loadUsers}
              disabled={loading}
              style={{ fontSize: '0.82rem', padding: '6px 14px' }}
            >
              {loading ? 'Refreshing...' : '🔄 Refresh List'}
            </button>
          </div>

          {/* Search and Filters */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="🔍 Search username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['ALL', 'STAFF', 'DOCTOR', 'PATIENT', 'ADMIN'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFilterRole(r)}
                  className={`btn ${filterRole === r ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '20px' }}
                >
                  {r === 'ALL' ? `All (${users.length})` : r === 'DOCTOR' ? `Dentist (${users.filter((u) => u.role === r).length})` : `${r} (${users.filter((u) => u.role === r).length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Email Address</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      Loading system users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      No users found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: '600', color: '#64748b' }}>#{u.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background:
                                u.role === 'ADMIN'
                                  ? '#f97316'
                                  : u.role === 'DOCTOR'
                                  ? '#0d9488'
                                  : u.role === 'STAFF'
                                  ? '#0284c7'
                                  : '#8b5cf6',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: '700'
                            }}
                          >
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: '600', color: '#0f172a' }}>{u.username}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background:
                              u.role === 'ADMIN'
                                ? '#ffedd5'
                                : u.role === 'DOCTOR'
                                ? '#ccfbf1'
                                : u.role === 'STAFF'
                                ? '#e0f2fe'
                                : '#f3e8ff',
                            color:
                              u.role === 'ADMIN'
                                ? '#c2410c'
                                : u.role === 'DOCTOR'
                                ? '#0f766e'
                                : u.role === 'STAFF'
                                ? '#0369a1'
                                : '#7e22ce'
                          }}
                        >
                          {u.role === 'ADMIN' ? '🛡️ ADMIN' : u.role === 'DOCTOR' ? '🩺 DENTIST' : u.role === 'STAFF' ? '🏥 STAFF' : '🦷 PATIENT'}
                        </span>
                      </td>
                      <td style={{ color: '#475569', fontSize: '0.85rem' }}>
                        {u.email ? u.email : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No email</span>}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.78rem',
                            color: '#16a34a',
                            fontWeight: '600'
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }}></span>
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
