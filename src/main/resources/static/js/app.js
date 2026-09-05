const { useState, useEffect, useCallback, useMemo } = React;

const API_BASE = window.location.port ? `${window.location.origin}/api` : "http://localhost:8190/api";

/* =========================================================================
   HEALTHCARE VECTOR SVG ICONS
   ========================================================================= */

function ClinicLogo({ size = 36, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <defs>
        <linearGradient id="clinicGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0d9488" />
          <stop offset="1" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#clinicGrad)" />
      <path
        d="M24 13C18.5 13 15 16 15 20.5C15 25 17.5 30 19 35C19.8 37.5 21.5 37.5 22.5 35C23.5 32.5 24 30.5 24 29C24 30.5 24.5 32.5 25.5 35C26.5 37.5 28.2 37.5 29 35C30.5 30 33 25 33 20.5C33 16 29.5 13 24 13Z"
        fill="#FFFFFF"
        fillOpacity="0.95"
      />
      <path d="M22.5 19H25.5V25H22.5V19ZM19.5 20.5H28.5V23.5H19.5V20.5Z" fill="#0d9488" />
    </svg>
  );
}

function DashboardIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function StethoscopeIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  );
}

function UsersIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CalendarPlusIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
      <path d="M10 16h4" />
      <path d="M12 14v4" />
    </svg>
  );
}

function SearchIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CreditCardIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function ReceiptIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h5" />
    </svg>
  );
}

function HelpCircleIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function ClockIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CheckCircleIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function AlertCircleIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

function ToothIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C7 2 4 4.5 4 8.5c0 4 2 8 3.5 12 1 2 2.5 2 3.5 0 1-2 1-3.5 1-5 0 1.5 0 3 1 5 1 2 2.5 2 3.5 0 1.5-4 3.5-8 3.5-12C20 4.5 17 2 12 2Z" />
    </svg>
  );
}

function BanknotesIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

function PlusIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function TrashIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function FileTextIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}

function CheckIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* =========================================================================
   DEFAULTS & API HELPER
   ========================================================================= */

const DEFAULT_TREATMENTS = [
  { name: "Teeth Cleaning", price: 2500 },
  { name: "Dental Filling", price: 3500 },
  { name: "Tooth Extraction", price: 4500 },
  { name: "Teeth Whitening", price: 8000 },
  { name: "Root Canal", price: 15000 },
  { name: "Orthodontics (Braces)", price: 45000 },
  { name: "General Consultation", price: 2000 }
];

const DEFAULT_DOCTORS = [];

const BASE_CONSULTATION_FEE = 1500;

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

