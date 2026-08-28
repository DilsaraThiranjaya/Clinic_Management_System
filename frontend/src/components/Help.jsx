import React, { useState } from 'react';

export default function Help() {
  const [openIndex, setOpenIndex] = useState(0);

  const guides = [
    {
      title: '1. How to Register a New Patient Appointment',
      steps: [
        'Navigate to the "Register Appointment" menu on the left sidebar.',
        'Input the patient\'s full name, residential address, and a valid 10-15 digit contact number.',
        'Select the attending dentist from the dropdown list.',
        'Choose the required dental treatment type. The system automatically calculates the estimated fee preview.',
        'Select the appointment date and appointment time.',
        'Click "Confirm & Save Appointment". The system will generate a unique Appointment Number and patient ID.'
      ]
    },
    {
      title: '2. How to Search and Display Appointment Details',
      steps: [
        'Navigate to "Search Appointments" on the sidebar.',
        'Enter the unique Appointment Number provided to the patient.',
        'Click "Search Record" to view patient demographics, treatment type, schedule, and registering staff info.',
        'Use the "Proceed to Generate & Print Bill" button to directly transition to billing.'
      ]
    },
    {
      title: '3. How Billing Calculations Work',
      steps: [
        'Navigate to "Calculate & Print Bill".',
        'Enter the Appointment Number and click "Calculate & Generate".',
        'The system applies the standard formula: Total Bill = Base Consultation Fee (LKR 1,500) + Treatment Specific Cost.',
        'Click "Print Patient Receipt" to print the official clinic invoice.'
      ]
    },
    {
      title: '4. Role-Based Access Permissions',
      steps: [
        'ADMIN: Full access to manage staff accounts, patient records, appointments, and financial reports.',
        'STAFF (Receptionist): Can register appointments, lookup patient records, and calculate/print bills.',
        'PATIENT: Can view personal appointments and receipts using their appointment number.'
      ]
    },
    {
      title: '5. Safe Application Exit',
      steps: [
        'To safely exit the system, click the "Exit" button located at the bottom-left of the sidebar.',
        'This clears the active JWT authentication token and returns to the secure login screen.'
      ]
    }
  ];

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <div>
            <h2>Staff Onboarding & System Help Guide</h2>
            <p className="card-subtitle">Step-by-step instructions for operating Sunrise Dental Clinic Management System</p>
          </div>
        </div>

        <div>
          {guides.map((guide, idx) => (
            <div key={idx} className="help-card">
              <div className="help-header" onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}>
                <span>{guide.title}</span>
                <span>{openIndex === idx ? '▲' : '▼'}</span>
              </div>
              {openIndex === idx && (
                <div className="help-body">
                  <ol className="step-list">
                    {guide.steps.map((step, sIdx) => (
                      <li key={sIdx}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
