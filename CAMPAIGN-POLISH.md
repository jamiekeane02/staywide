# Stay Wide campaign and homepage polish

22 November 2026. Changes are local only. No commit, push or deployment. Current local work was retained; no GitHub restore was used.

## Campaign asset and composition

Source: `stay wide campaign image.png`, 4961 × 2827, landscape ratio approximately 1.755:1. The rendered asset and supplied-source record were inspected before styling. The foreground boxer occupies the right half, his face above centre and red glove near the lower edge; the second person and raised arms occupy the left, with the bar and Stay Wide graphic across the upper portion. These details make a wide, short centre crop unsuitable: it would sacrifice either the upper action or lower glove/subject.

The full composition is therefore retained at every breakpoint. There is no new crop, retouch, artificial focal repositioning or added text. The photo scales proportionally with `object-fit: contain`, an explicit 4961:2827 aspect ratio and its existing width/height attributes. On desktop the smaller image is centred inside the same padded container as the collection. The container shares collection boundaries; the image deliberately stops at 840px wide so its complete composition stays below 480px tall.

Existing high-quality WebP files are reused without recompression:

| File under `assets/campaign/` | Dimensions |
| --- | --- |
| `stay-wide-campaign-480.webp` | 480 × 274 |
| `stay-wide-campaign-800.webp` | 800 × 456 |
| `stay-wide-campaign-1200.webp` | 1200 × 684 |
| `stay-wide-campaign-1600.webp` | 1600 × 912 |
| `stay-wide-campaign-2400.webp` | 2400 × 1368 |

No new image derivatives were needed. The responsive `sizes` attribute now matches the width caps. Lazy loading and async decoding remain in place; no preload or high fetch priority was added. Explicit aspect ratio reserves the same height before and after decode (verified within 1px). The source's intentionally soft, dark photographic treatment is preserved.

## Responsive layout

| Viewport | Actual campaign dimensions | Space above / below |
| --- | --- | --- |
| 375 × 812 | 335 × 190.9px | 40 / 40px |
| 390 × 844 | 350 × 199.4px | 40 / 40px |
| 430 × 932 | 390 × 222.2px | 40 / 40px |
| 768 × 1024 | 683.9 × 389.7px | 56 / 56px |
| 1024 × 768 | 700 × 398.9px | 56 / 56px |
| 1366 × 768 | 840 × 478.7px | 64 / 64px |
| 1440 × 900 | 840 × 478.7px | 64 / 64px |
| 1440 × 1000 | 840 × 478.7px | 64 / 64px |
| 1920 × 1080 | 840 × 478.7px | 64 / 64px |

Mobile fills the collection content width, capped at 560px / 320px high. The 375/390px presentations are intentionally below the suggested 220px height: the brief allows the natural ratio where it better preserves the photograph. Expanding them to a predetermined height would crop the action or introduce blank framing. Tablet caps are 700px / 400px; desktop caps are 840px / 480px. Both faces, raised arms, bar, logo and foreground glove remain visible, without adding further source-edge cropping.

Before this task, the product-to-campaign gap was 88px on mobile and 104px on desktop, from collection bottom padding plus campaign top padding. It is now controlled in one place: campaign section padding. The previous 24px gap before the footer is now 40/56/64px. At 1440px, campaign height fell from 738.4px to 478.7px.

## Other homepage adjustment

The populated Shopify cart tab previously covered the campaign's upper-right edge on phones and small tablets. Below 1100px, the homepage header now reserves a slot for that existing tab and has a 72px minimum height. A small homepage-only script follows the sticky header centre using a passive scroll listener and animation-frame scheduling; CSS positions the original tab there. No iframe is moved, recreated or edited, and no cart action is replaced. Desktop placement and all PDP headers remain as before. The control stays accessible after scrolling to the footer and no longer overlaps the campaign or footer at tested sizes.

No other homepage adjustments were necessary. The opening, CTA, product order, cards, captions and prices were retained. Campaign remains after products, image-only and non-clickable. No new sections, copy or commerce features were introduced.

## QA and regressions

All nine viewport sizes above passed in Chrome emulation. Full-page and campaign viewport screenshots were captured; actual rendered composition was reviewed at 375, 390, 430 and 1440px. Checked collection layout (2 × 2 mobile/tablet and four columns on desktop), captions/prices, header/CTA, sticky-header anchor landing, campaign dimensions and spacing, no horizontal overflow, footer transition and populated-cart position. All four desktop hover previews passed.

The existing commerce/size-guide browser suite was rerun against the refined homepage, writing separate evidence into `checks/campaign-polish/regression/`. It checks all four PDPs at 375 × 812, 390 × 844, 430 × 932 and 1440 × 1000: correct charts, open/close/Escape/focus, retained selected size, gallery arrows/keyboard and mobile swipe, real Shopify controls and prices. All four products add successfully; one persisted bag holds four lines, count 4 and subtotal €160. Continue Shopping closes the bag. A real checkout click opens a separate Shopify window while Stay Wide remains open, with exactly one begin_checkout event. No payment/order is submitted.

Prices remain Blower €55, Claddagh €55, Stay Wide Tee €25 and Ashtray Tee €25, including live Shopify variant validation. No Coming Soon, Drop 001, €60 or development placeholder text appears on the visible homepage. Metadata, tracking and Shopify-event contract checks pass. Hash comparison against the start-of-task local files confirms catalogue, commerce, gallery, consent, tracking, size-guide implementation, product template, build/metadata source, sitemap and robots were untouched. Homepage SEO/social head is identical apart from versioned assets and the new homepage positioning script. The established share card remains unchanged.

These are browser-emulation checks, not physical iOS/Safari testing. Shopify's existing cart logic and public product IDs were not changed.

## Files modified in this task

- `css/styles.css`
- `templates/home.html`
- `README.md`
- `index.html` (generated)
- `info.html` (generated asset version)
- `404.html` (generated asset version)
- `products/hoodie-01.html` (generated asset version)
- `products/hoodie-02.html` (generated asset version)
- `products/tshirt-01.html` (generated asset version)
- `products/tshirt-02.html` (generated asset version)

## Files created in this task

- `js/home.js`
- `scripts/check-campaign-polish.cjs`
- `CAMPAIGN-POLISH.md`
- `checks/campaign-polish/baseline.json`
- `checks/campaign-polish/before.json`
- `checks/campaign-polish/before-375.png`
- `checks/campaign-polish/before-1440.png`
- `checks/campaign-polish/results.json`
- `checks/campaign-polish/preservation.json`
- `checks/campaign-polish/home-{viewport}.png` and `campaign-{viewport}.png` for each of the nine viewport sizes in the table (18 screenshots).
- `checks/campaign-polish/regression/results.json` and 25 screenshots from the existing four-product regression suite.

New image derivatives: **none**. No supplied or existing campaign image file was modified.

## Build, preview and checks

From `C:\Users\User\Documents\StayWide`:

```powershell
node --preserve-symlinks --preserve-symlinks-main scripts/build.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/preview.cjs
```

Open http://127.0.0.1:8080/. Stop with Ctrl+C. With dedicated headless Chrome on localhost port 9223, run:

```powershell
node --preserve-symlinks --preserve-symlinks-main scripts/check-campaign-polish.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-size-campaign.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-metadata.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-tracking.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-shopify-events.cjs
```

Browser scripts run sequentially. They use live Shopify carts without submitting orders. The existing size/campaign suite normally writes to its original evidence directory; this task redirected only its output directory in memory to preserve earlier screenshots. Build-generated asset cache versions are retained on every page.
