# Stay Wide — photography and logo integration

Update, 2 November 2026: Current exports are documented in [PUBLIC-POLISH.md](PUBLIC-POLISH.md). The original photographic selections and 24 WebP derivatives remain unchanged. The three portrait share JPEGs below were replaced by dedicated 1200x630 cards, and square favicon assets now exist. The rest of this document records the earlier asset-integration pass.

30 October 2026. Local update only. No deployment, commit, push, commerce activation, tracking IDs or dependencies. The ten supplied text attachments contain the same brief after Markdown/list formatting is removed. This report covers the current local build.

Follow-up: [IMAGE-INTERACTIONS.md](IMAGE-INTERACTIONS.md) documents the subsequent requested hover previews and gallery arrows/counter. Its interaction descriptions supersede the initial interaction descriptions below; photo selections, crops, asset metrics and logo remain unchanged.

## 1. Supplied assets and review

All twelve supplied images were reviewed together and the chosen outputs inspected individually. Originals remain untouched at `C:/Users/User/Downloads/drive-download-20261030T031745Z-1-001/`. `checks/source-review.jpg` is the comparison sheet, not website artwork. Its gang-sheet thumbnail is for local review only.

All JPGs except IMG_1230/1231 have encoded dimensions 8064×6048. IMG_1230/1231 are 5236×3928. EXIF orientation 6 makes 1190, 1216, 1218, 1219, 1224, 1228, 1230 and 1231 upright portraits. The sideways 1193, 1197 and 1198 require a further clockwise 90° rotation. Upright dimensions and original sizes appear in the inventory table below.

| File | Represents | Review and use |
| --- | --- | --- |
| GANGSHEET2.1.png | Print-production sheet; 6615×11812 transparent PNG | Only the upright blue/white STAY WIDE logo near the lower centre was extracted. No other artwork is used. |
| IMG_1190.JPG | T-shirt 01, white with blue logo | Good complete front and fairly even light. Not used: another similar view; 1193 gives a clearer, broader chest/graphic presentation after rotation. |
| IMG_1193.JPG | T-shirt 01 | Primary. Complete sleeves/hem, clear rectangular silhouette, useful sharpness and ample background for a safe crop. Cool lighting remains as photographed. |
| IMG_1197.JPG | T-shirt 01, tighter front | Used only as a chest/print detail crop. Good legibility and fabric texture; whole-garment framing approaches the sleeve edges too closely for the lead. |
| IMG_1198.JPG | T-shirt 01, tighter front | Not used: near-duplicate of 1197, with the same tight edge clearance and visible body creasing; no extra customer information. |
| IMG_1216.JPG | T-shirt 02, white with yellow ashtray print | Not used: clear graphic but the right sleeve is already cut by the source frame. Less useful for garment shape than 1219. |
| IMG_1218.JPG | T-shirt 02, chest detail | Secondary. Large, sharp print, collar and fabric texture; directional light is retained. Intentionally a detail, not a full garment. |
| IMG_1219.JPG | T-shirt 02, full front | Primary. Entire silhouette, visible graphic, balanced exposure and neutral-looking white compared with the blue-logo set. Excess ground and edge clutter cropped away without altering the garment. |
| IMG_1224.JPG | Hoodie 01, black phone-print hoodie | Not used: sleeve/cuff cut at the lower-left edge. Bright floor and tighter framing make full shape harder to judge. |
| IMG_1228.JPG | Hoodie 01, full front | Primary. Complete hood, cuffs and hem, distinct phone graphic, good fabric definition and best breathing room. Natural warm light remains; no recolouring. |
| IMG_1230.JPG | Hoodie 01, mid-close view | Not used: hood/garment edges already cropped; overlaps the full lead and provides less print detail than 1231. |
| IMG_1231.JPG | Hoodie 01, close print detail | Secondary. Strongest view of both phones, small logo and black fabric. Lower native resolution still comfortably exceeds output requirements. |

## 2. Product image selection

- **Hoodie 01:** `IMG_1228.JPG` wins for the complete silhouette and balanced margins. It reads as a hoodie even on a small card; the fluorescent print remains visible against the dark fabric. `IMG_1231.JPG` provides useful print inspection. The source's warm cast and fabric shading are retained.
- **T-shirt 01:** `IMG_1193.JPG` wins for the complete sleeves and hem, broad readable logo, consistent light and usable crop. A clockwise orientation correction makes it immediately understandable on mobile. The cool white is retained accurately to the supplied photograph. A dedicated crop of `IMG_1197.JPG` adds a much larger logo/fabric view.
- **T-shirt 02:** `IMG_1219.JPG` wins for the complete garment, balanced shape, clear yellow print and even useful exposure. Its wider framing lets the crop exclude the paper/scissors at the edges without cutting clothing. `IMG_1218.JPG` gives a materially closer view of the print and collar.

