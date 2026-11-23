/* Dependency-free static generation. Run from the project root: node scripts/build.cjs */
const fs = require('node:fs');
const vm = require('node:vm');
const context = { module: { exports: {} } };
vm.runInNewContext(fs.readFileSync('js/catalog.js', 'utf8'), context);
const { products: catalogProducts } = context.module.exports;
const products = catalogProducts.filter(product => product.listed !== false);
for (const product of catalogProducts) {
  if (!/^[a-z0-9-]+$/.test(product.id)) throw new Error('Invalid product id');
  if (product.listed === false) fs.rmSync(`products/${product.id}.html`, { force: true });
  else if (!product.images.length || product.images.some(image => !image.src || !fs.existsSync(image.src))) throw new Error(`Real product photographs required: ${product.id}`);
}
const { createHash } = require('node:crypto');
// One deterministic release version for all shared CSS/JS; changes invalidate stale clients.
const assetFiles = ['css/styles.css', ...fs.readdirSync('js').filter(name => name.endsWith('.js')).sort().map(name => 'js/' + name)];
const assetVersion = createHash('sha256').update(Buffer.concat(assetFiles.map(file => Buffer.from(fs.readFileSync(file))))).digest('hex').slice(0, 12);
const versionAssets = html => html.replace(/((?:src|href)="(?:\.\.\/|\/)?(?:js|css)\/[^"?]+\.(?:js|css))"/g, '$1?v=' + assetVersion + '"');
const writePage = (file, html) => fs.writeFileSync(file, versionAssets(html));
const config = require('../js/site-config.js');
const sizeGuides = require('./size-guides.cjs');
const { head, url } = require('./metadata.cjs');
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const fill = (template, values) => template.replace(/{{(\w+)}}/g, (_, key) => {
  if (!(key in values)) throw new Error(`Missing template value: ${key}`);
  return values[key];
});
const confirmed = (product, value) => !product.development && value != null && !String(value).includes('[');
function sizeGuideDialog(kind) {
  const guide = sizeGuides[kind];
  if (!guide || !fs.existsSync('assets/size-guides/' + guide.image)) throw new Error('Missing size guide: ' + kind);
  return `<dialog class="size-guide-dialog" id="size-guide-dialog" data-size-guide-dialog aria-labelledby="size-guide-title" aria-describedby="size-guide-category">
    <header class="size-guide-header"><div><h2 id="size-guide-title">SIZE GUIDE</h2><p id="size-guide-category">${guide.category}</p></div><button type="button" class="size-guide-close" data-size-guide-close autofocus>CLOSE</button></header>
    <div class="size-guide-content" tabindex="0" role="region" aria-label="Size chart and measurements"><img src="../assets/size-guides/${guide.image}" width="${guide.width}" height="${guide.height}" alt="${guide.category === 'HOODIES' ? 'Hoodie' : 'T-shirt'} size chart in ${kind === 'hoodie' ? 'centimetres' : 'inches'}; all measurements are also in the table below." loading="lazy" decoding="async">
    <table><caption>${guide.units}</caption><thead><tr>${guide.headers.map(label => `<th scope="col">${escape(label)}</th>`).join('')}</tr></thead><tbody>${guide.rows.map(row => `<tr><th scope="row">${escape(row[0])}</th>${row.slice(1).map(value => `<td>${escape(value)}</td>`).join('')}</tr>`).join('')}</tbody></table>
    ${guide.notes.map(note => `<p>${escape(note)}</p>`).join('')}</div>
  </dialog>`;
}
// Approved numeric prices can be visible while development/commerce gates stay closed.
const price = product => !Number.isFinite(product.price) ? '' : new Intl.NumberFormat('en-IE', { style: 'currency', currency: product.currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(product.price);
function media(product, image, prefix, lazy = true, sizes = '(min-width: 1800px) 850px, (min-width: 700px) 48vw, (min-width: 420px) 380px, calc(100vw - 40px)') {
  if (image.src) return `<img src="${escape(prefix + image.src)}" ${image.srcset ? `srcset="${escape(image.srcset)}"` : ''} sizes="${sizes}" width="${image.width || 800}" height="${image.height || 1000}" alt="${escape(image.alt)}" loading="${lazy ? 'lazy' : 'eager'}" ${!lazy ? 'fetchpriority="high"' : ''} decoding="async">`;
  return `<span class="garment garment-${product.kind}${image.view === 'back' ? ' garment-back' : ''}" aria-hidden="true"><span class="garment-mark">${image.view === 'back' ? 'BACK' : product.mark}</span></span><span class="placeholder-tag">${escape(image.view)} image placeholder</span>`;
}
function card(product, prefix, lazy = true, columns = 3) {
  const sizes = columns === 4
    ? '(min-width: 1800px) 389px, (min-width: 1240px) calc((91vw - 84px) / 4), (min-width: 700px) calc((91vw - 28px) / 2), calc((100vw - 56px) / 2)'
    : `(min-width: 1800px) ${Math.ceil((1640 - 28 * (columns - 1)) / columns)}px, (min-width: 700px) calc((91vw - ${28 * (columns - 1)}px) / ${columns}), calc((100vw - 56px) / 2)`;
  const secondary = product.images[1];
  let preview = '';
  if (secondary?.src && secondary.src !== product.images[0].src) {
    const candidates = (secondary.srcset || '').split(',').map(s => s.trim()).filter(s => /\s\d+w$/.test(s) && Number(s.match(/(\d+)w$/)[1]) <= 800);
    const image = { ...secondary, alt: '', src: candidates.length ? candidates.at(-1).split(' ')[0].replace(/^\//, '') : secondary.src, srcset: candidates.join(', ') };
    preview = `<template data-card-secondary><span class="image-layer image-secondary" aria-hidden="true">${media(product, image, prefix, true, sizes)}</span></template>`;
  }
  return `<a class="product-card" href="${prefix}products/${product.id}.html" data-product="${product.id}"><span class="product-image tone-${product.tone}"><span class="image-layer image-primary">${media(product, product.images[0], prefix, lazy, sizes)}</span>${preview}</span><span class="product-caption"><strong>${escape(product.name)}</strong>${price(product) ? `<span class="product-price">${price(product)}</span>` : ''}</span></a>`;
}
function gallery(product) {
  const multiple = product.images.length > 1;
  const panels = product.images.map((image, index) => `<div id="image-${index}" class="gallery-panel" ${index ? 'hidden' : ''}>${media(product, image, '../', index > 0)}</div>`).join('');
  const arrows = multiple ? `<button class="gallery-arrow gallery-previous" type="button" data-gallery-previous aria-label="Previous product image" aria-disabled="true" disabled><span aria-hidden="true">←</span></button><button class="gallery-arrow gallery-next" type="button" data-gallery-next aria-label="Next product image" aria-disabled="false" disabled><span aria-hidden="true">→</span></button>` : '';
  return `<div class="gallery-frame tone-${product.tone}" ${multiple ? `data-gallery tabindex="0" role="group" aria-label="${escape(product.name)} product images" aria-describedby="gallery-instructions"` : ''}>${panels}${arrows}</div>${multiple ? `<div class="gallery-meta"><span id="gallery-view">${escape(product.images[0].view)}</span><p class="gallery-counter" role="status" aria-live="polite" aria-atomic="true"><span class="sr-only">Image </span><span data-gallery-current>1</span><span aria-hidden="true"> / </span><span class="sr-only"> of </span>${product.images.length}</p></div><p class="sr-only" id="gallery-instructions">Use the previous and next buttons, left and right arrow keys, or swipe to view product images.</p><p class="sr-only" data-gallery-error role="status"></p>` : ''}`;
}
const brand = prefix => `<img class="brand-logo" src="${prefix}assets/brand/stay-wide-logo-320.png" srcset="${prefix}assets/brand/stay-wide-logo-320.png 320w, ${prefix}assets/brand/stay-wide-logo.png 920w" sizes="108px" width="920" height="512" alt="Stay Wide" decoding="async">`;
function footer(prefix) {
  return `<footer class="site-footer section-pad"><a class="wordmark" href="${prefix}index.html">${brand(prefix)}</a><div class="footer-links"><a href="${prefix}info.html#shipping">Shipping / Returns</a><a href="${prefix}info.html#contact">Contact</a><button type="button" class="text-button" data-cookie-settings disabled>Cookie settings</button><noscript><span class="micro">Optional tracking off</span></noscript><!-- Add verified Instagram and TikTok links here. --></div><span class="micro">© <span id="year">2026</span> STAY WIDE / IRELAND</span></footer>`;
}
const consent = prefix => fill(fs.readFileSync('templates/consent.html', 'utf8'), { prefix });
for (const page of ['home', 'info']) {
  const template = fs.readFileSync(`templates/${page}.html`, 'utf8');
  writePage(page === 'home' ? 'index.html' : 'info.html', fill(template, { head: head(page === 'home' ? { title: 'Stay Wide', description: 'Stay Wide.', route: '/', home: true } : { title: 'Shipping, Sizing & Info \u2014 Stay Wide', description: 'Shipping, sizing and information for Stay Wide.', route: 'info.html' }), brand: brand(''), footer: footer(''), consent: consent(''), cards: products.map((p, i) => card(p, '', i > 1, 4)).join('\n') }));
}
const template = fs.readFileSync('templates/product.html', 'utf8');
for (const product of products) {
  writePage(`products/${product.id}.html`, fill(template, {
    ...Object.fromEntries(Object.entries(product).map(([key, value]) => [key, escape(value)])),
    head: head({ title: product.name + ' \u2014 Stay Wide', description: product.metaDescription || (product.development ? product.name + ' by Stay Wide.' : product.description), route: 'products/' + product.id + '.html', product }), brand: brand('../'), footer: footer('../'), consent: consent('../'), gallery: gallery(product), price: price(product) ? `<span class="detail-price">${price(product)}</span>` : '',
    unconfirmed: product.development ? 'hidden' : '',
    sizeGuideDialog: sizeGuideDialog(product.kind),
    ...Object.fromEntries(['fit', 'description', 'materials', 'decoration', 'care', 'sizeGuide'].map(key => [key, confirmed(product, product[key]) ? escape(product[key]) : ''])),
    cards: products.filter(other => other.id !== product.id).map(other => card(other, '../', true, Math.min(3, products.length - 1))).join('\n')
  }));
}


writePage('404.html', fill(fs.readFileSync('templates/404.html', 'utf8'), { brand: brand('/'), head: head({ title: 'Page not found \u2014 Stay Wide', description: 'Find your way back to Stay Wide.', route: '404.html', noindex: true }) }));
const routes = ['/', 'info.html', ...products.map(p => 'products/' + p.id + '.html')];
fs.writeFileSync('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + routes.map(route => '  <url><loc>' + escape(url(route)) + '</loc></url>').join('\n') + '\n</urlset>\n');
fs.writeFileSync('robots.txt', '# Public storefront assets and pages can be crawled.\nUser-agent: *\nAllow: /\nDisallow: /templates/\nDisallow: /scripts/\nDisallow: /checks/\n' + (config.domainConfirmed ? '\nSitemap: ' + url('sitemap.xml') + '\n' : '\n# Sitemap declaration withheld until final domain ownership is confirmed.\n'));

console.log(`Generated home, Info, ${products.length} product pages, 404, sitemap and robots.`);
