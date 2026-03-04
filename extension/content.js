(() => {
  const CHECKOUT_SELECTORS = [
    "button[name='checkout']",
    "button[type='submit'][name='checkout']",
    "button[id*='checkout']",
    "button[class*='checkout']",
    "[data-action='checkout']",
    "[data-testid*='checkout']",
    "a[href*='/checkout']",
    "form[action*='/checkout'] button[type='submit']",
    "#submitOrderButtonId", /* Amazon */
    "#buy-now-button", /* Amazon */
    "input[name='placeYourOrder1']" /* Amazon */
  ];

  const CHECKOUT_URL_PATTERNS = [/\/checkout\b/i, /\/payment\b/i, /\/order-confirmation\b/i];

  let bypassOnce = false;
  let lastAction = null;
  let activeModal = null;
  let activeCategory = null;
  let activeDomain = null;

  function normalizeDomain(hostname) {
    return hostname.replace(/^www\./, "").toLowerCase();
  }

  function textFromSelectors(selectors) {
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (!el) continue;
      if (el.tagName === "META") {
        const content = el.getAttribute("content");
        if (content) return content;
      } else {
        const text = el.textContent?.trim();
        if (text) return text;
      }
    }
    return "";
  }

  function collectBreadcrumbText() {
    const selectors = window.TollboothCategories?.breadcrumbSelectors || [];
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (!el) continue;
      const text = el.textContent?.replace(/\s+/g, " ").trim();
      if (text) return text;
    }
    return "";
  }

  function detectCategory() {
    const cats = window.TollboothCategories;
    if (!cats) return null;

    const domain = normalizeDomain(location.hostname);
    if (cats.domains[domain]) return cats.domains[domain];

    const url = location.href;
    for (const [category, patterns] of Object.entries(cats.urlPatterns || {})) {
      if (patterns.some((re) => re.test(url))) return category;
    }

    const titleText = textFromSelectors(cats.titleSelectors || []);
    const breadcrumbText = collectBreadcrumbText();
    const haystack = `${titleText} ${breadcrumbText}`.toLowerCase();

    for (const [category, words] of Object.entries(cats.keywords || {})) {
      if (words.some((word) => haystack.includes(word))) {
        return category;
      }
    }

    return null;
  }

  function isCheckoutElement(target) {
    if (!target) return false;
    for (const selector of CHECKOUT_SELECTORS) {
      if (target.matches?.(selector)) return true;
      if (target.closest?.(selector)) return true;
    }
    return false;
  }

  function isCheckoutUrl(url) {
    return CHECKOUT_URL_PATTERNS.some((re) => re.test(url));
  }

  async function shouldIntercept(category, domain) {
    return await chrome.runtime.sendMessage({
      type: "shouldIntercept",
      category,
      domain
    });
  }

  async function logEvent(event) {
    await chrome.runtime.sendMessage({ type: "logEvent", event });
  }

  async function setCooldown(category, domain, hours) {
    await chrome.runtime.sendMessage({
      type: "setCooldown",
      category,
      domain,
      hours
    });
  }

  async function showModal({ category, mode, frictionPercent, cooldownHours }) {
    if (activeModal) return;

    const modalModule = await import(chrome.runtime.getURL("modal/modal.js"));
    const html = await fetch(chrome.runtime.getURL("modal/modal.html")).then((r) => r.text());
    const cssText = await fetch(chrome.runtime.getURL("modal/modal.css")).then((r) => r.text());

    activeModal = modalModule.createModal({
      html,
      cssText,
      data: {
        category,
        mode,
        frictionPercent,
        cooldownHours
      },
      onAction: async (action) => {
        const eventBase = {
          timestamp: new Date().toISOString(),
          category,
          domain: activeDomain,
          mode
        };

        if (action === "block") {
          await logEvent({ ...eventBase, action: "blocked" });
          activeModal.close();
          activeModal = null;
          return;
        }

        if (action === "cooldown") {
          await setCooldown(category, activeDomain, cooldownHours);
          await logEvent({ ...eventBase, action: "cooldown" });
          activeModal.close();
          activeModal = null;
          return;
        }

        if (action === "continue") {
          await logEvent({ ...eventBase, action: "continued", frictionPercent });
          activeModal.close();
          activeModal = null;
          bypassOnce = true;
          if (lastAction?.type === "click" && lastAction.element) {
            lastAction.element.click();
          }
          if (lastAction?.type === "submit" && lastAction.element) {
            lastAction.element.submit();
          }
        }
      }
    });

    activeModal.open();
  }

  async function interceptIfNeeded(event, source) {
    if (bypassOnce) {
      bypassOnce = false;
      return false;
    }

    const category = activeCategory || detectCategory();
    if (!category) return false;

    activeCategory = category;
    activeDomain = normalizeDomain(location.hostname);

    const decision = await shouldIntercept(category, activeDomain);
    if (!decision.intercept) return false;

    event.preventDefault();
    event.stopPropagation();

    await showModal({
      category,
      mode: decision.mode,
      frictionPercent: decision.frictionPercent,
      cooldownHours: decision.cooldownHours
    });

    await logEvent({
      timestamp: new Date().toISOString(),
      category,
      domain: activeDomain,
      mode: decision.mode,
      action: "intercepted",
      source
    });

    return true;
  }

  document.addEventListener(
    "click",
    async (event) => {
      const target = event.target;
      if (!isCheckoutElement(target)) return;

      lastAction = { type: "click", element: target.closest("button, a, input") || target };
      await interceptIfNeeded(event, "click");
    },
    true
  );

  document.addEventListener(
    "submit",
    async (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (!/checkout|payment|order/i.test(form.action || "")) return;

      lastAction = { type: "submit", element: form };
      await interceptIfNeeded(event, "submit");
    },
    true
  );

  const observer = new MutationObserver(() => {
    if (isCheckoutUrl(location.href)) {
      if (!activeCategory) activeCategory = detectCategory();
      if (!activeCategory) return;
      const event = new Event("tollbooth-url", { bubbles: false });
      interceptIfNeeded(event, "url");
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (isCheckoutUrl(location.href)) {
    const event = new Event("tollbooth-url", { bubbles: false });
    interceptIfNeeded(event, "url");
  }
})();