Each primary is used consistently on its card, PDP lead and temporary product share image. No separate card/PDP source is necessary. No back photographs were supplied or invented. Each gallery has exactly two distinct views, labelled “front” and “print detail”. Rejected originals were not deleted.

## 3. Stay Wide logo

Source: `GANGSHEET2.1.png`, the upright blue-and-white logo near the bottom centre, separate from the bird artwork on either side. Extraction bounds in source pixels: x=1850, y=9720, width=2300, height=1280. The extraction contains only the logo, with clear transparent pixels along every outer edge.

`scripts/prepare-assets.cjs` crops those exact pixels, preserves the existing alpha channel and removes only connected near-black exterior pixels if present. It does not redraw, trace, replace fonts, reshape letters, alter spacing or change colours. Proportions are preserved, subject only to rounding a resized raster to whole pixels.

- `assets/brand/stay-wide-logo.png`: transparent PNG, 920×512, about 166 KB; suitable temporary high-resolution raster and Organization logo.
- `assets/brand/stay-wide-logo-320.png`: transparent PNG, 320×178; compact responsive header/footer derivative. Displayed at 80px wide in the header and 108px in the footer, with high-density coverage.
- `assets/brand/stay-wide-share.jpg`: 1200×630 JPEG, about 67 KB, exact logo centred on white; temporary default social image.
- `checks/logo-extraction.png`: 2300×1280 local source crop for inspection, not a storefront download.

Quality is sufficient for temporary website use. **The designer's original SVG or high-resolution transparent PNG is still required** as the authoritative master. The existing SW favicon is preserved; final designer favicon assets (ICO, SVG, PNG at 48px+, Apple 180px) are still needed.

## 4. Homepage changes

The existing opening copy, typography, compact campaign placeholder, navigation and overall structure remain. Header and footer now use the actual logo. The same asset is also used on Info and 404 for consistency. Header height remains under 62px in all checked layouts.

There are three real product cards, ordered Hoodie 01, T-shirt 01, T-shirt 02. On mobile, two columns remain and the third card is centred at exactly the same width as the first two. On desktop, three equal columns fill a single row. No spacer card or fabricated product exists. Four visible products automatically return to a two-by-two collection.

Cards contain only photography, development name, existing €XX price and existing preview status. Dispatch stays in the PDP buying information. Placeholder silhouettes, category overlays, arrows and speculative back-image hover swaps are no longer rendered for cards. Hover still underlines the name.

Primary crops are approximately 4:5. CSS uses `object-fit: contain` in a stable 4:5 frame, so no viewport introduces additional garment cropping. A little neutral space is retained when a photograph's ratio differs. No hood, sleeve, hem or main graphic is cut by the chosen primary crop. Natural wrinkles, shading, fabric and background remain.

## 5. Product pages

| PDP | Lead | Secondary |
| --- | --- | --- |
| `products/hoodie-01.html` | IMG_1228 → `hoodie-01-front-*` | IMG_1231 → `hoodie-01-detail-*` |
| `products/tshirt-01.html` | IMG_1193 → `tshirt-01-front-*` | IMG_1197 cropped → `tshirt-01-detail-*` |
| `products/tshirt-02.html` | IMG_1219 → `tshirt-02-front-*` | IMG_1218 → `tshirt-02-detail-*` |

The existing image/name/price/status/dispatch/size/cart/details structure, gallery buttons and horizontal swipe behaviour are retained. Each gallery starts on the full garment; the visitor can explicitly switch to its detail. All card links resolve to their matching PDP. The existing Hoodie 01/T-shirt 01 available preview states and T-shirt 02 sold-out preview state, size arrays, prices and dispatch placeholders are preserved. “Tee” labels were normalised to the brief's development names “T-shirt 01/02”; no final names were invented.

## 6. Adding Hoodie 02 later

Its original catalogue record is retained with `listed: false` and an empty image list. The build excludes it from the home grid, recommendations and sitemap and removes its obsolete generated placeholder HTML. Its local URL returns a genuine 404.

