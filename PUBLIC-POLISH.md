# Stay Wide — public polish and social sharing report

Completed locally on 2 November 2026. Source/templates were updated and public HTML rebuilt. No deployment, commit, push, dependency installation, new photography, invented commercial information or new brand mark. Existing inaccessible/missing files under checks/chrome-profile predated this work and were left untouched; QA used a separate temporary Chrome profile.

## 1. Homepage social preview

- Title: **Stay Wide — Drop 001**.
- OG/X description: **Drop 001.**
- Search meta description: **Stay Wide. Drop 001.**
- File: `assets/brand/stay-wide-share.jpg`.
- JPEG, **1200×630**, **74,374 bytes** (74.4 decimal KB), quality 0.94.
- White canvas; only the existing approved logo, centred. The 920×512 source is drawn with one scale factor, 720/920, producing **720×400.695652px**, at x=240, y=114.652174. This preserves its intrinsic ratio exactly and occupies 60% of the canvas width. No tracing, independent width/height resizing, extra text or graphics.
- Visual inspection found the existing artwork balanced at the geometric centre; no optical offset was needed. The final full-size image and contact sheet were reviewed for whitespace, clarity, clipping and opaque white background.

Cache decision: keep the clean, stable `stay-wide-share.jpg` URL. Local preview sends no-store headers, so this work can be checked without a version filename. Social platforms may retain the previous image after a future publication and need their page caches refreshed. No public cache refresh or deployment was performed. New product card filenames naturally differ from the former portrait URLs.

## 2. Public copy removed or replaced

The following customer-facing phrases were removed/replaced. Internal catalogue placeholders and historical documentation remain where useful.

- `Collection preview` in announcements → `DROP 001`.
- `Development preview / real product photography; names, prices, sizes and stock states remain provisional.` → removed.
- `Independent clothing from Ireland. Drop 001 preview.` → `COMING SOON`.
- `Stay Wide. Drop 001. Independent clothing from Ireland.` in metadata → separate concise search/social descriptions above.
- `Shop drop ↓` → `View drop ↓`.
- `€XX` → no card/PDP price element for unconfirmed products.
- `AVAILABLE / preview state` and `SOLD OUT / preview state` → `DROP 001`.
- `Estimated dispatch: [DISPATCH DATE RANGE TO BE CONFIRMED]` → no dispatch output.
- `Preview sizes — availability and measurements to be confirmed.` → unconfirmed size controls hidden and no development variants emitted; retained future hint reads `Select your size.`
- `[FIT TO BE CONFIRMED]`, `[PRODUCT DESCRIPTION TO BE CONFIRMED]`, `[MATERIALS / GARMENT SPECIFICATION TO BE CONFIRMED]`, `[PRINT / DECORATION TO BE CONFIRMED]`, `[CARE INSTRUCTIONS TO BE CONFIRMED]`, `[GARMENT MEASUREMENTS AND MODEL SIZING TO BE CONFIRMED]` → omitted from generated content; related unconfirmed detail sections hidden.
- `[POLICIES TO BE CONFIRMED]` → removed from the retained PDP shipping link section.
- `Collection preview. Price to be confirmed. Shopping is not connected yet.` → removed; the action itself reads `COMING SOON` and stays disabled.
- `Select a size` / `Sold out` demo purchase states → `COMING SOON` for the current development products.
- `Enable JavaScript to preview size and image interactions. Shopping is not connected.` → removed.
- `Shopping is not connected in this preview. No items have been added or reserved.` → cart says `Drop 001 is coming soon. Orders are not open yet.`
- Runtime `Size [size] selected. Shopping is not connected yet — nothing was added to your cart.` → `Orders are not open yet. Nothing was added to your cart.` in the retained adapter failure path. Current development forms cannot enter that path.
- Product metadata `Development collection preview; final product details and pricing to follow.` → `Stay Wide / Drop 001.`
- Info metadata ending `for the Stay Wide collection preview.` → `Shipping, sizing and information for Stay Wide.`
- `Local development preview. Policies and contact details are not final. Orders are not being accepted.` → `Drop 001 is coming soon. Orders are not open yet.`
- `[FINAL SHIPPING REGIONS AND RATES TO BE CONFIRMED]` → `Shipping destinations and rates will be available before orders open.`
- `[ESTIMATED DISPATCH WINDOW TO BE CONFIRMED BEFORE LAUNCH]` and the paragraph about the cart/checkout connection → `Dispatch information will be available before orders open.`
- `[RETURNS POLICY AND PROCESS TO BE CONFIRMED BEFORE LAUNCH]` → `Returns information will be available before orders open.`
- `[GARMENT MEASUREMENTS AND FIT TO BE CONFIRMED]` → `Size guides will be available with the drop.`
- `[SUPPORT EMAIL TO BE CONFIRMED BEFORE LAUNCH]` → `Contact details will be available before orders open.`
- `Development placeholder — this is not a final Privacy Policy.`, `[BUSINESS / DATA CONTROLLER DETAILS TO BE CONFIRMED BEFORE LAUNCH]` and `[FINAL PRIVACY INFORMATION REQUIRED: PURPOSES, PROVIDERS, RETENTION, TRANSFERS, RIGHTS AND CONTACT]` → `Full privacy information will be available before orders open. You can manage optional tracking below.`
- `Google Analytics and Meta are not configured in this local preview. No optional trackers load, even if you accept. When connected, each will require its corresponding consent.` → `Optional tracking is currently off.`
- `[FINAL PROVIDER / COOKIE INVENTORY AND RETENTION DETAILS REQUIRED BEFORE TRACKING IS ENABLED]` → removed from UI; remains an internal launch requirement.
- `[SELLER DETAILS AND TERMS TO BE CONFIRMED BEFORE ACCEPTING ORDERS]` → `Terms of sale will be available before orders open.`

