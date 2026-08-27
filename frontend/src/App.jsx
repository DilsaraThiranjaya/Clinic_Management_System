import React, { useState, useEffect } from "react";
import Login from "./components/Login";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("clinic_user");
    return saved ? JSON.parse(saved) : null;
  });

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
  };

  const handleLogout = () => {
    localStorage.removeItem("clinic_jwt_token");
    localStorage.removeItem("clinic_user");
    setUser(null);
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return <div className="app-container"></div>;
}