When ready: supply its real primary photo and only useful extra views; create responsive derivatives; add image records with accurate dimensions, alt and root-relative srcset; set its product share image; fill confirmed details as they become available; set `listed: true`; rebuild. The PDP and links are then generated automatically. The builder rejects any listed product without real image files. Keep `development: true` and `commerceReady: false` until their existing launch requirements are satisfied.

## 7. Optimisation and file metrics

Only EXIF orientation, the specified 90° correction, cropping, resizing and encoding were applied. No AI, artificial garment, retouching, recolouring, material alteration or new artwork was used. Chrome's canvas encoder creates WebP at quality 0.88, four widths per view (480/800/1200/1600). Full original files are never served by the site. Product social images use JPEG at quality 0.90 for broad sharing compatibility. Resized outputs omit camera metadata.

The exact original/derivative dimensions and byte sizes are in `checks/asset-manifest.json`; human-readable tables follow this report. Kilobytes/megabytes below are decimal, rounded. Responsive size selection is based on card versus PDP display width, not one oversized default. The HTML reserves dimensions and 4:5 frames; gallery details and later/recommendation cards are lazy-loaded. Primary PDP images and the first two homepage cards are eager with high fetch priority. Social JPEGs are metadata assets, not extra page image downloads.

## 8. Performance findings

At device pixel ratio 2 on the requested mobile widths, the home cards selected 480px WebPs: about 76 KB, 91 KB and 88 KB. The largest loaded home photograph is T-shirt 01. Mobile PDP leads selected 800px WebPs: about 232 KB (hoodie), 259 KB (T-shirt 01) and 248 KB (T-shirt 02). The header/footer use the small logo derivative.

At 1440px/DPR 2, home selected 1200px files; T-shirt 01 is largest at about 594 KB. The largest possible home candidate is `tshirt-01-front-1600.webp`, about 1.08 MB. Largest product derivative overall is `tshirt-02-detail-1600.webp`, about 1.10 MB; it is a lazy detail view. These larger sizes retain fabric/print detail on high-density desktop displays; the textured concrete background accounts for substantial image data.

Local PerformanceObserver checks identified a first-row product photograph as homepage LCP (Hoodie 01 on the mobile passes; first-row selection can vary on desktop). Each PDP's LCP is its full-garment lead. No campaign bitmap is present. Observed initial layout shift was zero in the high-density checks. These are local Chrome observations, not production Core Web Vitals, a throttled mobile benchmark or a Lighthouse score. Future campaign imagery will need its own eager, dimensioned, appropriately sized lead and performance review.

## 9. Mobile QA

Tested **375×812, 390×844 and 430×932**, at DPR 1 with the existing interaction suite and DPR 2 with the new asset suite. Checked header/logo/navigation fit, no horizontal overflow, three real cards, centred final card, exact product links, decoded images, correct responsive candidates, contain fitting, visible print detail, eager leads/lazy details, gallery controls/swipes, sizes, sold-out handling, cart preview, focus restoration, keyboard accordions and consent flows. Screenshots are in `checks/`.

## 10. Desktop QA

Tested **1440×1000**, at DPR 1 and DPR 2, and **768×1024** in the existing suite. Three equally sized products form one deliberate row at desktop/tablet widths of 700px and above. Product pages retain side-by-side gallery and buying information; recommendations use two balanced columns. Existing layout checks exercise two-, three- and four-card states without overflow. No extra fourth card is shipped.

Checks passed: `check.cjs` (25 page/viewport cases), `check-readiness.cjs` (consent/static HTML/404), `check-metadata.cjs` (references/schema/sitemap), `check-tracking.cjs` (isolated opt-in/withdrawal logic, no network), and `check-assets.cjs` (16 DPR-2 page/viewport cases plus all 27 product derivative dimensions). No page runtime exceptions, broken image requests or external requests with blank tracking IDs were found. Real-device Safari and deployed/social-platform previews have not been tested.

## 11–12. Changed and created files

The exact list follows the metrics tables. Generated public HTML is rebuilt from templates; changes should continue to be made in source. The obsolete `products/hoodie-02.html` was removed intentionally. The temporary dedicated Chrome profile is QA-only and is excluded from the public preview; it is not a deliverable or deployment asset.

## 13. Existing functionality preserved

