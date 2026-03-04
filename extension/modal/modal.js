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

  // Get funny message + emoji from categories (injected by content script)
  const cats = window.TollboothCategories;
  const category = data.category || "default";
  const emoji = cats ? cats.getCategoryEmoji(category) : "🛑";
  const headline = cats ? cats.getRandomMessage(category) : "Pump the brakes, champ.";

  setText("[data-tb='emoji']", emoji);
  setText("[data-tb='headline']", headline);
  setText("[data-tb='category']", category.replace(/_/g, " "));
  setText("[data-tb='domain']", data.domain || "this site");
  setText("[data-tb='friction']", String(data.frictionPercent || 100));
  setText("[data-tb='count']", String(data.weeklyBlockCount || 0));

  // Show friction note if mode is friction
  const frictionNote = overlay.querySelector(".tb-friction-note");
  if (frictionNote && data.mode === "friction") {
    frictionNote.classList.add("visible");
  }

  // Hide cooldown button if not in cooldown mode
  const cooldownBtn = overlay.querySelector("[data-action='cooldown']");
  if (cooldownBtn && data.mode === "block") {
    cooldownBtn.style.display = "none";
  }

  overlay.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.getAttribute("data-action");
    if (action) onAction?.(action);
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
