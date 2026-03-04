export function createModal({ html, cssText, data, onAction }) {
  const container = document.createElement("div");
  container.innerHTML = html.trim();

  const overlay = container.firstElementChild;
  const style = document.createElement("style");
  style.textContent = cssText;
  overlay.appendChild(style);

  function setText(selector, value) {
    const el = overlay.querySelector(selector);
    if (el) el.textContent = value;
  }

  setText("[data-tb='category']", data.category || "unknown");
  setText("[data-tb='mode']", data.mode || "warn");
  setText("[data-tb='friction']", String(data.frictionPercent || 0));
  setText("[data-tb='cooldown']", String(data.cooldownHours || 24));

  const frictionEl = overlay.querySelector("[data-tb-visible='friction']");
  if (frictionEl) frictionEl.style.display = data.mode === "friction" ? "block" : "none";

  const cooldownEl = overlay.querySelector("[data-tb-visible='cooldown']");
  if (cooldownEl) cooldownEl.style.display = data.mode === "cooldown" ? "block" : "none";

  overlay.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.getAttribute("data-action");
    if (!action) return;
    onAction?.(action);
  });

  return {
    open() {
      document.documentElement.appendChild(overlay);
      document.documentElement.style.overflow = "hidden";
    },
    close() {
      overlay.remove();
      document.documentElement.style.overflow = "";
    }
  };
}
