# Stay Wide — product image interactions

Update, 2 November 2026: Current public copy, header sizing, icons and social exports are documented in [PUBLIC-POLISH.md](PUBLIC-POLISH.md). Gallery and hover code remain unchanged. Normal interactions passed again; the existing failed-image recovery test now fails because an empty failure marker is tested for truthiness. The earlier recovery claim below is superseded by checks/image-interactions-results.json. Other text below records the earlier interaction pass.

Local implementation of the follow-up photography/logo/gallery brief, 30 October 2026. The existing local build is retained. No deployment, commit, push, dependencies, new photography or commercial data changes.

## Assets reviewed and selections

The complete comparison sheet was reviewed again for hover suitability. The strongest selected full-garment photographs and useful detail crops from the asset integration remain appropriate. Original files and all optimised image files are unchanged. The original file inventory, exact crop coordinates, all 27 product derivatives and their dimensions/weights are recorded in [ASSET-INTEGRATION.md](ASSET-INTEGRATION.md) and `checks/asset-manifest.json`.

| Supplied file | Product / use | Reason |
| --- | --- | --- |
| GANGSHEET2.1.png | Brand logo source only | Exact blue/white logo isolated previously; other artwork excluded. |
| IMG_1190.JPG | T-shirt 01, not used | Good full view, but redundant; 1193 has clearer chest presentation after rotation. |
| IMG_1193.JPG | T-shirt 01 primary/card/PDP lead | Complete silhouette, clear logo, safe framing and good small-card readability. Clockwise rotation corrects orientation. Natural cool lighting retained. |
| IMG_1197.JPG | T-shirt 01 secondary hover/PDP detail | A chest crop makes the logo and fabric substantially larger. Whole-garment source framing is too tight for the primary. |
| IMG_1198.JPG | T-shirt 01, not used | Near-duplicate tight front view; adds little beyond the selected lead and detail. |
| IMG_1216.JPG | T-shirt 02, not used | Graphic is clear but source already cuts a sleeve. |
| IMG_1218.JPG | T-shirt 02 secondary hover/PDP detail | Clearer, closer print, collar and fabric inspection; useful contrast to the full silhouette. |
| IMG_1219.JPG | T-shirt 02 primary/card/PDP lead | Complete garment, clear print and balanced exposure; crop excludes edge clutter while preserving sleeves/hem. |
| IMG_1224.JPG | Hoodie 01, not used | Sleeve/cuff cut by source edge; tighter, less useful whole-garment framing. |
| IMG_1228.JPG | Hoodie 01 primary/card/PDP lead | Best complete hood/cuffs/hem and silhouette, readable phone graphic, useful breathing room and fabric definition. |
| IMG_1230.JPG | Hoodie 01, not used | Cropped garment edges; less useful print detail than 1231. |
| IMG_1231.JPG | Hoodie 01 secondary hover/PDP detail | Both phones, small logo and fabric are substantially clearer than in the full view. |

Each product has two meaningful images, with the primary first. There are no additional PDP photographs: the remaining candidates add redundancy or weaker framing. The secondary is explicitly a print detail, not a fabricated rear view. No originals were deleted, no garment or colour was changed, and no extra gang-sheet art was introduced.

## Homepage hover interaction

The builder uses the product's first image as its default and second distinct image as its optional preview. No second image means no preview layer/template. The same behaviour works on recommendation cards.

- **Desktop:** hovering specifically over the image area fades the selected detail in over 160ms. Moving to the caption or outside restores the primary. Text, prices, dimensions and card positioning stay fixed. There is no zoom, sliding, autoplay, Quick View or extra card control.
- **Keyboard:** a visible keyboard focus on the card reveals the same decoded preview. The link remains an ordinary anchor. The secondary layer is `aria-hidden` with empty alternative text to avoid repeating the link's accessible name; the informative primary retains factual alt text.
- **Touch:** normal primary photo and one-tap navigation. No touch-hover interception or card carousel. Fine-pointer support is detected with `(hover: hover) and (pointer: fine)`; a keyboard can still access focus previews on a hybrid device.
- **Loading:** the secondary initially lives in an inert HTML template, so it produces no mobile hover download. On fine-pointer devices an IntersectionObserver prepares only cards approaching the viewport (160px margin), using low-priority responsive WebPs capped at 800px. Pointer entry and keyboard focus also initiate loading. The primary stays fully visible underneath until decoding succeeds; load failures keep the primary. A later intent can retry. It never loads every gallery view or any supplied original.
- **Reduced motion:** opacity transitions and gallery animation are disabled; image changes are immediate.

