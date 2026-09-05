import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from '../services/api';
import {
  CheckCircleIcon,
  AlertCircleIcon,
  StethoscopeIcon,
  SearchIcon,
  UsersIcon,
  PlusIcon
} from './Icons';

const DEFAULT_TREATMENTS = [
  { name: 'Teeth Cleaning', price: 2500 },
  { name: 'Dental Filling', price: 3500 },
  { name: 'Tooth Extraction', price: 4500 },
  { name: 'Teeth Whitening', price: 8000 },
  { name: 'Root Canal', price: 15000 },
  { name: 'Orthodontics (Braces)', price: 45000 },
  { name: 'General Consultation', price: 2000 }
];

const DEFAULT_DOCTORS = [];

const BASE_CONSULTATION_FEE = 1500;

export default function RegisterAppointment({
  user,
  setActiveTab,
  onAppointmentCreated,
  preselectedPatient,
  onClearPreselectedPatient
}) {
  const [doctors, setDoctors] = useState([]);
  const [treatments, setTreatments] = useState(DEFAULT_TREATMENTS);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const searchDropdownRef = useRef(null);

  // Quick Register Modal State
  const [showQuickRegisterModal, setShowQuickRegisterModal] = useState(false);
  const [quickPatientData, setQuickPatientData] = useState({ name: '', address: '', contactNumber: '', email: '' });
  const [quickPatientErrors, setQuickPatientErrors] = useState({});
  const [quickPatientSubmitting, setQuickPatientSubmitting] = useState(false);

  const [selectedTreatments, setSelectedTreatments] = useState(['Teeth Cleaning']);
  const [formData, setFormData] = useState({
    patientId: null,
    patientName: '',
    address: '',
    contactNumber: '',
    dentistName: 'Dr. Samantha Fernando',
    treatmentType: 'Teeth Cleaning',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '10:00'
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadDoctorsTreatmentsAndPatients();
  }, []);

  useEffect(() => {
    if (preselectedPatient) {
      handleSelectPatient(preselectedPatient);
    }
  }, [preselectedPatient]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target)) {
        setIsPatientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadDoctorsTreatmentsAndPatients = async () => {
    try {
      const [docRes, treatRes, patientRes] = await Promise.allSettled([
        api.get('/users/doctors'),
        api.get('/treatments'),
        api.get('/patients')
      ]);

      if (docRes.status === 'fulfilled' && Array.isArray(docRes.value.data)) {
        setDoctors(docRes.value.data);
        if (docRes.value.data.length > 0) {
          const firstDoc = docRes.value.data[0];
          const firstDocName = firstDoc.fullName || (firstDoc.username?.toLowerCase().startsWith('dr') ? firstDoc.username : 'Dr. ' + firstDoc.username);
          setFormData(prev => ({
            ...prev,
            dentistName: prev.dentistName || firstDocName
          }));
        }
      }

      if (treatRes.status === 'fulfilled' && Array.isArray(treatRes.value.data) && treatRes.value.data.length > 0) {
        setTreatments(treatRes.value.data);
      }

      if (patientRes.status === 'fulfilled' && Array.isArray(patientRes.value.data)) {
        setPatients(patientRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load doctors, treatments, or patients', err);
    }
  };

  const searchedPatients = useMemo(() => {
    if (!patientSearchTerm.trim()) return [];
    const term = patientSearchTerm.toLowerCase().trim();
    return patients.filter(p =>
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.contactNumber && p.contactNumber.toLowerCase().includes(term)) ||
      (p.id && String(p.id).includes(term)) ||
      (p.address && p.address.toLowerCase().includes(term))
    ).slice(0, 6);
  }, [patients, patientSearchTerm]);

  const handleSelectPatient = (p) => {
    setSelectedPatient(p);
    setFormData(prev => ({
      ...prev,
      patientId: p.id,
      patientName: p.name,
      address: p.address,
      contactNumber: p.contactNumber
    }));
    setPatientSearchTerm('');
    setIsPatientDropdownOpen(false);
    setErrors(prev => ({
      ...prev,
      patientSelection: '',
      patientName: '',
      address: '',
      contactNumber: ''
    }));
  };

  const handleClearPatient = () => {
    setSelectedPatient(null);
    setFormData(prev => ({
      ...prev,
      patientId: null,
      patientName: '',
      address: '',
      contactNumber: ''
    }));
    setPatientSearchTerm('');
    if (onClearPreselectedPatient) onClearPreselectedPatient();
  };

  const handleQuickRegisterPatient = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!quickPatientData.name.trim()) {
      errs.name = 'Patient full name is required';
    } else if (quickPatientData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    if (!quickPatientData.address.trim()) {
      errs.address = 'Residential address / NIC is required';
    } else if (quickPatientData.address.trim().length < 4) {
      errs.address = 'Address must be at least 4 characters';
    }

    const phoneRegex = /^[0-9+\-\s]{10,15}$/;
    if (!quickPatientData.contactNumber.trim()) {
      errs.contactNumber = 'Contact number is required';
    } else if (!phoneRegex.test(quickPatientData.contactNumber.trim())) {
      errs.contactNumber = 'Enter a valid 10-15 digit phone number (e.g. 0771234567)';
    }

    if (!quickPatientData.email.trim() || !quickPatientData.email.includes('@')) {
      errs.email = 'Valid email is required to dispatch patient login credentials';
    }

    if (Object.keys(errs).length > 0) {
      setQuickPatientErrors(errs);
      return;
    }

    setQuickPatientSubmitting(true);
    setQuickPatientErrors({});

    try {
      const cleanName = quickPatientData.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const username = `pt_${cleanName.slice(0, 8)}_${randomSuffix}`;
      const password = `Patient@${Math.floor(1000 + Math.random() * 9000)}`;

      const res = await api.post('/users/register', {
        fullName: quickPatientData.name.trim(),
        username: username,
        password: password,
        role: 'PATIENT',
        email: quickPatientData.email.trim(),
        contactNumber: quickPatientData.contactNumber.trim(),
        address: quickPatientData.address.trim()
      });

      const newAccount = res.data;
      const createdPatient = {
        id: newAccount.patientId,
        name: quickPatientData.name.trim(),
        address: quickPatientData.address.trim(),
        contactNumber: quickPatientData.contactNumber.trim()
      };

      setPatients(prev => [createdPatient, ...prev]);
      handleSelectPatient(createdPatient);
      setShowQuickRegisterModal(false);
      setQuickPatientData({ name: '', address: '', contactNumber: '', email: '' });
    } catch (err) {
      console.error('Quick patient registration failed', err);
      setQuickPatientErrors({ form: err.response?.data?.message || 'Failed to register patient profile' });
    } finally {
      setQuickPatientSubmitting(false);
    }
  };

  const treatmentPriceMap = useMemo(() => {
    const map = {};
    treatments.forEach(t => {
      map[t.name] = Number(t.price);
    });
    return map;
  }, [treatments]);

  const treatmentCostBreakdown = useMemo(() => {
    return selectedTreatments.map(tName => ({
      name: tName,
      price: treatmentPriceMap[tName] ?? 2000
    }));
  }, [selectedTreatments, treatmentPriceMap]);

  const totalTreatmentCost = useMemo(() => {
    return treatmentCostBreakdown.reduce((sum, item) => sum + item.price, 0);
  }, [treatmentCostBreakdown]);

  const estimatedPrice = useMemo(() => {
    return BASE_CONSULTATION_FEE + totalTreatmentCost;
  }, [totalTreatmentCost]);

  const toggleTreatment = (treatmentName) => {
    setSelectedTreatments(prev => {
      let updated;
      if (prev.includes(treatmentName)) {
        updated = prev.filter(t => t !== treatmentName);
      } else {
        updated = [...prev, treatmentName];
      }
      setFormData(f => ({ ...f, treatmentType: updated.join(', ') }));
      if (errors.treatmentType && updated.length > 0) {
        setErrors(errs => ({ ...errs, treatmentType: '' }));
      }
      return updated;
    });
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.patientId || !selectedPatient) {
      errs.patientSelection = 'You must select an existing registered patient from the clinic system. Appointments cannot be booked without an existing patient record.';
    }

    if (!formData.patientName || !formData.patientName.trim()) {
      errs.patientName = 'Patient is required. Please search and select a registered patient above.';
    }

    if (selectedTreatments.length === 0) {
      errs.treatmentType = 'Please select at least one clinical treatment procedure';
    }

    if (!formData.dentistName) {
      errs.dentistName = 'Please select a registered dentist';
    }

    if (!formData.appointmentDate) {
      errs.appointmentDate = 'Appointment date is required';
    }

    if (!formData.appointmentTime) {
      errs.appointmentTime = 'Appointment time is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSuccessMsg('');

    try {
      const response = await api.post('/appointments', {
        ...formData,
        userId: user?.id,
        appointmentTime: formData.appointmentTime.includes(':') && formData.appointmentTime.split(':').length === 2
          ? `${formData.appointmentTime}:00`
          : formData.appointmentTime
      });

      const data = response.data;
      setSuccessMsg(`Appointment #${data.appointmentNumber} successfully registered for ${data.patientName}!`);
      onAppointmentCreated(data.appointmentNumber);

      const firstDocName = doctors.length > 0
        ? (doctors[0].fullName || (doctors[0].username?.toLowerCase().startsWith('dr') ? doctors[0].username : 'Dr. ' + doctors[0].username))
        : '';
      const firstTreatmentName = treatments.length > 0 ? treatments[0].name : 'Teeth Cleaning';

      setSelectedTreatments([firstTreatmentName]);
      setSelectedPatient(null);
      setFormData({
        patientId: null,
        patientName: '',
        address: '',
        contactNumber: '',
        dentistName: firstDocName,
        treatmentType: firstTreatmentName,
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '10:00'
      });
      if (onClearPreselectedPatient) onClearPreselectedPatient();
    } catch (err) {
      setErrors({ form: err.response?.data?.message || 'Failed to register appointment' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div className="card-header">
        <div>
          {user?.role === 'ADMIN' ? (
            <span className="badge" style={{ background: '#7c3aed', color: '#fff', marginBottom: '8px' }}>
              Administrator Portal &bull; Scheduling as Clinic Admin ({user?.fullName || user?.username})
            </span>
          ) : (
            <span className="badge badge-teal" style={{ marginBottom: '8px' }}>
              Front-Desk Reception &bull; Booking as Receptionist ({user?.fullName || user?.username})
            </span>
          )}
          <h2>{user?.role === 'ADMIN' ? 'Schedule Clinic Appointment' : 'Front-Desk Appointment Booking'}</h2>
          <p className="card-subtitle">
            Search registered clinic patients or register new patients, then assign a dentist and clinical procedures
          </p>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '14px', background: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircleIcon size={18} color="#065f46" />
          <span>{successMsg}</span>
        </div>
      )}

      {errors.form && (
        <div style={{ padding: '14px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircleIcon size={18} color="#991b1b" />
          <span>{errors.form}</span>
        </div>
      )}

      {/* Patient Search & Selection Card */}
      {selectedPatient ? (
        <div style={{
          background: '#f0fdf4',
          border: '1.5px solid #86efac',
          borderRadius: '8px',
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
              ✓
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ color: '#14532d', fontSize: '1rem' }}>{selectedPatient.name}</strong>
                <span className="badge badge-teal">ID #{selectedPatient.id}</span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.84rem', color: '#166534' }}>
                Mobile: <strong>{selectedPatient.contactNumber}</strong> &bull; Address: {selectedPatient.address}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.82rem', background: '#fff' }}
            onClick={handleClearPatient}
          >
            ✕ Change / Clear Patient
          </button>
        </div>
      ) : (
        <div ref={searchDropdownRef} style={{
          background: '#f8fafc',
          border: '1.5px solid var(--border)',
          borderRadius: '8px',
          padding: '16px 18px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UsersIcon size={16} color="var(--teal)" /> Search & Select Registered Patient
            </label>
            <button
              type="button"
              onClick={() => {
                setQuickPatientErrors({});
                setShowQuickRegisterModal(true);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--teal)',
                fontWeight: '600',
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <PlusIcon size={14} /> + Register New Patient
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <div className="search-input-wrap">
              <span className="search-input-icon">
                <SearchIcon size={16} color="#64748b" />
              </span>
              <input
                type="text"
                className="form-input"
                placeholder="Search registered patient by Mobile Number (e.g. 077...), Name, or Patient ID..."
                value={patientSearchTerm}
                onChange={(e) => {
                  setPatientSearchTerm(e.target.value);
                  setIsPatientDropdownOpen(true);
                }}
                onFocus={() => setIsPatientDropdownOpen(true)}
              />
            </div>

            {/* Autocomplete Dropdown */}
            {isPatientDropdownOpen && patientSearchTerm.trim().length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#ffffff',
                border: '1.5px solid var(--teal)',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                zIndex: 50,
                marginTop: '4px',
                maxHeight: '260px',
                overflowY: 'auto'
              }}>
                {searchedPatients.length > 0 ? (
                  searchedPatients.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPatient(p)}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdfa'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                    >
                      <div>
                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.9rem' }}>
                          {p.name} <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 'normal' }}>(ID #{p.id})</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {p.address}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--teal)', fontSize: '0.85rem' }}>
                          {p.contactNumber}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: '#0284c7' }}>Click to select</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                    No registered patient found matching "{patientSearchTerm}".
                    <div style={{ marginTop: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                        onClick={() => {
                          setQuickPatientData({ name: patientSearchTerm, address: '', contactNumber: '' });
                          setShowQuickRegisterModal(true);
                          setIsPatientDropdownOpen(false);
                        }}
                      >
                        + Register "{patientSearchTerm}" as New Patient
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appointment Booking Form */}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Patient Selection Status Notice */}
          {!selectedPatient && (
            <div style={{
              gridColumn: '1 / -1',
              padding: '12px 16px',
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              color: '#92400e',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircleIcon size={18} color="#d97706" />
              <div>
                <strong>Registered Patient Required:</strong> Appointments must be linked to an existing patient profile. Search and select a patient in the box above, or click <strong>"+ Register New Patient"</strong> if they are visiting for the first time.
              </div>
            </div>
          )}

          <div className="form-group full-width">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>
                Patient Full Name <span className="req">*</span>
              </span>
              {selectedPatient ? (
                <span className="badge badge-teal" style={{ fontSize: '0.75rem' }}>
                  ✓ System Patient #{selectedPatient.id}
                </span>
              ) : (
                <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: '500' }}>
                  Select patient from directory above
                </span>
              )}
            </label>
            <input
              type="text"
              name="patientName"
              className={`form-input ${errors.patientSelection || errors.patientName ? 'error' : ''}`}
              value={formData.patientName}
              placeholder={selectedPatient ? '' : '🔒 Locked — Search & select a registered patient from above search'}
              readOnly={true}
              disabled={!selectedPatient}
              style={{
                background: selectedPatient ? '#f0fdf4' : '#f8fafc',
                cursor: selectedPatient ? 'default' : 'not-allowed',
                fontWeight: selectedPatient ? '600' : 'normal',
                color: selectedPatient ? '#0f172a' : '#94a3b8'
              }}
            />
            {errors.patientSelection && <span className="error-text">{errors.patientSelection}</span>}
            {errors.patientName && !errors.patientSelection && <span className="error-text">{errors.patientName}</span>}
          </div>

          <div className="form-group full-width">
            <label className="form-label">Residential Address <span className="req">*</span></label>
            <input
              type="text"
              name="address"
              className="form-input"
              value={formData.address}
              placeholder={selectedPatient ? '' : '🔒 Auto-populated from patient record'}
              readOnly={true}
              disabled={!selectedPatient}
              style={{
                background: selectedPatient ? '#f0fdf4' : '#f8fafc',
                cursor: selectedPatient ? 'default' : 'not-allowed',
                color: selectedPatient ? '#0f172a' : '#94a3b8'
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact / Mobile Number <span className="req">*</span></label>
            <input
              type="tel"
              name="contactNumber"
              className="form-input"
              value={formData.contactNumber}
              placeholder={selectedPatient ? '' : '🔒 Auto-populated from patient record'}
              readOnly={true}
              disabled={!selectedPatient}
              style={{
                background: selectedPatient ? '#f0fdf4' : '#f8fafc',
                cursor: selectedPatient ? 'default' : 'not-allowed',
                fontFamily: selectedPatient ? 'monospace' : 'inherit',
                fontWeight: selectedPatient ? '600' : 'normal',
                color: selectedPatient ? '#0f172a' : '#94a3b8'
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Dentist <span className="req">*</span></label>
            <select
              name="dentistName"
              className="form-select"
              value={formData.dentistName}
              onChange={handleChange}
              required
            >
              {doctors.length === 0 ? (
                <option value="">No registered dentists found</option>
              ) : (
                doctors.map(d => {
                  const docName = d.fullName || (d.username?.toLowerCase().startsWith('dr') ? d.username : 'Dr. ' + d.username);
                  return (
                    <option key={d.id || d.username} value={docName}>
                      {docName}
                    </option>
                  );
                })
              )}
            </select>
            {errors.dentistName && <span className="error-text">{errors.dentistName}</span>}
          </div>

          {/* Clinical Treatment Procedures (Multi-Select) */}
          <div className="form-group full-width">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ margin: 0 }}>
                Clinical Treatment Procedures <span className="req">*</span>
              </label>
              <span style={{ fontSize: '0.8rem', color: selectedTreatments.length > 0 ? 'var(--teal)' : '#ef4444', fontWeight: '600' }}>
                {selectedTreatments.length} procedure{selectedTreatments.length === 1 ? '' : 's'} selected
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 8px 0' }}>
              Select all treatments the patient will receive during this appointment. The total bill will sum all selected procedures.
            </p>

            {/* Clickable Multi-Select Cards Grid */}
            <div className="treatment-selection-grid">
              {treatments.map(t => {
                const isSelected = selectedTreatments.includes(t.name);
                return (
                  <div
                    key={t.id || t.name}
                    className={`treatment-card-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleTreatment(t.name)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        toggleTreatment(t.name);
                      }
                    }}
                  >
                    <div className="item-info">
                      <div className="item-checkbox">
                        {isSelected && <span style={{ fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                      </div>
                      <span className="item-name">{t.name}</span>
                    </div>
                    <span className="item-price">LKR {Number(t.price).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            {errors.treatmentType && <span className="error-text" style={{ marginTop: '6px', display: 'block' }}>{errors.treatmentType}</span>}

            {/* Active Selected Tags with Quick Remove */}
            {selectedTreatments.length > 1 && (
              <div className="selected-treatments-tags">
                <span style={{ fontSize: '0.78rem', color: '#64748b', alignSelf: 'center', fontWeight: '600' }}>Selected:</span>
                {selectedTreatments.map(tName => (
                  <span key={tName} className="selected-treatment-tag">
                    {tName}
                    <button type="button" onClick={() => toggleTreatment(tName)} title="Remove">✕</button>
                  </span>
                ))}
              </div>
            )}

            {/* Live Dynamic Pricing Breakdown Badge */}
            <div className="price-preview-badge">
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Live Estimated Invoice Total
                </span>
                <p style={{ fontSize: '0.84rem', color: '#0f172a', margin: '3px 0 0 0', fontWeight: '500' }}>
                  Base Consultation Fee: LKR 1,500 + Treatment Procedures ({selectedTreatments.length}): LKR {totalTreatmentCost.toLocaleString()}
                </p>
                {treatmentCostBreakdown.length > 0 && (
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '3px 0 0 0' }}>
                    Breakdown: {treatmentCostBreakdown.map(i => `${i.name} (LKR ${i.price.toLocaleString()})`).join(' + ')}
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right', minWidth: '130px' }}>
                <h4 style={{ margin: 0, fontSize: '1.25rem' }}>LKR {estimatedPrice.toLocaleString()}</h4>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Includes Consultation</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Appointment Date <span className="req">*</span></label>
            <input
              type="date"
              name="appointmentDate"
              className={`form-input ${errors.appointmentDate ? 'error' : ''}`}
              value={formData.appointmentDate}
              onChange={handleChange}
            />
            {errors.appointmentDate && <span className="error-text">{errors.appointmentDate}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Appointment Time <span className="req">*</span></label>
            <input
              type="time"
              name="appointmentTime"
              className={`form-input ${errors.appointmentTime ? 'error' : ''}`}
              value={formData.appointmentTime}
              onChange={handleChange}
            />
            {errors.appointmentTime && <span className="error-text">{errors.appointmentTime}</span>}
          </div>
        </div>

        <div style={{ marginTop: '28px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('dashboard')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Booking Appointment...' : 'Confirm & Save Appointment'}
          </button>
        </div>
      </form>

      {/* Quick Patient Registration Modal */}
      {showQuickRegisterModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Register New Patient</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Create patient record & auto-select for this appointment</p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickRegisterModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {quickPatientErrors.form && (
              <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '14px', fontSize: '0.85rem' }}>
                {quickPatientErrors.form}
              </div>
            )}

            <form onSubmit={handleQuickRegisterPatient}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Patient Full Name <span className="req">*</span></label>
                <input
                  type="text"
                  className={`form-input ${quickPatientErrors.name ? 'error' : ''}`}
                  placeholder="e.g. Sunil De Silva"
                  value={quickPatientData.name}
                  onChange={(e) => {
                    setQuickPatientData({ ...quickPatientData, name: e.target.value });
                    if (quickPatientErrors.name) setQuickPatientErrors({ ...quickPatientErrors, name: '' });
                  }}
                  autoFocus
                />
                {quickPatientErrors.name && <span className="error-text">{quickPatientErrors.name}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Contact / Mobile Number <span className="req">*</span></label>
                <input
                  type="tel"
                  className={`form-input ${quickPatientErrors.contactNumber ? 'error' : ''}`}
                  placeholder="e.g. 0771234567 or +94771234567"
                  value={quickPatientData.contactNumber}
                  onChange={(e) => {
                    setQuickPatientData({ ...quickPatientData, contactNumber: e.target.value });
                    if (quickPatientErrors.contactNumber) setQuickPatientErrors({ ...quickPatientErrors, contactNumber: '' });
                  }}
                />
                {quickPatientErrors.contactNumber && <span className="error-text">{quickPatientErrors.contactNumber}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Residential Address / NIC <span className="req">*</span></label>
                <input
                  type="text"
                  className={`form-input ${quickPatientErrors.address ? 'error' : ''}`}
                  placeholder="e.g. No. 45 Galle Road, Colombo 03"
                  value={quickPatientData.address}
                  onChange={(e) => {
                    setQuickPatientData({ ...quickPatientData, address: e.target.value });
                    if (quickPatientErrors.address) setQuickPatientErrors({ ...quickPatientErrors, address: '' });
                  }}
                />
                {quickPatientErrors.address && <span className="error-text">{quickPatientErrors.address}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Email Address (for Portal Credentials) <span className="req">*</span></label>
                <input
                  type="email"
                  className={`form-input ${quickPatientErrors.email ? 'error' : ''}`}
                  placeholder="e.g. patient@example.com"
                  value={quickPatientData.email}
                  onChange={(e) => {
                    setQuickPatientData({ ...quickPatientData, email: e.target.value });
                    if (quickPatientErrors.email) setQuickPatientErrors({ ...quickPatientErrors, email: '' });
                  }}
                />
                {quickPatientErrors.email && <span className="error-text">{quickPatientErrors.email}</span>}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowQuickRegisterModal(false)}
                  disabled={quickPatientSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={quickPatientSubmitting}
                >
                  {quickPatientSubmitting ? 'Registering...' : 'Save & Select Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
