/* Public configuration only — never put secrets here. Rebuild HTML after changes.
 * Production domain confirmed: staywide.cc.
 */
const stayWideConfig = {
  siteName: 'Stay Wide',
  productionUrl: 'https://staywide.cc',
  domainConfirmed: true,
  GA_MEASUREMENT_ID: '',
  META_PIXEL_ID: '',
  // Public browser-side Buy Button configuration supplied by Shopify, not an Admin token.
  shopify: {
    enabled: true,
    domain: 'zw8sj5-yw.myshopify.com',
    storefrontAccessToken: '01d852d99c4d5fbc423520aaac320f4b',
    scriptURL: 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js',
    moneyFormat: '%E2%82%AC%7B%7Bamount_with_comma_separator%7D%7D'
  },
  // Local asset paths only. Social images: { src, width: 1200, height: 630, alt }.
  defaultSocialImage: { src: 'assets/brand/stay-wide-share.jpg', width: 1200, height: 630, alt: 'Stay Wide logo on white' },
  icons: { ico: 'assets/brand/favicon.ico', png: 'assets/brand/favicon-48.png', svg: null, apple: 'assets/brand/apple-touch-icon.png' },
  organizationLogo: 'assets/brand/stay-wide-logo.png',
  socialProfiles: { instagram: '', tiktok: '' },
  shipping: { regions: [], rates: null }, // Founder must confirm; no worldwide claim.
  consentVersion: 1,
  consentMaxAgeDays: 180
};
if (typeof module !== 'undefined') module.exports = stayWideConfig;
if (typeof window !== 'undefined') window.stayWideConfig = stayWideConfig;
