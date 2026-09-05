import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  UsersIcon,
  StethoscopeIcon,
  ToothIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  PlusIcon,
  TrashIcon,
  BanknotesIcon,
  SearchIcon
} from './Icons';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterRole, setFilterRole] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // User form state
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('DOCTOR');
  const [showPassword, setShowPassword] = useState(false);

  // Treatment form state
  const [newTreatmentName, setNewTreatmentName] = useState('');
  const [newTreatmentPrice, setNewTreatmentPrice] = useState('');
  const [newTreatmentDesc, setNewTreatmentDesc] = useState('');
  const [treatmentSubmitting, setTreatmentSubmitting] = useState(false);
  const [treatmentMsg, setTreatmentMsg] = useState('');
  const [treatmentError, setTreatmentError] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadUsersAndTreatments();
  }, []);

  const loadUsersAndTreatments = async () => {
    setLoading(true);
    try {
      const [userRes, treatRes] = await Promise.allSettled([
        api.get('/users'),
        api.get('/treatments')
      ]);

      if (userRes.status === 'fulfilled') {
        setUsers(userRes.value.data || []);
      }
      if (treatRes.status === 'fulfilled') {
        setTreatments(treatRes.value.data || []);
      }
    } catch (err) {
      console.error('Failed to load users or treatments', err);
      setErrorMsg(err.response?.data?.message || 'Failed to fetch management data');
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
      const computedFullName = fullName.trim() || (role === 'DOCTOR' ? (username.startsWith('Dr.') ? username : 'Dr. ' + username) : username);

      const payload = {
        fullName: computedFullName,
        username: username.trim(),
        password: password,
        role: role,
        email: email.trim(),
        contactNumber: contactNumber.trim()
      };

      const response = await api.post('/users/register', payload);
      const newUser = response.data;

      setSuccessMsg(`Account created for ${newUser.role} "${newUser.username}"! Welcome credentials dispatched to ${newUser.email}.`);
      setFullName('');
      setContactNumber('');
      setUsername('');
      setEmail('');
      setPassword('');
      setShowPassword(false);
      await loadUsersAndTreatments();
    } catch (err) {
      console.error('Failed to register user', err);
      setErrorMsg(err.response?.data?.message || 'Failed to create user account');
    } finally {
      setSubmitting(false);
    }
  };


  const handleAddTreatment = async (e) => {
    e.preventDefault();
    setTreatmentError('');
    setTreatmentMsg('');

    if (!newTreatmentName.trim()) {
      setTreatmentError('Treatment name is required.');
      return;
    }

    const priceNum = parseFloat(newTreatmentPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setTreatmentError('Please specify a valid positive price in LKR.');
      return;
    }

    setTreatmentSubmitting(true);

    try {
      const payload = {
        name: newTreatmentName.trim(),
        price: priceNum,
        description: newTreatmentDesc.trim() || (newTreatmentName.trim() + ' Procedure')
      };

      await api.post('/treatments', payload);
      setTreatmentMsg(`Treatment "${payload.name}" added successfully at LKR ${priceNum.toLocaleString()}!`);
      setNewTreatmentName('');
      setNewTreatmentPrice('');
      setNewTreatmentDesc('');

      const res = await api.get('/treatments');
      setTreatments(res.data || []);
    } catch (err) {
      setTreatmentError(err.response?.data?.message || 'Failed to create treatment.');
    } finally {
      setTreatmentSubmitting(false);
    }
  };

  const handleDeleteTreatment = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove treatment "${name}"?`)) return;

    try {
      await api.delete(`/treatments/${id}`);
      setTreatmentMsg(`Treatment "${name}" removed successfully.`);
      const res = await api.get('/treatments');
      setTreatments(res.data || []);
    } catch (err) {
      setTreatmentError(err.response?.data?.message || 'Failed to delete treatment.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      u.username.toLowerCase().includes(term) ||
      (u.fullName && u.fullName.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.contactNumber && u.contactNumber.toLowerCase().includes(term)) ||
      (u.address && u.address.toLowerCase().includes(term)) ||
      (u.id && String(u.id).includes(term));
    return matchesRole && matchesSearch;
  });


  const doctorCount = users.filter((u) => u.role === 'DOCTOR').length;
  const staffCount = users.filter((u) => u.role === 'STAFF').length;
  const patientCount = users.filter((u) => u.role === 'PATIENT').length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div className="user-management-container">
      {/* Stats row */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon blue">
            <UsersIcon size={24} color="#0284c7" />
          </div>
          <div className="stat-info">
            <h3>{users.length}</h3>
            <p>Total Registered Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teal">
            <StethoscopeIcon size={24} color="#0d9488" />
          </div>
          <div className="stat-info">
            <h3>{doctorCount}</h3>
            <p>Registered Dentists</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <UsersIcon size={24} color="#16a34a" />
          </div>
          <div className="stat-info">
            <h3>{staffCount}</h3>
            <p>Active Staff & Reception</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <ToothIcon size={24} color="#d97706" />
          </div>
          <div className="stat-info">
            <h3>{treatments.length}</h3>
            <p>Active Treatment Types</p>
          </div>
        </div>
      </div>

      {/* Main Grid: User Registration & Directory Table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 420px) 1fr', gap: '24px', alignItems: 'start', marginBottom: '32px' }}>
        
        {/* User Registration Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#e0f2fe', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>
              <UsersIcon size={22} color="#0284c7" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>Register Clinic Staff</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Provision dentist and clinic staff administrative accounts</p>
            </div>
          </div>

          <div style={{ padding: '10px 12px', background: '#f1f5f9', borderLeft: '4px solid #0284c7', borderRadius: '6px', fontSize: '0.78rem', color: '#334155', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircleIcon size={16} color="#0284c7" />
            <span><strong>Clinic Staff Provisioning:</strong> Register dentists and front-desk staff here. Patient registration &amp; patient credentials are fully managed in the <strong>Patients Directory</strong>.</span>
          </div>

          {errorMsg && (
            <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircleIcon size={16} color="#b91c1c" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ padding: '12px 14px', background: '#ecfdf5', color: '#065f46', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', fontWeight: '500', lineHeight: '1.4', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircleIcon size={16} color="#065f46" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit}>
            {/* Role Selection */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Clinic Staff Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  className={`btn ${role === 'DOCTOR' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '10px 6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={() => setRole('DOCTOR')}
                >
                  <StethoscopeIcon size={15} />
                  <span>Dentist (Doctor)</span>
                </button>
                <button
                  type="button"
                  className={`btn ${role === 'STAFF' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '10px 6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={() => setRole('STAFF')}
                >
                  <UsersIcon size={15} />
                  <span>Staff (Receptionist)</span>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">{role === 'DOCTOR' ? 'Doctor Full Name & Title *' : 'Staff Full Name *'}</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={role === 'DOCTOR' ? 'e.g. Dr. Samantha Fernando' : 'e.g. Sunil De Silva'}
                required
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {role === 'DOCTOR' ? 'This clinical name is displayed in appointment scheduling and patient queues.' : 'Full name for administrative identification.'}
              </span>
            </div>

            {/* Mobile / Contact Number */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Contact Phone Number (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="e.g. 0771234567 or +94771234567"
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Emergency contact or clinic office extension.
              </span>
            </div>

            {/* Username */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Username (Login ID) *</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={role === 'PATIENT' ? 'e.g. sunil_p or patient_sunil' : 'e.g. dr_kasun or staff_sunil'}
                required
              />
            </div>


            {/* Email */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Recipient Email Address *</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Credentials & login link will be dispatched to this address.</span>
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label className="form-label" style={{ margin: 0 }}>Account Password *</label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}
                >
                  Auto-Generate
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
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting}
              style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <PlusIcon size={16} />
              <span>{submitting ? 'Registering User...' : `Register ${role === 'DOCTOR' ? 'Dentist' : role === 'STAFF' ? 'Staff' : 'Patient'} & Send Email`}</span>
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
              onClick={loadUsersAndTreatments}
              disabled={loading}
              style={{ fontSize: '0.82rem', padding: '6px 14px' }}
            >
              {loading ? 'Refreshing...' : 'Refresh List'}
            </button>
          </div>

          {/* Search and Filters */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search name, username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['ALL', 'DOCTOR', 'STAFF', 'PATIENT', 'ADMIN'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFilterRole(r)}
                  className={`btn ${filterRole === r ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '20px' }}
                >
                  {r === 'ALL' ? `All (${users.length})` : r === 'DOCTOR' ? `Dentists (${users.filter((u) => u.role === r).length})` : `${r} (${users.filter((u) => u.role === r).length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>ID</th>
                  <th>Clinical / User Name</th>
                  <th>Role</th>
                  <th>Contact &amp; Address</th>
                  <th>Email Address</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      Loading system users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
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
                              width: '30px',
                              height: '30px',
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
                            {(u.fullName || u.username).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.88rem' }}>
                              {u.fullName || u.username}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              @{u.username}
                            </div>
                          </div>
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
                          {u.role === 'ADMIN' ? 'ADMIN' : u.role === 'DOCTOR' ? 'DENTIST' : u.role === 'STAFF' ? 'STAFF' : 'PATIENT'}
                        </span>
                      </td>
                      <td>
                        {u.contactNumber ? (
                          <div>
                            <div style={{ fontWeight: '600', color: '#0f766e', fontSize: '0.84rem' }}>
                              📞 {u.contactNumber}
                            </div>
                            {u.address && (
                              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                📍 {u.address}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>—</span>
                        )}
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

      {/* Treatment & Pricing Management Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#fef3c7', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>
              <BanknotesIcon size={22} color="#d97706" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>Treatment Types &amp; Pricing Management</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Configure clinical dental procedures, tariffs, and custom prices</p>
            </div>
          </div>
          <span className="badge badge-teal">{treatments.length} Active Procedures</span>
        </div>

        {treatmentMsg && (
          <div style={{ padding: '10px 14px', background: '#ecfdf5', color: '#065f46', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircleIcon size={16} color="#065f46" />
            <span>{treatmentMsg}</span>
          </div>
        )}

        {treatmentError && (
          <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircleIcon size={16} color="#b91c1c" />
            <span>{treatmentError}</span>
          </div>
        )}

        {/* Add Treatment Form */}
        <form onSubmit={handleAddTreatment} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr auto', gap: '12px', alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Treatment Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dental Crown / Veneer"
                value={newTreatmentName}
                onChange={(e) => setNewTreatmentName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Price in LKR *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                className="form-input"
                placeholder="e.g. 25000"
                value={newTreatmentPrice}
                onChange={(e) => setNewTreatmentPrice(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Description (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Porcelain or ceramic restoration"
                value={newTreatmentDesc}
                onChange={(e) => setNewTreatmentDesc(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={treatmentSubmitting}
                style={{ padding: '9px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <PlusIcon size={16} />
                <span>{treatmentSubmitting ? 'Adding...' : 'Add Treatment'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Treatments Table */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>ID</th>
                <th>Treatment Procedure</th>
                <th>Standard Price (LKR)</th>
                <th>Clinical Description</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {treatments.map((t) => (
                <tr key={t.id || t.name}>
                  <td style={{ fontWeight: '600', color: '#64748b' }}>#{t.id || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ToothIcon size={16} color="#0d9488" />
                      <strong style={{ color: '#0f172a' }}>{t.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: '700', color: '#0f766e', fontSize: '0.9rem' }}>
                      LKR {Number(t.price).toLocaleString()}
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {t.description || 'Standard clinic procedure'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {t.id && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', color: '#dc2626', border: '1px solid #fecaca' }}
                        onClick={() => handleDeleteTreatment(t.id, t.name)}
                        title="Remove Treatment"
                      >
                        <TrashIcon size={14} color="#dc2626" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
