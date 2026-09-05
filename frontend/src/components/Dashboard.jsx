import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import {
  StethoscopeIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarPlusIcon,
  ToothIcon,
  BanknotesIcon,
  SearchIcon,
  FileTextIcon,
  CheckIcon,
  AlertCircleIcon,
  PlusIcon
} from './Icons';

export default function Dashboard({ user, setActiveTab, onSelectAppointment }) {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [treatmentsCount, setTreatmentsCount] = useState(6);
  const [loading, setLoading] = useState(true);

  // Doctor state
  const [completedAppts, setCompletedAppts] = useState(new Set());
  const [clinicalNotes, setClinicalNotes] = useState({});
  const [activeNoteModal, setActiveNoteModal] = useState(null);
  const [noteInput, setNoteInput] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorStatusFilter, setDoctorStatusFilter] = useState('ALL');

  // Admin state (strictly decoupled from Staff)
  const [adminDoctorFilter, setAdminDoctorFilter] = useState('ALL');
  const [adminDateFilter, setAdminDateFilter] = useState('ALL');
  const [adminSearch, setAdminSearch] = useState('');

  // Staff state (strictly decoupled from Admin)
  const [staffSearch, setStaffSearch] = useState('');
  const [staffFilter, setStaffFilter] = useState('TODAY');
  const [checkedInAppts, setCheckedInAppts] = useState(new Set());

  const isDoctor = user?.role === 'DOCTOR';
  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'STAFF';
  const doctorDisplayName = user?.fullName || (user?.username ? (user.username.toLowerCase().startsWith('dr') ? user.username.replace(/_/g, ' ') : 'Dr. ' + user.username.replace(/_/g, ' ')) : 'Dr. Samantha Fernando');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [apptRes, docRes, treatRes] = await Promise.allSettled([
        api.get('/appointments'),
        api.get('/users/doctors'),
        api.get('/treatments')
      ]);

      if (apptRes.status === 'fulfilled') {
        setAppointments(apptRes.value.data || []);
      }
      if (docRes.status === 'fulfilled' && Array.isArray(docRes.value.data)) {
        setDoctors(docRes.value.data);
      }
      if (treatRes.status === 'fulfilled' && Array.isArray(treatRes.value.data)) {
        setTreatmentsCount(treatRes.value.data.length);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
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

  // Doctor name normalization helper
  const normalizeDocName = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/^dr\.?\s*/i, '') // strip leading Dr. or Dr
      .replace(/[^a-z0-9]/g, ' ') // replace underscores, hyphens, punctuation with space
      .trim();
  };

  // Strictly filter appointments assigned to the logged-in doctor
  const myAppointments = useMemo(() => {
    if (!isDoctor) return appointments;

    const rawTerms = [
      user?.fullName,
      user?.username,
      doctorDisplayName
    ].filter(Boolean);

    const normTerms = rawTerms.map(normalizeDocName).filter(Boolean);
    const wordTokens = normTerms.flatMap(t => t.split(/\s+/).filter(w => w.length >= 3));

    return appointments.filter(a => {
      const docNorm = normalizeDocName(a.dentistName);
      if (!docNorm) return false;
      // Direct substring match
      if (normTerms.some(t => docNorm === t || docNorm.includes(t) || t.includes(docNorm))) {
        return true;
      }
      // Word token match (e.g. "nimal", "perera")
      if (wordTokens.length > 0 && wordTokens.some(w => docNorm.includes(w))) {
        return true;
      }
      return false;
    });
  }, [appointments, user, doctorDisplayName, isDoctor]);

  // Doctor's filtered patient queue
  const filteredDoctorAppointments = useMemo(() => {
    return myAppointments.filter(apt => {
      const isDone = completedAppts.has(apt.appointmentNumber);
      if (doctorStatusFilter === 'PENDING' && isDone) return false;
      if (doctorStatusFilter === 'COMPLETED' && !isDone) return false;

      if (!doctorSearch.trim()) return true;
      const term = doctorSearch.toLowerCase().trim();
      return (
        String(apt.appointmentNumber).includes(term) ||
        (apt.patientName && apt.patientName.toLowerCase().includes(term)) ||
        (apt.contactNumber && apt.contactNumber.toLowerCase().includes(term)) ||
        (apt.treatmentType && apt.treatmentType.toLowerCase().includes(term))
      );
    });
  }, [myAppointments, doctorStatusFilter, doctorSearch, completedAppts]);

  // Admin filtered appointments (Clinic-wide master schedule)
  const filteredAdminAppointments = useMemo(() => {
    if (!isAdmin) return [];
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => {
      // Attending Doctor filter
      if (adminDoctorFilter !== 'ALL') {
        const dNorm = normalizeDocName(apt.dentistName);
        const fNorm = normalizeDocName(adminDoctorFilter);
        if (!dNorm.includes(fNorm) && !fNorm.includes(dNorm)) return false;
      }
      // Date filter
      if (adminDateFilter === 'TODAY' && apt.appointmentDate !== today) return false;
      if (adminDateFilter === 'UPCOMING' && apt.appointmentDate < today) return false;
      // Search term
      if (adminSearch.trim()) {
        const term = adminSearch.toLowerCase().trim();
        const matches =
          String(apt.appointmentNumber).includes(term) ||
          (apt.patientName && apt.patientName.toLowerCase().includes(term)) ||
          (apt.contactNumber && apt.contactNumber.toLowerCase().includes(term)) ||
          (apt.dentistName && apt.dentistName.toLowerCase().includes(term)) ||
          (apt.treatmentType && apt.treatmentType.toLowerCase().includes(term)) ||
          (apt.username && apt.username.toLowerCase().includes(term));
        if (!matches) return false;
      }
      return true;
    });
  }, [appointments, adminDoctorFilter, adminDateFilter, adminSearch, isAdmin]);

  // Staff filtered appointments (Front-Desk Day Queue)
  const filteredStaffAppointments = useMemo(() => {
    if (!isStaff) return appointments;
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => {
      if (staffFilter === 'TODAY' && apt.appointmentDate !== today) return false;
      if (staffSearch.trim()) {
        const term = staffSearch.toLowerCase().trim();
        const matches =
          String(apt.appointmentNumber).includes(term) ||
          (apt.patientName && apt.patientName.toLowerCase().includes(term)) ||
          (apt.contactNumber && apt.contactNumber.toLowerCase().includes(term)) ||
          (apt.dentistName && apt.dentistName.toLowerCase().includes(term)) ||
          (apt.treatmentType && apt.treatmentType.toLowerCase().includes(term));
        if (!matches) return false;
      }
      return true;
    });
  }, [appointments, staffFilter, staffSearch, isStaff]);

  const toggleCheckIn = (apptNum) => {
    setCheckedInAppts(prev => {
      const next = new Set(prev);
      if (next.has(apptNum)) {
        next.delete(apptNum);
      } else {
        next.add(apptNum);
      }
      return next;
    });
  };

  if (isDoctor) {
    return (
      <div>
        {/* Doctor Clinical Header Card */}
        <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)', border: '1px solid #99f6e4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488, #0284c7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
              }}>
                <StethoscopeIcon size={28} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem' }}>{doctorDisplayName}</h2>
                  <span className="badge badge-teal">Attending Dental Surgeon</span>
                </div>
                <p style={{ margin: '4px 0 0 0', color: '#475569', fontSize: '0.9rem' }}>
                  Chairside Operatory &bull; Active Clinical Duty &bull; {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                className="btn btn-secondary"
                style={{ background: '#fff', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setActiveTab('help')}
              >
                <FileTextIcon size={16} /> Clinical SOP Guide
              </button>
            </div>
          </div>
        </div>

        {/* Doctor Specific KPIs - strictly for this doctor */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon teal">
              <StethoscopeIcon size={24} color="#0d9488" />
            </div>
            <div className="stat-info">
              <h3>{myAppointments.length}</h3>
              <p>My Assigned Consultations</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <UsersIcon size={24} color="#0284c7" />
            </div>
            <div className="stat-info">
              <h3>{new Set(myAppointments.map(a => a.patientId)).size}</h3>
              <p>Active Clinical Patients</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon amber">
              <ClockIcon size={24} color="#d97706" />
            </div>
            <div className="stat-info">
              <h3>{myAppointments.filter(a => !completedAppts.has(a.appointmentNumber)).length}</h3>
              <p>Pending Chairside Procedures</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <CheckCircleIcon size={24} color="#16a34a" />
            </div>
            <div className="stat-info">
              <h3>{myAppointments.filter(a => completedAppts.has(a.appointmentNumber)).length}</h3>
              <p>Completed Treatments</p>
            </div>
          </div>
        </div>

        {/* Doctor's Patient Queue & Schedule */}
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2>My Assigned Consultations &amp; Patient Queue</h2>
              <p className="card-subtitle">Chairside dental procedures assigned specifically to {doctorDisplayName}</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
                  placeholder="Search my patients..."
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                />
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <SearchIcon size={14} color="#94a3b8" />
                </span>
              </div>

              <select
                className="form-select"
                style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto' }}
                value={doctorStatusFilter}
                onChange={(e) => setDoctorStatusFilter(e.target.value)}
              >
                <option value="ALL">All My Patients ({myAppointments.length})</option>
                <option value="PENDING">Pending Chairside ({myAppointments.filter(a => !completedAppts.has(a.appointmentNumber)).length})</option>
                <option value="COMPLETED">Completed ({myAppointments.filter(a => completedAppts.has(a.appointmentNumber)).length})</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p style={{ color: '#64748b', padding: '20px' }}>Loading your clinical schedule...</p>
          ) : myAppointments.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b' }}>
              <StethoscopeIcon size={42} color="#94a3b8" style={{ marginBottom: '10px' }} />
              <h3 style={{ margin: '0 0 6px 0', color: '#334155' }}>No Consultations Assigned Yet</h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                There are currently no patient consultations scheduled under your care ({doctorDisplayName}). Clinic staff will assign patients to your chairside queue when bookings are made.
              </p>
            </div>
          ) : filteredDoctorAppointments.length === 0 ? (
            <p style={{ color: '#64748b', padding: '20px 0' }}>No consultations match your search criteria.</p>
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
                  {filteredDoctorAppointments.map(apt => {
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
                              {note}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => {
                                onSelectAppointment(apt.appointmentNumber);
                                setActiveTab('search');
                              }}
                              title="Examine Patient Record"
                            >
                              <SearchIcon size={13} /> View
                            </button>

                            <button
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => openNoteModal(apt)}
                              title="Add Chairside Notes"
                            >
                              <FileTextIcon size={13} /> Notes
                            </button>

                            <button
                              className={`btn ${isDone ? 'btn-secondary' : 'btn-primary'}`}
                              style={{ padding: '4px 8px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => toggleComplete(apt.appointmentNumber)}
                            >
                              {isDone ? 'Undo' : <><CheckIcon size={13} /> Done</>}
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
            <AlertCircleIcon size={20} color="#0284c7" />
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

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = appointments.filter(a => a.appointmentDate === todayStr).length;

  // =========================================================================
  // ADMIN VIEW: Clinic-Wide Master Schedule & Administrative Oversight
  // =========================================================================
  if (isAdmin) {
    return (
      <div>
        {/* Admin Header Card */}
        <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #f8fafc 0%, #ede9fe 100%)', border: '1px solid #ddd6fe' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="badge" style={{ background: '#7c3aed', color: '#fff', marginBottom: '6px' }}>
                Administrator Portal
              </span>
              <h2 style={{ margin: '4px 0 0 0', color: '#1e1b4b' }}>Clinic Administration &amp; Master Schedule</h2>
              <p style={{ margin: '4px 0 0 0', color: '#6b21a8', fontSize: '0.88rem' }}>
                Clinic-wide operations oversight, doctor schedules, staff audit logs, and service metrics
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="btn btn-primary" onClick={() => setActiveTab('register')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <PlusIcon size={16} /> Book Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Admin KPI Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <CalendarPlusIcon size={24} color="#0284c7" />
            </div>
            <div className="stat-info">
              <h3>{appointments.length}</h3>
              <p>Total Consultations</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon teal">
              <UsersIcon size={24} color="#0d9488" />
            </div>
            <div className="stat-info">
              <h3>{new Set(appointments.map(a => a.patientId)).size}</h3>
              <p>Registered Patients</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon amber">
              <StethoscopeIcon size={24} color="#d97706" />
            </div>
            <div className="stat-info">
              <h3>{doctors.length}</h3>
              <p>Active Dental Surgeons</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <ToothIcon size={24} color="#16a34a" />
            </div>
            <div className="stat-info">
              <h3>{treatmentsCount}</h3>
              <p>Clinical Treatments</p>
            </div>
          </div>
        </div>

        {/* Admin Master Appointment Schedule Card */}
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2>Clinic Master Appointment Schedule</h2>
              <p className="card-subtitle">Complete schedule records across all doctors, treatments, and receptionists</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => setActiveTab('register')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <PlusIcon size={16} /> Schedule Appointment
              </button>
            </div>
          </div>

          {/* Admin Schedule Filters (Decoupled from Staff) */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div className="search-input-wrap" style={{ flex: 1, minWidth: '220px' }}>
              <span className="search-input-icon">
                <SearchIcon size={16} color="#64748b" />
              </span>
              <input
                type="text"
                className="form-input"
                placeholder="Filter by patient, phone, dentist, or #..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: '600', whiteSpace: 'nowrap' }}>Doctor:</label>
              <select
                className="form-select"
                style={{ minWidth: '180px', padding: '7px 10px', fontSize: '0.85rem' }}
                value={adminDoctorFilter}
                onChange={(e) => setAdminDoctorFilter(e.target.value)}
              >
                <option value="ALL">All Attending Doctors ({doctors.length})</option>
                {doctors.map(d => {
                  const docName = d.fullName || (d.username?.toLowerCase().startsWith('dr') ? d.username : 'Dr. ' + d.username);
                  return (
                    <option key={d.id || d.username} value={docName}>{docName}</option>
                  );
                })}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: '600', whiteSpace: 'nowrap' }}>Date:</label>
              <select
                className="form-select"
                style={{ minWidth: '150px', padding: '7px 10px', fontSize: '0.85rem' }}
                value={adminDateFilter}
                onChange={(e) => setAdminDateFilter(e.target.value)}
              >
                <option value="ALL">All Scheduled Dates</option>
                <option value="TODAY">Today's Consultations ({todayCount})</option>
                <option value="UPCOMING">Upcoming Visits</option>
              </select>
            </div>

            {(adminSearch || adminDoctorFilter !== 'ALL' || adminDateFilter !== 'ALL') && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                onClick={() => {
                  setAdminSearch('');
                  setAdminDoctorFilter('ALL');
                  setAdminDateFilter('ALL');
                }}
              >
                Reset Filters
              </button>
            )}
          </div>

          <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px', fontWeight: '500' }}>
            Showing {filteredAdminAppointments.length} of {appointments.length} total clinic appointments
          </div>

          {loading ? (
            <p style={{ color: '#64748b' }}>Loading appointment records...</p>
          ) : filteredAdminAppointments.length === 0 ? (
            <p style={{ color: '#64748b', padding: '24px 0', textAlign: 'center' }}>
              No appointments found matching the selected administrative filters.
            </p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Appt #</th>
                    <th>Patient Name</th>
                    <th>Contact</th>
                    <th>Attending Dentist</th>
                    <th>Clinical Treatment</th>
                    <th>Scheduled Date &amp; Time</th>
                    <th>Booked By</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdminAppointments.map(apt => (
                    <tr key={apt.appointmentNumber}>
                      <td><strong>#{apt.appointmentNumber}</strong></td>
                      <td>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{apt.patientName}</div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ID #{apt.patientId}</span>
                      </td>
                      <td>{apt.contactNumber}</td>
                      <td>
                        <span style={{ color: '#0d9488', fontWeight: '600' }}>{apt.dentistName}</span>
                      </td>
                      <td><span className="badge badge-teal">{apt.treatmentType}</span></td>
                      <td>
                        <div>{apt.appointmentDate}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{apt.appointmentTime}</div>
                      </td>
                      <td>
                        <span className="badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.78rem' }}>
                          {apt.username || 'System Staff'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.8rem', marginRight: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => {
                            onSelectAppointment(apt.appointmentNumber);
                            setActiveTab('search');
                          }}
                        >
                          <SearchIcon size={12} /> View
                        </button>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
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

  // =========================================================================
  // STAFF VIEW: Front-Desk Reception Day Queue & Cashier Checkout Handoff
  // =========================================================================
  return (
    <div>
      {/* Staff Reception Header Card */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)', border: '1px solid #99f6e4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-teal" style={{ marginBottom: '6px' }}>
              Front-Desk Reception
            </span>
            <h2 style={{ margin: '4px 0 0 0', color: '#0f172a' }}>Reception Day Schedule &amp; Patient Queue</h2>
            <p style={{ margin: '4px 0 0 0', color: '#475569', fontSize: '0.88rem' }}>
              Real-time patient intake, arrival check-in, doctor handoff, and cashier billing checkout
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={() => setActiveTab('register')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <PlusIcon size={16} /> New Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Staff Reception KPIs */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon teal">
            <ClockIcon size={24} color="#0d9488" />
          </div>
          <div className="stat-info">
            <h3>{todayCount}</h3>
            <p>Today's Scheduled Patients</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <CalendarPlusIcon size={24} color="#0284c7" />
          </div>
          <div className="stat-info">
            <h3>{appointments.length}</h3>
            <p>Total Booked Appointments</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <UsersIcon size={24} color="#d97706" />
          </div>
          <div className="stat-info">
            <h3>{new Set(appointments.map(a => a.patientId)).size}</h3>
            <p>Registered Clinic Patients</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <BanknotesIcon size={24} color="#16a34a" />
          </div>
          <div className="stat-info">
            <h3>LKR 1,500</h3>
            <p>Standard Consultation Base</p>
          </div>
        </div>
      </div>

      {/* Staff Reception Patient Queue Table */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2>Reception Patient Queue</h2>
            <p className="card-subtitle">Manage patient arrivals, check-ins, and direct to surgery or billing cashier</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={() => setActiveTab('register')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <PlusIcon size={16} /> Book Patient Appointment
            </button>
          </div>
        </div>

        {/* Staff Reception Queue Controls (Decoupled from Admin) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div className="search-input-wrap" style={{ flex: 1, minWidth: '240px' }}>
            <span className="search-input-icon">
              <SearchIcon size={16} color="#64748b" />
            </span>
            <input
              type="text"
              className="form-input"
              placeholder="Search arriving patient by name, mobile, or #..."
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`btn ${staffFilter === 'TODAY' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              onClick={() => setStaffFilter('TODAY')}
            >
              Today's Arrivals ({todayCount})
            </button>
            <button
              type="button"
              className={`btn ${staffFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              onClick={() => setStaffFilter('ALL')}
            >
              All Scheduled ({appointments.length})
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#64748b' }}>Loading appointment queue...</p>
        ) : filteredStaffAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b' }}>
            <p style={{ margin: '0 0 10px 0' }}>
              {staffFilter === 'TODAY'
                ? "No appointments scheduled for today yet."
                : "No appointments match your search."}
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem' }}
              onClick={() => { setStaffSearch(''); setStaffFilter('ALL'); }}
            >
              View All Scheduled Appointments
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Appt #</th>
                  <th>Patient Name</th>
                  <th>Contact Number</th>
                  <th>Attending Dentist</th>
                  <th>Scheduled Treatment</th>
                  <th>Appointment Time</th>
                  <th>Reception Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaffAppointments.map(apt => {
                  const isCheckedIn = checkedInAppts.has(apt.appointmentNumber);
                  return (
                    <tr key={apt.appointmentNumber} style={{ background: isCheckedIn ? '#f0fdf4' : 'inherit' }}>
                      <td><strong>#{apt.appointmentNumber}</strong></td>
                      <td>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{apt.patientName}</div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ID #{apt.patientId}</span>
                      </td>
                      <td>{apt.contactNumber}</td>
                      <td>
                        <span style={{ color: '#0d9488', fontWeight: '600' }}>{apt.dentistName}</span>
                      </td>
                      <td><span className="badge badge-teal">{apt.treatmentType}</span></td>
                      <td>
                        <div>{apt.appointmentDate}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{apt.appointmentTime}</div>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => toggleCheckIn(apt.appointmentNumber)}
                          style={{
                            background: isCheckedIn ? '#dcfce7' : '#f1f5f9',
                            color: isCheckedIn ? '#15803d' : '#475569',
                            border: isCheckedIn ? '1px solid #86efac' : '1px solid #cbd5e1',
                            borderRadius: '20px',
                            padding: '3px 10px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {isCheckedIn ? '✓ Arrived & Waiting' : 'Mark Arrived'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.8rem', marginRight: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => {
                            onSelectAppointment(apt.appointmentNumber);
                            setActiveTab('search');
                          }}
                        >
                          <SearchIcon size={12} /> View
                        </button>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          onClick={() => {
                            onSelectAppointment(apt.appointmentNumber);
                            setActiveTab('billing');
                          }}
                        >
                          Bill &amp; Checkout
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
  );
}

