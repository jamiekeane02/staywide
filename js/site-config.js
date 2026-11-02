/* Public configuration only — never put secrets here. Rebuild HTML after changes.
 * LOCAL ONLY: productionUrl is provisional and ownership is NOT confirmed.
 */
const stayWideConfig = {
  siteName: 'Stay Wide',
  productionUrl: 'https://staywide.com',
  domainConfirmed: false,
  GA_MEASUREMENT_ID: '',
  META_PIXEL_ID: '',
  // Local asset paths only. Social images: { src, width: 1200, height: 630, alt }.
  defaultSocialImage: { src: 'assets/brand/stay-wide-share.jpg', width: 1200, height: 630, alt: 'Stay Wide logo on white' },
  icons: { ico: null, png: null, svg: null, apple: null },
  organizationLogo: 'assets/brand/stay-wide-logo.png',
  socialProfiles: { instagram: '', tiktok: '' },
  shipping: { regions: [], rates: null }, // Founder must confirm; no worldwide claim.
  consentVersion: 1,
  consentMaxAgeDays: 180
};
if (typeof module !== 'undefined') module.exports = stayWideConfig;
if (typeof window !== 'undefined') window.stayWideConfig = stayWideConfig;