## PDP gallery

The large gallery stays on the left of purchase information on desktop, and first on mobile. Stable 4:5 frames and contain fitting preserve the selected crops and prevent the purchase panel from jumping.

- Two real **44×44px buttons** overlay the image edges, labelled “Previous product image” and “Next product image”. No wrapping: previous is unavailable at the first image and next at the last.
- Boundary buttons use `aria-disabled` and guarded handlers, preserving keyboard focus when a navigation action reaches an endpoint. Without JavaScript both buttons remain natively disabled.
- A restrained row below the image shows the current view name and **1 / 2**, **2 / 2**, etc. The counter is a polite live region announced as “Image 1 of 2”.
- **Left/Right keys** navigate only while the gallery or one of its controls has focus. Tab reaches the gallery and buttons; Enter/Space use standard button activation. Keys elsewhere on the page are unaffected.
- **Swipe left/right** advances/reverses. The handler checks horizontal distance/direction, cancels on vertical motion, multitouch and touch cancellation, and retains native page scroll/pinch behaviour. Swiping an arrow itself does not accidentally navigate twice.
- The new image is decoded before the visible image changes. The current photo and count stay in place while it loads. A subtle 140ms reveal (92% to 100% opacity) provides feedback without a slide. Reduced motion removes it.
- An unsuccessful image load retains the current photo/counter and announces an error. A further arrow action retries with a fresh image element. Latest requested image wins when requests overlap.
- **One image:** no arrows, counter, focusable gallery or swipe affordance. **Two or more:** arrows, swipe, keyboard controls and the actual count. Three-image navigation was checked using an isolated browser-only fixture, without publishing fake images or changing product records.
- No thumbnails or lightbox were added. Arrows plus a counter provide clear navigation without adding visual weight or extra thumbnail downloads. No autoplay.

## Logo, layout and Hoodie 02

The existing faithful transparent extraction remains: `assets/brand/stay-wide-logo.png` (920×512), with a 320×178 header/footer derivative. The exact source crop is 2300×1280 at (1850, 9720) in GANGSHEET2.1.png. Original lettering, spacing, proportions, blue/white colour and transparency are preserved. The existing temporary SW favicon remains.

**Original designer SVG / high-resolution transparent PNG required for final production.** Proper designer favicon exports are still required. The campaign placeholder and existing social images remain.

The three-product layout is unchanged: two columns with a centred, equally sized third mobile card; three columns at desktop/tablet widths. Hoodie 02 stays `listed: false`, absent from visible links/recommendations/sitemap and served as a 404. When its real images arrive, add the first image for the lead, a distinct optional second for hover, then any useful gallery extras; enable its record and rebuild. The template derives controls/counts automatically. Product information and commerce flags retain their existing approval requirements.

## Performance

All byte counts below are rounded decimal KB/MB. Encoded JPG dimensions are 8064×6048 except IMG_1231 (5236×3928); EXIF/manual orientation produces portrait display. No images were recompressed in this follow-up.

| Product | Original lead | Original secondary | Card primary 480px | Hover secondary 480 / 800px | Mobile PDP lead / detail 800px |
| --- | --- | --- | --- | --- | --- |
| Hoodie 01 | IMG_1228.JPG, 15.56 MB | IMG_1231.JPG, 4.08 MB | 76.3 KB | 26.0 / 103.6 KB | 232.2 / 103.6 KB |
| T-shirt 01 | IMG_1193.JPG, 18.14 MB | IMG_1197.JPG, 17.06 MB | 90.8 KB | 60.0 / 185.9 KB | 259.2 / 185.9 KB |
| T-shirt 02 | IMG_1219.JPG, 16.83 MB | IMG_1218.JPG, 17.15 MB | 87.6 KB | 79.6 / 235.6 KB | 247.7 / 235.6 KB |

