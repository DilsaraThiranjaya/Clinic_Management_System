import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Help from "./components/Help";

export default function App() {
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
              {activeTab === "register" && "Appointment Registration"}
              {activeTab === "search" && "Appointment Lookup"}
              {activeTab === "billing" && "Billing & Patient Receipts"}
              {activeTab === "help" && "Staff Help & Documentation"}
            </h1>
          </div>

          <div className="top-bar-right">
            <div className="status-badge">
              <span className="status-dot"></span>
              <span>Backend Connected</span>
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

          {activeTab === "help" && <Help />}
        </main>
      </div>
    </div>
  );
}
