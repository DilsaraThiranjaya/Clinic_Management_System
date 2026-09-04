import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

export default function Dashboard({ user, setActiveTab, onSelectAppointment }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dentistFilter, setDentistFilter] = useState('ALL');
  const [completedAppts, setCompletedAppts] = useState(new Set());
  const [clinicalNotes, setClinicalNotes] = useState({});
  const [activeNoteModal, setActiveNoteModal] = useState(null);
  const [noteInput, setNoteInput] = useState('');

  const isDoctor = user?.role === 'DOCTOR';
  // Default doctor persona linked to Dr. Samantha Fernando
  const doctorName = user?.doctorName || 'Dr. Samantha Fernando';

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data || []);
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = (apptNum) => {
    setCompletedAppts(prev => {
      const next = new Set(prev);
      if (next.has(apptNum)) {
        next.delete(apptNum);
      } else {
        next.add(apptNum);
      }
      return next;
    });
  };

  const openNoteModal = (appt) => {
    setActiveNoteModal(appt);
    setNoteInput(clinicalNotes[appt.appointmentNumber] || '');
  };

  const saveNote = () => {
    if (activeNoteModal) {
      setClinicalNotes(prev => ({
        ...prev,
        [activeNoteModal.appointmentNumber]: noteInput
      }));
      setActiveNoteModal(null);
      setNoteInput('');
    }
  };

  // Filter appointments for Doctor view
  const doctorAppointments = useMemo(() => {
    if (!isDoctor) return appointments;
    if (dentistFilter === 'ALL') {
      return appointments;
    }
    return appointments.filter(a =>
      a.dentistName?.toLowerCase().includes(dentistFilter.toLowerCase())
    );
  }, [appointments, isDoctor, dentistFilter]);

  // Doctor Specific KPIs
  const myAppointments = useMemo(() => {
    return appointments.filter(a =>
      a.dentistName?.toLowerCase().includes('samantha') ||
      a.dentistName?.toLowerCase().includes(user?.username?.toLowerCase() || '')
    );
  }, [appointments, user]);

  if (isDoctor) {

    return (
      <div>
        {/* Doctor Clinical Header Card */}
        <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)', border: '1px solid #99f6e4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488, #0284c7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: '#fff', boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
              }}>
                🩺
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem' }}>{doctorName}</h2>
                  <span className="badge badge-teal">Attending Dental Surgeon</span>
                </div>
                <p style={{ margin: '4px 0 0 0', color: '#475569', fontSize: '0.9rem' }}>
                  Chairside Operatory #01 &bull; Active Clinical Duty &bull; {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                className="btn btn-secondary"
                style={{ background: '#fff', fontSize: '0.85rem' }}
                onClick={() => setActiveTab('help')}
              >
                📖 Clinical SOP Guide
              </button>
            </div>
          </div>
        </div>

        {/* Doctor Specific KPIs */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon teal">🩺</div>
            <div className="stat-info">
              <h3>{myAppointments.length > 0 ? myAppointments.length : appointments.length}</h3>
              <p>My Assigned Consultations</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">👥</div>
            <div className="stat-info">
              <h3>{new Set((myAppointments.length > 0 ? myAppointments : appointments).map(a => a.patientId)).size}</h3>
              <p>Active Clinical Patients</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon amber">⏳</div>
            <div className="stat-info">
              <h3>{(myAppointments.length > 0 ? myAppointments : appointments).filter(a => !completedAppts.has(a.appointmentNumber)).length}</h3>
              <p>Pending Chairside Procedures</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div className="stat-info">
              <h3>{completedAppts.size}</h3>
              <p>Completed Treatments</p>
            </div>
          </div>
        </div>

        {/* Doctor's Patient Queue & Schedule */}
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2>Doctor's Clinical Schedule &amp; Patient Queue</h2>
              <p className="card-subtitle">Examine patient treatment requirements, record clinical observations, and track completion</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Filter Schedule:</label>
              <select
                className="form-select"
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                value={dentistFilter}
                onChange={(e) => setDentistFilter(e.target.value)}
              >
                <option value="ALL">All Clinic Doctors ({appointments.length})</option>
                <option value="Samantha">Dr. Samantha Fernando (My Patients)</option>
                <option value="Kasun">Dr. Kasun Jayawardena (Orthodontics)</option>
                <option value="Niluka">Dr. Niluka Perera (Endodontics)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p style={{ color: '#64748b', padding: '20px' }}>Loading clinical schedule...</p>
          ) : doctorAppointments.length === 0 ? (
            <p style={{ color: '#64748b', padding: '20px 0' }}>No consultations scheduled for this doctor selection.</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Appt #</th>
                    <th>Patient Demographics</th>
                    <th>Contact</th>
                    <th>Attending Dentist</th>
                    <th>Required Treatment</th>
                    <th>Schedule Time</th>
                    <th>Clinical Status</th>
                    <th>Doctor Clinical Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorAppointments.map(apt => {
                    const isDone = completedAppts.has(apt.appointmentNumber);
                    const note = clinicalNotes[apt.appointmentNumber];

                    return (
                      <tr key={apt.appointmentNumber} style={{ background: isDone ? '#f0fdf4' : 'inherit' }}>
                        <td><strong>#{apt.appointmentNumber}</strong></td>
                        <td>
                          <div>
                            <strong>{apt.patientName}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Patient ID: #{apt.patientId}</div>
                          </div>
                        </td>
                        <td>{apt.contactNumber}</td>
                        <td>
                          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0d9488' }}>
                            {apt.dentistName}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-teal">{apt.treatmentType}</span>
                        </td>
                        <td>
                          <div>{apt.appointmentDate}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{apt.appointmentTime}</div>
                        </td>
                        <td>
                          {isDone ? (
                            <span className="badge" style={{ background: '#dcfce7', color: '#15803d' }}>
                              Completed
                            </span>
                          ) : (
                            <span className="badge" style={{ background: '#fef3c7', color: '#b45309' }}>
                              In Queue
                            </span>
                          )}
                          {note && (
                            <div style={{ fontSize: '0.72rem', color: '#0369a1', marginTop: '4px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={note}>
                              📝 {note}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                              onClick={() => {
                                onSelectAppointment(apt.appointmentNumber);
                                setActiveTab('search');
                              }}
                              title="Examine Patient Record"
                            >
                              🔍 View
                            </button>

                            <button
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                              onClick={() => openNoteModal(apt)}
                              title="Add Chairside Notes"
                            >
                              📝 Notes
                            </button>

                            <button
                              className={`btn ${isDone ? 'btn-secondary' : 'btn-primary'}`}
                              style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                              onClick={() => toggleComplete(apt.appointmentNumber)}
                            >
                              {isDone ? 'Undo' : '✓ Done'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Clinical Handoff Notice */}
          <div style={{ marginTop: '20px', padding: '14px 18px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.4rem' }}>ℹ️</span>
            <div style={{ fontSize: '0.82rem', color: '#475569' }}>
              <strong>Clinical Handoff &amp; Billing Protocol:</strong> Official treatment invoices and billing calculations are performed exclusively by front-desk reception staff upon patient checkout. Doctors do not handle financial payments or receipt generation.
            </div>
          </div>
        </div>

        {/* Modal for Doctor Clinical Notes */}
        {activeNoteModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
          }}>
            <div className="card" style={{ width: '100%', maxWidth: '480px', margin: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
              <div className="card-header">
                <div>
                  <h3>Chairside Clinical Notes</h3>
                  <p className="card-subtitle">Appointment #{activeNoteModal.appointmentNumber} &bull; {activeNoteModal.patientName}</p>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Treatment: {activeNoteModal.treatmentType}</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Record tooth quadrant, findings, anesthesia, materials, post-op instructions..."
                  style={{ width: '100%', resize: 'vertical' }}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveNoteModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={saveNote}
                >
                  Save Clinical Note
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (

    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📅</div>
          <div className="stat-info">
            <h3>{appointments.length}</h3>
            <p>Total Appointments</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teal">👥</div>
          <div className="stat-info">
            <h3>{new Set(appointments.map(a => a.patientId)).size}</h3>
            <p>Registered Patients</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">🦷</div>
          <div className="stat-info">
            <h3>6</h3>
            <p>Active Treatments</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">💰</div>
          <div className="stat-info">
            <h3>LKR 1,500</h3>
            <p>Base Consultation Fee</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2>Scheduled Appointments</h2>
            <p className="card-subtitle">Real-time view of patient appointments</p>
          </div>
          <button className="btn btn-primary" onClick={() => setActiveTab('register')}>
            + New Appointment
          </button>
        </div>

        {loading ? (
          <p style={{ color: '#64748b' }}>Loading appointment records...</p>
        ) : appointments.length === 0 ? (
          <p style={{ color: '#64748b', padding: '20px 0' }}>No appointments registered yet. Click "New Appointment" to create one.</p>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Appt #</th>
                  <th>Patient Name</th>
                  <th>Contact</th>
                  <th>Dentist</th>
                  <th>Treatment</th>
                  <th>Date &amp; Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(apt => (
                  <tr key={apt.appointmentNumber}>
                    <td><strong>#{apt.appointmentNumber}</strong></td>
                    <td>{apt.patientName}</td>
                    <td>{apt.contactNumber}</td>
                    <td>{apt.dentistName}</td>
                    <td><span className="badge badge-teal">{apt.treatmentType}</span></td>
                    <td>{apt.appointmentDate} at {apt.appointmentTime}</td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '0.8rem', marginRight: '6px' }}
                        onClick={() => {
                          onSelectAppointment(apt.appointmentNumber);
                          setActiveTab('search');
                        }}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                        onClick={() => {
                          onSelectAppointment(apt.appointmentNumber);
                          setActiveTab('billing');
                        }}
                      >
                        Bill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

