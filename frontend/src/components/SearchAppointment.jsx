import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { SearchIcon, AlertCircleIcon, CalendarPlusIcon, ToothIcon, StethoscopeIcon } from './Icons';

export default function SearchAppointment({ user, selectedId, setActiveTab, onSelectAppointment }) {
  const isPatient = user?.role === 'PATIENT';
  const isDoctor = user?.role === 'DOCTOR';
  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'STAFF';

  // State for staff & admin search
  const [searchTerm, setSearchTerm] = useState(selectedId ? String(selectedId) : '1');
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State for patient self-service view
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientLoading, setPatientLoading] = useState(false);

  // State for doctor consultations view
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorLoading, setDoctorLoading] = useState(false);

  const doctorDisplayName = user?.fullName || (user?.username ? (user.username.toLowerCase().startsWith('dr') ? user.username.replace(/_/g, ' ') : 'Dr. ' + user.username.replace(/_/g, ' ')) : 'Dr. Samantha Fernando');

  const normalizeDocName = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/^dr\.?\s*/i, '')
      .replace(/[^a-z0-9]/g, ' ')
      .trim();
  };

  useEffect(() => {
    if (isPatient) {
      loadPatientAppointments();
    } else if (isDoctor) {
      loadDoctorAppointments();
    } else {
      if (selectedId) {
        setSearchTerm(String(selectedId));
        fetchAppointment(selectedId);
      } else {
        fetchAppointment(1);
      }
    }
  }, [selectedId, user]);

  // Load appointments exclusively for this patient
  const loadPatientAppointments = async () => {
    setPatientLoading(true);
    setError('');
    try {
      let data = [];
      try {
        const res = await api.get('/appointments/my');
        data = res.data || [];
      } catch (errMy) {
        if (user?.patientId) {
          const res = await api.get(`/appointments/patient/${user.patientId}`);
          data = res.data || [];
        }
      }

      // Auto-heal patientId badge if user profile was missing patientId
      if (data.length > 0 && (!user?.patientId || user.patientId === null) && data[0]?.patientId) {
        const stored = localStorage.getItem('clinic_user') || localStorage.getItem('user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            parsed.patientId = data[0].patientId;
            localStorage.setItem('clinic_user', JSON.stringify(parsed));
          } catch (e) {
            // ignore
          }
        }
      }

      setPatientAppointments(data);
      if (data.length > 0) {
        const matched = selectedId ? data.find(a => String(a.appointmentNumber) === String(selectedId)) : null;
        setAppointment(matched || data[0]);
      } else {
        setAppointment(null);
      }
    } catch (err) {
      console.error('Failed to load patient appointments', err);
      setError('Unable to load your appointment history. Please verify your connection.');
    } finally {
      setPatientLoading(false);
    }
  };

  // Load appointments exclusively assigned to this doctor
  const loadDoctorAppointments = async () => {
    setDoctorLoading(true);
    setError('');
    try {
      const res = await api.get('/appointments');
      const all = res.data || [];
      const rawTerms = [user?.fullName, user?.username, doctorDisplayName].filter(Boolean);
      const normTerms = rawTerms.map(normalizeDocName).filter(Boolean);
      const wordTokens = normTerms.flatMap(t => t.split(/\s+/).filter(w => w.length >= 3));

      const myDocs = all.filter(a => {
        const docNorm = normalizeDocName(a.dentistName);
        if (!docNorm) return false;
        if (normTerms.some(t => docNorm === t || docNorm.includes(t) || t.includes(docNorm))) return true;
        if (wordTokens.length > 0 && wordTokens.some(w => docNorm.includes(w))) return true;
        return false;
      });

      setDoctorAppointments(myDocs);
      if (myDocs.length > 0) {
        const matched = selectedId ? myDocs.find(a => String(a.appointmentNumber) === String(selectedId)) : null;
        setAppointment(matched || myDocs[0]);
      } else {
        setAppointment(null);
      }
    } catch (err) {
      console.error('Failed to load doctor consultations', err);
      setError('Unable to load your clinical consultations.');
    } finally {
      setDoctorLoading(false);
    }
  };

  // Staff & Admin search for specific appointment number
  const fetchAppointment = async (id) => {
    if (!id) return;
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/appointments/${id}`);
      setAppointment(response.data);
    } catch (err) {
      setAppointment(null);
      setError(err.response?.status === 403 
        ? 'Access denied: You are not authorized to view this appointment.' 
        : `No appointment found with number #${id}`);
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

  // Patient's local filter on their own appointments
  const filteredPatientAppointments = useMemo(() => {
    if (!patientSearch.trim()) return patientAppointments;
    const term = patientSearch.toLowerCase().trim();
    return patientAppointments.filter(apt =>
      String(apt.appointmentNumber).includes(term) ||
      (apt.treatmentType && apt.treatmentType.toLowerCase().includes(term)) ||
      (apt.dentistName && apt.dentistName.toLowerCase().includes(term)) ||
      (apt.appointmentDate && apt.appointmentDate.toLowerCase().includes(term))
    );
  }, [patientAppointments, patientSearch]);

  // Doctor's local filter on their assigned consultations
  const filteredDoctorAppointments = useMemo(() => {
    if (!doctorSearch.trim()) return doctorAppointments;
    const term = doctorSearch.toLowerCase().trim();
    return doctorAppointments.filter(apt =>
      String(apt.appointmentNumber).includes(term) ||
      (apt.patientName && apt.patientName.toLowerCase().includes(term)) ||
      (apt.contactNumber && apt.contactNumber.toLowerCase().includes(term)) ||
      (apt.treatmentType && apt.treatmentType.toLowerCase().includes(term)) ||
      (apt.appointmentDate && apt.appointmentDate.toLowerCase().includes(term))
    );
  }, [doctorAppointments, doctorSearch]);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Patient Self-Service View */}
      {isPatient ? (
        <div>
          {/* Header Card */}
          <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)', border: '1px solid #99f6e4' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className="badge badge-teal" style={{ marginBottom: '6px' }}>Patient Portal</span>
                <h2 style={{ margin: '4px 0 0 0', color: '#0f172a' }}>My Scheduled Appointments</h2>
                <p style={{ margin: '4px 0 0 0', color: '#475569', fontSize: '0.88rem' }}>
                  Review your confirmed dental consultations, procedures, and attending dental surgeons
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Account:</span>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>{user?.fullName || user?.username}</div>
                {user?.patientId && (
                  <span className="badge" style={{ background: '#e2e8f0', color: '#334155', fontSize: '0.75rem' }}>
                    Patient ID #{user.patientId}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Search within own appointments */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div className="search-input-wrap" style={{ flex: 1, minWidth: '260px' }}>
                <span className="search-input-icon">
                  <SearchIcon size={18} color="#64748b" />
                </span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter your appointments by #, treatment, dentist, or date..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
              </div>
              <div style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: '600' }}>
                {patientAppointments.length} Total Consultation{patientAppointments.length === 1 ? '' : 's'}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ padding: '14px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontWeight: '500', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircleIcon size={16} color="#ef4444" />
              <span>{error}</span>
            </div>
          )}

          {/* Patient's appointments table */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3>Your Consultation History &amp; Upcoming Visits</h3>
            </div>

            {patientLoading ? (
              <p style={{ color: '#64748b', padding: '24px 0', textAlign: 'center' }}>Loading your appointments...</p>
            ) : patientAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                <CalendarPlusIcon size={40} color="#94a3b8" style={{ marginBottom: '10px' }} />
                <h3 style={{ margin: '0 0 6px 0', color: '#334155' }}>No Appointments Found</h3>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  You currently have no scheduled appointments. Please visit or contact Sunrise Dental Clinic reception at (+94) 11 234 5678 to book your consultation.
                </p>
              </div>
            ) : filteredPatientAppointments.length === 0 ? (
              <p style={{ color: '#64748b', padding: '20px 0', textAlign: 'center' }}>No appointments match "{patientSearch}".</p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Appt #</th>
                      <th>Scheduled Treatment</th>
                      <th>Attending Dentist</th>
                      <th>Date &amp; Time</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatientAppointments.map((apt) => {
                      const isSelected = appointment?.appointmentNumber === apt.appointmentNumber;
                      return (
                        <tr
                          key={apt.appointmentNumber}
                          style={{
                            background: isSelected ? '#f0fdfa' : 'inherit',
                            fontWeight: isSelected ? '600' : 'normal'
                          }}
                        >
                          <td>
                            <strong style={{ color: '#0f172a' }}>#{apt.appointmentNumber}</strong>
                          </td>
                          <td>
                            <span className="badge badge-teal">{apt.treatmentType}</span>
                          </td>
                          <td>
                            <span style={{ color: '#0d9488', fontWeight: '600' }}>{apt.dentistName}</span>
                          </td>
                          <td>
                            <div>{apt.appointmentDate}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{apt.appointmentTime}</div>
                          </td>
                          <td>
                            <span className="badge" style={{ background: '#dcfce7', color: '#15803d' }}>
                              Confirmed
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                              onClick={() => setAppointment(apt)}
                            >
                              {isSelected ? 'Viewing' : 'Inspect'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : isDoctor ? (
        /* Doctor Clinical Consultation Lookup */
        <div>
          <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)', border: '1px solid #99f6e4' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className="badge badge-teal" style={{ marginBottom: '6px' }}>Attending Dental Surgeon</span>
                <h2 style={{ margin: '4px 0 0 0', color: '#0f172a' }}>{doctorDisplayName} &bull; Consultations Lookup</h2>
                <p style={{ margin: '4px 0 0 0', color: '#475569', fontSize: '0.88rem' }}>
                  Review clinical details and scheduled procedures for your assigned patients
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Assigned Consultations:</span>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>{doctorAppointments.length} Consultation{doctorAppointments.length === 1 ? '' : 's'}</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div className="search-input-wrap" style={{ flex: 1, minWidth: '260px' }}>
                <span className="search-input-icon">
                  <SearchIcon size={18} color="#64748b" />
                </span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter your assigned consultations by patient, phone, treatment, or #..."
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && (
            <div style={{ padding: '14px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontWeight: '500', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircleIcon size={16} color="#ef4444" />
              <span>{error}</span>
            </div>
          )}

          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3>Your Clinical Consultation Schedule</h3>
            </div>

            {doctorLoading ? (
              <p style={{ color: '#64748b', padding: '24px 0', textAlign: 'center' }}>Loading your assigned consultations...</p>
            ) : doctorAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                <StethoscopeIcon size={40} color="#94a3b8" style={{ marginBottom: '10px' }} />
                <h3 style={{ margin: '0 0 6px 0', color: '#334155' }}>No Assigned Consultations</h3>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  You currently have no patient appointments assigned to your schedule.
                </p>
              </div>
            ) : filteredDoctorAppointments.length === 0 ? (
              <p style={{ color: '#64748b', padding: '20px 0', textAlign: 'center' }}>No consultations match "{doctorSearch}".</p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Appt #</th>
                      <th>Patient Name</th>
                      <th>Contact Number</th>
                      <th>Clinical Treatment</th>
                      <th>Date &amp; Time</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoctorAppointments.map((apt) => {
                      const isSelected = appointment?.appointmentNumber === apt.appointmentNumber;
                      return (
                        <tr
                          key={apt.appointmentNumber}
                          style={{
                            background: isSelected ? '#f0fdfa' : 'inherit',
                            fontWeight: isSelected ? '600' : 'normal'
                          }}
                        >
                          <td><strong style={{ color: '#0f172a' }}>#{apt.appointmentNumber}</strong></td>
                          <td>
                            <div style={{ fontWeight: '600', color: '#0f172a' }}>{apt.patientName}</div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ID #{apt.patientId}</span>
                          </td>
                          <td>{apt.contactNumber}</td>
                          <td><span className="badge badge-teal">{apt.treatmentType}</span></td>
                          <td>
                            <div>{apt.appointmentDate}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{apt.appointmentTime}</div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                              onClick={() => setAppointment(apt)}
                            >
                              {isSelected ? 'Viewing' : 'Inspect'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Staff / Admin Search Form */
        <div className="card">
          <div className="card-header">
            <div>
              {isAdmin ? (
                <span className="badge" style={{ background: '#7c3aed', color: '#fff', marginBottom: '8px' }}>
                  Administrator Portal
                </span>
              ) : (
                <span className="badge badge-teal" style={{ marginBottom: '8px' }}>
                  Front-Desk Reception
                </span>
              )}
              <h2>{isAdmin ? 'Clinic Master Appointment Lookup' : 'Front-Desk Appointment Lookup'}</h2>
              <p className="card-subtitle">
                {isAdmin
                  ? 'Audit and inspect clinic-wide appointment records, patient details, and recording staff'
                  : 'Lookup patient appointment by appointment number for arrival check-in or cashier billing'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="search-bar-box">
            <div className="search-input-wrap">
              <span className="search-input-icon">
                <SearchIcon size={18} color="#64748b" />
              </span>
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
            <div style={{ padding: '14px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircleIcon size={16} color="#ef4444" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Selected Appointment Detailed Card View */}
      {appointment && (
        <div className="card" style={{ marginTop: '20px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                  {isPatient ? 'YOUR APPOINTMENT SUMMARY' : isDoctor ? 'CLINICAL CONSULTATION RECORD' : isAdmin ? 'ADMINISTRATIVE APPOINTMENT AUDIT' : 'RECEPTION APPOINTMENT RECORD'}
                </span>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--teal)', margin: '4px 0 0 0' }}>
                  Appointment #{appointment.appointmentNumber}
                </h3>
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
                <span>Schedule Date &amp; Time</span>
                <strong>{appointment.appointmentDate} at {appointment.appointmentTime}</strong>
              </div>

              <div className="receipt-item">
                <span>Recorded By Staff</span>
                <strong>{appointment.staffUsername || 'Clinic Staff'} (User #{appointment.staffId})</strong>
              </div>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              {isPatient ? (
                <div style={{ padding: '12px 18px', background: '#e0f2fe', border: '1px solid #7dd3fc', borderRadius: '8px', fontSize: '0.85rem', color: '#0369a1', width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircleIcon size={18} color="#0369a1" />
                  <span><strong>Patient Policy:</strong> Please arrive 10 minutes prior to your scheduled time at Sunrise Dental Clinic. Treatment payments and official invoice receipts are finalized at the reception checkout desk following procedure completion.</span>
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
        </div>
      )}
    </div>
  );
}
