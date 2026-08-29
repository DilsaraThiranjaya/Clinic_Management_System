import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Billing({ selectedId }) {
  const [appointmentNum, setAppointmentNum] = useState(selectedId ? String(selectedId) : '1');
  const [billReceipt, setBillReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
            <span className="search-input-icon">💳</span>
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
          <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontWeight: '500' }}>
            ⚠️ {error}
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

            <div className="calc-row">
              <span>Treatment Cost ({billReceipt.treatmentType})</span>
              <span>LKR {billReceipt.treatmentCost?.toLocaleString() || '0.00'}</span>
            </div>

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
            <button className="btn btn-primary" onClick={handlePrint}>
              🖨️ Print Patient Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