Titles, descriptions, provisional canonicals, static OG/X infrastructure, WebSite/Organization JSON-LD, sitemap, robots, accessibility controls, responsive structure, cart preview, size selection, consent/privacy, analytics readiness, Meta readiness and 404 handling remain. Product sharing now references the matching real JPEG. Future Product schema consumes the real catalogue image paths, but remains withheld because product/commercial data is still development content. No invented offers, ratings, SKU, colour schema, materials, dates or PreOrder data were added. Tracking/consent/main interaction scripts, legal content and the metadata generator are unchanged. Tracking IDs remain blank and checkout remains inactive.

## 14. Still required

- Hoodie 02 photographs and approved product data before listing it.
- Original designer SVG/high-resolution transparent PNG, plus proper final favicon assets.
- Real campaign photography/film and final campaign social artwork.
- Final product names, prices, descriptions, materials/decoration/care, fit/measurements and confirmed sizes/inventory.
- Final dispatch windows, shipping/returns information and other existing launch-readiness requirements.
- Confirmed domain, commerce integration and approval of the remaining policies/platform configuration in `LAUNCH-READINESS.md` before launch.

## 15. Local preview

From PowerShell:

```powershell
Set-Location 'C:\Users\User\Documents\StayWide'
node --preserve-symlinks --preserve-symlinks-main scripts/build.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/preview.cjs
```

Open **http://127.0.0.1:8080/** in Chrome or Edge. Use Shop and open each product; open the second gallery view and try sizes/cart preview. Use HTTP so root-relative srcset and shared consent storage work correctly. Stop the server with Ctrl+C. No installation or deployment is needed.

To reproduce the prepared assets, start the dedicated headless Chrome session documented in README, then run:

```powershell
node --preserve-symlinks --preserve-symlinks-main scripts/prepare-assets.cjs 'C:\Users\User\Downloads\drive-download-20261030T031745Z-1-001'
```

Keep the originals in that directory or supply their new directory as the argument. Never run asset preparation and browser QA simultaneously; both use the dedicated test tab.


## Original inventory metrics

| Original file | Format | Encoded pixels | Upright pixels | Approx. original size |
| --- | --- | --- | --- | --- |
| GANGSHEET2.1.png | PNG | 6615 x 11812 | 6615 x 11812 | 37.53 MB |
| IMG_1190.JPG | JPEG | 8064 x 6048 | 6048 x 8064 | 18.24 MB |
| IMG_1193.JPG | JPEG | 8064 x 6048 | 6048 x 8064 | 18.14 MB |
| IMG_1197.JPG | JPEG | 8064 x 6048 | 6048 x 8064 | 17.06 MB |
| IMG_1198.JPG | JPEG | 8064 x 6048 | 6048 x 8064 | 17.51 MB |
| IMG_1216.JPG | JPEG | 8064 x 6048 | 6048 x 8064 | 16.60 MB |
| IMG_1218.JPG | JPEG | 8064 x 6048 | 6048 x 8064 | 17.15 MB |
| IMG_1219.JPG | JPEG | 8064 x 6048 | 6048 x 8064 | 16.83 MB |
| IMG_1224.JPG | JPEG | 8064 x 6048 | 6048 x 8064 | 15.34 MB |
| IMG_1228.JPG | JPEG | 8064 x 6048 | 6048 x 8064 | 15.56 MB |
| IMG_1230.JPG | JPEG | 5236 x 3928 | 3928 x 5236 | 3.68 MB |
| IMG_1231.JPG | JPEG | 5236 x 3928 | 3928 x 5236 | 4.08 MB |

## Optimised product files (all newly created)

Paths below are relative to `assets/products/`. Each row maps to its original filename above; originals were not overwritten.

