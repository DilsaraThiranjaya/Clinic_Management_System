import React, { useState } from 'react';

export default function Help({ user, setActiveTab }) {
  const currentRole = user?.role || 'STAFF';
  const [selectedRoleFilter, setSelectedRoleFilter] = useState(currentRole);
  const [openIndex, setOpenIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const guides = [
    // STAFF GUIDES
    {
      id: 'staff-1',
      role: 'STAFF',
      badge: 'Front-Desk SOP',
      title: '1. How to Register a New Patient & Schedule Appointment',
      summary: 'Complete workflow for onboarding patients and reserving dental chair slots with automated deduplication.',
      action: { tab: 'register', label: 'Open Registration' },
      steps: [
        'Navigate to "Register Appointment" on the left sidebar menu.',
        'Enter patient demographic details: Full Name, Residential Address, and a valid 10–15 digit Contact Number.',
        'Intelligent Deduplication: If the patient has visited before, the system automatically links to their existing patient record by contact number.',
        'Select the attending Dental Surgeon from the dropdown list.',
        'Choose the required Treatment Type (e.g., Teeth Cleaning, Root Canal, Orthodontics). The live fee estimate preview updates instantly.',
        'Select the desired Appointment Date and Time.',
        'Click "Confirm & Save Appointment". The system generates and displays a unique Appointment Number (e.g., #101).'
      ]
    },
    {
      id: 'staff-2',
      role: 'STAFF',
      badge: 'Front-Desk SOP',
      title: '2. How to Search & Retrieve Appointment Details',
      summary: 'Lookup existing appointments for patient check-in, verification, and schedule inspection.',
      action: { tab: 'search', label: 'Open Search' },
      steps: [
        'Navigate to "Search Appointments" on the left sidebar.',
        'Enter the unique Appointment Number provided to the patient.',
        'Click "Search Record" to retrieve full patient demographics, appointment schedule, treatment type, and registering staff info.',
        'Use the "Proceed to Generate & Print Bill" button to seamlessly transfer to the billing module.'
      ]
    },
    {
      id: 'staff-3',
      role: 'STAFF',
      badge: 'Front-Desk SOP',
      title: '3. How to Calculate Treatment Fees & Print Official Receipts',
      summary: 'Standard clinical billing calculations and producing print-ready patient invoice receipts.',
      action: { tab: 'billing', label: 'Open Billing' },
      steps: [
        'Navigate to "Calculate & Print Bill" on the sidebar.',
        'Enter the Appointment Number and click "Calculate & Generate".',
        'Formula Applied: Total Bill = Base Consultation Fee (LKR 1,500.00) + Treatment-Specific Tariff.',
        'Verify the itemized breakdown on the clinical invoice preview.',
        'Click "Print Patient Receipt" to trigger the browser print dialog or save as a PDF receipt for the patient.'
      ]
    },
    {
      id: 'staff-4',
      role: 'STAFF',
      badge: 'Pricing Reference',
      title: '4. Standard Clinical Treatment Pricing Tariff',
      summary: 'Deterministic price matrix for dental procedures administered at Sunrise Dental Clinic.',
      steps: [
        'Base Consultation Fee: LKR 1,500.00 (Standard for all clinical visits)',
        'Teeth Cleaning / Polishing: LKR 2,500.00 (Total: LKR 4,000.00)',
        'Dental Filling / Restoration: LKR 3,500.00 (Total: LKR 5,000.00)',
        'Tooth Extraction (Simple/Surgical): LKR 4,500.00 (Total: LKR 6,000.00)',
        'Teeth Whitening (Bleaching): LKR 8,000.00 (Total: LKR 9,500.00)',
        'Root Canal Treatment (Endodontic): LKR 15,000.00 (Total: LKR 16,500.00)',
        'Orthodontics / Dental Braces: LKR 45,000.00 (Total: LKR 46,500.00)'
      ]
    },
    {
      id: 'staff-5',
      role: 'STAFF',
      badge: 'Security Protocol',
      title: '5. Safe Shift Handover & Application Exit',
      summary: 'Security guidelines for front-desk terminals during shift changes.',
      steps: [
        'Always click the "Exit" button at the bottom of the sidebar when leaving your desk.',
        'Exiting immediately invalidates your JWT authentication token and clears local storage.',
        'Never share receptionist user credentials with unauthorized personnel.'
      ]
    },

    // ADMIN GUIDES
    {
      id: 'admin-1',
      role: 'ADMIN',
      badge: 'Administration',
      title: '1. Staff Credential & Role-Based Access Control (RBAC)',
      summary: 'Managing system users, authorization boundaries, and security enforcement.',
      action: { tab: 'dashboard', label: 'View System Status' },
      steps: [
        'User roles are partitioned into ADMIN, STAFF, and PATIENT.',
        'Administrators have exclusive authorization to query all registered accounts via /api/users endpoints.',
        'All user passwords are cryptographically hashed using salted BCrypt (10 rounds) prior to database persistence.',
        'JWT tokens are signed with HMAC-SHA256 and configured with an expiration window of 24 hours.'
      ]
    },
    {
      id: 'admin-2',
      role: 'ADMIN',
      badge: 'Data Governance',
      title: '2. Patient Record Governance & Deletion Policy',
      summary: 'Guidelines for managing clinical data integrity and executing GDPR-compliant record deletion.',
      steps: [
        'To prevent accidental medical history loss, only ADMIN users are authorized to delete patient records (DELETE /api/patients/{id}).',
        'Staff members are restricted to creating and updating records.',
        'Before deleting any record, ensure there are no active dependencies or unresolved invoices associated with the patient.'
      ]
    },
    {
      id: 'admin-3',
      role: 'ADMIN',
      badge: 'Analytics',
      title: '3. Clinical Oversight & Decision-Making Reports',
      summary: 'Utilizing system analytics for clinical scheduling, operatory preparation, and financial auditing.',
      action: { tab: 'dashboard', label: 'Open Dashboard' },
      steps: [
        'Daily Appointment Schedule: Review attending dentist workload distribution and upcoming treatments.',
        'Treatment Revenue Breakdown: Track aggregate financial turnover across high-value procedures (e.g. Orthodontics, Root Canals).',
        'Patient Flow Metrics: Monitor new patient acquisition versus returning patient visits.'
      ]
    },
    {
      id: 'admin-4',
      role: 'ADMIN',
      badge: 'System Architecture',
      title: '4. Database Architecture & Transaction Integrity',
      summary: 'Relational data persistence, foreign key relationships, and ACID compliance.',
      steps: [
        'The persistence layer utilizes MySQL 8.0 with Spring Data JPA and Hibernate ORM.',
        'All database tables (users, patients, appointments, bills) are normalized to 3rd Normal Form (3NF).',
        'Datasource management uses a thread-safe Singleton Pattern (DatabaseConnection.java) with double-checked locking.'
      ]
    },

    // PATIENT GUIDES
    {
      id: 'patient-1',
      role: 'PATIENT',
      badge: 'Patient Portal',
      title: '1. How to Check Your Appointment Status',
      summary: 'Quick guide for patients to verify scheduled dental consultation details.',
      action: { tab: 'search', label: 'Check Appointment' },
      steps: [
        'Go to "Search Appointments" on the menu.',
        'Enter the Appointment Number provided on your booking SMS or card.',
        'Click "Search Record" to review your appointment date, scheduled time, treatment type, and attending dental surgeon.'
      ]
    },
    {
      id: 'patient-2',
      role: 'PATIENT',
      badge: 'Patient Portal',
      title: '2. How to View & Download Your Treatment Invoice',
      summary: 'Accessing official clinic payment receipts for personal health records or insurance claims.',
      action: { tab: 'billing', label: 'View Receipt' },
      steps: [
        'Navigate to "Calculate & Print Bill".',
        'Enter your Appointment Number to load your itemized receipt.',
        'Click "Print Patient Receipt" to print a physical copy or save a PDF invoice with the official clinic header and registration details.'
      ]
    },
    {
      id: 'patient-3',
      role: 'PATIENT',
      badge: 'Clinic Information',
      title: '3. Sunrise Dental Clinic Contact & Emergency Care',
      summary: 'Emergency dental support, clinic location, and operating hours in Colombo.',
      steps: [
        'Clinic Address: No. 123 Galle Road, Colombo 03, Sri Lanka',
        'Appointment Hotline: +94 11 234 5678 / +94 77 123 4567',
        'Clinic Operating Hours: Monday to Saturday: 8:30 AM – 7:30 PM | Sunday: 9:00 AM – 2:00 PM',
        'Emergency Dental Trauma: Please call our 24/7 emergency hotline at +94 71 999 8888.'
      ]
    }
  ];

  // Filter by role tab and search query
  const filteredGuides = guides.filter(item => {
    const matchesRole = selectedRoleFilter === 'ALL' || item.role === selectedRoleFilter;
    const matchesSearch = searchTerm.trim() === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.steps.some(step => step.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h2 style={{ margin: 0 }}>System Help & Operating Guidelines</h2>
              <span className={`badge ${currentRole === 'ADMIN' ? 'badge-blue' : currentRole === 'STAFF' ? 'badge-teal' : 'badge-amber'}`}>
                Logged in as: {currentRole}
              </span>
            </div>
            <p className="card-subtitle">
              Role-adaptive documentation and standard operating procedures for Sunrise Dental Clinic
            </p>
          </div>

          {/* Search Box */}
          <div style={{ minWidth: '260px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Search instructions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '0.88rem', padding: '8px 14px' }}
            />
          </div>
        </div>

        {/* Role Switcher Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px', flexWrap: 'wrap' }}>
          <button
            className={`role-chip ${selectedRoleFilter === 'STAFF' ? 'active' : ''}`}
            onClick={() => { setSelectedRoleFilter('STAFF'); setOpenIndex(0); }}
          >
            📋 Receptionist / Staff Guide
          </button>
          <button
            className={`role-chip ${selectedRoleFilter === 'ADMIN' ? 'active' : ''}`}
            onClick={() => { setSelectedRoleFilter('ADMIN'); setOpenIndex(0); }}
          >
            ⚙️ Administrator Guide
          </button>
          <button
            className={`role-chip ${selectedRoleFilter === 'PATIENT' ? 'active' : ''}`}
            onClick={() => { setSelectedRoleFilter('PATIENT'); setOpenIndex(0); }}
          >
            🦷 Patient Self-Service
          </button>
          <button
            className={`role-chip ${selectedRoleFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => { setSelectedRoleFilter('ALL'); setOpenIndex(0); }}
          >
            📚 View All Guides ({guides.length})
          </button>
        </div>
      </div>

      {/* Guide Cards */}
      {filteredGuides.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '8px' }}>🔎 No matching instructions found</p>
          <p style={{ fontSize: '0.9rem' }}>Try changing your search term or selecting a different role filter above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredGuides.map((guide, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={guide.id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  boxShadow: isOpen ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  overflow: 'hidden',
                  transition: 'var(--transition)'
                }}
              >
                <div
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: isOpen ? 'linear-gradient(90deg, #f8fafc, #ffffff)' : 'transparent',
                    borderBottom: isOpen ? '1px solid var(--border)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, paddingRight: '12px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: guide.role === 'ADMIN' ? '#dbeafe' : guide.role === 'STAFF' ? '#ccfbf1' : '#fef3c7',
                        color: guide.role === 'ADMIN' ? '#1e40af' : guide.role === 'STAFF' ? '#0f766e' : '#b45309'
                      }}
                    >
                      {guide.badge}
                    </span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>{guide.title}</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{guide.summary}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ padding: '20px', background: '#fafbfc' }}>
                    <ol style={{ paddingLeft: '22px', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {guide.steps.map((step, sIdx) => (
                        <li key={sIdx} style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                          {step}
                        </li>
                      ))}
                    </ol>

                    {guide.action && setActiveTab && (
                      <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px dashed var(--border)' }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '7px 14px', fontSize: '0.85rem' }}
                          onClick={() => setActiveTab(guide.action.tab)}
                        >
                          🚀 {guide.action.label}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
