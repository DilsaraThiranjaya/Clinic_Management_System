import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard({ setActiveTab, onSelectAppointment }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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
                  <th>Date & Time</th>
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