| Original | Optimised filename | Pixels | Format | Approx. size |
| --- | --- | --- | --- | --- |
| IMG_1228.JPG | hoodie-01-front-480.webp | 480 x 589 | WebP | 76.3 KB |
| IMG_1228.JPG | hoodie-01-front-800.webp | 800 x 982 | WebP | 232.2 KB |
| IMG_1228.JPG | hoodie-01-front-1200.webp | 1200 x 1474 | WebP | 545.3 KB |
| IMG_1228.JPG | hoodie-01-front-1600.webp | 1600 x 1965 | WebP | 976.4 KB |
| IMG_1228.JPG | hoodie-01-front-share.jpg | 1200 x 1474 | JPEG | 617.8 KB |
| IMG_1231.JPG | hoodie-01-detail-480.webp | 480 x 640 | WebP | 26.0 KB |
| IMG_1231.JPG | hoodie-01-detail-800.webp | 800 x 1066 | WebP | 103.6 KB |
| IMG_1231.JPG | hoodie-01-detail-1200.webp | 1200 x 1600 | WebP | 263.6 KB |
| IMG_1231.JPG | hoodie-01-detail-1600.webp | 1600 x 2133 | WebP | 476.1 KB |
| IMG_1193.JPG | tshirt-01-front-480.webp | 480 x 591 | WebP | 90.8 KB |
| IMG_1193.JPG | tshirt-01-front-800.webp | 800 x 985 | WebP | 259.2 KB |
| IMG_1193.JPG | tshirt-01-front-1200.webp | 1200 x 1478 | WebP | 593.9 KB |
| IMG_1193.JPG | tshirt-01-front-1600.webp | 1600 x 1970 | WebP | 1079.0 KB |
| IMG_1193.JPG | tshirt-01-front-share.jpg | 1200 x 1478 | JPEG | 671.7 KB |
| IMG_1197.JPG | tshirt-01-detail-480.webp | 480 x 600 | WebP | 60.0 KB |
| IMG_1197.JPG | tshirt-01-detail-800.webp | 800 x 1000 | WebP | 185.9 KB |
| IMG_1197.JPG | tshirt-01-detail-1200.webp | 1200 x 1500 | WebP | 441.5 KB |
| IMG_1197.JPG | tshirt-01-detail-1600.webp | 1600 x 2000 | WebP | 820.1 KB |
| IMG_1219.JPG | tshirt-02-front-480.webp | 480 x 583 | WebP | 87.6 KB |
| IMG_1219.JPG | tshirt-02-front-800.webp | 800 x 972 | WebP | 247.7 KB |
| IMG_1219.JPG | tshirt-02-front-1200.webp | 1200 x 1458 | WebP | 561.0 KB |
| IMG_1219.JPG | tshirt-02-front-1600.webp | 1600 x 1944 | WebP | 995.7 KB |
| IMG_1219.JPG | tshirt-02-front-share.jpg | 1200 x 1458 | JPEG | 636.4 KB |
| IMG_1218.JPG | tshirt-02-detail-480.webp | 480 x 640 | WebP | 79.6 KB |
| IMG_1218.JPG | tshirt-02-detail-800.webp | 800 x 1067 | WebP | 235.6 KB |
| IMG_1218.JPG | tshirt-02-detail-1200.webp | 1200 x 1600 | WebP | 595.2 KB |
| IMG_1218.JPG | tshirt-02-detail-1600.webp | 1600 x 2133 | WebP | 1097.0 KB |

## Brand files (all newly created)

| File | Pixels | Size |
| --- | --- | --- |
| assets/brand/stay-wide-logo.png | 920 x 512 | 165.9 KB |
| assets/brand/stay-wide-logo-320.png | 320 x 178 | 31.7 KB |
| assets/brand/stay-wide-share.jpg | 1200 x 630 | 66.6 KB |

## Modified files

- `404.html`
- `LAUNCH-READINESS.md`
- `README.md`
- `checks/consent-mobile.png`
- `checks/home-desktop.png`
- `checks/home-mobile.png`
- `checks/product-mobile.png`
- `checks/readiness-results.json`
- `checks/results.json`
- `css/styles.css`
- `index.html`
- `info.html`
- `js/catalog.js`
- `js/site-config.js`
- `products/hoodie-01.html`
- `products/tshirt-01.html`
- `products/tshirt-02.html`
- `scripts/build.cjs`
- `scripts/check-metadata.cjs`
- `scripts/check-readiness.cjs`
- `scripts/check.cjs`
- `sitemap.xml`
- `templates/404.html`
- `templates/home.html`
- `templates/info.html`
- `templates/product.html`

## Removed generated file

- `products/hoodie-02.html` (withheld product; reproducible from retained catalogue/template once real imagery is added)

## Other new files

The 27 product images and three brand files are individually listed above. Additional new files:

- `ASSET-INTEGRATION.md`
- `scripts/prepare-assets.cjs`
- `scripts/check-assets.cjs`
- `checks/asset-baseline.json`
- `checks/source-inventory.json`
- `checks/source-review.jpg`
- `checks/asset-manifest.json`
- `checks/logo-extraction.png`
- `checks/asset-results.json`
- `checks/assets-home-390.png`
- `checks/assets-home-1440.png`
- `checks/assets-hoodie-01-390.png`
- `checks/assets-tshirt-01-390.png`
- `checks/assets-tshirt-02-390.png`
- `checks/asset-changes.json` (machine-readable file list)