/* =========================================================================
   LOGIN (SINGLE UNIFIED PORTAL)
   ========================================================================= */

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("doctor");
  const [password, setPassword] = useState("doctor123");
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
        role: data.role,
        fullName: data.fullName
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
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
            <ClinicLogo size={52} />
          </div>
          <h2>Sunrise Dental Clinic</h2>
          <p>Unified Clinic Management System</p>
        </div>

        <div className="role-chips" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "20px" }}>
          <span className={`role-chip ${username === "staff" ? "active" : ""}`}
                onClick={() => handleQuickSelect("staff", "staff123")}>
            Staff / Reception
          </span>
          <span className={`role-chip ${username === "doctor" ? "active" : ""}`}
                onClick={() => handleQuickSelect("doctor", "doctor123")}>
            Dentist / Doctor
          </span>
          <span className={`role-chip ${username === "admin" ? "active" : ""}`}
                onClick={() => handleQuickSelect("admin", "admin123")}>
            Admin
          </span>
          <span className={`role-chip ${username === "patient" ? "active" : ""}`}
                onClick={() => handleQuickSelect("patient", "patient123")}>
            Patient Portal
          </span>
        </div>

        {error && (
          <div style={{ padding: "10px 14px", background: "#fee2e2", color: "#ef4444", borderRadius: "8px", fontSize: "0.88rem", marginBottom: "16px", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircleIcon size={16} color="#ef4444" />
            <span>{error}</span>
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
      </div>
    </div>
  );
}

/* =========================================================================
   NAVIGATION SIDEBAR
   ========================================================================= */

function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <DashboardIcon size={18} />, roles: ["ADMIN", "STAFF", "DOCTOR"] },
    { id: "users", label: "User Management", icon: <UsersIcon size={18} />, roles: ["ADMIN"] },
    { id: "register", label: "Register Appointment", icon: <CalendarPlusIcon size={18} />, roles: ["ADMIN", "STAFF"] },
    { id: "search", label: "Search Appointments", icon: <SearchIcon size={18} />, roles: ["ADMIN", "STAFF", "DOCTOR", "PATIENT"] },
    { id: "billing", label: "Calculate & Print Bill", icon: <CreditCardIcon size={18} />, roles: ["ADMIN", "STAFF"] },
    { id: "help", label: "Help & SOP Guide", icon: <HelpCircleIcon size={18} />, roles: ["ADMIN", "STAFF", "DOCTOR", "PATIENT"] }
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div style={{ marginRight: "10px" }}>
          <ClinicLogo size={36} />
        </div>
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
            <span className="icon" style={{ display: "inline-flex", alignItems: "center" }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-info">
            <div className="user-avatar">{(user.fullName || user.username).charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <h4>{user.fullName || user.username}</h4>
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

/* =========================================================================
   DASHBOARD VIEW (DOCTOR CHAIRSIDE & RECEPTION / ADMIN VIEWS)
   ========================================================================= */

function Dashboard({ user, setActiveTab, onSelectAppointment }) {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [treatmentsCount, setTreatmentsCount] = useState(7);
  const [loading, setLoading] = useState(true);
  const [dentistFilter, setDentistFilter] = useState("ALL");
  const [completedAppts, setCompletedAppts] = useState(new Set());
  const [clinicalNotes, setClinicalNotes] = useState({});
  const [activeNoteModal, setActiveNoteModal] = useState(null);
  const [noteInput, setNoteInput] = useState("");

  const isDoctor = user?.role === "DOCTOR";
  const doctorDisplayName = user?.fullName || (user?.username ? (user.username.toLowerCase().startsWith("dr") ? user.username : "Dr. " + user.username) : "Dr. Samantha Fernando");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [apptRes, docRes, treatRes] = await Promise.allSettled([
        apiCall("/appointments"),
        apiCall("/users/doctors"),
        apiCall("/treatments")
      ]);

      if (apptRes.status === "fulfilled") {
        setAppointments(apptRes.value || []);
      }
      if (docRes.status === "fulfilled" && Array.isArray(docRes.value)) {
        setDoctors(docRes.value);
      }
      if (treatRes.status === "fulfilled" && Array.isArray(treatRes.value)) {
        setTreatmentsCount(treatRes.value.length);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = (apptNum) => {
    setCompletedAppts(prev => {
      const next = new Set(prev);
      if (next.has(apptNum)) {
        next.delete(apptNum);
      } else {
        next.add(apptNum);
      }
      return next;
    });
  };

  const openNoteModal = (apt) => {
    setActiveNoteModal(apt);
    setNoteInput(clinicalNotes[apt.appointmentNumber] || "");
  };

  const saveNote = () => {
    if (activeNoteModal) {
      setClinicalNotes(prev => ({
        ...prev,
        [activeNoteModal.appointmentNumber]: noteInput
      }));
      setActiveNoteModal(null);
      setNoteInput("");
    }
  };

  // Doctor-specific appointment match
  const myAppointments = useMemo(() => {
    const searchTerms = [
      user?.fullName,
      user?.username,
      doctorDisplayName
    ].filter(Boolean).map(s => s.toLowerCase());

    if (searchTerms.length === 0) return appointments;

    return appointments.filter(a => {
      const doc = (a.dentistName || "").toLowerCase();
      return searchTerms.some(t => doc.includes(t) || t.includes(doc));
    });
  }, [appointments, user, doctorDisplayName]);

  // Filter schedule for doctor
  const doctorAppointments = useMemo(() => {
    if (!isDoctor) return appointments;
    if (dentistFilter === "MINE") return myAppointments;
    if (dentistFilter === "ALL") return appointments;
    return appointments.filter(a =>
      a.dentistName?.toLowerCase().includes(dentistFilter.toLowerCase())
    );
  }, [appointments, isDoctor, dentistFilter, myAppointments]);

  if (isDoctor) {
    return (
      <div>
        {/* Doctor Clinical Header Card */}
        <div className="card" style={{ marginBottom: "24px", background: "linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)", border: "1px solid #99f6e4" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, #0d9488, #0284c7)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 12px rgba(13, 148, 136, 0.3)"
              }}>
                <StethoscopeIcon size={28} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h2 style={{ margin: 0, color: "#0f172a", fontSize: "1.4rem" }}>{doctorDisplayName}</h2>
                  <span className="badge badge-teal">Attending Dental Surgeon</span>
                </div>
                <p style={{ margin: "4px 0 0 0", color: "#475569", fontSize: "0.9rem" }}>
                  Chairside Operatory &bull; Active Clinical Duty &bull; {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                className="btn btn-secondary"
                style={{ background: "#fff", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
                onClick={() => setActiveTab("help")}
              >
                <FileTextIcon size={16} /> Clinical SOP Guide
              </button>
            </div>
          </div>
        </div>

        {/* Doctor Specific KPIs */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon teal">
              <StethoscopeIcon size={24} color="#0d9488" />
            </div>
            <div className="stat-info">
              <h3>{myAppointments.length > 0 ? myAppointments.length : appointments.length}</h3>
              <p>My Assigned Consultations</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <UsersIcon size={24} color="#0284c7" />
            </div>
            <div className="stat-info">
              <h3>{new Set((myAppointments.length > 0 ? myAppointments : appointments).map(a => a.patientId)).size}</h3>
              <p>Active Clinical Patients</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon amber">
              <ClockIcon size={24} color="#d97706" />
            </div>
            <div className="stat-info">
              <h3>{(myAppointments.length > 0 ? myAppointments : appointments).filter(a => !completedAppts.has(a.appointmentNumber)).length}</h3>
              <p>Pending Chairside Procedures</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <CheckCircleIcon size={24} color="#16a34a" />
            </div>
            <div className="stat-info">
              <h3>{completedAppts.size}</h3>
              <p>Completed Treatments</p>
            </div>
          </div>
        </div>

        {/* Doctor's Patient Queue & Schedule */}
        <div className="card">
          <div className="card-header" style={{ flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2>Doctor's Clinical Schedule &amp; Patient Queue</h2>
              <p className="card-subtitle">Examine patient treatment requirements, record clinical observations, and track completion</p>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <label style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Filter Schedule:</label>
              <select
                className="form-select"
                style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                value={dentistFilter}
                onChange={(e) => setDentistFilter(e.target.value)}
              >
                <option value="ALL">All Clinic Doctors ({appointments.length})</option>
                <option value="MINE">My Assigned Patients ({myAppointments.length})</option>
                {doctors.map(doc => (
                  <option key={doc.id || doc.username} value={doc.fullName || doc.username}>
                    {doc.fullName || doc.username}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p style={{ color: "#64748b", padding: "20px" }}>Loading clinical schedule...</p>
          ) : doctorAppointments.length === 0 ? (
            <p style={{ color: "#64748b", padding: "20px 0" }}>No consultations scheduled for this doctor selection.</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Appt #</th>
                    <th>Patient Demographics</th>
                    <th>Contact</th>
                    <th>Attending Dentist</th>
                    <th>Required Treatment</th>
                    <th>Schedule Time</th>
                    <th>Clinical Status</th>
                    <th>Doctor Clinical Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorAppointments.map(apt => {
                    const isDone = completedAppts.has(apt.appointmentNumber);
                    const note = clinicalNotes[apt.appointmentNumber];

                    return (
                      <tr key={apt.appointmentNumber} style={{ background: isDone ? "#f0fdf4" : "inherit" }}>
                        <td><strong>#{apt.appointmentNumber}</strong></td>
                        <td>
                          <div>
                            <strong>{apt.patientName}</strong>
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Patient ID: #{apt.patientId}</div>
                          </div>
                        </td>
                        <td>{apt.contactNumber}</td>
                        <td>
                          <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#0d9488" }}>
                            {apt.dentistName}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-teal">{apt.treatmentType}</span>
                        </td>
                        <td>
                          <div>{apt.appointmentDate}</div>
                          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{apt.appointmentTime}</div>
                        </td>
                        <td>
                          {isDone ? (
                            <span className="badge" style={{ background: "#dcfce7", color: "#15803d" }}>
                              Completed
                            </span>
                          ) : (
                            <span className="badge" style={{ background: "#fef3c7", color: "#b45309" }}>
                              In Queue
                            </span>
                          )}
                          {note && (
                            <div style={{ fontSize: "0.72rem", color: "#0369a1", marginTop: "4px", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={note}>
                              {note}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: "4px 8px", fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
                              onClick={() => {
                                onSelectAppointment(apt.appointmentNumber);
                                setActiveTab("search");
                              }}
                              title="Examine Patient Record"
                            >
                              <SearchIcon size={13} /> View
                            </button>

                            <button
                              className="btn btn-secondary"
                              style={{ padding: "4px 8px", fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
                              onClick={() => openNoteModal(apt)}
                              title="Add Chairside Notes"
                            >
                              <FileTextIcon size={13} /> Notes
                            </button>

                            <button
                              className={`btn ${isDone ? "btn-secondary" : "btn-primary"}`}
                              style={{ padding: "4px 8px", fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
                              onClick={() => toggleComplete(apt.appointmentNumber)}
                            >
                              {isDone ? "Undo" : <><CheckIcon size={13} /> Done</>}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Clinical Handoff Notice */}
          <div style={{ marginTop: "20px", padding: "14px 18px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertCircleIcon size={20} color="#0284c7" />
            <div style={{ fontSize: "0.82rem", color: "#475569" }}>
              <strong>Clinical Handoff &amp; Billing Protocol:</strong> Official treatment invoices and billing calculations are performed exclusively by front-desk reception staff upon patient checkout. Doctors do not handle financial payments or receipt generation.
            </div>
          </div>
        </div>

        {/* Modal for Doctor Clinical Notes */}
        {activeNoteModal && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
          }}>
            <div className="card" style={{ width: "100%", maxWidth: "480px", margin: "20px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)" }}>
              <div className="card-header">
                <div>
                  <h3>Chairside Clinical Notes</h3>
                  <p className="card-subtitle">Appointment #{activeNoteModal.appointmentNumber} &bull; {activeNoteModal.patientName}</p>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Treatment: {activeNoteModal.treatmentType}</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Record tooth quadrant, findings, anesthesia, materials, post-op instructions..."
                  style={{ width: "100%", resize: "vertical" }}
                  autoFocus
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveNoteModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={saveNote}
                >
                  Save Clinical Note
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Admin / Staff / Patient Dashboard
  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <CalendarPlusIcon size={24} color="#0284c7" />
          </div>
          <div className="stat-info">
            <h3>{appointments.length}</h3>
            <p>Total Appointments</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teal">
            <UsersIcon size={24} color="#0d9488" />
          </div>
          <div className="stat-info">
            <h3>{new Set(appointments.map(a => a.patientId)).size}</h3>
            <p>Registered Patients</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <ToothIcon size={24} color="#d97706" />
          </div>
          <div className="stat-info">
            <h3>{treatmentsCount}</h3>
            <p>Active Treatments</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <BanknotesIcon size={24} color="#16a34a" />
          </div>
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
          {user?.role !== "PATIENT" && (
            <button className="btn btn-primary" onClick={() => setActiveTab("register")} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <PlusIcon size={16} /> New Appointment
            </button>
          )}
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
                  <th>Date &amp; Time</th>
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
                        style={{ padding: "5px 10px", fontSize: "0.8rem", marginRight: "6px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        onClick={() => {
                          onSelectAppointment(apt.appointmentNumber);
                          setActiveTab("search");
                        }}
                      >
                        <SearchIcon size={13} /> View
                      </button>
                      {user?.role !== "PATIENT" && (
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
                      )}
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

/* =========================================================================
   APPOINTMENT REGISTRATION (DYNAMIC DOCTORS & TREATMENTS)
   ========================================================================= */

function RegisterAppointment({ user, setActiveTab, onAppointmentCreated }) {
  const [doctors, setDoctors] = useState(DEFAULT_DOCTORS);
  const [treatments, setTreatments] = useState(DEFAULT_TREATMENTS);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: null,
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

  useEffect(() => {
    loadDoctorsTreatmentsAndPatients();
  }, []);

  const loadDoctorsTreatmentsAndPatients = async () => {
    try {
      const [docRes, treatRes, patientRes] = await Promise.allSettled([
        apiCall("/users/doctors"),
        apiCall("/treatments"),
        apiCall("/patients")
      ]);

      if (docRes.status === "fulfilled" && Array.isArray(docRes.value) && docRes.value.length > 0) {
        setDoctors(docRes.value);
        const firstDoc = docRes.value[0];
        const firstDocName = firstDoc.fullName || (firstDoc.username?.toLowerCase().startsWith("dr") ? firstDoc.username : "Dr. " + firstDoc.username);
        setFormData(prev => ({ ...prev, dentistName: prev.dentistName || firstDocName }));
      }

      if (treatRes.status === "fulfilled" && Array.isArray(treatRes.value) && treatRes.value.length > 0) {
        setTreatments(treatRes.value);
      }

      if (patientRes.status === "fulfilled" && Array.isArray(patientRes.value)) {
        setPatients(patientRes.value);
      }
    } catch (err) {
      console.error("Failed to load doctors, treatments, or patients", err);
    }
  };

  const searchedPatients = useMemo(() => {
    if (!patientSearchTerm.trim()) return [];
    const term = patientSearchTerm.toLowerCase().trim();
    return patients.filter(p =>
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.contactNumber && p.contactNumber.toLowerCase().includes(term)) ||
      (p.id && String(p.id).includes(term)) ||
      (p.address && p.address.toLowerCase().includes(term))
    ).slice(0, 6);
  }, [patients, patientSearchTerm]);

  const handleSelectPatient = (p) => {
    setSelectedPatient(p);
    setFormData(prev => ({
      ...prev,
      patientId: p.id,
      patientName: p.name,
      address: p.address,
      contactNumber: p.contactNumber
    }));
    setPatientSearchTerm("");
    setIsPatientDropdownOpen(false);
    setErrors(prev => ({ ...prev, patientSelection: "", patientName: "" }));
  };

  const handleClearPatient = () => {
    setSelectedPatient(null);
    setFormData(prev => ({
      ...prev,
      patientId: null,
      patientName: "",
      address: "",
      contactNumber: ""
    }));
    setPatientSearchTerm("");
  };

  const treatmentPriceMap = useMemo(() => {
    const map = {};
    treatments.forEach(t => {
      map[t.name] = Number(t.price);
    });
    return map;
  }, [treatments]);

  const estimatedPrice = useMemo(() => {
    const treatmentCost = treatmentPriceMap[formData.treatmentType] ?? 2000;
    return BASE_CONSULTATION_FEE + treatmentCost;
  }, [formData.treatmentType, treatmentPriceMap]);

  const validateForm = () => {
    const errs = {};
    if (!formData.patientId || !selectedPatient) {
      errs.patientSelection = "You must select an existing registered patient from the clinic system. Appointments cannot be booked without an existing patient record.";
    }

    if (!formData.patientName || !formData.patientName.trim()) {
      errs.patientName = "Patient is required. Please search and select a registered patient above.";
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
          userId: user?.id,
          appointmentTime: formData.appointmentTime.includes(":") && formData.appointmentTime.split(":").length === 2 
            ? `${formData.appointmentTime}:00` 
            : formData.appointmentTime
        })
      });

      setSuccessMsg(`Appointment #${response.appointmentNumber} successfully registered for ${response.patientName}!`);
      onAppointmentCreated(response.appointmentNumber);

      const firstDocName = doctors.length > 0 ? (doctors[0].fullName || (doctors[0].username?.toLowerCase().startsWith("dr") ? doctors[0].username : "Dr. " + doctors[0].username)) : "";
      const firstTreatmentName = treatments.length > 0 ? treatments[0].name : "Teeth Cleaning";

      setSelectedPatient(null);
      setFormData({
        patientId: null,
        patientName: "",
        address: "",
        contactNumber: "",
        dentistName: firstDocName,
        treatmentType: firstTreatmentName,
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
          {user?.role === "ADMIN" ? (
            <span className="badge" style={{ background: "#7c3aed", color: "#fff", marginBottom: "8px" }}>
              Administrator Portal &bull; Scheduling as Clinic Admin ({user?.fullName || user?.username})
            </span>
          ) : (
            <span className="badge badge-teal" style={{ marginBottom: "8px" }}>
              Front-Desk Reception &bull; Booking as Receptionist ({user?.fullName || user?.username})
            </span>
          )}
          <h2>{user?.role === "ADMIN" ? "Schedule Clinic Appointment" : "Front-Desk Appointment Booking"}</h2>
          <p className="card-subtitle">Search registered clinic patients and schedule consultation</p>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: "14px", background: "#d1fae5", color: "#065f46", borderRadius: "8px", marginBottom: "20px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircleIcon size={18} color="#065f46" />
          <span>{successMsg}</span>
        </div>
      )}

      {errors.form && (
        <div style={{ padding: "14px", background: "#fee2e2", color: "#991b1b", borderRadius: "8px", marginBottom: "20px", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertCircleIcon size={18} color="#991b1b" />
          <span>{errors.form}</span>
        </div>
      )}

      {/* Patient Search & Selection Card */}
      {selectedPatient ? (
        <div style={{
          background: "#f0fdf4",
          border: "1.5px solid #86efac",
          borderRadius: "8px",
          padding: "14px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "24px"
        }}>
          <div>
            <strong style={{ color: "#14532d", fontSize: "1rem" }}>{selectedPatient.name} (ID #{selectedPatient.id})</strong>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.84rem", color: "#166534" }}>
              Mobile: <strong>{selectedPatient.contactNumber}</strong> &bull; Address: {selectedPatient.address}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: "6px 14px", fontSize: "0.82rem", background: "#fff" }}
            onClick={handleClearPatient}
          >
            ✕ Change / Clear Patient
          </button>
        </div>
      ) : (
        <div style={{
          background: "#f8fafc",
          border: "1.5px solid var(--border)",
          borderRadius: "8px",
          padding: "16px 18px",
          marginBottom: "24px",
          position: "relative"
        }}>
          <label className="form-label" style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <UsersIcon size={16} color="var(--teal)" /> Search &amp; Select Registered Patient <span className="req">*</span>
          </label>
          <div className="search-input-wrap">
            <span className="search-input-icon">
              <SearchIcon size={16} color="#64748b" />
            </span>
            <input
              type="text"
              className="form-input"
              placeholder="Search registered patient by Mobile Number (e.g. 077...), Name, or Patient ID..."
              value={patientSearchTerm}
              onChange={(e) => {
                setPatientSearchTerm(e.target.value);
                setIsPatientDropdownOpen(true);
              }}
              onFocus={() => setIsPatientDropdownOpen(true)}
            />
          </div>

          {isPatientDropdownOpen && patientSearchTerm.trim().length > 0 && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: "18px",
              right: "18px",
              background: "#ffffff",
              border: "1.5px solid var(--teal)",
              borderRadius: "8px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              zIndex: 50,
              marginTop: "4px",
              maxHeight: "240px",
              overflowY: "auto"
            }}>
              {searchedPatients.length > 0 ? (
                searchedPatients.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPatient(p)}
                    style={{
                      padding: "10px 14px",
                      borderBottom: "1px solid #f1f5f9",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f0fdfa"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#ffffff"}
                  >
                    <div>
                      <div style={{ fontWeight: "600", color: "#0f172a" }}>{p.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Mobile: {p.contactNumber} &bull; {p.address}</div>
                    </div>
                    <span className="badge badge-teal" style={{ fontSize: "0.75rem" }}>Select #ID {p.id}</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: "14px", color: "#64748b", fontSize: "0.88rem", textAlign: "center" }}>
                  No registered patient found matching "{patientSearchTerm}".
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {!selectedPatient && (
            <div style={{
              gridColumn: "1 / -1",
              padding: "12px 16px",
              background: "#fef3c7",
              border: "1px solid #fde68a",
              borderRadius: "8px",
              color: "#92400e",
              fontSize: "0.88rem",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <AlertCircleIcon size={18} color="#d97706" />
              <div>
                <strong>Registered Patient Required:</strong> Appointments must be linked to an existing patient profile. Search and select a patient in the box above.
              </div>
            </div>
          )}

          <div className="form-group full-width">
            <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Patient Full Name <span className="req">*</span></span>
              {selectedPatient ? (
                <span className="badge badge-teal" style={{ fontSize: "0.75rem" }}>✓ System Patient #{selectedPatient.id}</span>
              ) : (
                <span style={{ fontSize: "0.78rem", color: "#dc2626", fontWeight: "500" }}>Select patient from directory above</span>
              )}
            </label>
            <input
              type="text"
              name="patientName"
              className={`form-input ${errors.patientSelection || errors.patientName ? "error" : ""}`}
              value={formData.patientName}
              placeholder={selectedPatient ? "" : "🔒 Locked — Search & select a registered patient from above search"}
              readOnly={true}
              disabled={!selectedPatient}
              style={{
                background: selectedPatient ? "#f0fdf4" : "#f8fafc",
                cursor: selectedPatient ? "default" : "not-allowed",
                fontWeight: selectedPatient ? "600" : "normal",
                color: selectedPatient ? "#0f172a" : "#94a3b8"
              }}
            />
            {errors.patientSelection && <span className="error-text">{errors.patientSelection}</span>}
            {errors.patientName && !errors.patientSelection && <span className="error-text">{errors.patientName}</span>}
          </div>

          <div className="form-group full-width">
            <label className="form-label">Residential Address <span className="req">*</span></label>
            <input
              type="text"
              name="address"
              className="form-input"
              value={formData.address}
              placeholder={selectedPatient ? "" : "🔒 Auto-populated from patient record"}
              readOnly={true}
              disabled={!selectedPatient}
              style={{
                background: selectedPatient ? "#f0fdf4" : "#f8fafc",
                cursor: selectedPatient ? "default" : "not-allowed",
                color: selectedPatient ? "#0f172a" : "#94a3b8"
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Number <span className="req">*</span></label>
            <input
              type="tel"
              name="contactNumber"
              className="form-input"
              value={formData.contactNumber}
              placeholder={selectedPatient ? "" : "🔒 Auto-populated from patient record"}
              readOnly={true}
              disabled={!selectedPatient}
              style={{
                background: selectedPatient ? "#f0fdf4" : "#f8fafc",
                cursor: selectedPatient ? "default" : "not-allowed",
                color: selectedPatient ? "#0f172a" : "#94a3b8"
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Dentist <span className="req">*</span></label>
            <select
              name="dentistName"
              className="form-select"
              value={formData.dentistName}
              onChange={handleChange}
            >
              {doctors.map(d => {
                const docName = d.fullName || (d.username?.toLowerCase().startsWith("dr") ? d.username : "Dr. " + d.username);
                return (
                  <option key={d.id || d.username} value={docName}>
                    {docName}
                  </option>
                );
              })}
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
              {treatments.map(t => (
                <option key={t.id || t.name} value={t.name}>
                  {t.name} (Treatment Cost: LKR {Number(t.price).toLocaleString()})
                </option>
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

/* =========================================================================
   SEARCH & LOOKUP APPOINTMENTS
   ========================================================================= */

function SearchAppointment({ user, selectedId, setActiveTab, onSelectAppointment }) {
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
            <h2>{user?.role === "PATIENT" ? "Look Up Your Appointment" : "Search & Display Appointment"}</h2>
            <p className="card-subtitle">
              {user?.role === "PATIENT"
                ? "Enter your unique appointment number to inspect booking time, attending dentist & details"
                : "Search registered appointments by unique appointment number"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="search-bar-box">
          <div className="search-input-wrap">
            <span className="search-input-icon">
              <SearchIcon size={18} color="#64748b" />
            </span>
            <input
              type="number"
              className="form-input"
              placeholder="Enter Appointment Number (e.g. 1)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search Record
          </button>
        </form>

        {loading && <p style={{ color: "#64748b" }}>Fetching appointment details...</p>}

        {error && (
          <div style={{ padding: "14px", background: "#fee2e2", color: "#ef4444", borderRadius: "8px", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircleIcon size={16} color="#ef4444" />
            <span>{error}</span>
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

            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              {user?.role === "PATIENT" ? (
                <div style={{ padding: "12px 18px", background: "#e0f2fe", border: "1px solid #7dd3fc", borderRadius: "8px", fontSize: "0.85rem", color: "#0369a1", width: "100%", display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertCircleIcon size={18} color="#0369a1" />
                  <span><strong>Patient Notice:</strong> You can view and search your scheduled appointment details above. In accordance with clinic policy, official billing calculations and invoices are generated and settled by reception staff at the clinic checkout counter.</span>
                </div>
              ) : user?.role === "DOCTOR" ? (
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    Attending Physician Record View &bull; Treatment billing is finalized by reception
                  </span>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setActiveTab("dashboard")}
                  >
                    &larr; Back to Clinical Schedule
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      onSelectAppointment(appointment.appointmentNumber);
                      setActiveTab("billing");
                    }}
                  >
                    Proceed to Generate &amp; Print Bill &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   BILLING & OFFICIAL PATIENT INVOICE
   ========================================================================= */

function Billing({ user, selectedId }) {
  const [appointmentNum, setAppointmentNum] = useState(selectedId ? String(selectedId) : "1");
  const [billReceipt, setBillReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user?.role === "PATIENT") {
    return (
      <div className="card" style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center", padding: "36px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertCircleIcon size={32} color="#0284c7" />
          </div>
        </div>
        <h2>Patient Billing Notice</h2>
        <p style={{ color: "#64748b", marginTop: "8px", lineHeight: "1.6" }}>
          In accordance with Sunrise Dental Clinic billing and clinical governance protocols, patients are not permitted to calculate or generate bills.
          Please visit the front-desk reception counter upon completion of your appointment to settle treatment payments and receive your official invoice receipt.
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
    setError("");

    try {
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
            <h2>Calculate &amp; Issue Bill</h2>
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
            {loading ? "Calculating..." : "Calculate & Generate"}
          </button>
        </form>

        {error && (
          <div style={{ padding: "12px 16px", background: "#fee2e2", color: "#ef4444", borderRadius: "8px", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
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
            <button className="btn btn-primary" onClick={handlePrint} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <ReceiptIcon size={16} /> Print Patient Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   USER & TREATMENT MANAGEMENT (ADMIN ONLY)
   ========================================================================= */

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterRole, setFilterRole] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("DOCTOR");
  const [showPassword, setShowPassword] = useState(false);

  // Treatment management form state
  const [newTreatmentName, setNewTreatmentName] = useState("");
  const [newTreatmentPrice, setNewTreatmentPrice] = useState("");
  const [newTreatmentDesc, setNewTreatmentDesc] = useState("");
  const [treatmentSubmitting, setTreatmentSubmitting] = useState(false);
  const [treatmentMsg, setTreatmentMsg] = useState("");
  const [treatmentError, setTreatmentError] = useState("");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadUsersAndTreatments();
  }, []);

  const loadUsersAndTreatments = async () => {
    setLoading(true);
    try {
      const [userRes, treatRes] = await Promise.allSettled([
        apiCall("/users"),
        apiCall("/treatments")
      ]);

      if (userRes.status === "fulfilled") {
        setUsers(userRes.value || []);
      }
      if (treatRes.status === "fulfilled") {
        setTreatments(treatRes.value || []);
      }
    } catch (err) {
      console.error("Failed to load users or treatments", err);
      setErrorMsg(err.message || "Failed to fetch management data");
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
      const computedFullName = fullName.trim() || (role === "DOCTOR" ? (username.startsWith("Dr.") ? username : "Dr. " + username) : username);

      const payload = {
        fullName: computedFullName,
        username: username.trim(),
        password: password,
        role: role,
        email: email.trim()
      };

      const newUser = await apiCall("/users/register", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setSuccessMsg(`Account for "${newUser.fullName || newUser.username}" (${newUser.role}) created successfully! Credentials sent to ${newUser.email || email}.`);

      setFullName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("DOCTOR");
      setShowPassword(false);

      loadUsersAndTreatments();
    } catch (err) {
      setErrorMsg(err.message || "Failed to register user. Please verify input.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTreatment = async (e) => {
    e.preventDefault();
    setTreatmentError("");
    setTreatmentMsg("");

    if (!newTreatmentName.trim()) {
      setTreatmentError("Treatment name is required.");
      return;
    }

    const priceNum = parseFloat(newTreatmentPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setTreatmentError("Please specify a valid positive price in LKR.");
      return;
    }

    setTreatmentSubmitting(true);

    try {
      const payload = {
        name: newTreatmentName.trim(),
        price: priceNum,
        description: newTreatmentDesc.trim() || (newTreatmentName.trim() + " Procedure")
      };

      await apiCall("/treatments", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setTreatmentMsg(`Treatment "${payload.name}" added successfully at LKR ${priceNum.toLocaleString()}!`);
      setNewTreatmentName("");
      setNewTreatmentPrice("");
      setNewTreatmentDesc("");

      const res = await apiCall("/treatments");
      setTreatments(res || []);
    } catch (err) {
      setTreatmentError(err.message || "Failed to create treatment.");
    } finally {
      setTreatmentSubmitting(false);
    }
  };

  const handleDeleteTreatment = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove treatment "${name}"?`)) return;

    try {
      await apiCall(`/treatments/${id}`, { method: "DELETE" });
      setTreatmentMsg(`Treatment "${name}" removed successfully.`);
      const res = await apiCall("/treatments");
      setTreatments(res || []);
    } catch (err) {
      setTreatmentError(err.message || "Failed to delete treatment.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === "ALL" || u.role === filterRole;
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.fullName && u.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const doctorCount = users.filter((u) => u.role === "DOCTOR").length;
  const staffCount = users.filter((u) => u.role === "STAFF").length;
  const patientCount = users.filter((u) => u.role === "PATIENT").length;

  return (
    <div className="user-management-container">
      <div className="stats-grid" style={{ marginBottom: "24px" }}>
        <div className="stat-card">
          <div className="stat-icon blue">
            <UsersIcon size={24} color="#0284c7" />
          </div>
          <div className="stat-info">
            <h3>{users.length}</h3>
            <p>Total Registered Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teal">
            <StethoscopeIcon size={24} color="#0d9488" />
          </div>
          <div className="stat-info">
            <h3>{doctorCount}</h3>
            <p>Registered Dentists</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <UsersIcon size={24} color="#16a34a" />
          </div>
          <div className="stat-info">
            <h3>{staffCount}</h3>
            <p>Active Staff &amp; Reception</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <ToothIcon size={24} color="#d97706" />
          </div>
          <div className="stat-info">
            <h3>{treatments.length}</h3>
            <p>Active Treatment Types</p>
          </div>
        </div>
      </div>

      {/* User Registration & Directory Table */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(340px, 420px) 1fr", gap: "24px", alignItems: "start", marginBottom: "32px" }}>
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ background: "#e0f2fe", width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "10px" }}>
              <UsersIcon size={22} color="#0284c7" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#0f172a" }}>Register New User</h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>Provision doctor, staff, or patient accounts</p>
            </div>
          </div>

          <div style={{ padding: "10px 12px", background: "#f1f5f9", borderLeft: "4px solid #0284c7", borderRadius: "6px", fontSize: "0.78rem", color: "#334155", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircleIcon size={16} color="#0284c7" />
            <span><strong>Admin Provisioning:</strong> Doctors registered here appear in appointment assignment and can log in to view their scheduled patients.</span>
          </div>

          {errorMsg && (
            <div style={{ padding: "10px 14px", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "16px", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertCircleIcon size={16} color="#b91c1c" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ padding: "12px 14px", background: "#ecfdf5", color: "#065f46", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "16px", fontWeight: "500", lineHeight: "1.4", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircleIcon size={16} color="#065f46" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label">User Access Role</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                <button
                  type="button"
                  className={`btn ${role === "DOCTOR" ? "btn-primary" : "btn-secondary"}`}
                  style={{ padding: "10px 6px", fontSize: "0.82rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                  onClick={() => setRole("DOCTOR")}
                >
                  <StethoscopeIcon size={14} />
                  <span>Dentist</span>
                </button>
                <button
                  type="button"
                  className={`btn ${role === "STAFF" ? "btn-primary" : "btn-secondary"}`}
                  style={{ padding: "10px 6px", fontSize: "0.82rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                  onClick={() => setRole("STAFF")}
                >
                  <UsersIcon size={14} />
                  <span>Staff</span>
                </button>
                <button
                  type="button"
                  className={`btn ${role === "PATIENT" ? "btn-primary" : "btn-secondary"}`}
                  style={{ padding: "10px 6px", fontSize: "0.82rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                  onClick={() => setRole("PATIENT")}
                >
                  <ToothIcon size={14} />
                  <span>Patient</span>
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label">{role === "DOCTOR" ? "Doctor Full Name & Title *" : "Full Name *"}</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={role === "DOCTOR" ? "e.g. Dr. Kasun Jayawardena" : "e.g. Sunil De Silva"}
                required
              />
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                {role === "DOCTOR" ? "This clinical name is displayed in appointment scheduling and patient queues." : "Full name for administrative identification."}
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label">Username (Login ID) *</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. dr_kasun or staff_sunil"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label">Recipient Email Address *</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Credentials &amp; login link will be dispatched to this address.</span>
            </div>

            <div className="form-group" style={{ marginBottom: "22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <label className="form-label" style={{ margin: 0 }}>Account Password *</label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  style={{ background: "none", border: "none", color: "#0284c7", fontSize: "0.78rem", cursor: "pointer", fontWeight: "600", textDecoration: "underline" }}
                >
                  Auto-Generate
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
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting}
              style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              <PlusIcon size={16} />
              <span>{submitting ? "Registering User..." : `Register ${role === "DOCTOR" ? "Dentist" : role === "STAFF" ? "Staff" : "Patient"} & Send Email`}</span>
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
              onClick={loadUsersAndTreatments}
              disabled={loading}
              style={{ fontSize: "0.82rem", padding: "6px 14px" }}
            >
              {loading ? "Refreshing..." : "Refresh List"}
            </button>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", marginBottom: "18px" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search name, username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: "8px 12px", fontSize: "0.85rem" }}
              />
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {["ALL", "DOCTOR", "STAFF", "PATIENT", "ADMIN"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFilterRole(r)}
                  className={`btn ${filterRole === r ? "btn-primary" : "btn-secondary"}`}
                  style={{ padding: "6px 12px", fontSize: "0.75rem", borderRadius: "20px" }}
                >
                  {r === "ALL" ? `All (${users.length})` : r === "DOCTOR" ? `Dentists (${users.filter((u) => u.role === r).length})` : `${r} (${users.filter((u) => u.role === r).length})`}
                </button>
              ))}
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>ID</th>
                  <th>Clinical / User Name</th>
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
                              width: "30px",
                              height: "30px",
                              borderRadius: "50%",
                              background:
                                u.role === "ADMIN"
                                  ? "#f97316"
                                  : u.role === "DOCTOR"
                                  ? "#0d9488"
                                  : u.role === "STAFF"
                                  ? "#0284c7"
                                  : "#8b5cf6",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.75rem",
                              fontWeight: "700"
                            }}
                          >
                            {(u.fullName || u.username).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: "600", color: "#0f172a", fontSize: "0.88rem" }}>
                              {u.fullName || u.username}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                              @{u.username}
                            </div>
                          </div>
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
                                : u.role === "DOCTOR"
                                ? "#ccfbf1"
                                : u.role === "STAFF"
                                ? "#e0f2fe"
                                : "#f3e8ff",
                            color:
                              u.role === "ADMIN"
                                ? "#c2410c"
                                : u.role === "DOCTOR"
                                ? "#0f766e"
                                : u.role === "STAFF"
                                ? "#0369a1"
                                : "#7e22ce"
                          }}
                        >
                          {u.role === "ADMIN" ? "ADMIN" : u.role === "DOCTOR" ? "DENTIST" : u.role === "STAFF" ? "STAFF" : "PATIENT"}
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

      {/* Treatment & Pricing Management Card */}
      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "#fef3c7", width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "10px" }}>
              <BanknotesIcon size={22} color="#d97706" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#0f172a" }}>Treatment Types &amp; Pricing Management</h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>Configure clinical dental procedures, tariffs, and custom prices</p>
            </div>
          </div>
          <span className="badge badge-teal">{treatments.length} Active Procedures</span>
        </div>

        {treatmentMsg && (
          <div style={{ padding: "10px 14px", background: "#ecfdf5", color: "#065f46", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircleIcon size={16} color="#065f46" />
            <span>{treatmentMsg}</span>
          </div>
        )}

        {treatmentError && (
          <div style={{ padding: "10px 14px", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircleIcon size={16} color="#b91c1c" />
            <span>{treatmentError}</span>
          </div>
        )}

        <form onSubmit={handleAddTreatment} style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1.5fr auto", gap: "12px", alignItems: "end" }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: "0.8rem" }}>Treatment Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dental Crown / Veneer"
                value={newTreatmentName}
                onChange={(e) => setNewTreatmentName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: "0.8rem" }}>Price in LKR *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                className="form-input"
                placeholder="e.g. 25000"
                value={newTreatmentPrice}
                onChange={(e) => setNewTreatmentPrice(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: "0.8rem" }}>Description (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Porcelain restoration"
                value={newTreatmentDesc}
                onChange={(e) => setNewTreatmentDesc(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={treatmentSubmitting}
                style={{ padding: "9px 16px", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <PlusIcon size={16} />
                <span>{treatmentSubmitting ? "Adding..." : "Add Treatment"}</span>
              </button>
            </div>
          </div>
        </form>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "50px" }}>ID</th>
                <th>Treatment Procedure</th>
                <th>Standard Price (LKR)</th>
                <th>Clinical Description</th>
                <th style={{ width: "80px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {treatments.map((t) => (
                <tr key={t.id || t.name}>
                  <td style={{ fontWeight: "600", color: "#64748b" }}>#{t.id || "-"}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ToothIcon size={16} color="#0d9488" />
                      <strong style={{ color: "#0f172a" }}>{t.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: "700", color: "#0f766e", fontSize: "0.9rem" }}>
                      LKR {Number(t.price).toLocaleString()}
                    </span>
                  </td>
                  <td style={{ color: "#64748b", fontSize: "0.85rem" }}>
                    {t.description || "Standard clinic procedure"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {t.id && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: "4px 8px", color: "#dc2626", border: "1px solid #fecaca" }}
                        onClick={() => handleDeleteTreatment(t.id, t.name)}
                        title="Remove Treatment"
                      >
                        <TrashIcon size={14} color="#dc2626" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   ROLE-ADAPTIVE HELP & STANDARD OPERATING PROCEDURES (SOP)
   ========================================================================= */

function Help({ user, setActiveTab }) {
  const currentRole = user?.role || "STAFF";
  const [selectedRoleFilter, setSelectedRoleFilter] = useState(currentRole);
  const [openIndex, setOpenIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const guides = [
    {
      id: "doc-1",
      role: "DOCTOR",
      badge: "Clinical Duty",
      title: "1. How to Review Assigned Patients & Queue",
      summary: "Protocol for inspecting attending patient queue, treatment types, and consultation schedule.",
      action: { tab: "dashboard", label: "Open Clinical Schedule" },
      steps: [
        "Upon login with your Doctor account, the dashboard automatically filters consultations assigned to you.",
        "Use the Schedule Filter dropdown to alternate between 'My Assigned Patients' and all scheduled appointments.",
        "Review patient demographics, required dental treatment, and arrival time before calling the patient to the chair.",
        "Click 'View' to inspect comprehensive patient record history and contact info."
      ]
    },
    {
      id: "doc-2",
      role: "DOCTOR",
      badge: "Clinical Documentation",
      title: "2. How to Record Chairside Notes & Mark Treatments Completed",
      summary: "Clinical recording of tooth quadrant observations, materials, and treatment completion status.",
      action: { tab: "dashboard", label: "View Queue" },
      steps: [
        "Click the 'Notes' button next to the active patient in your queue.",
        "Enter clinical findings, tooth quadrant, materials used, anesthesia administered, or post-op instructions.",
        "Click 'Save Clinical Note' to preserve the note for the current clinical session.",
        "Once procedure finishes, click 'Done' to update the patient status to Completed and update clinic counters."
      ]
    },
    {
      id: "staff-1",
      role: "STAFF",
      badge: "Front-Desk SOP",
      title: "3. How to Register a New Patient & Schedule Appointment",
      summary: "Complete workflow for onboarding patients and reserving dental chair slots with automated deduplication.",
      action: { tab: "register", label: "Open Registration" },
      steps: [
        "Navigate to 'Register Appointment' on the sidebar.",
        "Enter patient demographic details: Full Name, Address, and 10–15 digit phone number.",
        "Select the attending Dental Surgeon from the dynamically populated doctor list.",
        "Select the required Treatment Type from the dynamically loaded tariffs.",
        "Verify estimated total cost preview (Base Consultation Fee LKR 1,500 + Treatment Tariff).",
        "Select Appointment Date and Time, then click 'Confirm & Save Appointment'."
      ]
    },
    {
      id: "staff-2",
      role: "STAFF",
      badge: "Billing SOP",
      title: "4. How to Calculate Treatment Fees & Print Official Invoices",
      summary: "Standard clinical billing calculations and producing print-ready patient invoice receipts.",
      action: { tab: "billing", label: "Open Billing" },
      steps: [
        "Navigate to 'Calculate & Print Bill' on the sidebar.",
        "Enter the Appointment Number and click 'Calculate & Generate'.",
        "The system applies the official tariff formula: Total Bill = Base Fee (LKR 1,500.00) + Treatment Price.",
        "Click 'Print Patient Receipt' to trigger the browser print dialog or export a PDF receipt."
      ]
    },
    {
      id: "admin-1",
      role: "ADMIN",
      badge: "Administration",
      title: "5. How to Register Doctors & Configure Treatment Tariffs",
      summary: "Managing clinical staff provision, doctor assignments, and custom dental pricing.",
      action: { tab: "users", label: "Open User Management" },
      steps: [
        "Navigate to 'User Management' on the sidebar.",
        "To register a doctor, select 'Dentist', provide their Full Name (e.g., Dr. Kasun Jayawardena), username, email, and password.",
        "Upon registration, the doctor will immediately appear in appointment assignment and can log into their chairside dashboard.",
        "To add new treatments and prices, scroll to 'Treatment Types & Pricing Management', enter the procedure name, price in LKR, and click 'Add Treatment'."
      ]
    },
    {
      id: "patient-1",
      role: "PATIENT",
      badge: "Patient Portal",
      title: "6. How to Search & Inspect Your Scheduled Appointment",
      summary: "Patient self-service lookup for appointment status, date, time, and attending doctor.",
      action: { tab: "search", label: "Search Appointment" },
      steps: [
        "Navigate to 'Search Appointments' on the sidebar.",
        "Enter your unique Appointment Number provided during booking.",
        "Review your appointment status, confirmed schedule time, and attending dentist.",
        "Please visit the reception counter upon appointment completion to settle official invoice billing."
      ]
    }
  ];

  const filteredGuides = guides.filter(item => {
    const matchesRole = selectedRoleFilter === "ALL" || item.role === selectedRoleFilter;
    const matchesSearch = searchTerm.trim() === "" || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.steps.some(step => step.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  return (
    <div style={{ maxWidth: "920px", margin: "0 auto", paddingBottom: "40px" }}>
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-header" style={{ alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <h2 style={{ margin: 0 }}>System Help &amp; Operating Guidelines</h2>
              <span className="badge badge-teal">
                Role: {user?.role || "STAFF"}
              </span>
            </div>
            <p className="card-subtitle">
              Role-adaptive documentation and standard operating procedures for Sunrise Dental Clinic
            </p>
          </div>

          <div style={{ minWidth: "260px" }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search instructions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: "0.88rem", padding: "8px 14px" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "16px", borderTop: "1px solid var(--border)", paddingTop: "16px", flexWrap: "wrap" }}>
          <button
            className={`role-chip ${selectedRoleFilter === "DOCTOR" ? "active" : ""}`}
            onClick={() => { setSelectedRoleFilter("DOCTOR"); setOpenIndex(0); }}
          >
            Dentist / Doctor Guide
          </button>
          <button
            className={`role-chip ${selectedRoleFilter === "STAFF" ? "active" : ""}`}
            onClick={() => { setSelectedRoleFilter("STAFF"); setOpenIndex(0); }}
          >
            Receptionist / Staff Guide
          </button>
          <button
            className={`role-chip ${selectedRoleFilter === "ADMIN" ? "active" : ""}`}
            onClick={() => { setSelectedRoleFilter("ADMIN"); setOpenIndex(0); }}
          >
            Administrator Guide
          </button>
          <button
            className={`role-chip ${selectedRoleFilter === "PATIENT" ? "active" : ""}`}
            onClick={() => { setSelectedRoleFilter("PATIENT"); setOpenIndex(0); }}
          >
            Patient Self-Service
          </button>
          <button
            className={`role-chip ${selectedRoleFilter === "ALL" ? "active" : ""}`}
            onClick={() => { setSelectedRoleFilter("ALL"); setOpenIndex(0); }}
          >
            All Guides ({guides.length})
          </button>
        </div>
      </div>

      {filteredGuides.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
          <p style={{ fontSize: "1.1rem", marginBottom: "8px", fontWeight: "600" }}>No matching instructions found</p>
          <p style={{ fontSize: "0.9rem" }}>Try changing your search term or selecting a different role filter above.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredGuides.map((guide, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={guide.id}
                style={{
                  background: "var(--bg-card)",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                  boxShadow: isOpen ? "var(--shadow-md)" : "var(--shadow-sm)",
                  overflow: "hidden",
                  transition: "var(--transition)"
                }}
              >
                <div
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    background: isOpen ? "linear-gradient(90deg, #f8fafc, #ffffff)" : "transparent",
                    borderBottom: isOpen ? "1px solid var(--border)" : "none"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, paddingRight: "12px" }}>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: guide.role === "ADMIN" ? "#dbeafe" : guide.role === "STAFF" ? "#ccfbf1" : guide.role === "DOCTOR" ? "#e0f2fe" : "#fef3c7",
                        color: guide.role === "ADMIN" ? "#1e40af" : guide.role === "STAFF" ? "#0f766e" : guide.role === "DOCTOR" ? "#0369a1" : "#b45309"
                      }}
                    >
                      {guide.badge}
                    </span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--text-main)" }}>{guide.title}</h4>
                      <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>{guide.summary}</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>
                      {isOpen ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ padding: "20px", background: "#fafbfc" }}>
                    <ol style={{ paddingLeft: "22px", margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                      {guide.steps.map((step, sIdx) => (
                        <li key={sIdx} style={{ fontSize: "0.92rem", color: "var(--text-main)", lineHeight: "1.6" }}>
                          {step}
                        </li>
                      ))}
                    </ol>

                    {guide.action && setActiveTab && (
                      <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px dashed var(--border)" }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: "7px 14px", fontSize: "0.85rem" }}
                          onClick={() => setActiveTab(guide.action.tab)}
                        >
                          {guide.action.label} &rarr;
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

/* =========================================================================
   ROOT APPLICATION COMPONENT
   ========================================================================= */

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
      role: authData.role,
      fullName: authData.fullName
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
              {activeTab === "dashboard" && (user.role === "DOCTOR" ? "Doctor Clinical Portal" : "Clinic Dashboard")}
              {activeTab === "users" && "User & Treatment Management"}
              {activeTab === "register" && "Appointment Registration"}
              {activeTab === "search" && "Appointment Lookup"}
              {activeTab === "billing" && "Billing & Patient Receipts"}
              {activeTab === "help" && "Help & Operating Guidelines"}
            </h1>
          </div>
        </header>

        <main className="content-area">
          {activeTab === "dashboard" && (
            <Dashboard
              user={user}
              setActiveTab={setActiveTab}
              onSelectAppointment={(id) => setSelectedAppointmentId(id)}
            />
          )}

          {activeTab === "users" && user.role === "ADMIN" && (
            <UserManagement />
          )}

          {activeTab === "register" && (
            <RegisterAppointment
              user={user}
              setActiveTab={setActiveTab}
              onAppointmentCreated={(id) => {
                setSelectedAppointmentId(id);
              }}
            />
          )}

          {activeTab === "search" && (
            <SearchAppointment
              user={user}
              selectedId={selectedAppointmentId}
              setActiveTab={setActiveTab}
              onSelectAppointment={(id) => setSelectedAppointmentId(id)}
            />
          )}

          {activeTab === "billing" && (
            <Billing
              user={user}
              selectedId={selectedAppointmentId}
            />
          )}

          {activeTab === "help" && (
            <Help
              user={user}
              setActiveTab={setActiveTab}
            />
          )}
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
