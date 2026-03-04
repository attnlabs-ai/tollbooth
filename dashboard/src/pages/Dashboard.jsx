import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("tb_token");
    if (!token) return;

    fetch(`${API_URL}/api/events/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats || null);
        setRecent(data.recent || []);
      })
      .catch(() => {});
  }, []);

  if (!localStorage.getItem("tb_token")) {
    return (
      <div className="card">
        <h2>Connect your account</h2>
        <p>Log in via the API to see dashboard stats.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid">
        <div className="card">
          <div className="badge">Blocks this week</div>
          <div className="stat">{stats?.blocks ?? 0}</div>
        </div>
        <div className="card">
          <div className="badge">Estimated saved</div>
          <div className="stat">${stats?.estimatedSaved ?? 0}</div>
        </div>
        <div className="card">
          <div className="badge">Streak</div>
          <div className="stat">{stats?.streakDays ?? 0} days</div>
        </div>
        <div className="card">
          <div className="badge">Cooldowns</div>
          <div className="stat">{stats?.cooldowns ?? 0}</div>
        </div>
      </div>

      <div className="card">
        <h3>Recent events</h3>
        {recent.length === 0 ? (
          <p>No events yet.</p>
        ) : (
          <ul>
            {recent.map((event) => (
              <li key={event.id || event.timestamp}>
                {new Date(event.timestamp).toLocaleString()} — {event.category} — {event.action}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
