/* Shared build-time metadata: crawlers receive complete HTML, no runtime injection. */
const fs = require('node:fs');
const path = require('node:path');
const config = require('../js/site-config.js');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url = route => new URL(route, config.productionUrl + '/').href;
const jsonld = data => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
function asset(src) {
  const root = path.resolve('.');
  const resolved = path.resolve(src);
  if (!resolved.startsWith(root + path.sep) || !fs.statSync(resolved).isFile()) throw new Error(`Invalid/missing asset: ${src}`);
  return url(src);
}
function productSchema(product, route) {
  // Never publish fabricated offers or preview inventory to search engines.
  if (product.development) return '<!-- Product/Offer schema withheld: final visible product data and commerce required. See LAUNCH-READINESS.md. -->';
  if (!product.description || product.description.includes('[') || !Number.isFinite(product.price) || product.price <= 0 || !product.images[0]?.src) throw new Error(`Incomplete launch product: ${product.id}`);
  const data = { '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: product.description,
    url: url(route), image: product.images.filter(i => i.src).map(i => asset(i.src)), brand: { '@type': 'Brand', name: config.siteName } };
  for (const [field, value] of Object.entries({ sku: product.sku, color: product.colour, material: product.materials })) {
    if (value && !value.includes('[')) data[field] = value;
  }
  // Coming soon is not an orderable offer; never infer preorder from dispatch time.
  if (product.status !== 'coming_soon') {
    if (!['available', 'sold_out'].includes(product.status) || !product.commerceReady) throw new Error(`Unverified offer: ${product.id}`);
    data.offers = { '@type': 'Offer', url: url(route), price: product.price, priceCurrency: product.currency,
      availability: `https://schema.org/${product.status === 'available' ? 'InStock' : 'OutOfStock'}`, itemCondition: 'https://schema.org/NewCondition' };
  }
  return jsonld(data);
}
function head({ title, description, socialDescription = description, route, product, home = false, noindex = false }) {
  const lines = [`<title>${escape(title)}</title>`, `<meta name="description" content="${escape(description)}">`];
  if (noindex) lines.push('<meta name="robots" content="noindex, follow">');
  else lines.push(`<link rel="canonical" href="${escape(url(route))}">`);
  for (const [key, value] of Object.entries({ title, description: socialDescription, url: url(route), type: 'website', site_name: config.siteName })) lines.push(`<meta property="og:${key}" content="${escape(value)}">`);
  const social = product ? product.socialImage : config.defaultSocialImage;
  lines.push(`<meta name="twitter:card" content="${social ? 'summary_large_image' : 'summary'}">`, `<meta name="twitter:title" content="${escape(title)}">`, `<meta name="twitter:description" content="${escape(socialDescription)}">`);
  if (social) {
    if (!social.width || !social.height || !social.alt) throw new Error('Social image dimensions and alt required');
    const src = asset(social.src);
    for (const [key, value] of Object.entries({ image: src, 'image:width': social.width, 'image:height': social.height, 'image:alt': social.alt })) lines.push(`<meta property="og:${key}" content="${escape(value)}">`);
    lines.push(`<meta name="twitter:image" content="${escape(src)}">`, `<meta name="twitter:image:alt" content="${escape(social.alt)}">`);
  } else lines.push('<!-- FINAL OG SHARE IMAGE REQUIRED (1200 × 630). Large X card enabled when a real image is configured. -->');
  for (const [type, src] of Object.entries(config.icons)) if (src) {
    asset(src);
    const attributes = type === 'apple' ? 'sizes="180x180"' : type === 'png' ? 'type="image/png" sizes="48x48"' : type === 'svg' ? 'type="image/svg+xml"' : 'type="image/x-icon" sizes="16x16 32x32 48x48"';
    lines.push(`<link rel="${type === 'apple' ? 'apple-touch-icon' : 'icon'}" ${attributes} href="/${escape(src)}">`);
  }
  if (home) {
    const org = { '@type': 'Organization', '@id': url('#organization'), name: config.siteName, url: url('/') };
    if (config.organizationLogo) org.logo = asset(config.organizationLogo);
    const profiles = Object.values(config.socialProfiles).filter(Boolean);
    if (profiles.length) org.sameAs = profiles;
    lines.push(jsonld({ '@context': 'https://schema.org', '@graph': [ { '@type': 'WebSite', name: config.siteName, url: url('/'), publisher: { '@id': url('#organization') } }, org ] }));
  }
  if (product) {
    lines.push(productSchema(product, route));
  }
  return lines.join('\n  ');
}
module.exports = { head, url, productSchema };
