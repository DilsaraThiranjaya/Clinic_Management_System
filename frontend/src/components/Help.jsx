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

    // DOCTOR / DENTIST CLINICAL GUIDES
    {
      id: 'doctor-1',
      role: 'DOCTOR',
      badge: 'Doctor Clinical SOP',
      title: '1. Daily Clinical Schedule & Chairside Queue Inspection',
      summary: 'Reviewing assigned dental patient appointments, treatment types, and consultation timings.',
      action: { tab: 'dashboard', label: 'Open Clinical Dashboard' },
      steps: [
        'Access the "Clinical Dashboard" on the left navigation menu.',
        'View the "Doctor\'s Clinical Schedule & Patient Queue" table displaying appointments assigned to you.',
        'Use the dentist filter dropdown to isolate your patient queue or inspect general clinic consultations.',
        'Review patient demographics, telephone contact details, and the scheduled dental procedure (e.g. Teeth Cleaning, Root Canal, Orthodontics).',
        'Check appointment timings to prepare required clinical operatory instruments in advance.'
      ]
    },
    {
      id: 'doctor-2',
      role: 'DOCTOR',
      badge: 'Doctor Clinical SOP',
      title: '2. Reviewing Patient Dental History & Diagnostics',
      summary: 'Inspect patient records and demographics prior to chairside examination.',
      action: { tab: 'search', label: 'Search Patient Record' },
      steps: [
        'From your Clinical Dashboard, click "🔍 View" next to any patient appointment row.',
        'Alternatively, navigate to "Search Appointments" and input the unique Appointment ID (e.g. #1).',
        'Review the registered patient name, residential address, emergency phone number, and recording receptionist staff details.',
        'Verify treatment scope and confirm any contraindications or special care needs.'
      ]
    },
    {
      id: 'doctor-3',
      role: 'DOCTOR',
      badge: 'Clinical Documentation',
      title: '3. Chairside Clinical Notes & Treatment Progress',
      summary: 'Documenting tooth quadrants, clinical observations, local anesthesia, and procedure completion.',
      action: { tab: 'dashboard', label: 'Open Dashboard' },
      steps: [
        'On your Clinical Dashboard appointment row, click "📝 Notes" to launch the chairside documentation dialog.',
        'Enter procedure notes: tooth numbers, restorative materials, local anesthetic dosage, or post-op instructions.',
        'Click "Save Clinical Note" to persist your notes for the session.',
        'When the clinical procedure concludes successfully, click "✓ Done" to mark the treatment status as Completed.'
      ]
    },
    {
      id: 'doctor-4',
      role: 'DOCTOR',
      badge: 'Clinical Governance',
      title: '4. Patient Checkout & Reception Handoff for Invoicing',
      summary: 'Clinical handoff protocol ensuring doctors do not handle cash or billing calculation.',
      steps: [
        'In strict compliance with clinic policy, attending dental surgeons do not calculate or issue invoices directly.',
        'Upon finishing treatment, instruct the patient to proceed to the front-desk reception counter for payment settlement.',
        'Receptionist staff retrieve the completed appointment number in the Billing module to generate the official clinical invoice (Base Fee LKR 1,500.00 + Treatment Tariff).',
        'Reception staff issue the printed payment receipt and collect payment via cash or card.'
      ]
    },
    {
      id: 'doctor-5',
      role: 'DOCTOR',
      badge: 'Security & Hygiene',
      title: '5. Infection Control, Data Privacy & Session Termination',
      summary: 'Standard clinical hygiene compliance, healthcare data ethics, and secure terminal exit.',
      steps: [
        'Maintain strict infection control and sterilization guidelines between patient chairside sessions.',
        'Ensure patient medical confidentiality in accordance with medical ethics and data protection standards.',
        'When stepping away from the operatory terminal or completing your shift, click the "Exit" button at the bottom of the sidebar to invalidate your JWT session.'
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
        'Go to "Search Appointments" on the left menu.',
        'Enter the unique Appointment Number provided on your booking SMS or card (e.g. 1).',
        'Click "Search Record" to review your appointment date, scheduled time, treatment type, and attending dental surgeon.'
      ]
    },
    {
      id: 'patient-2',
      role: 'PATIENT',
      badge: 'Patient Portal',
      title: '2. Official Treatment Billing & Receipt Collection',
      summary: 'Guidelines on treatment fees and receiving official clinic receipts at checkout.',
      steps: [
        'In accordance with clinic policy, patients cannot calculate or generate bills themselves on the self-service portal.',
        'All treatment calculations are performed accurately by clinic front-desk staff.',
        'Fee Structure: Base consultation fee of LKR 1,500.00 plus procedure-specific treatment cost (e.g., Teeth Cleaning: LKR 2,500, Dental Filling: LKR 3,500).',
        'Upon conclusion of your appointment with the doctor, please proceed to the reception counter.',
        'The receptionist will print your official itemized payment receipt with full clinic registration details and accept cash or card payment.'
      ]
    },
    {
      id: 'patient-3',
      role: 'PATIENT',
      badge: 'Clinic Information',
      title: '3. Sunrise Dental Clinic Contact & Emergency Care',
      summary: 'Emergency dental support, clinic location, and operating hours in Colombo.',
      steps: [
        'Clinic Address: No. 45 Galle Road, Colombo 03, Sri Lanka',
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

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'ADMIN': return 'badge-blue';
      case 'DOCTOR': return 'badge-teal';
      case 'STAFF': return 'badge-teal';
      case 'PATIENT': return 'badge-amber';
      default: return 'badge-teal';
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'DOCTOR': return 'Dentist (Doctor)';
      case 'STAFF': return 'Staff (Reception)';
      case 'PATIENT': return 'Patient';
      default: return role;
    }
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h2 style={{ margin: 0 }}>System Help &amp; Operating Guidelines</h2>
              <span className={`badge ${getRoleBadgeStyle(currentRole)}`}>
                Logged in as: {getRoleDisplayName(currentRole)}
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
            className={`role-chip ${selectedRoleFilter === 'DOCTOR' ? 'active' : ''}`}
            onClick={() => { setSelectedRoleFilter('DOCTOR'); setOpenIndex(0); }}
          >
            🩺 Dentist / Doctor Guide
          </button>
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
