import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import {
  UsersIcon,
  SearchIcon,
  PlusIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  CalendarPlusIcon,
  ToothIcon
} from './Icons';

export default function PatientsManagement({ user, onBookForPatient }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Helper to generate secure random password
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%&*';
    let res = 'Dental@';
    for (let i = 0; i < 4; i++) {
      res += Math.floor(Math.random() * 10);
    }
    return res;
  };

  // Form state for new patient + portal account
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    address: '',
    email: '',
    username: '',
    password: generateSecurePassword()
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get('/patients');
      setPatients(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load patients', err);
      setErrorMsg(err.response?.data?.message || 'Unable to load patients directory');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return patients;
    const term = searchTerm.toLowerCase().trim();
    return patients.filter(p =>
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.contactNumber && p.contactNumber.toLowerCase().includes(term)) ||
      (p.id && String(p.id).includes(term)) ||
      (p.address && p.address.toLowerCase().includes(term))
    );
  }, [patients, searchTerm]);

  const handleNameChange = (val) => {
    const cleanName = val.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 15);
    const suggested = cleanName ? `patient_${cleanName}` : '';
    setFormData(prev => ({
      ...prev,
      name: val,
      username: prev.username && !prev.username.startsWith('patient_') ? prev.username : suggested
    }));
    if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
  };

  const handleRegeneratePassword = () => {
    setFormData(prev => ({
      ...prev,
      password: generateSecurePassword()
    }));
    setShowPassword(true);
  };

  const validatePatientForm = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Patient full name is required';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    const phoneRegex = /^[0-9+\-\s]{10,15}$/;
    if (!formData.contactNumber.trim()) {
      errs.contactNumber = 'Contact number is required';
    } else if (!phoneRegex.test(formData.contactNumber.trim())) {
      errs.contactNumber = 'Enter a valid 10-15 digit phone number (e.g. 0771234567)';
    }

    if (!formData.address.trim()) {
      errs.address = 'Residential address / NIC is required';
    } else if (formData.address.trim().length < 4) {
      errs.address = 'Address must be at least 4 characters';
    }

    if (!formData.email.trim() || !formData.email.includes('@') || !formData.email.includes('.')) {
      errs.email = 'A valid email address is required to dispatch login credentials';
    }

    if (!formData.username.trim() || formData.username.trim().length < 3) {
      errs.username = 'Username must be at least 3 characters';
    }

    if (!formData.password || formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    if (!validatePatientForm()) return;

    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // Register patient + user profile via /api/users/register
      const payload = {
        fullName: formData.name.trim(),
        username: formData.username.trim(),
        password: formData.password,
        role: 'PATIENT',
        email: formData.email.trim(),
        contactNumber: formData.contactNumber.trim(),
        address: formData.address.trim()
      };

      const res = await api.post('/users/register', payload);
      const newAccount = res.data;

      // Keep credentials banner active for easy handoff / copy
      setCreatedCredentials({
        fullName: formData.name.trim(),
        username: newAccount.username,
        password: formData.password,
        email: newAccount.email,
        patientId: newAccount.patientId,
        contactNumber: formData.contactNumber.trim(),
        address: formData.address.trim()
      });

      setSuccessMsg(`Patient profile & portal account successfully created for "${formData.name}"! Login credentials emailed to ${newAccount.email}.`);
      
      setFormData({
        name: '',
        contactNumber: '',
        address: '',
        email: '',
        username: '',
        password: generateSecurePassword()
      });
      setShowModal(false);
      await loadPatients();
    } catch (err) {
      console.error('Failed to register patient', err);
      setFormErrors({ form: err.response?.data?.message || 'Failed to register patient. Please verify input.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `SUNRISE DENTAL CLINIC - PATIENT PORTAL ACCESS\nPatient: ${createdCredentials.fullName} (ID #${createdCredentials.patientId || ''})\nPortal URL: http://localhost:5173\nUsername: ${createdCredentials.username}\nTemporary Password: ${createdCredentials.password}\nRegistered Email: ${createdCredentials.email}`;
    navigator.clipboard.writeText(text);
    alert('Patient credentials copied to clipboard!');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2>Clinic Patients Directory</h2>
            <p className="card-subtitle">
              Search registered dental patients, review contact records, and onboard new clinic visitors.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setFormErrors({});
              setFormData({
                name: '',
                contactNumber: '',
                address: '',
                email: '',
                username: '',
                password: generateSecurePassword()
              });
              setShowModal(true);
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <PlusIcon size={18} /> Register New Patient
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{ padding: '14px 18px', background: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircleIcon size={18} color="#065f46" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '14px 18px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircleIcon size={18} color="#991b1b" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Newly Created Credentials Banner (Handoff to Patient) */}
      {createdCredentials && (
        <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: '2px solid #86efac', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ background: '#22c55e', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <CheckCircleIcon size={24} color="#ffffff" />
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#14532d', fontSize: '1.15rem' }}>
                  Patient Profile &amp; Portal Account Created!
                </h3>
                <p style={{ margin: '2px 0 0 0', color: '#166534', fontSize: '0.85rem' }}>
                  Credentials dispatched to <strong>{createdCredentials.email}</strong>. Hand over or copy credentials below:
                </p>
              </div>
            </div>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '4px 10px', background: '#fff' }}
              onClick={() => setCreatedCredentials(null)}
            >
              Dismiss
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px', background: '#fff', padding: '14px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>PATIENT NAME</span>
              <div style={{ fontWeight: '700', color: '#0f172a' }}>{createdCredentials.fullName} {createdCredentials.patientId ? `(ID #${createdCredentials.patientId})` : ''}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>PORTAL USERNAME</span>
              <div style={{ fontWeight: '700', color: '#0284c7', fontFamily: 'monospace' }}>{createdCredentials.username}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>TEMPORARY PASSWORD</span>
              <div style={{ fontWeight: '700', color: '#0d9488', fontFamily: 'monospace' }}>{createdCredentials.password}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>CONTACT PHONE</span>
              <div style={{ fontWeight: '600', color: '#334155' }}>{createdCredentials.contactNumber}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '14px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff' }}
              onClick={handleCopyCredentials}
            >
              📋 Copy Credentials
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={() => onBookForPatient({ id: createdCredentials.patientId, name: createdCredentials.fullName, contactNumber: createdCredentials.contactNumber, address: createdCredentials.address })}
            >
              <CalendarPlusIcon size={15} /> Book Appointment Now
            </button>
          </div>
        </div>
      )}

      {/* Search & Stats Filter */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div className="search-input-wrap" style={{ flex: 1, minWidth: '280px' }}>
            <span className="search-input-icon">
              <SearchIcon size={18} color="#64748b" />
            </span>
            <input
              type="text"
              className="form-input"
              placeholder="Search by Mobile Number (e.g. 077...), Patient Name, or Patient ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: '600' }}>
            Showing {filteredPatients.length} of {patients.length} registered patient{patients.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '32px 0' }}>Loading registered patients...</p>
        ) : filteredPatients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <UsersIcon size={44} color="#cbd5e1" />
            <h3 style={{ marginTop: '12px', color: '#334155' }}>No Patients Found</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
              {searchTerm ? `No patient records match "${searchTerm}".` : 'No patients registered in the clinic yet.'}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setFormErrors({});
                setShowModal(true);
              }}
              style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <PlusIcon size={16} /> Register First Patient
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Patient ID</th>
                  <th>Full Name</th>
                  <th>Contact Number</th>
                  <th>Residential Address / NIC</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <span className="badge badge-teal" style={{ fontWeight: '700' }}>
                        #{patient.id}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{patient.name}</strong>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', color: '#0284c7', fontWeight: '600' }}>
                        {patient.contactNumber}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#475569', fontSize: '0.85rem' }}>
                        {patient.address || '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => onBookForPatient(patient)}
                        style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        title={`Book appointment for ${patient.name}`}
                      >
                        <CalendarPlusIcon size={14} /> Book Appointment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog for Patient Registration & Portal Provisioning */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '560px', width: '100%', maxHeight: '92vh', overflowY: 'auto', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Register New Patient</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Create clinic medical chart and provision patient portal credentials
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '10px 12px', background: '#f0fdfa', borderLeft: '4px solid #0d9488', borderRadius: '6px', fontSize: '0.8rem', color: '#134e4a', marginBottom: '16px' }}>
              <strong>Automated Account Provisioning:</strong> Registering the patient creates their clinic chart, generates secure portal credentials, and automatically sends an email to their provided address.
            </div>

            {formErrors.form && (
              <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px', fontSize: '0.85rem' }}>
                {formErrors.form}
              </div>
            )}

            <form onSubmit={handleRegisterPatient}>
              {/* Full Name */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Patient Full Name <span className="req">*</span></label>
                <input
                  type="text"
                  className={`form-input ${formErrors.name ? 'error' : ''}`}
                  placeholder="e.g. Sunil De Silva"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  autoFocus
                />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>

              {/* Mobile / Contact Number */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Mobile / Contact Number <span className="req">*</span></label>
                <input
                  type="tel"
                  className={`form-input ${formErrors.contactNumber ? 'error' : ''}`}
                  placeholder="e.g. 0771234567 or +94771234567"
                  value={formData.contactNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, contactNumber: e.target.value });
                    if (formErrors.contactNumber) setFormErrors({ ...formErrors, contactNumber: '' });
                  }}
                />
                {formErrors.contactNumber && <span className="error-text">{formErrors.contactNumber}</span>}
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Used for reception search, booking confirmation, and SMS notifications.</span>
              </div>

              {/* Residential Address / NIC */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Residential Address / NIC <span className="req">*</span></label>
                <input
                  type="text"
                  className={`form-input ${formErrors.address ? 'error' : ''}`}
                  placeholder="e.g. No. 45 Galle Road, Colombo 03 (or NIC: 199512345678)"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    if (formErrors.address) setFormErrors({ ...formErrors, address: '' });
                  }}
                />
                {formErrors.address && <span className="error-text">{formErrors.address}</span>}
              </div>

              {/* Recipient Email */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Recipient Email Address <span className="req">*</span></label>
                <input
                  type="email"
                  className={`form-input ${formErrors.email ? 'error' : ''}`}
                  placeholder="e.g. sunil.desilva@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                  }}
                />
                {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Patient portal credentials and appointment receipts will be emailed here.</span>
              </div>

              {/* Grid: Username & Generated Password */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Portal Username (Login ID) <span className="req">*</span></label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.username ? 'error' : ''}`}
                    placeholder="e.g. patient_sunil"
                    value={formData.username}
                    onChange={(e) => {
                      setFormData({ ...formData, username: e.target.value });
                      if (formErrors.username) setFormErrors({ ...formErrors, username: '' });
                    }}
                  />
                  {formErrors.username && <span className="error-text">{formErrors.username}</span>}
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" style={{ marginBottom: '4px' }}>Generated Password <span className="req">*</span></label>
                    <button
                      type="button"
                      onClick={handleRegeneratePassword}
                      style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Regenerate
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`form-input ${formErrors.password ? 'error' : ''}`}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '0.75rem', color: '#64748b', cursor: 'pointer' }}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {formErrors.password && <span className="error-text">{formErrors.password}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Creating Profile & Sending Email...' : 'Save & Provision Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
