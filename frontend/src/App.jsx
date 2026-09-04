import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
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
      role: authData.role
    };
    setUser(userData);
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
              {activeTab === 'dashboard' && (user.role === 'DOCTOR' ? 'Doctor Clinical Dashboard' : 'Clinic Dashboard')}
              {activeTab === 'users' && 'User & Staff Management'}
              {activeTab === 'register' && 'Appointment Registration'}
              {activeTab === 'search' && (user.role === 'PATIENT' ? 'Patient Appointment Lookup' : 'Appointment Lookup')}
              {activeTab === 'billing' && 'Billing & Patient Receipts'}
              {activeTab === 'help' && (user.role === 'DOCTOR' ? 'Doctor Clinical SOP & Guidelines' : user.role === 'PATIENT' ? 'Patient Self-Service Guide' : 'Staff Help & Documentation')}
            </h1>
          </div>

          <div className="top-bar-right">
            <div className="status-badge">
              <span className="status-dot"></span>
              <span>Backend Connected (Spring Boot)</span>
            </div>
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

          {activeTab === 'register' && (
            <RegisterAppointment
              setActiveTab={setActiveTab}
              onAppointmentCreated={(id) => {
                setSelectedAppointmentId(id);
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
