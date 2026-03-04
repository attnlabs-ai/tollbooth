import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const CATEGORY_LIST = [
  "alcohol",
  "gambling",
  "shopping",
  "food_delivery",
  "nicotine",
  "gaming",
  "adult",
  "supplements",
  "caffeine"
];

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("tb_token");
    if (!token) return;

    fetch(`${API_URL}/api/settings`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setSettings(data.settings || null))
      .catch(() => {});
  }, []);

  if (!localStorage.getItem("tb_token")) {
    return (
      <div className="card">
        <h2>Connect your account</h2>
        <p>Log in via the API to manage settings.</p>
      </div>
    );
  }

  if (!settings) {
    return <div className="card">Loading settings…</div>;
  }

  const updateCategory = (category) => {
    setSettings({
      ...settings,
      categories: {
        ...settings.categories,
        [category]: !settings.categories?.[category]
      }
    });
  };

  const save = () => {
    const token = localStorage.getItem("tb_token");
    fetch(`${API_URL}/api/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ settings })
    })
      .then((res) => res.json())
      .then(() => setMessage("Saved"))
      .catch(() => setMessage("Save failed"));
  };

  return (
    <div>
      <div className="card">
        <h2>Categories</h2>
        <div className="grid">
          {CATEGORY_LIST.map((category) => (
            <label key={category}>
              <input
                type="checkbox"
                checked={!!settings.categories?.[category]}
                onChange={() => updateCategory(category)}
              />
              {" "}{category.replace("_", " ")}
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Mode</h2>
        <select
          className="input"
          value={settings.defaultMode || "warn"}
          onChange={(e) => setSettings({ ...settings, defaultMode: e.target.value })}
        >
          <option value="warn">Warn</option>
          <option value="block">Block</option>
          <option value="friction">Friction</option>
          <option value="cooldown">Cool-down</option>
        </select>

        <label>
          Friction %
          <input
            className="input"
            type="range"
            min="25"
            max="200"
            step="25"
            value={settings.frictionPercent || 100}
            onChange={(e) => setSettings({ ...settings, frictionPercent: Number(e.target.value) })}
          />
          <div>{settings.frictionPercent || 100}%</div>
        </label>

        <label>
          Cool-down hours
          <input
            className="input"
            type="number"
            min="1"
            max="72"
            value={settings.cooldownHours || 24}
            onChange={(e) => setSettings({ ...settings, cooldownHours: Number(e.target.value) })}
          />
        </label>

        <label>
          Accountability partner email
          <input
            className="input"
            type="email"
            value={settings.accountabilityEmail || ""}
            onChange={(e) => setSettings({ ...settings, accountabilityEmail: e.target.value })}
          />
        </label>

        <button className="button" onClick={save}>Save settings</button>
        {message && <div>{message}</div>}
      </div>
    </div>
  );
}