The approved campaign placeholder, including `[CAMPAIGN IMAGE / FILM]` and its accessible label, is intentionally unchanged. Public scanning explicitly permits only that bracketed placeholder. Info notices do not constitute completed policies or supply invented operational details.

## 3. Homepage opening

Exact visible copy, in order:

```text
DROP 001 / A FIRST LOOK
STAY WIDE.
COMING SOON
View drop ↓
```

The CTA retains `href="#shop"`. Hero structure, typography, campaign structure and product grid remain.

## 4. Header logo

| Measurement | Before | After |
| --- | --- | --- |
| Mobile logo width | 80px | 96px |
| Desktop logo width | 80px | 104px |
| Header vertical padding | 5px each side | 1px each side |
| Resulting mobile header height | approximately 55.5px | 56.39px |
| Resulting desktop header height | approximately 55.5px | 60.84px |

Height remains automatic; the existing image, alt text, home-link accessible name and focus styles are retained. Footer logo remains 108px. No narrower mobile exception was needed at 375px. All Shop/Info/Cart controls retain 44px heights, one-line navigation, a visible count and separation from the logo. No overlap or horizontal overflow at 375, 390, 430 or 1440px.

## 5. Favicon assets

| File | Format / dimensions | Bytes |
| --- | --- | ---: |
| `assets/brand/favicon.ico` | ICO containing 16×16, 32×32, 48×48 PNG frames | 4,947 |
| `assets/brand/favicon-48.png` | PNG, 48×48 | 2,804 |
| `assets/brand/apple-touch-icon.png` | PNG, 180×180 | 18,951 |

Every icon uses the exact existing logo, proportionally contained at 88% canvas width on white. Shared metadata supplies root-relative paths, image types and sizes to home, Info, 404 and all three nested product pages through their existing templates. The square PNG has a stable URL suitable for browser/search usage. The raw wide logo is no longer the favicon. No SVG was faked, and the old monogram fallback was removed.

The complete wordmark is inherently difficult to read at 16px. A dedicated **designer-approved favicon is still recommended**, together with the original vector/high-resolution brand package. This pass does not invent that identity.

## 6. Product social cards

All cards are **1200×630 JPEG**, quality 0.94. Each contains the complete selected primary derivative, centred in a 600×566px box at (300,32), using one proportional scale; the photograph renders approximately 460–466px wide. No extra garment crop, retouching, colour change or photo selection change. White padding is deliberate. The exact logo is included at 144px wide in the lower-right white margin, also proportionally scaled. There is no price, availability message, slogan or date.

| Product | Original photograph → unchanged primary derivative | Final image | Bytes |
| --- | --- | --- | ---: |
| Hoodie 01 | `IMG_1228.JPG` → `assets/products/hoodie-01-front-1200.webp` | `assets/products/hoodie-01-share.jpg` | 123,149 |
| T-shirt 01 | `IMG_1193.JPG` → `assets/products/tshirt-01-front-1200.webp` | `assets/products/tshirt-01-share.jpg` | 134,621 |
| T-shirt 02 | `IMG_1219.JPG` → `assets/products/tshirt-02-front-1200.webp` | `assets/products/tshirt-02-share.jpg` | 135,711 |

The former three `*-front-share.jpg` portrait exports were removed. Asset preparation no longer generates them; the original pipeline calls the new composer after photography preparation. All 24 existing visible-photo WebPs remain unchanged.

