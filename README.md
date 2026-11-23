# Stay Wide local launch foundation

Existing static storefront for **https://staywide.cc**. This iteration is local only; do not deploy automatically. Shared Shopify commerce is active; GA4 and Meta IDs remain blank. See [CAMPAIGN-OPENING.md](CAMPAIGN-OPENING.md) for the current intro → campaign → collection homepage layout. [CAMPAIGN-POLISH.md](CAMPAIGN-POLISH.md) records the preceding layout and retained cart-tab positioning. [SIZE-CAMPAIGN-UPDATE.md](SIZE-CAMPAIGN-UPDATE.md) documents the retained size guides, pricing and checkout return behaviour. Earlier reports describe their original iterations.

## Preview

From `C:\Users\User\Documents\StayWide` in PowerShell:

```powershell
node --preserve-symlinks --preserve-symlinks-main scripts/build.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/preview.cjs
```

Open http://127.0.0.1:8080/ in Chrome or Edge. Stop with Ctrl+C. The flags accommodate restricted Windows directory permissions; ordinary `node scripts/build.cjs` also works outside that restriction. No dependencies to install.

The preview returns HTTP 404 at unknown paths (try `/missing/deep/page`) and excludes templates/check artifacts. It is not production hosting. HTTP preview is preferred because cookie preferences must share an origin. Use `index.html`, not the untouched empty typo file `index.hmtl`.

## Edit source, then rebuild

- `templates/home.html`, `templates/product.html`, `templates/info.html`: retained layouts and content.
- `templates/consent.html`, `templates/404.html`: consent controls and error page.
- `js/catalog.js`: products, states, dispatch, descriptions, images, variants and real Shopify product IDs. Four products use real photography and verified Buy Button mappings, including Claddagh Hoodie (`hoodie-02`). `listed: false` can withhold a product. Approved prices remain visible; Shopify owns purchasable sizes and inventory. Unconfirmed editorial details and Product/Offer schema remain gated. Future confirmed states remain `available`, `sold_out`, `coming_soon`.
- `js/site-config.js`: site name, confirmed staywide.cc production URL/ownership flag, blank tracking IDs, brand/social assets, social profiles and shipping slots. Public values only, never secrets.
- `scripts/build.cjs` and `scripts/metadata.cjs`: static HTML, footer, metadata, schema, sitemap and robots. The build adds one content-derived version to all shared CSS/JS URLs. No runtime SEO injection.
- `css/styles.css`: original colours, typography, silhouettes and responsive design, with restrained consent styling.
- `js/main.js`: gallery and card interactions. `js/shopify-buy.js`: shared official Shopify loader, product controls, cart and checkout. `js/consent.js`: preferences. `js/tracking.js`: gated SDKs and lean event helper.

Product schema is withheld for `development: true`. Do not clear that flag just to obtain schema: visible copy, imagery, price and availability must be real. Offers also require `commerceReady: true`; coming-soon products have no orderable Offer. Rebuild after catalogue/metadata changes.

`domainConfirmed: true` reflects the supplied public domain, staywide.cc. It gates the robots sitemap line, not deployment. Publishing changes remains a separate task.

## Assets and collection

Real supplied photographs cover Blower Hoodie, Claddagh Hoodie, Stay Wide Tee and Ashtray Tee. Each has a primary full-garment view and a print detail. The approved logo extraction supplies the header/footer, square ICO/PNG/Apple icons and a 1200x630 homepage share. Each product has its own 1200x630 JPEG share. Original source selections remain documented in ASSET-INTEGRATION.md; current exports and metrics are in PUBLIC-POLISH.md.

Image interactions: hover over a product's image on a fine-pointer device to see the selected print detail; move out to return to the full garment. Keyboard focus also previews it. Touch cards remain one-tap links and do not preload hover images. PDP galleries have 44px previous/next buttons, a live image counter, left/right keyboard keys and horizontal swipe; they do not loop or autoplay. See [IMAGE-INTERACTIONS.md](IMAGE-INTERACTIONS.md) for implementation and QA. A one-image product automatically omits both hover and gallery controls. Gallery failures retain the current photograph; an existing retry defect is documented in PUBLIC-POLISH.md.

Image records support `src`, `alt`, `width`, `height`, `srcset`. Supply true dimensions; the reserved product frame is 4:5 with contain fitting. Product WebP widths are 480, 800, 1200 and 1600. Use root-relative srcset URLs over HTTP. Primary gallery and first two homepage card images load eagerly; secondary/recommendation imagery can lazy load. The campaign photograph sits directly between the intro and collection and loads eagerly with high fetch priority. Existing 480/800/1200/1600/2400px WebP derivatives are reused, with a controlled 7:5 mobile crop and full composition from tablet upward. The homepage share card is unchanged. `scripts/prepare-assets.cjs` retains the original product pipeline; `scripts/prepare-campaign-assets.cjs` handles the supplied campaign and shared charts using dedicated Chrome on port 9223.

