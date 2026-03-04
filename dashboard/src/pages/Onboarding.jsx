import React, { useState } from "react";

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

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [categories, setCategories] = useState({
    alcohol: true,
    gambling: true,
    shopping: true
  });
  const [mode, setMode] = useState("friction");
  const [frictionPercent, setFrictionPercent] = useState(100);
  const [cooldownHours, setCooldownHours] = useState(24);
  const [status, setStatus] = useState("");

  const toggleCategory = (category) => {
    setCategories({ ...categories, [category]: !categories[category] });
  };

  const register = async () => {
    setStatus("");
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      setStatus("Registration failed");
      return;
    }

    const data = await res.json();
    localStorage.setItem("tb_token", data.token);
    setStep(2);
  };

  const saveSettings = async () => {
    const token = localStorage.getItem("tb_token");
    const settings = {
      categories,
      defaultMode: mode,
      frictionPercent,
      cooldownHours
    };

    await fetch(`${API_URL}/api/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ settings })
    });
    setStep(3);
  };

  return (
    <div className="card">
      {step === 1 && (
        <div>
          <h2>Step 1: Create account</h2>
          <label>
            Email
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="button" onClick={register}>Create account</button>
          {status && <div>{status}</div>}
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Step 2: Choose categories</h2>
          <div className="grid">
            {CATEGORY_LIST.map((category) => (
              <label key={category}>
                <input
                  type="checkbox"
                  checked={!!categories[category]}
                  onChange={() => toggleCategory(category)}
                />
                {" "}{category.replace("_", " ")}
              </label>
            ))}
          </div>
          <h3>Intervention</h3>
          <select className="input" value={mode} onChange={(e) => setMode(e.target.value)}>
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
              value={frictionPercent}
              onChange={(e) => setFrictionPercent(Number(e.target.value))}
            />
            <div>{frictionPercent}%</div>
          </label>
          <label>
            Cool-down hours
            <input
              className="input"
              type="number"
              min="1"
              max="72"
              value={cooldownHours}
              onChange={(e) => setCooldownHours(Number(e.target.value))}
            />
          </label>
          <button className="button" onClick={saveSettings}>Save settings</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>Step 3: You're ready</h2>
          <p>Your settings are saved. Install the extension and start browsing.</p>
          <button className="button secondary" onClick={() => (window.location.href = "/")}>Go to Dashboard</button>
        </div>
      )}
    </div>
  );
}
