/* Basic opt-in only. No tags, preconnects, pixels or queued events before consent.
 * GA property: disable enhanced measurement and automatic form/outbound/scroll events.
 * Shopify owns future purchase verification; never call purchase from the preview.
 */
(() => {
  'use strict';
  const config = window.stayWideConfig;
  const gaId = /^G-[A-Z0-9]+$/.test(config.GA_MEASUREMENT_ID) ? config.GA_MEASUREMENT_ID : '';
  const metaId = /^\d+$/.test(config.META_PIXEL_ID) ? config.META_PIXEL_ID : '';
  const allowed = new Set(['page_view', 'view_item', 'add_to_cart', 'begin_checkout', 'purchase', 'email_signup']);
  const mapping = { page_view: 'PageView', view_item: 'ViewContent', add_to_cart: 'AddToCart', begin_checkout: 'InitiateCheckout', purchase: 'Purchase' };
  const loaded = { analytics: false, advertising: false };
  const viewed = { analytics: new Set(), advertising: new Set() };
  let previous = { analytics: false, advertising: false };
  const consent = () => window.stayWideConsent?.get() || previous;
  function script(src) {
    const element = document.createElement('script'); element.async = true; element.src = src;
    document.head.append(element);
  }
  function removeCookies(pattern) {
    const domains = location.hostname.split('.').map((_, i, parts) => parts.slice(i).join('.'));
    const paths = ['/', ...location.pathname.split('/').slice(0, -1).map((_, i, parts) => parts.slice(0, i + 1).join('/') || '/')];
    for (const part of document.cookie.split(';')) {
      const name = part.split('=')[0].trim();
      if (!pattern.test(name)) continue;
      for (const path of new Set(paths)) for (const domain of ['', ...domains, ...domains.map(d => '.' + d)]) {
        document.cookie = `${name}=; Max-Age=0; path=${path}${domain ? '; domain=' + domain : ''}`;
      }
    }
  }
  function enable() {
    const choice = consent();
    let revoked = false;
    if (!choice.analytics) {
      if (gaId) window['ga-disable-' + gaId] = true;
      if (gaId) removeCookies(/^_ga(?:_|$)/);
      if (loaded.analytics && previous.analytics) {
        window.dataLayer.length = 0; revoked = true;
      }
    }
    if (!choice.advertising) {
      if (metaId) removeCookies(/^_fb[pc]$/);
      if (loaded.advertising && previous.advertising) {
        if (window.fbq.queue) window.fbq.queue.length = 0;
        window.fbq('consent', 'revoke'); revoked = true;
      }
    }
    previous = choice;
    // Unload already-running third-party SDKs after withdrawal. Stored choice is
    // read before any SDK on the next document; denied-state pings are not used.
    if (revoked) { location.reload(); return; }
    if (choice.analytics && gaId && !loaded.analytics) {
      loaded.analytics = true;
      window['ga-disable-' + gaId] = false;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      window.gtag('js', new Date());
      window.gtag('config', gaId, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, page_location: location.origin + location.pathname, page_referrer: '' });
      script('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId));
    }
    if (choice.advertising && metaId && !loaded.advertising) {
      loaded.advertising = true;
      const fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
      fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
      window.fbq = fbq; window._fbq = fbq;
      fbq('consent', 'grant'); fbq('set', 'autoConfig', false, metaId); fbq('init', metaId);
      script('https://connect.facebook.net/en_US/fbevents.js');
    }
    pageEvents();
  }
  // Accept only the lean event contract. No contact details, free text or URL queries.
  function track(name, input = {}) {
    if (!allowed.has(name)) return false;
    const choice = consent();
    const data = {};
    if (Number.isFinite(input.value)) data.value = input.value;
    if (input.currency === 'EUR') data.currency = 'EUR';
    if (name === 'purchase' && typeof input.transaction_id === 'string') data.transaction_id = input.transaction_id;
    if (Array.isArray(input.items)) data.items = input.items.map(item => Object.fromEntries(
      ['item_id', 'item_name', 'item_variant', 'price', 'quantity'].filter(k => typeof item[k] === 'string' || Number.isFinite(item[k])).map(k => [k, item[k]])
    ));
    const view = name === 'page_view' || name === 'view_item';
    let sent = false;
    if (choice.analytics && gaId && loaded.analytics && !(view && viewed.analytics.has(name))) {
      window.gtag('event', name, { ...data, page_location: location.origin + location.pathname, page_referrer: '' });
      if (view) viewed.analytics.add(name); sent = true;
    }
    if (choice.advertising && metaId && loaded.advertising && mapping[name] && !(view && viewed.advertising.has(name))) {
      const meta = {};
      if (data.value !== undefined) meta.value = data.value;
      if (data.currency) meta.currency = data.currency;
      if (data.items) { meta.content_ids = data.items.map(i => i.item_id); meta.content_type = 'product'; meta.contents = data.items.map(i => ({ id: i.item_id, quantity: i.quantity || 1 })); }
      window.fbq('track', mapping[name], meta);
      if (view) viewed.advertising.add(name); sent = true;
    }
    return sent;
  }
  function pageEvents() {
    track('page_view');
    const product = window.stayWideCatalog?.products.find(p => p.id === document.body.dataset.product);
    if (product && !product.development) track('view_item', { currency: product.currency, value: product.price, items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity: 1 }] });
  }
  window.stayWideTrack = track;
  window.addEventListener('staywide:consent', enable);
  enable();
})();
