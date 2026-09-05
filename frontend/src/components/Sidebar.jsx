import React from 'react';
import {
  ClinicLogo,
  DashboardIcon,
  StethoscopeIcon,
  UsersIcon,
  UserCheckIcon,
  CalendarPlusIcon,
  SearchIcon,
  CreditCardIcon,
  HelpCircleIcon
} from './Icons';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const menuItems = [
    {
      id: 'dashboard',
      label: user.role === 'DOCTOR' ? 'Clinical Dashboard' : user.role === 'ADMIN' ? 'Admin Overview' : 'Reception Queue',
      icon: user.role === 'DOCTOR' ? <StethoscopeIcon size={19} /> : <DashboardIcon size={19} />,
      roles: ['ADMIN', 'STAFF', 'DOCTOR']
    },
    {
      id: 'users',
      label: 'Staff & Accounts',
      icon: <UsersIcon size={19} />,
      roles: ['ADMIN']
    },
    {
      id: 'patients',
      label: 'Patients Directory',
      icon: <UserCheckIcon size={19} />,
      roles: ['ADMIN', 'STAFF']
    },
    {
      id: 'register',
      label: user.role === 'ADMIN' ? 'Schedule Appointment' : 'Book Appointment',
      icon: <CalendarPlusIcon size={19} />,
      roles: ['ADMIN', 'STAFF']
    },
    {
      id: 'search',
      label: user.role === 'PATIENT' ? 'My Appointments' : user.role === 'DOCTOR' ? 'My Consultations' : 'Appointment Lookup',
      icon: <SearchIcon size={19} />,
      roles: ['ADMIN', 'STAFF', 'DOCTOR', 'PATIENT']
    },
    {
      id: 'billing',
      label: user.role === 'ADMIN' ? 'Invoices & Billing' : 'Cashier & Billing',
      icon: <CreditCardIcon size={19} />,
      roles: ['ADMIN', 'STAFF']
    },
    {
      id: 'help',
      label: user.role === 'DOCTOR' ? 'Clinical Guidelines' : user.role === 'PATIENT' ? 'Patient Guide' : user.role === 'ADMIN' ? 'Admin SOP Guide' : 'Reception Guide',
      icon: <HelpCircleIcon size={19} />,
      roles: ['ADMIN', 'STAFF', 'DOCTOR', 'PATIENT']
    }
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
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ClinicLogo size={36} />
        <div className="logo-text">
          <h2 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>Sunrise Dental</h2>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Clinical Management</span>
        </div>
      </div>

      <nav className="nav-menu">
        {filteredMenu.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-info">
            <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <h4>{user.fullName || user.username}</h4>
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
