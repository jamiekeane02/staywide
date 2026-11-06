/* Official Shopify Buy Button integration. No local cart or inventory decisions. */
(() => {
  'use strict';
  if (window.stayWideShopify || document.body.dataset.page === '404') return;
  const config = window.stayWideConfig.shopify;
  if (!config?.enabled) return;
  const product = window.stayWideCatalog.products.find(p => p.id === document.body.dataset.product && p.listed !== false);
  const mount = document.querySelector('[data-shopify-product]');
  const status = document.querySelector('[data-shopify-status]');
  const notice = document.querySelector('[data-shopify-error]');
  const unavailable = 'Shopping is temporarily unavailable. Please try again.';
  let cart, pendingAdd, addTimer, productValid = false;
  const state = window.stayWideShopify = { status: 'loading' };
  const report = (message, productOnly = false) => {
    if (mount) mount.hidden = true;
    if (status) status.textContent = message;
    if (!productOnly && notice) { notice.hidden = false; notice.textContent = message; }
    state.status = 'unavailable';
  };
  function load() {
    if (window.ShopifyBuy?.UI) return Promise.resolve();
    return new Promise((resolve, reject) => {
      let script = [...document.scripts].find(s => s.src === config.scriptURL);
      const timer = setTimeout(() => reject(new Error('Shopify library timeout')), 20000);
      const finish = () => {
        clearTimeout(timer);
        window.ShopifyBuy?.UI ? resolve() : reject(new Error('Shopify library unavailable'));
      };
      if (!script) {
        script = document.createElement('script');
        script.src = config.scriptURL;
        script.async = true;
        script.addEventListener('load', finish, { once: true });
        script.addEventListener('error', () => { clearTimeout(timer); reject(new Error('Shopify network failure')); }, { once: true });
        document.head.append(script);
      } else {
        script.addEventListener('load', finish, { once: true });
        script.addEventListener('error', () => { clearTimeout(timer); reject(new Error('Shopify network failure')); }, { once: true });
      }
    });
  }
  const lines = component => component?.model?.lineItems || [];
  const quantity = (component, id) => lines(component).filter(line => line.variant?.id === id).reduce((sum, line) => sum + line.quantity, 0);
  function cancelPending() { clearTimeout(addTimer); pendingAdd = null; }
  function captureAdd(component) {
    cancelPending();
    const variant = component.selectedVariant;
    if (!productValid || !variant?.available || component.selectedQuantity <= 0) return;
    pendingAdd = { id: variant.id, before: quantity(cart, variant.id), model: cart?.model, quantity: component.selectedQuantity };
    // The documented product hook runs BEFORE the request. Never track here.
    addTimer = setTimeout(() => {
      pendingAdd = null;
      if (status) status.textContent = 'Your bag could not be confirmed. Check your bag before trying again.';
    }, 20000);
  }
  function confirmAdd(component) {
    cart = component;
    if (!pendingAdd || component.model === pendingAdd.model) return;
    const added = quantity(component, pendingAdd.id) - pendingAdd.before;
    if (added <= 0) { cancelPending(); return; }
    const line = lines(component).find(item => item.variant?.id === pendingAdd.id);
    const count = Math.min(added, pendingAdd.quantity);
    cancelPending();
    if (status) status.textContent = '';
    window.stayWideTrack?.('add_to_cart', {
      currency: line.variant.price.currencyCode,
      value: Number(line.variant.price.amount) * count,
      items: [{ item_id: product.id, item_name: product.name, item_variant: line.variant.id, price: Number(line.variant.price.amount), quantity: count }]
    });
  }
  function checkout(component) {
    cancelPending();
    if (!component.model?.webUrl || !lines(component).length) return;
    window.stayWideTrack?.('begin_checkout', {
      currency: component.model.subtotalPriceV2.currencyCode,
      value: Number(component.model.subtotalPriceV2.amount),
      items: lines(component).map(line => {
        const local = window.stayWideCatalog.products.find(p => line.variant.product?.id === 'gid://shopify/Product/' + p.shopifyProductId);
        return { item_id: local?.id || line.variant.product?.id || line.variant.id, item_name: local?.name || line.title, item_variant: line.variant.id, price: Number(line.variant.price.amount), quantity: line.quantity };
      })
    });
  }
  function validateProduct(component) {
    // Fail closed for every variant, including unexpected size-specific pricing.
    // Keep approved editorial prices; never present a misleading cheaper price.
    const model = component.model;
    productValid = Boolean(model?.id?.endsWith('/' + product.shopifyProductId) && model.variants?.length && model.variants.every(variant =>
      variant.price.currencyCode === product.currency && Number(variant.price.amount) === product.price));
    if (!productValid) {
      report(unavailable, true);
      state.reason = 'Product mapping or price mismatch: ' + product.id;
      console.warn('[Stay Wide] ' + state.reason);
    }
  }
  const font = 'Arial, Helvetica, sans-serif';
  const focus = { outline: '2px solid #263fc6', 'outline-offset': '2px' };
  const button = {
    'font-family': font, 'font-size': '14px', 'font-weight': '700', 'min-height': '52px',
    'background-color': '#161616', color: '#ffffff', 'border-radius': '0', 'box-shadow': 'none',
    ':hover': { 'background-color': '#263fc6' }, ':focus': { ...focus, 'background-color': '#263fc6' }
  };
  function options() {
    return {
      product: {
        iframe: true, width: '100%', buttonDestination: 'cart', order: ['options', 'button'],
        contents: { img: false, imgWithCarousel: false, title: false, variantTitle: false, price: false, unitPrice: false, description: false, quantity: false, buttonWithQuantity: false, options: true, button: true },
        text: { button: 'ADD TO BAG', outOfStock: 'SOLD OUT', unavailable: 'UNAVAILABLE' },
        styles: {
          product: { 'font-family': font, 'max-width': '100%', 'margin': '0', 'text-align': 'left' },
          button: { ...button, width: '100%' }, buttonWrapper: { 'margin-top': '16px' },
          options: { 'margin-bottom': '0', 'max-width': '100%' }
        },
        events: { beforeRender: validateProduct, addVariantToCart: captureAdd }
      },
      option: { styles: {
        label: { 'font-family': font, color: '#161616', 'font-size': '13px', 'text-transform': 'uppercase' },
        select: { 'font-family': font, color: '#161616', 'font-size': '16px', 'min-height': '48px', 'padding': '12px', ':focus': focus },
        wrapper: { 'border': '1px solid #767676', 'border-radius': '0', 'max-width': '100%', width: '100%' }, option: { 'margin-bottom': '0', width: '100%' }
      } },
      cart: {
        iframe: true, popup: false,
        text: { title: 'YOUR BAG', empty: 'Your bag is empty.', button: 'CHECKOUT', total: 'SUBTOTAL', notice: 'Shipping and discount codes are added at checkout.' },
        styles: { cart: { 'background-color': '#ffffff', 'font-family': font }, title: { color: '#161616' }, button, close: { 'min-width': '44px', 'min-height': '44px', ':focus': focus } },
        events: { afterRender: confirmAdd, updateItemQuantity: cancelPending, openCheckout: checkout }
      },
      // Supplied Shopify products have no cart images; omit generic bag placeholders.
      lineItem: { contents: { image: false }, styles: {
        itemTitle: { color: '#161616', 'font-family': font, 'margin-left': '0' },
        variantTitle: { color: '#161616', 'margin-left': '0' },
        quantity: { display: 'flex', width: '132px', height: '44px', 'margin-left': '0', 'margin-right': '0' },
        quantityInput: { 'min-height': '44px', width: '44px', 'font-size': '16px', ':focus': focus },
        quantityButton: { 'min-height': '44px', width: '44px', ':focus': focus }
      } },
      toggle: {
        iframe: true, contents: { title: true, count: true, icon: false }, order: ['title', 'count'], text: { title: 'Cart' },
        styles: { toggle: { 'font-family': font, 'background-color': '#161616', 'border-radius': '0', 'min-width': '52px', 'padding': '12px', ':hover': { 'background-color': '#263fc6' }, ':focus': focus }, title: { 'font-size': '14px' }, count: { 'font-size': '14px', 'margin': '4px 0 0' } }
      }
    };
  }
  // CDN onReady currently does not return createComponent's promise. Lifecycle
  // events provide a supported completion signal; a timeout covers missing IDs.
  function create(ui, type, node) {
    return new Promise((resolve, reject) => {
      let expired = false;
      const timer = setTimeout(() => { expired = true; reject(new Error(type + ' initialization timeout')); }, 25000);
      const settings = options();
      settings[type].events = { ...settings[type].events, afterInit(component) {
        clearTimeout(timer);
        if (expired) return;
        resolve(component);
      } };
      try {
        ui.createComponent(type, { ...(type === 'product' ? { id: product.shopifyProductId } : {}), node, moneyFormat: config.moneyFormat, options: settings });
      } catch (error) { clearTimeout(timer); reject(error); }
    });
  }
  state.ready = (async () => {
    try {
      await load();
      const client = window.ShopifyBuy.buildClient({ domain: config.domain, storefrontAccessToken: config.storefrontAccessToken });
      const ui = await window.ShopifyBuy.UI.onReady(client);
      cart = await create(ui, 'cart', document.body.appendChild(document.createElement('div')));
      if (mount) {
        if (!product?.shopifyProductId) throw new Error('Missing Shopify product mapping');
        await create(ui, 'product', mount);
        if (!productValid) return;
        mount.hidden = false;
        status.textContent = '';
      }
      state.status = 'ready';
    } catch (error) {
      state.reason = (product ? product.id + ': ' : '') + error.message;
      console.warn('[Stay Wide] ' + state.reason);
      report(unavailable);
    }
  })();
})();
