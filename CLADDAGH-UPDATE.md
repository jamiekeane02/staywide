# Claddagh Hoodie + mobile product funnel

Local implementation, 16 November 2026. Nothing deployed, committed or pushed. Existing browser-profile permission/deletion entries were present before this task and were not modified.

## 1. Claddagh images

- Primary: C:/Users/User/Downloads/IMG_1464.jpeg. Full garment, hood, pocket and cuffs make the hoodie immediately understandable. The white Claddagh print is legible at card size. Used for card, PDP lead and social share.
- Secondary: C:/Users/User/Downloads/IMG_1457.jpeg. Close-up shows the print, blue Stay Wide logo and fabric texture. Used for fine-pointer card hover and PDP image two.

Both originals were inspected. Browser EXIF orientation produces 6048 × 8064 upright pixels. No cropping, retouching, recolouring, artwork changes or generated imagery. Only proportional resizing and encoding; originals remain outside the public site and untouched.

## 2. Product configuration

Local ID: hoodie-02. Name: Claddagh Hoodie. Shopify product ID: 16718244217223. Kind: hoodie. Listed: true. Price: EUR 60.

Commerce is verified ready: the existing runtime validator accepted the real Shopify product and all variant prices/currencies. The existing validator still fails closed on mapping or price mismatch. The catalogue commerceReady flag denotes mapping eligibility; the actual controls remain hidden until live validation succeeds. No local sizes or inventory were invented. Live Shopify returned L, M, S and XL during this check; availability remains dynamic.

## 3. Homepage

Order: Blower Hoodie → Claddagh Hoodie → Stay Wide Tee → Ashtray Tee. Cards and recommendations come from the shared catalogue. Mobile and tablet use 2 × 2. At 1240px and above, four columns fit with at least about 260px per card; measured width at 1440px is 306.6px. The desktop screenshot was reviewed for garment readability.

Fine-pointer hover uses the existing decoded secondary-image system and restores the primary on exit. Mobile cards retain one-tap PDP navigation and do not download hover photos. Shared image grid constraints now keep the entire photograph inside its frame.

## 4. Mobile gallery

Existing two-image gallery retained: left/right swipes, native vertical page scrolling, previous/next buttons, keyboard arrows, 1 / 2 and 2 / 2 counter, boundaries and reduced-motion support all passed. Buttons remain 44 × 44px. No new carousel, thumbnails, zoom modal or duplicate buy control.

Mobile gallery height is capped at 46svh (and 108vw); photos remain contained. An existing retry bug checked an empty data-failed value as a boolean. It now checks attribute presence; failed-image fallback and recovery passed. Primary images load eagerly with high priority; secondary images decode before reveal.

## 5. Shopify

The existing domain, public token, loader, client, cart, control styles, checkout and tracking hooks are reused. No generated embed was pasted and no duplicate client, script or cart added. Shopify provides sizes, inventory, cart count and checkout.

Real test: add Claddagh, navigate to Blower, add Blower, return home, open bag: one cart, two product lines, EUR 120. Successful-add tracking fired with EUR 60 and the correct local ID for each add. Cart persisted across pages. All four products loaded real size selectors and passed existing price validation. CHECKOUT navigated the same tab to zw8sj5-yw.myshopify.com. No payment or order was submitted.

## 6. Header cleanup

Removed the COMING SOON span in templates/home.html, templates/product.html and templates/info.html; the build regenerated home, all four PDPs and Info. Each announcement now contains only STAY WIDE. The 404 template has no announcement strip, so none needed removing. Legitimate SOLD OUT / UNAVAILABLE Shopify states remain.

## 7. Footer / Info cleanup

Shared footer now contains Shipping / Returns, Contact and Cookie settings. Removed custom Terms and Privacy footer links and placeholder Info sections. Removed Orders are not open yet and all before-orders-open language. Shipping points to checkout; returns/contact/measurements honestly state that details are not yet published instead of inventing policy values.

Cookies remains a separate section. Accept all, Reject non-essential, Manage, Cookie settings, persistence, withdrawal and GA/Meta consent gating passed. Shopify policy configuration and checkout links were untouched. Tracking IDs remain blank as before.

