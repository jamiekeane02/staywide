/* Keep the existing Shopify cart tab beside the narrow-screen sticky header.
 * Only its host position changes; Shopify retains the iframe and all actions.
 */
(() => {
  const header = document.querySelector('.site-header');
  if (document.body.dataset.page !== 'home' || !header) return;
  const narrow = matchMedia('(max-width:1099px)');
  let pending = false;
  function positionCart() {
    pending = false;
    if (!narrow.matches) return;
    const bounds = header.getBoundingClientRect();
    document.documentElement.style.setProperty('--home-cart-center', `${bounds.top + bounds.height / 2}px`);
  }
  function schedule() {
    if (pending || !narrow.matches) return;
    pending = true;
    requestAnimationFrame(positionCart);
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  narrow.addEventListener('change', schedule);
  positionCart();
})();
