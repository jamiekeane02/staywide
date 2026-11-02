/* Dependency-free static generation. Run from the project root: node scripts/build.cjs */
const fs = require('node:fs');
const vm = require('node:vm');
const context = { module: { exports: {} } };
vm.runInNewContext(fs.readFileSync('js/catalog.js', 'utf8'), context);
const { products: catalogProducts, statuses } = context.module.exports;
const products = catalogProducts.filter(product => product.listed !== false);
for (const product of catalogProducts) {
  if (!/^[a-z0-9-]+$/.test(product.id)) throw new Error('Invalid product id');
  if (product.listed === false) fs.rmSync(`products/${product.id}.html`, { force: true });
  else if (!product.images.length || product.images.some(image => !image.src || !fs.existsSync(image.src))) throw new Error(`Real product photographs required: ${product.id}`);
}
const config = require('../js/site-config.js');
const { head, url } = require('./metadata.cjs');
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const fill = (template, values) => template.replace(/{{(\w+)}}/g, (_, key) => {
  if (!(key in values)) throw new Error(`Missing template value: ${key}`);
  return values[key];
});
const confirmed = (product, value) => !product.development && value != null && !String(value).includes('[');
const price = product => !confirmed(product, product.price) ? '' : new Intl.NumberFormat('en-IE', { style: 'currency', currency: product.currency }).format(product.price);
function state(product, includeDispatch = true) {
  if (!statuses[product.status]) throw new Error(`Unknown product status: ${product.status}`);
  return `<p class="product-state">${product.development ? 'DROP 001' : escape(statuses[product.status])}</p>${includeDispatch && confirmed(product, product.dispatch) ? `<p class="dispatch">Estimated dispatch: ${escape(product.dispatch)}</p>` : ''}`;
}
function media(product, image, prefix, lazy = true, sizes = '(min-width: 1800px) 850px, (min-width: 700px) 48vw, (min-width: 420px) 380px, calc(100vw - 40px)') {
  if (image.src) return `<img src="${escape(prefix + image.src)}" ${image.srcset ? `srcset="${escape(image.srcset)}"` : ''} sizes="${sizes}" width="${image.width || 800}" height="${image.height || 1000}" alt="${escape(image.alt)}" loading="${lazy ? 'lazy' : 'eager'}" ${!lazy ? 'fetchpriority="high"' : ''} decoding="async">`;
  return `<span class="garment garment-${product.kind}${image.view === 'back' ? ' garment-back' : ''}" aria-hidden="true"><span class="garment-mark">${image.view === 'back' ? 'BACK' : product.mark}</span></span><span class="placeholder-tag">${escape(image.view)} image placeholder</span>`;
}
function card(product, prefix, lazy = true, columns = 3) {
  const sizes = `(min-width: 1800px) ${Math.ceil(1640 / columns)}px, (min-width: 700px) ${Math.ceil(91 / columns)}vw, calc((100vw - 56px) / 2)`;
  const secondary = product.images[1];
  let preview = '';
  if (secondary?.src && secondary.src !== product.images[0].src) {
    const candidates = (secondary.srcset || '').split(',').map(s => s.trim()).filter(s => /\s\d+w$/.test(s) && Number(s.match(/(\d+)w$/)[1]) <= 800);
    const image = { ...secondary, alt: '', src: candidates.length ? candidates.at(-1).split(' ')[0].replace(/^\//, '') : secondary.src, srcset: candidates.join(', ') };
    preview = `<template data-card-secondary><span class="image-layer image-secondary" aria-hidden="true">${media(product, image, prefix, true, sizes)}</span></template>`;
  }
  return `<a class="product-card" href="${prefix}products/${product.id}.html" data-product="${product.id}"><span class="product-image tone-${product.tone}"><span class="image-layer image-primary">${media(product, product.images[0], prefix, lazy, sizes)}</span>${preview}</span><span class="product-caption"><strong>${escape(product.name)}</strong>${price(product) ? `<span class="product-price">${price(product)}</span>` : ''}</span>${state(product, false)}</a>`;
}
function gallery(product) {
  const multiple = product.images.length > 1;
  const panels = product.images.map((image, index) => `<div id="image-${index}" class="gallery-panel" ${index ? 'hidden' : ''}>${media(product, image, '../', index > 0)}</div>`).join('');
  const arrows = multiple ? `<button class="gallery-arrow gallery-previous" type="button" data-gallery-previous aria-label="Previous product image" aria-disabled="true" disabled><span aria-hidden="true">←</span></button><button class="gallery-arrow gallery-next" type="button" data-gallery-next aria-label="Next product image" aria-disabled="false" disabled><span aria-hidden="true">→</span></button>` : '';
  return `<div class="gallery-frame tone-${product.tone}" ${multiple ? `data-gallery tabindex="0" role="group" aria-label="${escape(product.name)} product images" aria-describedby="gallery-instructions"` : ''}>${panels}${arrows}</div>${multiple ? `<div class="gallery-meta"><span id="gallery-view">${escape(product.images[0].view)}</span><p class="gallery-counter" role="status" aria-live="polite" aria-atomic="true"><span class="sr-only">Image </span><span data-gallery-current>1</span><span aria-hidden="true"> / </span><span class="sr-only"> of </span>${product.images.length}</p></div><p class="sr-only" id="gallery-instructions">Use the previous and next buttons, left and right arrow keys, or swipe to view product images.</p><p class="sr-only" data-gallery-error role="status"></p>` : ''}`;
}
const brand = prefix => `<img class="brand-logo" src="${prefix}assets/brand/stay-wide-logo-320.png" srcset="${prefix}assets/brand/stay-wide-logo-320.png 320w, ${prefix}assets/brand/stay-wide-logo.png 920w" sizes="108px" width="920" height="512" alt="Stay Wide" decoding="async">`;
function footer(prefix) {
  return `<footer class="site-footer section-pad"><a class="wordmark" href="${prefix}index.html">${brand(prefix)}</a><div class="footer-links"><a href="${prefix}info.html#shipping">Shipping / Returns</a><a href="${prefix}info.html#contact">Contact</a><a href="${prefix}info.html#privacy">Privacy</a><a href="${prefix}info.html#terms">Terms</a><button type="button" class="text-button" data-cookie-settings disabled>Cookie settings</button><noscript><span class="micro">Optional tracking off</span></noscript><!-- Add verified Instagram and TikTok links here. --></div><span class="micro">© <span id="year">2026</span> STAY WIDE / IRELAND</span></footer>`;
}
const cart = `<dialog id="cart-dialog" aria-labelledby="cart-title" aria-describedby="cart-description"><div class="dialog-header"><span class="micro">YOUR CART / <span id="cart-item-count">0</span> ITEMS</span><button type="button" class="dialog-close" aria-label="Close cart" autofocus>×</button></div><h2 id="cart-title">Your cart</h2><p id="cart-description">Drop 001 is coming soon. Orders are not open yet.</p><div id="cart-lines"><p>Your cart is empty.</p></div><template id="cart-line-template"><article class="cart-line"><div class="cart-thumbnail"></div><div><h3 data-cart-title></h3><p data-cart-size></p><p data-cart-price></p><p data-cart-status></p><p data-cart-dispatch></p><label>Quantity <input data-cart-quantity type="number" min="1" step="1" inputmode="numeric" disabled></label><button type="button" data-cart-remove disabled>Remove</button></div></article></template><div class="cart-subtotal"><span>Subtotal</span><span id="cart-subtotal">—</span></div><button type="button" class="button button-dark" id="checkout" disabled aria-describedby="cart-description">Checkout unavailable</button><button type="button" class="button dialog-close">Keep exploring ↗</button></dialog>`;
const consent = prefix => fill(fs.readFileSync('templates/consent.html', 'utf8'), { prefix });
for (const page of ['home', 'info']) {
  const template = fs.readFileSync(`templates/${page}.html`, 'utf8');
  fs.writeFileSync(page === 'home' ? 'index.html' : 'info.html', fill(template, { head: head(page === 'home' ? { title: 'Stay Wide \u2014 Drop 001', description: 'Stay Wide. Drop 001.', socialDescription: 'Drop 001.', route: '/', home: true } : { title: 'Shipping, Sizing & Info \u2014 Stay Wide', description: 'Shipping, sizing and information for Stay Wide.', route: 'info.html' }), brand: brand(''), footer: footer(''), cart, consent: consent(''), cards: products.map((p, i) => card(p, '', i > 1, products.length === 3 ? 3 : 2)).join('\n') }));
}
const template = fs.readFileSync('templates/product.html', 'utf8');
for (const product of products) {
  fs.writeFileSync(`products/${product.id}.html`, fill(template, {
    ...Object.fromEntries(Object.entries(product).map(([key, value]) => [key, escape(value)])),
    head: head({ title: product.name + ' \u2014 Stay Wide', description: product.metaDescription || (product.development ? 'Stay Wide / Drop 001.' : product.description), route: 'products/' + product.id + '.html', product }), brand: brand('../'), footer: footer('../'), cart, consent: consent('../'), gallery: gallery(product), price: price(product) ? `<span class="detail-price">${price(product)}</span>` : '', state: state(product),
    unconfirmed: product.development ? 'hidden' : '',
    ...Object.fromEntries(['fit', 'description', 'materials', 'decoration', 'care', 'sizeGuide'].map(key => [key, confirmed(product, product[key]) ? escape(product[key]) : ''])),
    action: product.development || !product.commerceReady || product.status === 'coming_soon' ? 'COMING SOON' : product.status === 'sold_out' ? 'Sold out' : 'Select a size',
    sizes: product.development ? '' : product.variants.map(variant => `<label class="size-option"><input type="radio" name="size" value="${escape(variant.size)}" required ${!variant.available || product.status !== 'available' ? 'disabled aria-label="' + escape(variant.size) + ' unavailable"' : ''}><span>${escape(variant.size)}</span></label>`).join(''),
    cards: products.filter(other => other.id !== product.id).map(other => card(other, '../', true, Math.min(3, products.length - 1))).join('\n')
  }));
}


fs.writeFileSync('404.html', fill(fs.readFileSync('templates/404.html', 'utf8'), { brand: brand('/'), head: head({ title: 'Page not found \u2014 Stay Wide', description: 'Find your way back to Stay Wide.', route: '404.html', noindex: true }) }));
const routes = ['/', 'info.html', ...products.map(p => 'products/' + p.id + '.html')];
fs.writeFileSync('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + routes.map(route => '  <url><loc>' + escape(url(route)) + '</loc></url>').join('\n') + '\n</urlset>\n');
fs.writeFileSync('robots.txt', '# Public storefront assets and pages can be crawled.\nUser-agent: *\nAllow: /\nDisallow: /templates/\nDisallow: /scripts/\nDisallow: /checks/\n' + (config.domainConfirmed ? '\nSitemap: ' + url('sitemap.xml') + '\n' : '\n# Sitemap declaration withheld until final domain ownership is confirmed.\n'));

console.log(`Generated home, Info, ${products.length} product pages, 404, sitemap and robots.`);