Reviewed [the contact sheet](checks/social-assets-contact-sheet.jpg), the full-size homepage card, selected primary photos and representative small icons. Garment silhouettes, hood/sleeves/hem and graphics remain visible; no stretching, clipping or new transparency artifacts were found. The cards are metadata assets and are neither preloaded nor used as visible page media.

## 7. Final metadata

For every row below: `og:type=website`, `og:site_name=Stay Wide`, `og:image:width=1200`, `og:image:height=630`, `twitter:card=summary_large_image`. X title, description, image and image alt equal the corresponding OG values. Canonical equals og:url. No current product has Product/Offer JSON-LD.

| Page | OG/X title | OG/X description | Canonical / og:url |
| --- | --- | --- | --- |
| Homepage | Stay Wide — Drop 001 | Drop 001. | `https://staywide.cc/` |
| Hoodie 01 | Hoodie 01 — Stay Wide | Stay Wide / Drop 001. | `https://staywide.cc/products/hoodie-01.html` |
| T-shirt 01 | T-shirt 01 — Stay Wide | Stay Wide / Drop 001. | `https://staywide.cc/products/tshirt-01.html` |
| T-shirt 02 | T-shirt 02 — Stay Wide | Stay Wide / Drop 001. | `https://staywide.cc/products/tshirt-02.html` |

| Page | OG/X image | OG/X image alt |
| --- | --- | --- |
| Homepage | `https://staywide.cc/assets/brand/stay-wide-share.jpg` | Stay Wide logo on white |
| Hoodie 01 | `https://staywide.cc/assets/products/hoodie-01-share.jpg` | Stay Wide Hoodie 01, black phone-print hoodie flat lay, with Stay Wide logo |
| T-shirt 01 | `https://staywide.cc/assets/products/tshirt-01-share.jpg` | Stay Wide T-shirt 01, white T-shirt with blue logo flat lay, with Stay Wide logo |
| T-shirt 02 | `https://staywide.cc/assets/products/tshirt-02-share.jpg` | Stay Wide T-shirt 02, white ashtray-print T-shirt flat lay, with Stay Wide logo |

Homepage search description is `Stay Wide. Drop 001.`; each product search description is `Stay Wide / Drop 001.`. Actual generated HTML was checked for each value and correct image mapping.

## 8. Files modified

- `404.html`
- `ASSET-INTEGRATION.md`
- `IMAGE-INTERACTIONS.md`
- `LAUNCH-READINESS.md`
- `README.md`
- `assets/brand/stay-wide-share.jpg`
- `checks/asset-manifest.json`
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
- `checks/home-desktop.png`
- `checks/home-mobile.png`
- `checks/image-interactions-results.json`
- `checks/product-mobile.png`
- `checks/readiness-results.json`
- `checks/results.json`
- `css/styles.css`
- `index.html`
- `info.html`
- `js/catalog.js`
- `js/main.js`
- `js/site-config.js`
- `products/hoodie-01.html`
- `products/tshirt-01.html`
- `products/tshirt-02.html`
- `scripts/build.cjs`
- `scripts/check-image-interactions.cjs`
- `scripts/check-metadata.cjs`
- `scripts/check-readiness.cjs`
- `scripts/check.cjs`
- `scripts/metadata.cjs`
- `scripts/prepare-assets.cjs`
- `templates/home.html`
- `templates/info.html`
- `templates/product.html`

## 9. Files created and removed

- `PUBLIC-POLISH.md`
- `assets/brand/apple-touch-icon.png`
- `assets/brand/favicon-48.png`
- `assets/brand/favicon.ico`
- `assets/products/hoodie-01-share.jpg`
- `assets/products/tshirt-01-share.jpg`
- `assets/products/tshirt-02-share.jpg`
- `checks/polish-home-1440.png`
- `checks/polish-home-375.png`
- `checks/polish-home-390.png`
- `checks/polish-home-430.png`
- `checks/public-polish-changes.json`
- `checks/public-polish-results.json`
- `checks/social-assets-contact-sheet.jpg`
- `checks/social-assets-manifest.json`
- `scripts/check-public-polish.cjs`
- `scripts/prepare-social-assets.cjs`

Removed obsolete assets:

- `assets/products/hoodie-01-front-share.jpg`
- `assets/products/tshirt-01-front-share.jpg`
- `assets/products/tshirt-02-front-share.jpg`

All file paths, including regenerated QA artifacts, are also recorded in `checks/public-polish-changes.json`. Pre-existing Chrome-profile changes are excluded.

## 10. Tests and inspection

