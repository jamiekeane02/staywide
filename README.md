# Stay Wide local launch foundation

Existing static storefront for the public pre-launch website at **https://staywide.cc**. This iteration is local only; do not deploy automatically. Commerce, GA4 and Meta are inactive. See [PUBLIC-POLISH.md](PUBLIC-POLISH.md) for current assets and QA, and [LAUNCH-READINESS.md](LAUNCH-READINESS.md) for ordering/tracking blockers.

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
- `js/catalog.js`: products, states, dispatch, descriptions, images, variants and future commerce IDs. Three products use real photography; commercial data remains unconfirmed. `listed: false` withholds Hoodie 02. Development products hide prices, sizes and unconfirmed details; cards show DROP 001 and purchase actions remain disabled with COMING SOON. Future confirmed states remain `available`, `sold_out`, `coming_soon`.
- `js/site-config.js`: site name, confirmed staywide.cc production URL/ownership flag, blank tracking IDs, brand/social assets, social profiles and shipping slots. Public values only, never secrets.
- `scripts/build.cjs` and `scripts/metadata.cjs`: static HTML, footer/cart, metadata, schema, sitemap and robots. No runtime SEO injection.
- `css/styles.css`: original colours, typography, silhouettes and responsive design, with restrained consent styling.
- `js/main.js`: gallery, sizes and unconnected Shopify adapter. `js/consent.js`: preferences. `js/tracking.js`: gated SDKs and lean event helper.

Product schema is withheld for `development: true`. Do not clear that flag just to obtain schema: visible copy, imagery, price and availability must be real. Offers also require `commerceReady: true`; coming-soon products have no orderable Offer. Rebuild after catalogue/metadata changes.

`domainConfirmed: true` reflects the supplied public domain, staywide.cc. It gates the robots sitemap line, not deployment. Publishing changes remains a separate task.

## Assets and collection

Real supplied photographs cover Hoodie 01, T-shirt 01 and T-shirt 02. Each has a primary full-garment view and a print detail. The approved logo extraction supplies the header/footer, square ICO/PNG/Apple icons and a 1200x630 homepage share. Each product has its own 1200x630 JPEG share. Original source selections remain documented in ASSET-INTEGRATION.md; current exports and metrics are in PUBLIC-POLISH.md.

Image interactions: hover over a product's image on a fine-pointer device to see the selected print detail; move out to return to the full garment. Keyboard focus also previews it. Touch cards remain one-tap links and do not preload hover images. PDP galleries have 44px previous/next buttons, a live image counter, left/right keyboard keys and horizontal swipe; they do not loop or autoplay. See [IMAGE-INTERACTIONS.md](IMAGE-INTERACTIONS.md) for implementation and QA. A one-image product automatically omits both hover and gallery controls. Gallery failures retain the current photograph; an existing retry defect is documented in PUBLIC-POLISH.md.

Image records support `src`, `alt`, `width`, `height`, `srcset`. Supply true dimensions; the reserved frame is 4:5 with contain fitting. WebP widths are 480, 800, 1200 and 1600. Use root-relative srcset URLs over HTTP. Primary gallery and first two homepage card images load eagerly; secondary/recommendation imagery can lazy load. The future campaign LCP image must be eager with explicit dimensions. `scripts/prepare-assets.cjs` reproduces deterministic orientation/crop/encoding with the dedicated Chrome session; it reads originals without modifying them and requires no installed image package.

Set `listed: false` to withhold a catalogue entry, then rebuild. The builder removes that explicitly withheld product's generated HTML and excludes it from cards, recommendations and sitemap. Hoodie 02's URL currently returns HTTP 404. To add it, supply real image records, confirm details and set `listed: true`; the builder rejects listed products without real image files. Three desktop products use one row; four naturally return to a two-by-two grid.

## Consent and events

`localStorage['staywide.consent']` holds version, saved timestamp, Analytics/Advertising booleans and Essential always true. Maximum age: 180 days. Missing, expired, malformed or inaccessible storage means optional tracking off. Close/Escape dismisses without consenting. Footer/Info Cookie settings reopens controls; changes synchronise across tabs. Blocked storage uses page-only preferences and explains the limitation.

Accept/Reject/Manage have equal prominence. Withdrawal blocks helper events, disables GA/revokes Meta, removes accessible associated `_ga*`, `_fbp`, `_fbc` cookies, and reloads only if an SDK had started. Reload unloads third-party code; blank-ID changes need no reload. No pre-consent event replay.

`window.stayWideTrack(name, data)` returns false when nothing can be forwarded. Names: `page_view`, `view_item`, `add_to_cart`, `begin_checkout`, `purchase`, `email_signup`. Views deduplicate separately per provider; development products do not emit view_item. Preview buttons emit no commerce events.

Data contract: `{ currency: 'EUR', value, items: [{ item_id, item_name, item_variant, price, quantity }], transaction_id }`. Supply only verified product/order data, never personal information. No contact fields are forwarded.

Future integration: add_to_cart only after successful Shopify mutation; begin_checkout before a verified real checkout handoff; email_signup only after provider success. Purchase belongs to verified Shopify checkout/order integration, with attribution and deduplication decided there. No email form, fake signup or fake purchase exists.

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

Nothing was committed, pushed, deployed or migrated. No dependency, framework, live commerce or active tracker was added.
