const DEFAULT_SETTINGS = {
  enabled: true,
  categories: {
    alcohol: true,
    gambling: true,
    shopping: true,
    food_delivery: false,
    nicotine: false,
    gaming: false,
    adult: false,
    supplements: false,
    caffeine: false
  },
  categoryModes: {
    alcohol: "friction",
    gambling: "block",
    shopping: "warn",
    food_delivery: "warn",
    nicotine: "block",
    gaming: "warn",
    adult: "block",
    supplements: "warn",
    caffeine: "warn"
  },
  frictionPercent: 100,
  cooldownHours: 24,
  apiBaseUrl: "",
  apiAuthToken: ""
};

async function getStorage(keys) {
  return await chrome.storage.local.get(keys);
}

async function setStorage(values) {
  return await chrome.storage.local.set(values);
}

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await getStorage(["settings", "cooldowns", "events"]);
  if (!stored.settings) {
    await setStorage({ settings: DEFAULT_SETTINGS });
  }
  if (!stored.cooldowns) {
    await setStorage({ cooldowns: {} });
  }
  if (!stored.events) {
    await setStorage({ events: [] });
  }
});

function buildCooldownKey(category, domain) {
  return `${category}::${domain}`;
}

async function isInCooldown(category, domain) {
  const { cooldowns } = await getStorage(["cooldowns"]);
  const key = buildCooldownKey(category, domain);
  const until = cooldowns?.[key];
  if (!until) return false;
  if (Date.now() > until) {
    const next = { ...cooldowns };
    delete next[key];
    await setStorage({ cooldowns: next });
    return false;
  }
  return true;
}

async function setCooldown(category, domain, hours) {
  const { cooldowns } = await getStorage(["cooldowns"]);
  const key = buildCooldownKey(category, domain);
  const next = { ...(cooldowns || {}) };
  next[key] = Date.now() + hours * 60 * 60 * 1000;
  await setStorage({ cooldowns: next });
}

async function logEvent(event) {
  const { events, settings } = await getStorage(["events", "settings"]);
  const next = [...(events || []), event].slice(-500);
  await setStorage({ events: next });

  if (settings?.apiBaseUrl && settings?.apiAuthToken) {
    fetch(`${settings.apiBaseUrl.replace(/\/$/, "")}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.apiAuthToken}`
      },
      body: JSON.stringify(event)
    }).catch(() => {});
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message?.type === "getSettings") {
      const { settings } = await getStorage(["settings"]);
      sendResponse({ settings: settings || DEFAULT_SETTINGS });
      return;
    }

    if (message?.type === "setSettings") {
      const current = (await getStorage(["settings"])).settings || DEFAULT_SETTINGS;
      const next = { ...current, ...message.settings };
      await setStorage({ settings: next });
      sendResponse({ settings: next });
      return;
    }

    if (message?.type === "shouldIntercept") {
      const { settings } = await getStorage(["settings"]);
      const s = settings || DEFAULT_SETTINGS;
      if (!s.enabled) {
        sendResponse({ intercept: false, reason: "disabled" });
        return;
      }
      if (!s.categories?.[message.category]) {
        sendResponse({ intercept: false, reason: "category_disabled" });
        return;
      }
      const inCooldown = await isInCooldown(message.category, message.domain);
      if (inCooldown) {
        sendResponse({
          intercept: true,
          mode: "cooldown",
          frictionPercent: s.frictionPercent,
          cooldownHours: s.cooldownHours
        });
        return;
      }
      const mode = s.categoryModes?.[message.category] || "warn";
      sendResponse({
        intercept: true,
        mode,
        frictionPercent: s.frictionPercent,
        cooldownHours: s.cooldownHours
      });
      return;
    }

    if (message?.type === "setCooldown") {
      await setCooldown(message.category, message.domain, message.hours || DEFAULT_SETTINGS.cooldownHours);
      sendResponse({ ok: true });
      return;
    }

    if (message?.type === "logEvent") {
      await logEvent(message.event);
      sendResponse({ ok: true });
      return;
    }

    if (message?.type === "getEvents") {
      const { events } = await getStorage(["events"]);
      sendResponse({ events: events || [] });
      return;
    }

    sendResponse({ ok: false });
  })();

  return true;
});