## 8. Assets

All files below are in assets/products/. Encoding: WebP quality 0.88; share JPEG quality 0.94. Share composition matches the existing catalogue: proportional full photograph on white with restrained existing Stay Wide logo, no price or promotional copy.

| Filename | Dimensions | Approximate size |
| --- | --- | --- |
| hoodie-02-front-480.webp | 480 × 640 | 62 KiB |
| hoodie-02-front-800.webp | 800 × 1067 | 187 KiB |
| hoodie-02-front-1200.webp | 1200 × 1600 | 358 KiB |
| hoodie-02-front-1600.webp | 1600 × 2133 | 741 KiB |
| hoodie-02-detail-480.webp | 480 × 640 | 36 KiB |
| hoodie-02-detail-800.webp | 800 × 1067 | 144 KiB |
| hoodie-02-detail-1200.webp | 1200 × 1600 | 275 KiB |
| hoodie-02-detail-1600.webp | 1600 × 2133 | 635 KiB |
| hoodie-02-share.jpg | 1200 × 630 | 104 KiB |

Reproducible preparation: node --preserve-symlinks --preserve-symlinks-main scripts/prepare-claddagh-assets.cjs C:/Users/User/Downloads (dedicated Chrome on port 9223 required).

## 9. Social metadata and caching

- Title / OG title: Claddagh Hoodie — Stay Wide
- Description / OG description: Claddagh Hoodie by Stay Wide.
- OG / X image: https://staywide.cc/assets/products/hoodie-02-share.jpg
- Canonical / OG URL: https://staywide.cc/products/hoodie-02.html
- Sitemap includes the canonical through the existing build.
- Existing conservative Product/Offer schema suppression remains; no static inventory claim added.

No shared asset-version mechanism existed in this checkout. The build now derives one deterministic version from the shared CSS/JS contents and applies it to all generated CSS/JS references. Rebuild after editing source; no per-file random versions or credentials changed.

## 10. Files modified

Includes regenerated public pages and refreshed QA evidence:

- `404.html`
- `README.md`
- `checks/asset-results.json`
- `checks/assets-home-1440.png`
- `checks/assets-home-390.png`
- `checks/assets-hoodie-01-390.png`
- `checks/assets-tshirt-01-390.png`
- `checks/assets-tshirt-02-390.png`
- `checks/consent-mobile.png`
- `checks/gallery-hoodie-01-1440.png`
- `checks/gallery-hoodie-01-390.png`
- `checks/gallery-tshirt-01-1440.png`
- `checks/gallery-tshirt-01-390.png`
- `checks/gallery-tshirt-02-1440.png`
- `checks/gallery-tshirt-02-390.png`
- `checks/image-interactions-results.json`
- `checks/polish-home-1440.png`
- `checks/polish-home-375.png`
- `checks/polish-home-390.png`
- `checks/polish-home-430.png`
- `checks/public-polish-results.json`
- `checks/readiness-results.json`
- `css/styles.css`
- `index.html`
- `info.html`
- `js/catalog.js`
- `js/main.js`
- `products/hoodie-01.html`
- `products/tshirt-01.html`
- `products/tshirt-02.html`
- `scripts/build.cjs`
- `scripts/check-assets.cjs`
- `scripts/check-image-interactions.cjs`
- `scripts/check-public-polish.cjs`
- `scripts/check-readiness.cjs`
- `sitemap.xml`
- `templates/home.html`
- `templates/info.html`
- `templates/product.html`

## 11. Files created

