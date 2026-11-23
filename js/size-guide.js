/* One native informational dialog, independent of Shopify and gallery state. */
(() => {
  'use strict';
  const trigger = document.querySelector('[data-size-guide-open]');
  const dialog = document.querySelector('[data-size-guide-dialog]');
  if (!trigger || !dialog || typeof dialog.showModal !== 'function') return;
  trigger.disabled = false;
  trigger.addEventListener('click', () => dialog.showModal());
  dialog.querySelector('[data-size-guide-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => trigger.focus({ preventScroll: true }));
})();