Both hoodies are EUR 55; both tees remain EUR 25. Shopify validation still rejects any variant whose price/currency differs from the catalogue. All four existing product IDs remain unchanged. Checkout uses Shopify's supported `cart.popup: true`; Continue Shopping uses Shopify's own cart-close action through a configured title template. The product template places the fit note between Shopify's size selector and Add to Bag.

Size guides use one native dialog implementation (`js/size-guide.js`), with shared chart data in `scripts/size-guides.cjs` selected by product kind. Original JPEGs and exact semantic measurement tables are informational only. Native Escape/Close and focus restoration preserve the selected Shopify variant.

Current feature QA: run `node --preserve-symlinks --preserve-symlinks-main scripts/check-size-campaign.cjs` with preview on 8080 and dedicated Chrome on 9223. This reads live Shopify prices, adds test cart lines and opens checkout without placing an order. Results and screenshots are in `checks/size-campaign/`. Earlier commerce browser scripts retain historical price and same-tab assumptions; use this script for current checkout acceptance.

Homepage campaign opening: the image now follows the intro and precedes the collection. Width caps are 420px / 672px / 736px for mobile / tablet / desktop. Mobile uses a 7:5 frame and object-position 55% 50% to keep the wall logo and boxer visible; larger screens retain the original 4961:2827 composition. Intro-to-image gaps are 24px mobile / 30px larger screens; campaign-to-collection gaps are 28px / 32px / 40px. Collection-to-footer spacing is restored to 48px / 64px. The existing header cart positioning in js/home.js is unchanged. Run scripts/check-campaign-polish.cjs for nine-viewport homepage QA; evidence is in checks/campaign-opening/. The commerce/size-guide suite accepts STAYWIDE_QA_OUTPUT to keep regression evidence separate.

Set `listed: false` to withhold a catalogue entry, then rebuild. The builder removes that explicitly withheld product's generated HTML and excludes it from cards, recommendations and sitemap. Claddagh Hoodie is now listed at `/products/hoodie-02.html`. The builder rejects listed products without real image files. Four products use a two-by-two grid below 1240px and one four-column row above it.

## Consent and events

`localStorage['staywide.consent']` holds version, saved timestamp, Analytics/Advertising booleans and Essential always true. Maximum age: 180 days. Missing, expired, malformed or inaccessible storage means optional tracking off. Close/Escape dismisses without consenting. Footer/Info Cookie settings reopens controls; changes synchronise across tabs. Blocked storage uses page-only preferences and explains the limitation.

Accept/Reject/Manage have equal prominence. Withdrawal blocks helper events, disables GA/revokes Meta, removes accessible associated `_ga*`, `_fbp`, `_fbc` cookies, and reloads only if an SDK had started. Reload unloads third-party code; blank-ID changes need no reload. No pre-consent event replay.

`window.stayWideTrack(name, data)` returns false when nothing can be forwarded. Names: `page_view`, `view_item`, `add_to_cart`, `begin_checkout`, `purchase`, `email_signup`. Views deduplicate separately per provider; development products do not emit view_item. Commerce events are emitted only after an authoritative cart increase or actual checkout handoff.

Data contract: `{ currency: 'EUR', value, items: [{ item_id, item_name, item_variant, price, quantity }], transaction_id }`. Supply only verified product/order data, never personal information. No contact fields are forwarded.

Current integration: add_to_cart only after successful Shopify mutation; begin_checkout before a verified real checkout handoff; email_signup only after provider success. Purchase belongs to verified Shopify checkout/order integration, with attribution and deduplication decided there. No email form, fake signup or fake purchase exists.

## Checks

With preview running, start a dedicated Chrome session in another terminal:

```powershell
$qaProfile = Join-Path $env:TEMP 'staywide-public-polish-chrome'
Start-Process -FilePath 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList '--headless=new','--disable-gpu','--no-first-run','--disable-background-networking','--remote-debugging-address=127.0.0.1','--remote-debugging-port=9222',"--user-data-dir=$qaProfile",'about:blank' -WindowStyle Hidden
node --preserve-symlinks --preserve-symlinks-main scripts/check.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-readiness.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-tracking.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-metadata.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-assets.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-image-interactions.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-public-polish.cjs
```

Run browser scripts sequentially; they share the dedicated tab. Keep debugging local and close that dedicated browser afterwards. `checks/results.json`, `checks/readiness-results.json` and PNG screenshots record evidence. SDK tests use isolated fake IDs only in a VM, with no network; actual provider delivery remains unverified until real properties exist.

Regenerate share/favicon assets with dedicated Chrome running: `node --preserve-symlinks --preserve-symlinks-main scripts/prepare-social-assets.cjs`, then rebuild. The original prepare-assets.cjs pipeline calls this composer after photograph preparation. No image dependency is needed. Run composition and browser checks sequentially because they share the dedicated test tab.

Nothing was committed, pushed, deployed or migrated. No dependency, framework or active GA/Meta tracker was added. Real Shopify Buy Button commerce is integrated locally; see SHOPIFY-INTEGRATION.md.