| Check | Result |
| --- | --- |
| `scripts/build.cjs` | Pass; authoritative source/templates regenerate all public pages |
| `scripts/check.cjs` | Pass; 25 page/viewport cases, 2/3/4-card fixtures, disabled commerce, normal galleries, cart Escape/focus/scroll |
| `scripts/check-readiness.cjs` | Pass; consent persistence/categories/withdrawal/storage fallbacks, static HTML without JS, blank-ID network silence, nested 404 |
| `scripts/check-tracking.cjs` | Pass; isolated tracking gates, event mapping/deduplication/withdrawal; no provider network |
| `scripts/check-metadata.cjs` | Pass; local references, JSON-LD, sitemap/domain, missing-asset rejection, current schema suppression and isolated future Offer fixtures |
| `scripts/check-assets.cjs` | Pass; 16 DPR-2 page/viewport cases and all 24 visible-photo derivative dimensions; no broken images |
| `scripts/check-public-polish.cjs` | Pass; 24 page/viewport cases, exact OG/X/canonicals, favicon paths/ICO frames, no internal public copy, header ratios/fit, image dimensions/content/white background, no social-image browsing downloads |
| `scripts/check-image-interactions.cjs` | Normal interaction cases pass; final pre-existing failed-image retry assertion fails, as described below |

Viewports: **375×812, 390×844, 430×932, 1440×1000**, plus existing suite coverage at **768×1024**. DPR 1 and DPR 2 browser emulation were used. Manual visual review included share assets, small icons, homepage mobile/desktop screenshots and PDP screenshots. No physical Safari/device, production crawler cache, production performance or real provider-delivery claim is made.

Existing failure: the gallery writes `image.dataset.failed = ''`, but its retry branch uses `if (image.dataset.failed)`. The empty marker is falsy, so the fresh-image retry branch is skipped. The normal 15 product/viewport cases, hover/focus/reduced motion, mobile one-tap/no-hover-download checks, arrows/swipe/keyboard/count/boundaries, one/three-image fixtures and initial failed-load fallback all pass. The final recovery assertion fails. The gallery implementation was compared with HEAD and is byte-identical. It was not changed because gallery behavior is outside this pass. The test still fails honestly and now records `failedImageRecovery: "fail"` in `checks/image-interactions-results.json` instead of leaving an old success artifact.

Stale tests expecting the former provisional `.com` domain and demo purchase/size controls were updated to the already configured `.cc` domain and the approved public pre-launch treatment. Tests do not enable commerce or modify catalogue facts.

## 11. Existing functionality preserved

- Product photo selection/order, responsive sources, image hover and keyboard preview are unchanged; normal interaction checks pass.
- PDP arrows, swipe, keyboard navigation, counter and stable layout pass. Existing image-error retry limitation is disclosed above.
- Consent UI/behavior and tracking implementation are unchanged. GA4/Meta IDs remain blank; no SDKs or commerce events were activated.
- Cart remains visible and opens/closes as before, with disabled checkout and no invented items. Future adapter, variant fields and cart-line structure remain.
- Campaign placeholder structure/content remains unchanged.
- Canonicals, five sitemap routes, robots declaration, 404 and Info remain. Stale provisional-domain comments were removed from the builders; domain configuration and sitemap architecture were not changed.
- WebSite/Organization schema remains; Product/Offer data remains withheld while `development: true`. No invented prices, availability, specifications, dates or policies.

## 12. Still required later

Hoodie 02 photography and approved product data; final product names, descriptions/specifications, real EUR prices, confirmed sizes/measurements/inventory, honest dispatch information, Shopify integration, campaign photography/film, original designer vector/high-resolution logo package, a dedicated tiny-size designer favicon, shipping destinations/rates, returns process, public contact/seller/data-controller details and complete privacy/cookie/terms policies. Tracking properties/provider validation, production hosting/search setup and other launch gates remain in LAUNCH-READINESS.md. The separately scoped gallery failed-image retry defect also remains. Nothing here activates ordering or tracking.

## 13. Local preview

From PowerShell:

```powershell
Set-Location 'C:\Users\User\Documents\StayWide'
node --preserve-symlinks --preserve-symlinks-main scripts/build.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/preview.cjs
```

Open **http://127.0.0.1:8080/**. Follow View drop, open each product, test normal gallery arrows/swipe and open Cart. Stop the server with Ctrl+C. No installation is needed.

To regenerate share/icon assets, start dedicated headless Chrome using the README command, run `node --preserve-symlinks --preserve-symlinks-main scripts/prepare-social-assets.cjs`, then rebuild. The normal preview does not require Chrome debugging. Run asset composition and browser suites sequentially. No automatic deployment or next task was started.
