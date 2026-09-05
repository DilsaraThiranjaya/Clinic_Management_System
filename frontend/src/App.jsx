import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import PatientsManagement from './components/PatientsManagement';
import RegisterAppointment from './components/RegisterAppointment';
import SearchAppointment from './components/SearchAppointment';
import Billing from './components/Billing';
import Help from './components/Help';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('clinic_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('clinic_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        return u.role === 'PATIENT' ? 'search' : 'dashboard';
      } catch (e) {
        return 'dashboard';
      }
    }
    return 'dashboard';
  });
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [selectedPatientForBooking, setSelectedPatientForBooking] = useState(null);

  useEffect(() => {
    const handleAuthChange = () => {
      const saved = localStorage.getItem('clinic_user');
      if (saved) {
        const u = JSON.parse(saved);
        setUser(u);
        if (u.role === 'PATIENT' && activeTab === 'dashboard') {
          setActiveTab('search');
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener('auth_change', handleAuthChange);
    return () => window.removeEventListener('auth_change', handleAuthChange);
  }, [activeTab]);

  const handleLoginSuccess = (authData) => {
    const userData = {
      id: authData.id,
      username: authData.username,
      role: authData.role,
      patientId: authData.patientId,
      fullName: authData.fullName
    };
    setUser(userData);
    localStorage.setItem('clinic_user', JSON.stringify(userData));
    setActiveTab(authData.role === 'PATIENT' ? 'search' : 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('clinic_jwt_token');
    localStorage.removeItem('clinic_user');
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      <div className="main-wrapper">
        <header className="top-bar no-print">
          <div className="top-bar-title">
            <h1>
              {activeTab === 'dashboard' && (user.role === 'DOCTOR' ? 'Doctor Clinical Dashboard' : user.role === 'ADMIN' ? 'Clinic Administration Overview' : 'Front-Desk Reception Dashboard')}
              {activeTab === 'users' && 'User & Staff Management'}
              {activeTab === 'patients' && (user.role === 'ADMIN' ? 'Clinic Patients Directory & Governance' : 'Reception Patients Directory & Intake')}
              {activeTab === 'register' && (user.role === 'ADMIN' ? 'Schedule Clinic Appointment (Admin)' : 'Front-Desk Appointment Booking')}
              {activeTab === 'search' && (user.role === 'PATIENT' ? 'My Scheduled Appointments' : user.role === 'DOCTOR' ? 'My Clinical Consultations' : user.role === 'ADMIN' ? 'Clinic Master Appointment Lookup' : 'Reception Appointment Lookup')}
              {activeTab === 'billing' && (user.role === 'ADMIN' ? 'Billing Oversight & Patient Invoices' : 'Cashier Billing & Patient Receipts')}
              {activeTab === 'help' && (user.role === 'DOCTOR' ? 'Doctor Clinical SOP & Guidelines' : user.role === 'PATIENT' ? 'Patient Self-Service Guide' : user.role === 'ADMIN' ? 'Administrator Operational SOP & Guide' : 'Reception Staff SOP & Documentation')}
            </h1>
          </div>
        </header>

        <main className="content-area">
          {activeTab === 'dashboard' && (
            <Dashboard
              user={user}
              setActiveTab={setActiveTab}
              onSelectAppointment={(id) => setSelectedAppointmentId(id)}
            />
          )}

          {activeTab === 'users' && user.role === 'ADMIN' && (
            <UserManagement />
          )}

          {activeTab === 'patients' && (user.role === 'ADMIN' || user.role === 'STAFF') && (
            <PatientsManagement
              user={user}
              onBookForPatient={(patient) => {
                setSelectedPatientForBooking(patient);
                setActiveTab('register');
              }}
            />
          )}

          {activeTab === 'register' && (
            <RegisterAppointment
              user={user}
              setActiveTab={setActiveTab}
              preselectedPatient={selectedPatientForBooking}
              onClearPreselectedPatient={() => setSelectedPatientForBooking(null)}
              onAppointmentCreated={(id) => {
                setSelectedAppointmentId(id);
                setSelectedPatientForBooking(null);
              }}
            />
          )}

          {activeTab === 'search' && (
            <SearchAppointment
              user={user}
              selectedId={selectedAppointmentId}
              setActiveTab={setActiveTab}
              onSelectAppointment={(id) => setSelectedAppointmentId(id)}
            />
          )}

          {activeTab === 'billing' && (
            <Billing user={user} selectedId={selectedAppointmentId} />
          )}

          {activeTab === 'help' && (
            <Help user={user} setActiveTab={setActiveTab} />
          )}
        </main>
      </div>
    </div>
  );
}

