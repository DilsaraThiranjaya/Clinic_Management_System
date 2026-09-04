import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function SearchAppointment({ user, selectedId, setActiveTab, onSelectAppointment }) {
  const [searchTerm, setSearchTerm] = useState(selectedId ? String(selectedId) : '1');
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedId) {
      setSearchTerm(String(selectedId));
      fetchAppointment(selectedId);
    } else {
      fetchAppointment(1);
    }
  }, [selectedId]);

  const fetchAppointment = async (id) => {
    if (!id) return;
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/appointments/${id}`);
      setAppointment(response.data);
    } catch (err) {
      setAppointment(null);
      setError(`No appointment found with number #${id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchAppointment(searchTerm.trim());
    }
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <div>
            <h2>{user?.role === 'PATIENT' ? 'Look Up Your Appointment' : 'Search & Display Appointment'}</h2>
            <p className="card-subtitle">
              {user?.role === 'PATIENT'
                ? 'Enter your unique appointment number to inspect booking time, attending dentist & details'
                : 'Search registered appointments by unique appointment number'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="search-bar-box">
          <div className="search-input-wrap">
            <span className="search-input-icon">🔍</span>
            <input
              type="number"
              className="form-input"
              placeholder="Enter Appointment Number (e.g. 1)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search Record
          </button>
        </form>

        {loading && <p style={{ color: '#64748b' }}>Fetching appointment details...</p>}

        {error && (
          <div style={{ padding: '14px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontWeight: '500' }}>
            ⚠️ {error}
          </div>
        )}

        {appointment && !loading && (
          <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '24px', marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>APPOINTMENT RECORD</span>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--teal)' }}>Appointment #{appointment.appointmentNumber}</h3>
              </div>
              <span className="badge badge-teal" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                Confirmed
              </span>
            </div>

            <div className="receipt-grid">
              <div className="receipt-item">
                <span>Patient Name</span>
                <strong>{appointment.patientName} (ID: #{appointment.patientId})</strong>
              </div>

              <div className="receipt-item">
                <span>Contact Number</span>
                <strong>{appointment.contactNumber}</strong>
              </div>

              <div className="receipt-item">
                <span>Residential Address</span>
                <strong>{appointment.patientAddress}</strong>
              </div>

              <div className="receipt-item">
                <span>Assigned Dentist</span>
                <strong>{appointment.dentistName}</strong>
              </div>

              <div className="receipt-item">
                <span>Treatment Category</span>
                <strong>{appointment.treatmentType}</strong>
              </div>

              <div className="receipt-item">
                <span>Schedule Date & Time</span>
                <strong>{appointment.appointmentDate} at {appointment.appointmentTime}</strong>
              </div>

              <div className="receipt-item">
                <span>Recorded By Staff</span>
                <strong>{appointment.staffUsername || 'Clinic Staff'} (User #{appointment.staffId})</strong>
              </div>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              {user?.role === 'PATIENT' ? (
                <div style={{ padding: '12px 18px', background: '#e0f2fe', border: '1px solid #7dd3fc', borderRadius: '8px', fontSize: '0.85rem', color: '#0369a1', width: '100%' }}>
                  ℹ️ <strong>Patient Notice:</strong> You can view and search your scheduled appointment details above. In accordance with clinic policy, official billing calculations and invoices are generated and settled by reception staff at the clinic checkout counter.
                </div>
              ) : user?.role === 'DOCTOR' ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Attending Physician Record View &bull; Treatment billing is finalized by reception
                  </span>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setActiveTab('dashboard')}
                  >
                    ← Back to Clinical Schedule
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      onSelectAppointment(appointment.appointmentNumber);
                      setActiveTab('billing');
                    }}
                  >
                    Proceed to Generate &amp; Print Bill →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
