import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Settings from "./pages/Settings.jsx";
import Onboarding from "./pages/Onboarding.jsx";

export default function App() {
  return (
    <div>
      <nav className="nav">
        <div className="brand">Tollbooth</div>
        <Link to="/">Dashboard</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/onboarding">Onboarding</Link>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </div>
    </div>
  );
}
