const { useState, useEffect, useCallback, useMemo } = React;

const API_BASE = "http://localhost:8080/api";

// Treatment price lookup mapping
const TREATMENT_PRICES = {
  "Teeth Cleaning": 2500,
  "Dental Filling": 3500,
  "Tooth Extraction": 4500,
  "Teeth Whitening": 8000,
  "Root Canal": 15000,
  "Orthodontics (Braces)": 45000,
  "General Consultation": 2000
};
const BASE_CONSULTATION_FEE = 1500;

// API helper with JWT injection
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem("clinic_jwt_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      localStorage.removeItem("clinic_jwt_token");
      localStorage.removeItem("clinic_user");
      window.dispatchEvent(new Event("auth_change"));
      throw new Error("Session expired. Please log in again.");
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(errData.message || `Error: ${response.statusText}`);
    }

    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Unified Login component
function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("staff");
  const [password, setPassword] = useState("staff123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleQuickSelect = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiCall("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });

      localStorage.setItem("clinic_jwt_token", data.token);
      localStorage.setItem("clinic_user", JSON.stringify({
        id: data.id,
        username: data.username,
        role: data.role
      }));

      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-icon">🦷</div>
          <h2>Sunrise Dental Clinic</h2>
          <p>Appointment & Patient Management System</p>
        </div>

        <div className="role-chips">
          <span className={`role-chip ${username === "staff" ? "active" : ""}`}
                onClick={() => handleQuickSelect("staff", "staff123")}>
            Staff (Receptionist)
          </span>
          <span className={`role-chip ${username === "admin" ? "active" : ""}`}
                onClick={() => handleQuickSelect("admin", "admin123")}>
            Admin
          </span>
          <span className={`role-chip ${username === "patient" ? "active" : ""}`}
                onClick={() => handleQuickSelect("patient", "patient123")}>
            Patient
          </span>
        </div>

        {error && (
          <div style={{ padding: "10px 14px", background: "#fee2e2", color: "#ef4444", borderRadius: "8px", fontSize: "0.88rem", marginBottom: "16px", fontWeight: "500" }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In to System"}
          </button>
        </form>

        <div style={{ marginTop: "20px", padding: "12px", background: "#f8fafc", borderRadius: "8px", fontSize: "0.8rem", color: "#64748b", textAlign: "center", border: "1px solid #e2e8f0" }}>
          🔒 New staff & patient accounts are registered securely by the Clinic Administrator. Login credentials are emailed upon registration.
        </div>

        <div style={{ marginTop: "16px", textAlign: "center", fontSize: "0.75rem", color: "#94a3b8" }}>
          Protected by JWT Role-Based Access Control (RBAC)
        </div>
      </div>
    </div>
  );
}

// Navigation sidebar
function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊", roles: ["ADMIN", "STAFF"] },
    { id: "users", label: "User Management", icon: "👥", roles: ["ADMIN"] },
    { id: "register", label: "Register Appointment", icon: "📝", roles: ["ADMIN", "STAFF"] },
    { id: "search", label: "Search Appointments", icon: "🔍", roles: ["ADMIN", "STAFF", "PATIENT"] },
    { id: "billing", label: "Calculate & Print Bill", icon: "💳", roles: ["ADMIN", "STAFF", "PATIENT"] },
    { id: "help", label: "Help & Staff Guide", icon: "❓", roles: ["ADMIN", "STAFF", "PATIENT"] }
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
            className={`nav-item ${activeTab === item.id ? "active" : ""}`}
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

// Dashboard view
function Dashboard({ setActiveTab, onSelectAppointment }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await apiCall("/appointments");
      setAppointments(data || []);
    } catch (err) {
      console.error("Failed to load appointments", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📅</div>
          <div className="stat-info">
            <h3>{appointments.length}</h3>
            <p>Total Appointments</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teal">👥</div>
          <div className="stat-info">
            <h3>{new Set(appointments.map(a => a.patientId)).size}</h3>
            <p>Registered Patients</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">🦷</div>
          <div className="stat-info">
            <h3>6</h3>
            <p>Active Treatments</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">💰</div>
          <div className="stat-info">
            <h3>LKR 1,500</h3>
            <p>Base Consultation Fee</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2>Scheduled Appointments</h2>
            <p className="card-subtitle">Real-time view of patient appointments</p>
          </div>
          <button className="btn btn-primary" onClick={() => setActiveTab("register")}>
            + New Appointment
          </button>
        </div>

        {loading ? (
          <p style={{ color: "#64748b" }}>Loading appointment records...</p>
        ) : appointments.length === 0 ? (
          <p style={{ color: "#64748b", padding: "20px 0" }}>No appointments registered yet. Click "New Appointment" to create one.</p>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Appt #</th>
                  <th>Patient Name</th>
                  <th>Contact</th>
                  <th>Dentist</th>
                  <th>Treatment</th>
                  <th>Date & Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(apt => (
                  <tr key={apt.appointmentNumber}>
                    <td><strong>#{apt.appointmentNumber}</strong></td>
                    <td>{apt.patientName}</td>
                    <td>{apt.contactNumber}</td>
                    <td>{apt.dentistName}</td>
                    <td><span className="badge badge-teal">{apt.treatmentType}</span></td>
                    <td>{apt.appointmentDate} at {apt.appointmentTime}</td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "5px 10px", fontSize: "0.8rem", marginRight: "6px" }}
                        onClick={() => {
                          onSelectAppointment(apt.appointmentNumber);
                          setActiveTab("search");
                        }}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ padding: "5px 10px", fontSize: "0.8rem" }}
                        onClick={() => {
                          onSelectAppointment(apt.appointmentNumber);
                          setActiveTab("billing");
                        }}
                      >
                        Bill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Appointment registration form
function RegisterAppointment({ setActiveTab, onAppointmentCreated }) {
  const [formData, setFormData] = useState({
    patientName: "",
    address: "",
    contactNumber: "",
    dentistName: "Dr. Samantha Fernando",
    treatmentType: "Teeth Cleaning",
    appointmentDate: new Date().toISOString().split("T")[0],
    appointmentTime: "10:00"
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const estimatedPrice = useMemo(() => {
    const treatmentCost = TREATMENT_PRICES[formData.treatmentType] || 2000;
    return BASE_CONSULTATION_FEE + treatmentCost;
  }, [formData.treatmentType]);

  const validateForm = () => {
    const errs = {};
    if (!formData.patientName.trim()) {
      errs.patientName = "Patient name is required";
    } else if (formData.patientName.trim().length < 2) {
      errs.patientName = "Name must be at least 2 characters";
    }

    if (!formData.address.trim()) {
      errs.address = "Address is required";
    } else if (formData.address.trim().length < 5) {
      errs.address = "Address must be at least 5 characters";
    }

    const phoneRegex = /^[0-9+\-\s]{10,15}$/;
    if (!formData.contactNumber.trim()) {
      errs.contactNumber = "Contact number is required";
    } else if (!phoneRegex.test(formData.contactNumber.trim())) {
      errs.contactNumber = "Must be a valid 10-15 digit phone number (e.g. 0771234567)";
    }

    if (!formData.appointmentDate) {
      errs.appointmentDate = "Appointment date is required";
    }

    if (!formData.appointmentTime) {
      errs.appointmentTime = "Appointment time is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSuccessMsg("");

    try {
      const response = await apiCall("/appointments", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          appointmentTime: formData.appointmentTime.includes(":") && formData.appointmentTime.split(":").length === 2 
            ? `${formData.appointmentTime}:00` 
            : formData.appointmentTime
        })
      });

      setSuccessMsg(`Appointment #${response.appointmentNumber} successfully registered for ${response.patientName}!`);
      onAppointmentCreated(response.appointmentNumber);

      // Reset form
      setFormData({
        patientName: "",
        address: "",
        contactNumber: "",
        dentistName: "Dr. Samantha Fernando",
        treatmentType: "Teeth Cleaning",
        appointmentDate: new Date().toISOString().split("T")[0],
        appointmentTime: "10:00"
      });
    } catch (err) {
      setErrors({ form: err.message || "Failed to register appointment" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: "860px", margin: "0 auto" }}>
      <div className="card-header">
        <div>
          <h2>Register New Appointment</h2>
          <p className="card-subtitle">Enter patient demographics and schedule clinic consultation</p>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: "14px", background: "#d1fae5", color: "#065f46", borderRadius: "8px", marginBottom: "20px", fontWeight: "600" }}>
          ✅ {successMsg}
        </div>
      )}

      {errors.form && (
        <div style={{ padding: "14px", background: "#fee2e2", color: "#991b1b", borderRadius: "8px", marginBottom: "20px", fontWeight: "500" }}>
          ⚠️ {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">Patient Full Name <span className="req">*</span></label>
            <input
              type="text"
              name="patientName"
              className={`form-input ${errors.patientName ? "error" : ""}`}
              value={formData.patientName}
              onChange={handleChange}
              placeholder="e.g. Sunil De Silva"
            />
            {errors.patientName && <span className="error-text">{errors.patientName}</span>}
          </div>

          <div className="form-group full-width">
            <label className="form-label">Residential Address <span className="req">*</span></label>
            <input
              type="text"
              name="address"
              className={`form-input ${errors.address ? "error" : ""}`}
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. No. 45 Galle Road, Colombo 03"
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Contact Number <span className="req">*</span></label>
            <input
              type="tel"
              name="contactNumber"
              className={`form-input ${errors.contactNumber ? "error" : ""}`}
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="e.g. 0771234567"
            />
            {errors.contactNumber && <span className="error-text">{errors.contactNumber}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Dentist <span className="req">*</span></label>
            <select
              name="dentistName"
              className="form-select"
              value={formData.dentistName}
              onChange={handleChange}
            >
              <option value="Dr. Samantha Fernando">Dr. Samantha Fernando (Senior Surgeon)</option>
              <option value="Dr. Kasun Jayawardena">Dr. Kasun Jayawardena (Orthodontist)</option>
              <option value="Dr. Niluka Perera">Dr. Niluka Perera (Endodontist)</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label className="form-label">Treatment Type <span className="req">*</span></label>
            <select
              name="treatmentType"
              className="form-select"
              value={formData.treatmentType}
              onChange={handleChange}
            >
              {Object.keys(TREATMENT_PRICES).map(t => (
                <option key={t} value={t}>{t} (Treatment Cost: LKR {TREATMENT_PRICES[t].toLocaleString()})</option>
              ))}
            </select>

            <div className="price-preview-badge">
              <div>
                <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: "600" }}>ESTIMATED TOTAL BILL</span>
                <p style={{ fontSize: "0.82rem", color: "#0f172a" }}>Base Fee: LKR 1,500 + Treatment: LKR {(estimatedPrice - 1500).toLocaleString()}</p>
              </div>
              <h4>LKR {estimatedPrice.toLocaleString()}</h4>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Appointment Date <span className="req">*</span></label>
            <input
              type="date"
              name="appointmentDate"
              className={`form-input ${errors.appointmentDate ? "error" : ""}`}
              value={formData.appointmentDate}
              onChange={handleChange}
            />
            {errors.appointmentDate && <span className="error-text">{errors.appointmentDate}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Appointment Time <span className="req">*</span></label>
            <input
              type="time"
              name="appointmentTime"
              className={`form-input ${errors.appointmentTime ? "error" : ""}`}
              value={formData.appointmentTime}
              onChange={handleChange}
            />
            {errors.appointmentTime && <span className="error-text">{errors.appointmentTime}</span>}
          </div>
        </div>

        <div style={{ marginTop: "28px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-secondary" onClick={() => setActiveTab("dashboard")}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Booking Appointment..." : "Confirm & Save Appointment"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Search appointment
function SearchAppointment({ selectedId, setActiveTab, onSelectAppointment }) {
  const [searchTerm, setSearchTerm] = useState(selectedId ? String(selectedId) : "1");
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedId) {
      setSearchTerm(String(selectedId));
      fetchAppointment(selectedId);
    } else {
      fetchAppointment(1);
    }
  }, [selectedId]);

  const fetchAppointment = async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");

    try {
      const data = await apiCall(`/appointments/${id}`);
      setAppointment(data);
    } catch (err) {
      setAppointment(null);
      setError(`No appointment found with number #${id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchAppointment(searchTerm.trim());
    }
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
      <div className="card">
        <div className="card-header">
          <div>
            <h2>Search & Display Appointment</h2>
            <p className="card-subtitle">Search registered appointments by unique appointment number</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="search-bar-box">
          <div className="search-input-wrap">
            <span className="search-input-icon">🔍</span>
            <input
              type="number"
              className="form-input"
              placeholder="Enter Appointment Number (e.g. 1)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search Record
          </button>
        </form>

        {loading && <p style={{ color: "#64748b" }}>Fetching appointment details...</p>}

        {error && (
          <div style={{ padding: "14px", background: "#fee2e2", color: "#ef4444", borderRadius: "8px", fontWeight: "500" }}>
            ⚠️ {error}
          </div>
        )}

        {appointment && !loading && (
          <div style={{ background: "#f8fafc", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "24px", marginTop: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "16px", marginBottom: "20px" }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>APPOINTMENT RECORD</span>
                <h3 style={{ fontSize: "1.4rem", color: "var(--teal)" }}>Appointment #{appointment.appointmentNumber}</h3>
              </div>
              <span className="badge badge-teal" style={{ fontSize: "0.85rem", padding: "6px 14px" }}>
                Confirmed
              </span>
            </div>

            <div className="receipt-grid">
              <div className="receipt-item">
                <span>Patient Name</span>
                <strong>{appointment.patientName} (ID: #{appointment.patientId})</strong>
              </div>

              <div className="receipt-item">
                <span>Contact Number</span>
                <strong>{appointment.contactNumber}</strong>
              </div>

              <div className="receipt-item">
                <span>Residential Address</span>
                <strong>{appointment.patientAddress}</strong>
              </div>

              <div className="receipt-item">
                <span>Assigned Dentist</span>
                <strong>{appointment.dentistName}</strong>
              </div>

              <div className="receipt-item">
                <span>Treatment Category</span>
                <strong>{appointment.treatmentType}</strong>
              </div>

              <div className="receipt-item">
                <span>Schedule Date & Time</span>
                <strong>{appointment.appointmentDate} at {appointment.appointmentTime}</strong>
              </div>

              <div className="receipt-item">
                <span>Recorded By Staff</span>
                <strong>{appointment.staffUsername || "Clinic Staff"} (User #{appointment.staffId})</strong>
              </div>
            </div>

            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  onSelectAppointment(appointment.appointmentNumber);
                  setActiveTab("billing");
                }}
              >
                Proceed to Generate & Print Bill →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Billing and receipt generation
function Billing({ selectedId }) {
  const [appointmentNum, setAppointmentNum] = useState(selectedId ? String(selectedId) : "1");
  const [billReceipt, setBillReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedId) {
      setAppointmentNum(String(selectedId));
      generateOrLoadBill(selectedId);
    }
  }, [selectedId]);

  const generateOrLoadBill = async (apptNum) => {
    if (!apptNum) return;
    setLoading(true);
    setError("");

    try {
      // Generate bill via POST (computes Base Fee + Treatment Cost)
      const data = await apiCall(`/bills/generate/${apptNum}`, {
        method: "POST"
      });
      setBillReceipt(data);
    } catch (err) {
      setBillReceipt(null);
      setError(err.message || `Unable to generate bill for appointment #${apptNum}`);
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
      <div className="card no-print" style={{ maxWidth: "680px", margin: "0 auto 24px auto" }}>
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
            {loading ? "Calculating..." : "Calculate & Generate"}
          </button>
        </form>

        {error && (
          <div style={{ padding: "12px 16px", background: "#fee2e2", color: "#ef4444", borderRadius: "8px", fontWeight: "500" }}>
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

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>INVOICE / RECEIPT</span>
              <h4 style={{ color: "var(--teal)" }}>REC-{String(billReceipt.billId).padStart(5, "0")}</h4>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>ISSUE DATE</span>
              <p style={{ fontWeight: "700" }}>{billReceipt.issueDate}</p>
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
              <span>LKR {billReceipt.baseConsultationFee?.toLocaleString() || "1,500.00"}</span>
            </div>

            <div className="calc-row">
              <span>Treatment Cost ({billReceipt.treatmentType})</span>
              <span>LKR {billReceipt.treatmentCost?.toLocaleString() || "0.00"}</span>
            </div>

            <div className="calc-row total">
              <span>TOTAL AMOUNT DUE / PAID</span>
              <span>LKR {billReceipt.totalCost?.toLocaleString()}</span>
            </div>
          </div>

          <div className="receipt-footer">
            <p style={{ fontWeight: "600", color: "#0f172a" }}>Status: {billReceipt.status} (Cash / Card)</p>
            <p style={{ marginTop: "4px" }}>Thank you for visiting Sunrise Dental Clinic!</p>
            <p style={{ fontSize: "0.75rem", marginTop: "12px", color: "#94a3b8" }}>This is a computer-generated receipt.</p>
          </div>

          <div className="no-print" style={{ marginTop: "28px", display: "flex", justifyContent: "center", gap: "12px" }}>
            <button className="btn btn-primary" onClick={handlePrint}>
              🖨️ Print Patient Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Help and documentation
function Help() {
  const [openIndex, setOpenIndex] = useState(0);

  const guides = [
    {
      title: "1. How to Register a New Patient Appointment",
      steps: [
        "Navigate to the 'Register Appointment' menu on the left sidebar.",
        "Input the patient's full name, residential address, and a valid 10-15 digit contact number.",
        "Select the attending dentist from the dropdown list.",
        "Choose the required dental treatment type. The system automatically calculates the estimated fee preview.",
        "Select the appointment date and appointment time.",
        "Click 'Confirm & Save Appointment'. The system will generate a unique Appointment Number and patient ID."
      ]
    },
    {
      title: "2. How to Search and Display Appointment Details",
      steps: [
        "Navigate to 'Search Appointments' on the sidebar.",
        "Enter the unique Appointment Number provided to the patient.",
        "Click 'Search Record' to view patient demographics, treatment type, schedule, and registering staff info.",
        "Use the 'Proceed to Generate & Print Bill' button to directly transition to billing."
      ]
    },
    {
      title: "3. How Billing Calculations Work",
      steps: [
        "Navigate to 'Calculate & Print Bill'.",
        "Enter the Appointment Number and click 'Calculate & Generate'.",
        "The system applies the standard formula: Total Bill = Base Consultation Fee (LKR 1,500) + Treatment Specific Cost.",
        "Click 'Print Patient Receipt' to print the official clinic invoice."
      ]
    },
    {
      title: "4. Role-Based Access Permissions",
      steps: [
        "ADMIN: Full access to manage staff accounts, patient records, appointments, and financial reports.",
        "STAFF (Receptionist): Can register appointments, lookup patient records, and calculate/print bills.",
        "PATIENT: Can view personal appointments and receipts using their appointment number."
      ]
    },
    {
      title: "5. Safe Application Exit",
      steps: [
        "To safely exit the system, click the 'Exit' button located at the bottom-left of the sidebar.",
        "This clears the active JWT authentication token and returns to the secure login screen."
      ]
    }
  ];

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
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
                <span>{openIndex === idx ? "▲" : "▼"}</span>
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

// User management
function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterRole, setFilterRole] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STAFF");
  const [showPassword, setShowPassword] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiCall("/users");
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to load users", err);
      setErrorMsg(err.message || "Failed to fetch user directory");
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    let generated = "";
    for (let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    setShowPassword(true);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (role === "ADMIN") {
      setErrorMsg("Admin registration is prohibited. Only the system-seeded administrator is permitted.");
      return;
    }

    if (!username.trim() || username.length < 3) {
      setErrorMsg("Username must be at least 3 characters.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (!email || !email.includes("@")) {
      setErrorMsg("A valid email address is required to deliver user credentials.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        username: username.trim(),
        password: password,
        role: role,
        email: email.trim()
      };

      const newUser = await apiCall("/users/register", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setSuccessMsg(`✅ Account for "${newUser.username}" (${newUser.role}) created successfully! Login credentials have been dispatched to ${newUser.email || email}.`);

      setUsername("");
      setEmail("");
      setPassword("");
      setRole("STAFF");
      setShowPassword(false);

      loadUsers();
    } catch (err) {
      setErrorMsg(err.message || "Failed to register user. Please verify input.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === "ALL" || u.role === filterRole;
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const staffCount = users.filter((u) => u.role === "STAFF").length;
  const patientCount = users.filter((u) => u.role === "PATIENT").length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="user-management-container">
      <div className="stats-grid" style={{ marginBottom: "24px" }}>
        <div className="stat-card">
          <div className="stat-icon blue">👥</div>
          <div className="stat-info">
            <h3>{users.length}</h3>
            <p>Total Registered Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">🏥</div>
          <div className="stat-info">
            <h3>{staffCount}</h3>
            <p>Active Staff & Reception</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">🦷</div>
          <div className="stat-info">
            <h3>{patientCount}</h3>
            <p>Registered Patients</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">🛡️</div>
          <div className="stat-info">
            <h3>{adminCount}</h3>
            <p>Seeded System Admin</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(340px, 420px) 1fr", gap: "24px", alignItems: "start" }}>
        {/* Registration Card */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ fontSize: "1.5rem", background: "#e0f2fe", width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "10px" }}>
              👤
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#0f172a" }}>Register New User</h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>Provision staff or patient portal accounts</p>
            </div>
          </div>

          <div style={{ padding: "10px 12px", background: "#f1f5f9", borderLeft: "4px solid #0284c7", borderRadius: "6px", fontSize: "0.78rem", color: "#334155", marginBottom: "18px" }}>
            ℹ️ <strong>Admin Security Policy:</strong> Only Staff and Patients can be registered. Credentials will be sent directly to the provided email.
          </div>

          {errorMsg && (
            <div style={{ padding: "10px 14px", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "16px", fontWeight: "500" }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ padding: "12px 14px", background: "#ecfdf5", color: "#065f46", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "16px", fontWeight: "500", lineHeight: "1.4" }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label">User Access Role</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  type="button"
                  className={`btn ${role === "STAFF" ? "btn-primary" : "btn-secondary"}`}
                  style={{ padding: "10px 8px", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                  onClick={() => setRole("STAFF")}
                >
                  <span>🏥</span>
                  <span>Staff / Reception</span>
                </button>
                <button
                  type="button"
                  className={`btn ${role === "PATIENT" ? "btn-primary" : "btn-secondary"}`}
                  style={{ padding: "10px 8px", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                  onClick={() => setRole("PATIENT")}
                >
                  <span>🦷</span>
                  <span>Patient</span>
                </button>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "6px" }}>
                {role === "STAFF" ? "Staff template email with clinic operations guide will be sent." : "Patient template email with patient portal instructions will be sent."}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. dr_perera or patient_kamal"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label">Recipient Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Credentials & login link will be emailed to this address.</span>
            </div>

            <div className="form-group" style={{ marginBottom: "22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <label className="form-label" style={{ margin: 0 }}>Account Password</label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  style={{ background: "none", border: "none", color: "#0284c7", fontSize: "0.78rem", cursor: "pointer", fontWeight: "600", textDecoration: "underline" }}
                >
                  ⚡ Auto-Generate
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "0.9rem", color: "#64748b" }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting}
              style={{ padding: "12px" }}
            >
              {submitting ? "Registering & Dispatching Email..." : `Register ${role === "STAFF" ? "Staff" : "Patient"} & Send Email`}
            </button>
          </form>
        </div>

        {/* Directory Table Card */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#0f172a" }}>System User Directory</h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>Overview of all registered clinic accounts</p>
            </div>
            <button
              className="btn btn-secondary"
              onClick={loadUsers}
              disabled={loading}
              style={{ fontSize: "0.82rem", padding: "6px 14px" }}
            >
              {loading ? "Refreshing..." : "🔄 Refresh List"}
            </button>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", marginBottom: "18px" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <input
                type="text"
                className="form-input"
                placeholder="🔍 Search username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: "8px 12px", fontSize: "0.85rem" }}
              />
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {["ALL", "STAFF", "PATIENT", "ADMIN"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFilterRole(r)}
                  className={`btn ${filterRole === r ? "btn-primary" : "btn-secondary"}`}
                  style={{ padding: "6px 12px", fontSize: "0.75rem", borderRadius: "20px" }}
                >
                  {r === "ALL" ? `All (${users.length})` : `${r} (${users.filter((u) => u.role === r).length})`}
                </button>
              ))}
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>ID</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Email Address</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                      Loading system users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                      No users found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: "600", color: "#64748b" }}>#{u.id}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              background: u.role === "ADMIN" ? "#f97316" : u.role === "STAFF" ? "#0284c7" : "#8b5cf6",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.75rem",
                              fontWeight: "700"
                            }}
                          >
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: "600", color: "#0f172a" }}>{u.username}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            background:
                              u.role === "ADMIN"
                                ? "#ffedd5"
                                : u.role === "STAFF"
                                ? "#e0f2fe"
                                : "#f3e8ff",
                            color:
                              u.role === "ADMIN"
                                ? "#c2410c"
                                : u.role === "STAFF"
                                ? "#0369a1"
                                : "#7e22ce"
                          }}
                        >
                          {u.role === "ADMIN" ? "🛡️ ADMIN" : u.role === "STAFF" ? "🏥 STAFF" : "🦷 PATIENT"}
                        </span>
                      </td>
                      <td style={{ color: "#475569", fontSize: "0.85rem" }}>
                        {u.email ? u.email : <span style={{ color: "#94a3b8", fontStyle: "italic" }}>No email</span>}
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "0.78rem",
                            color: "#16a34a",
                            fontWeight: "600"
                          }}
                        >
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a" }}></span>
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Root application component
function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("clinic_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  useEffect(() => {
    const handleAuthChange = () => {
      const saved = localStorage.getItem("clinic_user");
      setUser(saved ? JSON.parse(saved) : null);
    };

    window.addEventListener("auth_change", handleAuthChange);
    return () => window.removeEventListener("auth_change", handleAuthChange);
  }, []);

  const handleLoginSuccess = (authData) => {
    setUser({
      id: authData.id,
      username: authData.username,
      role: authData.role
    });
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("clinic_jwt_token");
    localStorage.removeItem("clinic_user");
    setUser(null);
    setActiveTab("dashboard");
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
              {activeTab === "dashboard" && "Clinic Dashboard"}
              {activeTab === "users" && "User & Staff Management"}
              {activeTab === "register" && "Appointment Registration"}
              {activeTab === "search" && "Appointment Lookup"}
              {activeTab === "billing" && "Billing & Patient Receipts"}
              {activeTab === "help" && "Staff Help & Documentation"}
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
          {activeTab === "dashboard" && (
            <Dashboard
              setActiveTab={setActiveTab}
              onSelectAppointment={(id) => setSelectedAppointmentId(id)}
            />
          )}

          {activeTab === "users" && user.role === "ADMIN" && (
            <UserManagement />
          )}

          {activeTab === "register" && (
            <RegisterAppointment
              setActiveTab={setActiveTab}
              onAppointmentCreated={(id) => {
                setSelectedAppointmentId(id);
              }}
            />
          )}

          {activeTab === "search" && (
            <SearchAppointment
              selectedId={selectedAppointmentId}
              setActiveTab={setActiveTab}
              onSelectAppointment={(id) => setSelectedAppointmentId(id)}
            />
          )}

          {activeTab === "billing" && (
            <Billing selectedId={selectedAppointmentId} />
          )}

          {activeTab === "help" && <Help />}
        </main>
      </div>
    </div>
  );
}

// Mount the React Application
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
