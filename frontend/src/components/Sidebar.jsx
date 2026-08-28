import React from 'react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['ADMIN', 'STAFF'] },
    { id: 'register', label: 'Register Appointment', icon: '📝', roles: ['ADMIN', 'STAFF'] },
    { id: 'search', label: 'Search Appointments', icon: '🔍', roles: ['ADMIN', 'STAFF', 'PATIENT'] },
    { id: 'billing', label: 'Calculate & Print Bill', icon: '💳', roles: ['ADMIN', 'STAFF', 'PATIENT'] },
    { id: 'help', label: 'Help & Staff Guide', icon: '❓', roles: ['ADMIN', 'STAFF', 'PATIENT'] }
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

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
              <span>{user.role}</span>
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