- `CLADDAGH-UPDATE.md`
- `assets/products/hoodie-02-detail-1200.webp`
- `assets/products/hoodie-02-detail-1600.webp`
- `assets/products/hoodie-02-detail-480.webp`
- `assets/products/hoodie-02-detail-800.webp`
- `assets/products/hoodie-02-front-1200.webp`
- `assets/products/hoodie-02-front-1600.webp`
- `assets/products/hoodie-02-front-480.webp`
- `assets/products/hoodie-02-front-800.webp`
- `assets/products/hoodie-02-share.jpg`
- `checks/assets-hoodie-02-390.png`
- `checks/claddagh/assets.json`
- `checks/claddagh/home-1440.png`
- `checks/claddagh/home-375.png`
- `checks/claddagh/home-390.png`
- `checks/claddagh/home-430.png`
- `checks/claddagh/home-768.png`
- `checks/claddagh/product-1440.png`
- `checks/claddagh/product-375.png`
- `checks/claddagh/product-390.png`
- `checks/claddagh/product-430.png`
- `checks/claddagh/product-768.png`
- `checks/claddagh/results.json`
- `checks/gallery-hoodie-02-1440.png`
- `checks/gallery-hoodie-02-390.png`
- `products/hoodie-02.html`
- `scripts/check-claddagh.cjs`
- `scripts/prepare-claddagh-assets.cjs`

## 12. QA

Chrome desktop/mobile emulation, DPR 2. All listed widths passed with no horizontal overflow, one shared cart/script, authoritative size control and contained photography. Coordinates below are CSS pixels from the page top after dismissing consent. At 375px only the final ~5px of the buy button extends below the first viewport; at 390px and 430px the whole control fits.

| Viewport | Result | Homepage layout | PDP title top | Add to Bag bottom |
| --- | --- | --- | --- | --- |
| 375 × 812 | Pass | 2 × 2 | 601px | 817px |
| 390 × 844 | Pass | 2 × 2 | 616px | 832px |
| 430 × 932 | Pass | 2 × 2 | 657px | 872px |
| 768 × 1024 | Pass | 2 × 2 | 172px | 388px |
| 1440 × 1000 | Pass | 4 columns | 172px | 409px |

Passed suites:

- Build and static metadata/local references/sitemap checks.
- check-claddagh.cjs: real price/mapping, mixed cart, all four product selectors, 15 page/viewport cases, nine new asset dimensions and hosted checkout.
- check-image-interactions.cjs: 20 product/viewport cases; hover/focus, touch one-tap, swipe, actual vertical scrolling, arrows/keyboard/counter, single/three-image fixtures, failed-image fallback/recovery.
- check-public-polish.cjs: 28 page/viewport cases and social metadata.
- check-readiness.cjs: consent categories, persistence, withdrawal, invalid/expired/blocked storage, no-JS content, blank-ID tracking silence and 404.
- check-assets.cjs: 20 high-density page/viewport cases, existing 24 responsive derivatives, no failed assets or runtime exceptions.
- check-shopify-events.cjs: initialization deduplication, successful-add tracking, mismatch failure, quantity cancellation, checkout and failure states.
- check-tracking.cjs: independent categories, blank IDs, no replay, deduplication and withdrawal during SDK load.
- Scoped git diff whitespace check.

Evidence: checks/claddagh/results.json, checks/claddagh/assets.json, checks/image-interactions-results.json, checks/public-polish-results.json, checks/readiness-results.json and checks/asset-results.json. Screenshot sets include all five home and Claddagh viewports in checks/claddagh/.

## 13. Remaining manual checks

- Actual iPhone/Safari and Android hardware spot-check; desktop Chrome emulation cannot certify those browsers.
- Founder-approved returns, contact details and garment measurements remain to be supplied. No replacement policy text or rates were invented.
- Shopify payment, shipping destinations/rates and full order fulfilment require a platform test order; this task verified only hosted-checkout handoff.
- After a separately authorized deployment, repeat the cart/checkout smoke test on the production origin.

## 14. Preview commands

From C:/Users/User/Documents/StayWide in PowerShell:

~~~powershell
node --preserve-symlinks --preserve-symlinks-main scripts/build.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/preview.cjs
~~~

Open http://127.0.0.1:8080/ and http://127.0.0.1:8080/products/hoodie-02.html. Stop the preview with Ctrl+C. No dependencies to install. Browser suites require a dedicated Chrome debug session on 9223; set CHROME_DEBUG_PORT=9223 for the older shared suites and run them sequentially.
