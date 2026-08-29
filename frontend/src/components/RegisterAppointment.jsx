import React, { useState, useMemo } from 'react';
import api from '../services/api';

const TREATMENT_PRICES = {
  'Teeth Cleaning': 2500,
  'Dental Filling': 3500,
  'Tooth Extraction': 4500,
  'Teeth Whitening': 8000,
  'Root Canal': 15000,
  'Orthodontics (Braces)': 45000,
  'General Consultation': 2000
};
const BASE_CONSULTATION_FEE = 1500;

export default function RegisterAppointment({ setActiveTab, onAppointmentCreated }) {
  const [formData, setFormData] = useState({
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

  const estimatedPrice = useMemo(() => {
    const treatmentCost = TREATMENT_PRICES[formData.treatmentType] || 2000;
    return BASE_CONSULTATION_FEE + treatmentCost;
  }, [formData.treatmentType]);

  const validateForm = () => {
    const errs = {};
    if (!formData.patientName.trim()) {
      errs.patientName = 'Patient name is required';
    } else if (formData.patientName.trim().length < 2) {
      errs.patientName = 'Name must be at least 2 characters';
    }

    if (!formData.address.trim()) {
      errs.address = 'Address is required';
    } else if (formData.address.trim().length < 5) {
      errs.address = 'Address must be at least 5 characters';
    }

    const phoneRegex = /^[0-9+\-\s]{10,15}$/;
    if (!formData.contactNumber.trim()) {
      errs.contactNumber = 'Contact number is required';
    } else if (!phoneRegex.test(formData.contactNumber.trim())) {
      errs.contactNumber = 'Must be a valid 10-15 digit phone number (e.g. 0771234567)';
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
        appointmentTime: formData.appointmentTime.includes(':') && formData.appointmentTime.split(':').length === 2
          ? `${formData.appointmentTime}:00`
          : formData.appointmentTime
      });

      const data = response.data;
      setSuccessMsg(`Appointment #${data.appointmentNumber} successfully registered for ${data.patientName}!`);
      onAppointmentCreated(data.appointmentNumber);

      setFormData({
        patientName: '',
        address: '',
        contactNumber: '',
        dentistName: 'Dr. Samantha Fernando',
        treatmentType: 'Teeth Cleaning',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '10:00'
      });
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
          <h2>Register New Appointment</h2>
          <p className="card-subtitle">Enter patient demographics and schedule clinic consultation</p>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '14px', background: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '20px', fontWeight: '600' }}>
          ✅ {successMsg}
        </div>
      )}

      {errors.form && (
        <div style={{ padding: '14px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px', fontWeight: '500' }}>
          ⚠️ {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">Patient Full Name <span className="req">*</span></label>
            <input
              type="text"
              name="patientName"
              className={`form-input ${errors.patientName ? 'error' : ''}`}
              value={formData.patientName}
              onChange={handleChange}
              placeholder="e.g. Sunil De Silva"
            />
            {errors.patientName && <span className="error-text">{errors.patientName}</span>}
          </div>

          <div className="form-group full-width">
            <label className="form-label">Residential Address <span className="req">*</span></label>
            <input
              type="text"
              name="address"
              className={`form-input ${errors.address ? 'error' : ''}`}
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. No. 45 Galle Road, Colombo 03"
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Contact Number <span className="req">*</span></label>
            <input
              type="tel"
              name="contactNumber"
              className={`form-input ${errors.contactNumber ? 'error' : ''}`}
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="e.g. 0771234567"
            />
            {errors.contactNumber && <span className="error-text">{errors.contactNumber}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Dentist <span className="req">*</span></label>
            <select
              name="dentistName"
              className="form-select"
              value={formData.dentistName}
              onChange={handleChange}
            >
              <option value="Dr. Samantha Fernando">Dr. Samantha Fernando (Senior Surgeon)</option>
              <option value="Dr. Kasun Jayawardena">Dr. Kasun Jayawardena (Orthodontist)</option>
              <option value="Dr. Niluka Perera">Dr. Niluka Perera (Endodontist)</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label className="form-label">Treatment Type <span className="req">*</span></label>
            <select
              name="treatmentType"
              className="form-select"
              value={formData.treatmentType}
              onChange={handleChange}
            >
              {Object.keys(TREATMENT_PRICES).map(t => (
                <option key={t} value={t}>{t} (Treatment Cost: LKR {TREATMENT_PRICES[t].toLocaleString()})</option>
              ))}
            </select>

            <div className="price-preview-badge">
              <div>
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600' }}>ESTIMATED TOTAL BILL</span>
                <p style={{ fontSize: '0.82rem', color: '#0f172a' }}>Base Fee: LKR 1,500 + Treatment: LKR {(estimatedPrice - 1500).toLocaleString()}</p>
              </div>
              <h4>LKR {estimatedPrice.toLocaleString()}</h4>
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
    </div>
  );
}
