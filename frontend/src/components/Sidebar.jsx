import React from 'react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: user.role === 'DOCTOR' ? 'Clinical Dashboard' : 'Dashboard', icon: user.role === 'DOCTOR' ? '🩺' : '📊', roles: ['ADMIN', 'STAFF', 'DOCTOR'] },
    { id: 'users', label: 'User Management', icon: '👥', roles: ['ADMIN'] },
    { id: 'register', label: 'Register Appointment', icon: '📝', roles: ['ADMIN', 'STAFF'] },
    { id: 'search', label: 'Search Appointments', icon: '🔍', roles: ['ADMIN', 'STAFF', 'DOCTOR', 'PATIENT'] },
    { id: 'billing', label: 'Calculate & Print Bill', icon: '💳', roles: ['ADMIN', 'STAFF'] },
    { id: 'help', label: user.role === 'DOCTOR' ? 'Doctor Clinical Guide' : user.role === 'PATIENT' ? 'Patient Help Guide' : 'Help & Staff Guide', icon: '❓', roles: ['ADMIN', 'STAFF', 'DOCTOR', 'PATIENT'] }
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  const formatRoleLabel = (role) => {
    switch (role) {
      case 'DOCTOR': return 'Dentist (Doctor)';
      case 'STAFF': return 'Staff (Reception)';
      case 'ADMIN': return 'Administrator';
      case 'PATIENT': return 'Patient';
      default: return role;
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">🦷</div>
        <div className="logo-text">
          <h2>Sunrise Dental</h2>
          <span>Colombo Clinic</span>
        </div>
      </div>

      <nav className="nav-menu">
        {filteredMenu.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-info">
            <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <h4>{user.username}</h4>
              <span>{formatRoleLabel(user.role)}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={onLogout} title="Logout">
            Exit
          </button>
        </div>
      </div>
    </aside>
  );
}
