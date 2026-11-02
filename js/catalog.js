/* Development content only. No status, size or price is a launch commitment.
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
    { id: 'hoodie-01', name: 'Hoodie 01', kind: 'hoodie', tone: '01', mark: '01', status: 'available', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], images: [
      productPhoto('hoodie-01-front', 'front', 'Stay Wide Hoodie 01, black phone-print hoodie flat lay', 1474),
      productPhoto('hoodie-01-detail', 'print detail', 'Phone print and Stay Wide logo on Hoodie 01', 1600)
    ] },
    { id: 'hoodie-02', listed: false, name: 'Hoodie 02', kind: 'hoodie', tone: '02', mark: '02', status: 'available', sizes: ['S', 'M', 'L', 'XL'] },
    { id: 'tshirt-01', name: 'T-shirt 01', kind: 'tee', tone: '03', mark: '01', status: 'available', sizes: ['S', 'M', 'L', 'XL'], images: [
      productPhoto('tshirt-01-front', 'front', 'Stay Wide T-shirt 01, white T-shirt with blue logo flat lay', 1478),
      productPhoto('tshirt-01-detail', 'print detail', 'Blue Stay Wide logo and fabric detail on T-shirt 01', 1500)
    ] },
    { id: 'tshirt-02', name: 'T-shirt 02', kind: 'tee', tone: '04', mark: '02', status: 'sold_out', sizes: ['S', 'M', 'L', 'XL'], images: [
      productPhoto('tshirt-02-front', 'front', 'Stay Wide T-shirt 02, white ashtray-print T-shirt flat lay', 1458),
      productPhoto('tshirt-02-detail', 'print detail', 'Yellow ashtray print and fabric detail on T-shirt 02', 1600)
    ] }
  ].map(product => ({
    ...product,
    development: true, // Keep true until all visible product data is approved.
    commerceReady: false, // Requires authoritative Shopify products/cart/checkout.
    metaDescription: null, // Final short description; otherwise concise drop copy.
    socialImage: product.images ? { src: `assets/products/${product.id}-share.jpg`, width: 1200, height: 630, alt: product.images[0].alt + ", with Stay Wide logo" } : null,
    sku: null,
    colour: null,
    shopifyProductId: null,
    price: null,
    currency: 'EUR',
    dispatch: '[DISPATCH DATE RANGE TO BE CONFIRMED]',
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