At tested DPR-2 mobile widths the card primaries select 480px files; no hover detail downloads occur. At 1440px/DPR 2 the home primaries select 1200px files (545.3 / 593.9 / 561.0 KB) and hover details are capped at 800px. All three 800px hover files together are about 525 KB, loaded only on fine-pointer devices as their cards approach the viewport. The largest loaded homepage primary at that desktop size is T-shirt 01 (593.9 KB); its maximum 1600px candidate is 1.08 MB. The largest entire product derivative remains the 1600px T-shirt 02 detail (1.10 MB), used only in a PDP at sufficient display density.

The likely initial homepage LCP is one of the first-row full-garment photographs; each PDP's is its lead photograph. Leads remain eager and high priority. Hover previews use low priority, and hidden gallery detail images begin lazy until requested. The small logo remains about 31.7 KB. No huge originals are in public assets. Local image-size and layout checks are recorded in `checks/asset-results.json`; this is not a production/throttled Core Web Vitals claim.

## Responsive and behavioural QA

Tested **375×812, 390×844, 430×932, 768×1024 and 1440×1000**. Interaction checks use DPR 2 and explicitly emulate touch/coarse pointer for mobile, fine pointer for tablet/desktop. Existing layout/commerce tests also cover these sizes at DPR 1.

Verified all three products: correct primary/secondary, image-area-only hover, hover-out, keyboard-focus preview, reduced motion, stable geometry, mobile absence of hover downloads, one-tap PDP links, 44px buttons, non-looping boundaries, image order/count, Tab/Enter and arrow-key navigation, horizontal swipes, vertical-scroll exclusion, no horizontal overflow, decoded gallery switching and failed-load recovery. One- and three-image fixture tests passed. Runtime exceptions were absent.

Also passed existing suites: 25 layout/interaction cases; consent/static HTML/404; metadata/references/schema/sitemap; isolated tracking gates; 16 image/viewport checks plus every product derivative's dimensions. No live trackers, checkout or external integration was activated. Tests and screenshots use local Chrome emulation; physical iOS/Safari and production performance/social crawler behaviour are not claimed.

Evidence: `checks/image-interactions-results.json`, `checks/gallery-*-390.png`, `checks/gallery-*-1440.png`, and the refreshed existing check artifacts.

## Existing functionality preserved

Product records, names, €XX prices, sizes, status/dispatch placeholders, gallery photo order/crops, brand assets, campaign structure and purchase hierarchy remain. Main JS changes are confined to card previews and gallery navigation. Cart and purchase routines remain intact. Metadata engine, canonical/OG/schema configuration, robots/sitemap, consent, tracking, privacy/Info content and commerce-readiness flags remain unchanged. Product schema is still withheld for development data; no commercial or policy facts were invented.

## Still required

Hoodie 02 photography; original designer logo and proper favicon exports; final campaign imagery; confirmed product names, prices, descriptions, specifications/materials/fit/sizes and dispatch details. Other domain, policy, shipping/returns and platform launch requirements remain in LAUNCH-READINESS.md.

## Preview locally

```powershell
Set-Location 'C:\Users\User\Documents\StayWide'
node --preserve-symlinks --preserve-symlinks-main scripts/build.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/preview.cjs
```

Open **http://127.0.0.1:8080/**. On desktop, hover over a product image, then move onto its name. Tab through cards to check focus previews. Open each product and use arrows or focus the gallery and press Left/Right. On mobile, tap a card once and swipe the PDP image. Stop with Ctrl+C. No install or deployment required.

Browser QA setup and all check commands are in README. Run scripts sequentially because they share the dedicated Chrome test tab. Browser-only fixtures do not change public HTML or the catalogue.
