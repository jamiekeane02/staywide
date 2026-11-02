/* First-party preferences only. No tracker is loaded by this file. */
(() => {
  'use strict';
  const config = window.stayWideConfig;
  const key = 'staywide.consent';
  const off = () => ({ essential: true, analytics: false, advertising: false });
  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      if (value?.version !== config.consentVersion || typeof value.analytics !== 'boolean' || typeof value.advertising !== 'boolean' ||
          !Number.isFinite(value.savedAt) || value.savedAt > Date.now() || Date.now() - value.savedAt > config.consentMaxAgeDays * 86400000) return null;
      return { ...value, essential: true };
    } catch { return null; }
  }
  let saved = read();
  let current = saved || off();
  const panel = document.querySelector('#cookie-panel');
  const manage = document.querySelector('#cookie-options');
  const analytics = document.querySelector('#consent-analytics');
  const advertising = document.querySelector('#consent-advertising');
  let returnFocus;
  function close() {
    const restore = panel.contains(document.activeElement);
    panel.hidden = true;
    document.body.style.paddingBottom = '';
    if (restore) (returnFocus || document.querySelector('[data-cookie-settings]'))?.focus({ preventScroll: true });
  }
  function open(options = false) {
    if (!panel.contains(document.activeElement)) returnFocus = document.activeElement;
    panel.hidden = false;
    manage.hidden = !options;
    analytics.checked = current.analytics;
    advertising.checked = current.advertising;
    if (options) analytics.focus({ preventScroll: true });
  }
  function publish() {
    window.dispatchEvent(new CustomEvent('staywide:consent', { detail: { ...current } }));
  }
  function save(a, b) {
    current = { ...off(), analytics: a, advertising: b, version: config.consentVersion, savedAt: Date.now() };
    let persistent = true;
    try { localStorage.setItem(key, JSON.stringify(current)); } catch { persistent = false; }
    saved = current;
    close();
    document.querySelector('#cookie-status').textContent = persistent ? 'Cookie preferences saved.' : 'Preferences apply to this page. Your browser could not save them; optional tracking stays off on your next visit.';
    publish();
  }
  document.querySelectorAll('[data-cookie-settings]').forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => { open(true); returnFocus = button; });
  });
  document.querySelector('[data-cookie-accept]').addEventListener('click', () => save(true, true));
  document.querySelector('[data-cookie-reject]').addEventListener('click', () => save(false, false));
  document.querySelector('[data-cookie-manage]').addEventListener('click', () => open(true));
  document.querySelector('[data-cookie-save]').addEventListener('click', () => save(analytics.checked, advertising.checked));
  document.querySelector('[data-cookie-close]').addEventListener('click', close);
  panel.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); close(); } });
  // A non-modal banner: page navigation and cart remain usable, including by keyboard.
  new ResizeObserver(() => {
    document.body.style.paddingBottom = panel.hidden ? '' : panel.offsetHeight + 'px';
  }).observe(panel);
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    saved = read(); current = saved || off();
    if (saved) close(); else open();
    publish();
  });
  window.stayWideConsent = Object.freeze({ get: () => ({ ...current }), open: () => open(true) });
  if (!saved) open();
})();
