import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CreditCardIcon, AlertCircleIcon, ReceiptIcon } from './Icons';

export default function Billing({ user, selectedId }) {
  const [appointmentNum, setAppointmentNum] = useState(selectedId ? String(selectedId) : '1');
  const [billReceipt, setBillReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user?.role === 'PATIENT' || user?.role === 'DOCTOR') {
    return (
      <div className="card" style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center', padding: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircleIcon size={32} color="#0284c7" />
          </div>
        </div>
        <h2>{user?.role === 'DOCTOR' ? 'Clinical Governance Notice' : 'Patient Billing Notice'}</h2>
        <p style={{ color: '#64748b', marginTop: '8px', lineHeight: '1.6' }}>
          {user?.role === 'DOCTOR'
            ? 'In accordance with clinical governance protocols, attending dental surgeons do not handle financial billing transactions. Front-desk receptionist staff calculate and finalize patient invoices.'
            : 'In accordance with Sunrise Dental Clinic billing protocols, patients are not permitted to calculate or generate bills. Please visit the front-desk reception counter upon completion of your appointment to settle treatment payments and receive your official invoice receipt.'}
        </p>
      </div>
    );
  }

  useEffect(() => {
    if (selectedId) {
      setAppointmentNum(String(selectedId));
      generateOrLoadBill(selectedId);
    }
  }, [selectedId]);

  const generateOrLoadBill = async (apptNum) => {
    if (!apptNum) return;
    setLoading(true);
    setError('');

    try {
      const response = await api.post(`/bills/generate/${apptNum}`);
      setBillReceipt(response.data);
    } catch (err) {
      setBillReceipt(null);
      setError(err.response?.data?.message || `Unable to generate bill for appointment #${apptNum}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    if (appointmentNum.trim()) {
      generateOrLoadBill(appointmentNum.trim());
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="card no-print" style={{ maxWidth: '680px', margin: '0 auto 24px auto' }}>
        <div className="card-header">
          <div>
            <h2>Calculate & Issue Bill</h2>
            <p className="card-subtitle">Generate official clinic invoice based on consultation and treatment fees</p>
          </div>
        </div>

        <form onSubmit={handleCalculate} className="search-bar-box">
          <div className="search-input-wrap">
            <span className="search-input-icon">
              <CreditCardIcon size={18} color="#64748b" />
            </span>
            <input
              type="number"
              className="form-input"
              placeholder="Enter Appointment Number (e.g. 1)"
              value={appointmentNum}
              onChange={(e) => setAppointmentNum(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate & Generate'}
          </button>
        </form>

        {error && (
          <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircleIcon size={16} color="#ef4444" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {billReceipt && (
        <div className="receipt-container">
          <div className="receipt-header">
            <h2>{billReceipt.clinicName}</h2>
            <p>{billReceipt.clinicAddress}</p>
            <p>Hotline: {billReceipt.clinicPhone} | Reg: SLMC/DENT/2024</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>INVOICE / RECEIPT</span>
              <h4 style={{ color: 'var(--teal)' }}>REC-{String(billReceipt.billId).padStart(5, '0')}</h4>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>ISSUE DATE</span>
              <p style={{ fontWeight: '700' }}>{billReceipt.issueDate}</p>
            </div>
          </div>

          <div className="receipt-grid">
            <div className="receipt-item">
              <span>Appointment No</span>
              <strong>#{billReceipt.appointmentNumber}</strong>
            </div>

            <div className="receipt-item">
              <span>Appointment Date</span>
              <strong>{billReceipt.appointmentDate}</strong>
            </div>

            <div className="receipt-item">
              <span>Patient Name</span>
              <strong>{billReceipt.patientName}</strong>
            </div>

            <div className="receipt-item">
              <span>Contact Number</span>
              <strong>{billReceipt.contactNumber}</strong>
            </div>

            <div className="receipt-item">
              <span>Address</span>
              <strong>{billReceipt.patientAddress}</strong>
            </div>

            <div className="receipt-item">
              <span>Attending Dentist</span>
              <strong>{billReceipt.dentistName}</strong>
            </div>
          </div>

          <div className="receipt-calculation">
            <div className="calc-row">
              <span>Base Consultation Fee</span>
              <span>LKR {billReceipt.baseConsultationFee?.toLocaleString() || '1,500.00'}</span>
            </div>

            {billReceipt.treatmentType?.includes(',') ? (
              <>
                <div style={{ padding: '8px 0 4px 0', borderBottom: '1px dashed var(--border)' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                    Itemized Clinical Procedures ({billReceipt.treatmentType.split(',').length}):
                  </span>
                  {billReceipt.treatmentType.split(',').map((t, idx) => (
                    <div key={idx} className="calc-row" style={{ paddingLeft: '14px', fontSize: '0.88rem', color: '#334155' }}>
                      <span>&bull; {t.trim()}</span>
                    </div>
                  ))}
                </div>
                <div className="calc-row">
                  <span>Total Treatment Procedures Cost</span>
                  <span>LKR {billReceipt.treatmentCost?.toLocaleString() || '0.00'}</span>
                </div>
              </>
            ) : (
              <div className="calc-row">
                <span>Treatment Cost ({billReceipt.treatmentType})</span>
                <span>LKR {billReceipt.treatmentCost?.toLocaleString() || '0.00'}</span>
              </div>
            )}

            <div className="calc-row total">
              <span>TOTAL AMOUNT DUE / PAID</span>
              <span>LKR {billReceipt.totalCost?.toLocaleString()}</span>
            </div>
          </div>

          <div className="receipt-footer">
            <p style={{ fontWeight: '600', color: '#0f172a' }}>Status: {billReceipt.status} (Cash / Card)</p>
            <p style={{ marginTop: '4px' }}>Thank you for visiting Sunrise Dental Clinic!</p>
            <p style={{ fontSize: '0.75rem', marginTop: '12px', color: '#94a3b8' }}>This is a computer-generated receipt.</p>
          </div>

          <div className="no-print" style={{ marginTop: '28px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button className="btn btn-primary" onClick={handlePrint} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <ReceiptIcon size={16} /> Print Patient Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
