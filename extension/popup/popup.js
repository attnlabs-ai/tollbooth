async function getSettings() {
  return await chrome.runtime.sendMessage({ type: "getSettings" });
}

async function setSettings(settings) {
  return await chrome.runtime.sendMessage({ type: "setSettings", settings });
}

async function getEvents() {
  return await chrome.runtime.sendMessage({ type: "getEvents" });
}

const statusEl = document.getElementById("status");
const toggleEl = document.getElementById("enabledToggle");
const eventCountEl = document.getElementById("eventCount");
const dashboardBtn = document.getElementById("dashboardBtn");

(async () => {
  const { settings } = await getSettings();
  toggleEl.checked = !!settings.enabled;
  statusEl.textContent = settings.enabled ? "Active" : "Paused";

  const { events } = await getEvents();
  eventCountEl.textContent = String(events.length || 0);
})();

toggleEl.addEventListener("change", async () => {
  const { settings } = await getSettings();
  const next = { ...settings, enabled: toggleEl.checked };
  await setSettings(next);
  statusEl.textContent = next.enabled ? "Active" : "Paused";
});

dashboardBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: "http://localhost:5173" });
});
