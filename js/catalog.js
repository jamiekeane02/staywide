/* Approved editorial data. Legacy sizes/status are documentation only; Shopify owns stock.
 * Set listed:false to withhold a product and its generated route, then rebuild.
 * Image src is relative to the site root; srcset URLs are root-relative.
 */
const productPhoto = (name, view, alt, height) => ({
  view, alt, src: `assets/products/${name}-1200.webp`, width: 1200, height,
  srcset: [480, 800, 1200, 1600].map(width => `/assets/products/${name}-${width}.webp ${width}w`).join(', ')
});
const stayWideCatalog = {
  statuses: { available: 'AVAILABLE', sold_out: 'SOLD OUT', coming_soon: 'COMING SOON' },
  products: [
    { id: 'hoodie-01', shopifyProductId: '16690527011207', name: 'Blower Hoodie', price: 60, metaDescription: 'Blower Hoodie by Stay Wide.', kind: 'hoodie', tone: '01', mark: '01', status: 'available', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], images: [
      productPhoto('hoodie-01-front', 'front', 'Blower Hoodie, black phone-print hoodie flat lay', 1474),
      productPhoto('hoodie-01-detail', 'print detail', 'Phone print and Stay Wide logo on Blower Hoodie', 1600)
    ] },
    { id: 'hoodie-02', listed: false, name: 'Hoodie 02', kind: 'hoodie', tone: '02', mark: '02', status: 'available', sizes: ['S', 'M', 'L', 'XL'] },
    { id: 'tshirt-01', shopifyProductId: '16690535891335', name: 'Stay Wide Tee', price: 25, metaDescription: 'Stay Wide Tee.', kind: 'tee', tone: '03', mark: '01', status: 'available', sizes: ['S', 'M', 'L', 'XL'], images: [
      productPhoto('tshirt-01-front', 'front', 'Stay Wide Tee, white T-shirt with blue logo flat lay', 1478),
      productPhoto('tshirt-01-detail', 'print detail', 'Blue Stay Wide logo and fabric detail on Stay Wide Tee', 1500)
    ] },
    { id: 'tshirt-02', shopifyProductId: '16690540020103', name: 'Ashtray Tee', price: 25, metaDescription: 'Ashtray Tee by Stay Wide.', kind: 'tee', tone: '04', mark: '02', status: 'sold_out', sizes: ['S', 'M', 'L', 'XL'], images: [
      productPhoto('tshirt-02-front', 'front', 'Ashtray Tee, white ashtray-print T-shirt flat lay', 1458),
      productPhoto('tshirt-02-detail', 'print detail', 'Yellow ashtray print and fabric detail on Ashtray Tee', 1600)
    ] }
  ].map(product => ({
    ...product,
    development: true, // Editorial/specification and static SEO gate, independent of live commerce.
    commerceReady: Boolean(product.shopifyProductId) && product.listed !== false, // Live mapping/add/cart verified 6 November 2026.
    metaDescription: product.metaDescription || null,
    socialImage: product.images ? { src: `assets/products/${product.id}-share.jpg`, width: 1200, height: 630, alt: product.images[0].alt + ", with Stay Wide logo" } : null,
    sku: null,
    colour: null,
    shopifyProductId: product.shopifyProductId || null,
    price: product.price ?? null,
    currency: 'EUR',
    dispatch: null, // Optional internal field; intentionally not rendered publicly.
    fitNote: 'Size up for a looser fit.',
    fit: '[FIT TO BE CONFIRMED]',
    description: '[PRODUCT DESCRIPTION TO BE CONFIRMED]',
    materials: '[MATERIALS / GARMENT SPECIFICATION TO BE CONFIRMED]',
    decoration: '[PRINT / DECORATION TO BE CONFIRMED]',
    care: '[CARE INSTRUCTIONS TO BE CONFIRMED]',
    sizeGuide: '[GARMENT MEASUREMENTS AND MODEL SIZING TO BE CONFIRMED]',
    images: product.images || [], // Supply real images before enabling Hoodie 02.
    variants: product.sizes.map(size => ({ size, shopifyVariantId: null, available: product.status === 'available' }))
  }))
};
if (typeof module !== 'undefined') module.exports = stayWideCatalog;
if (typeof window !== 'undefined') window.stayWideCatalog = stayWideCatalog;
