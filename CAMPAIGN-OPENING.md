# Stay Wide campaign opening refinement

22 November 2026. Local-only changes using the current repository. No commit, push or deployment. No older GitHub files restored.

## Structure and placement

The homepage is now header → existing intro/VIEW COLLECTION → campaign photograph → collection → footer. The campaign section is directly between `.opening` and `#shop` in the authoritative homepage template. It is no longer below the products. The image establishes the brand mood before shopping; restrained spacing and the existing collection anchor keep purchasing easy to reach. No section, overlay copy, feature or image link was added.

## Image and crop

Source remains `stay wide campaign image.png`, 4961 × 2827. The actual existing image was inspected before editing. The wall logo sits upper-left, with the foreground boxer and red glove on the right; the gym/bar and second person provide context.

Mobile uses a 7:5 frame, `object-fit: cover` and deliberate `object-position: 55% 50%`. This preserves the source's full height and trims its lateral edges, approximately 11% from the left and 9% from the right. The complete logo, boxer face and foreground glove remain visible. Some peripheral background and the far-left raised arm are outside this crop. This prioritizes the two focal areas in the new brief without cutting the top logo or lower glove. Actual screenshots were inspected at 375, 390 and 430px.

From 700px upward the image uses its natural 4961:2827 ratio with contain fitting, preserving the complete photograph. Tablet width caps at 672px; desktop caps at 736px, down from 840px. The desktop image is about 419px high, down from 479px. Mobile is now approximately 239–279px high to meet the latest crop/height guidance, compared with the previous uncropped 191–222px presentation. No claim is made that mobile became shorter; the desktop treatment became smaller and the opening sequence is compact.

Existing WebP derivatives are reused unchanged:

- `assets/campaign/stay-wide-campaign-480.webp` — 480 × 274
- `assets/campaign/stay-wide-campaign-800.webp` — 800 × 456
- `assets/campaign/stay-wide-campaign-1200.webp` — 1200 × 684
- `assets/campaign/stay-wide-campaign-1600.webp` — 1600 × 912
- `assets/campaign/stay-wide-campaign-2400.webp` — 2400 × 1368

No new derivatives, retouching, recompression or original-file changes.

## Sizing and spacing

| Viewport | Campaign width × height | Intro → image | Image → collection boundary |
| --- | --- | --- | --- |
| 375 × 812 | 335 × 239.3px | 24px | 28px |
| 390 × 844 | 350 × 250px | 24px | 28px |
| 430 × 932 | 390 × 278.6px | 24px | 28px |
| 768 × 1024 | 672 × 382.9px | 30px | 32px |
| 1024 × 768 | 672 × 382.9px | 30px | 32px |
| 1366 × 768 | 736 × 419.4px | 30px | 40px |
| 1440 × 900 | 736 × 419.4px | 30px | 40px |
| 1440 × 1000 | 736 × 419.4px | 30px | 40px |
| 1920 × 1080 | 736 × 419.4px | 30px | 40px |

The image remains centred in the shared padded content container. Mobile width caps at 420px, keeping the 7:5 image at or below 300px tall. There are no viewport-height hero rules. The intro's existing bottom padding supplies the upper gap, so campaign top padding is zero. Campaign bottom padding supplies the single gap to the collection. The collection heading retains its existing 16px inset after its border.

Removing the previous homepage `.shop { padding-bottom: 0 }` override restores 48px between the product grid and footer below 1100px and 64px on desktop. This prevents the footer touching product captions now that the campaign no longer separates them. No other spacing, header, typography, logo or cart-position changes were made in this task.

## Loading and layout stability

Because the campaign is now visible in the initial screen, it changes from lazy to eager loading with `fetchpriority="high"`. It uses the existing responsive WebP srcset and updated sizes for the new width caps; it never serves the large original PNG. Async decoding remains. CSS aspect ratios and existing intrinsic width/height reserve layout space, verified stable within 1px after decoding. No extra preload was added. Existing product-image loading settings are unchanged.

## CTA and regression checks

VIEW COLLECTION still targets `#shop`, not the campaign. The existing sticky-header offset remains effective: mobile collection boundaries landed at approximately 82–88px with a 72px header. The first product row begins at approximately 558 / 569 / 598px on the initial 375 / 390 / 430px screens. On taller desktop screens, native anchor scrolling reaches the document's maximum scroll and shows the full collection; no artificial footer whitespace was added solely to force the heading to the viewport top.

All nine viewport sizes above passed Chrome emulation checks: correct section order, image dimensions, restrained gaps, mobile 2 × 2 / desktop four-column collection, no horizontal overflow, no cart overlap, no placeholder copy and correct product links/prices. All four desktop hover previews passed. Actual rendered screenshots were inspected for the logo and boxer crop.

The existing live commerce/size-guide suite passed for all four products at 375 × 812, 390 × 844, 430 × 932 and 1440 × 1000. Charts, dialog close/Escape/focus, selected size preservation, gallery arrows/keyboard/swipe, Add to Bag and cart persistence remain working. The four-line bag totals €160: Blower €55, Claddagh €55, Stay Wide Tee €25 and Ashtray Tee €25. Live Shopify variants validate at those prices. Continue Shopping closes the bag, and checkout opens separately with Stay Wide retained and one begin_checkout event. No payment/order was submitted.

Metadata, tracking and Shopify event-contract checks passed. Baseline hashes confirm commerce, catalogue, existing home-cart positioning, galleries, size guides, consent/tracking, product template, build/metadata implementation, sitemap and robots remain untouched. The homepage head differs only in the generated asset version. The deliberate OG/social card remains unchanged. These are Chrome emulation checks, not physical iOS/Safari testing.

## Files modified in this task

- `templates/home.html`
- `css/styles.css`
- `scripts/check-campaign-polish.cjs`
- `scripts/check-size-campaign.cjs`
- `README.md`
- `index.html` (generated structure and cache version)
- `info.html` (generated cache version)
- `404.html` (generated cache version)
- `products/hoodie-01.html` (generated cache version)
- `products/hoodie-02.html` (generated cache version)
- `products/tshirt-01.html` (generated cache version)
- `products/tshirt-02.html` (generated cache version)

The checks were updated to expect campaign-before-collection placement, eager loading and the new mobile ratio, rather than preserving obsolete acceptance assumptions.

## Files created

- `CAMPAIGN-OPENING.md`
- `checks/campaign-opening/baseline.json`
- `checks/campaign-opening/preservation.json`
- `checks/campaign-opening/results.json`
- `checks/campaign-opening/home-{viewport}.png` and `campaign-{viewport}.png` for each of the nine viewports above (18 screenshots).
- `checks/campaign-opening/regression/results.json` and 25 screenshots from the four-product regression suite.

New production assets/derivatives: **none**. Earlier QA evidence was retained.

## Build and preview

From `C:\Users\User\Documents\StayWide`:

```powershell
node --preserve-symlinks --preserve-symlinks-main scripts/build.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/preview.cjs
```

Open http://127.0.0.1:8080/. Stop with Ctrl+C. With dedicated Chrome on localhost port 9223, run browser checks sequentially:

```powershell
node --preserve-symlinks --preserve-symlinks-main scripts/check-campaign-polish.cjs
$env:STAYWIDE_QA_OUTPUT = 'checks/campaign-opening/regression'
node --preserve-symlinks --preserve-symlinks-main scripts/check-size-campaign.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-metadata.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-tracking.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-shopify-events.cjs
```
