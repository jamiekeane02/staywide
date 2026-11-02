# Stay Wide local launch foundation

Existing static storefront, improved for technical launch readiness. **Local only: do not deploy. `staywide.com` is provisional; ownership is unconfirmed.** Commerce, GA4 and Meta are inactive. See [LAUNCH-READINESS.md](LAUNCH-READINESS.md) for launch blockers.

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
- `js/catalog.js`: products, visible states, dispatch, descriptions, images, variants and future commerce IDs. Three products use real photography; commercial data remains provisional. `listed: false` withholds Hoodie 02. `null` price renders €XX. States: `available`, `sold_out`, `coming_soon`; dispatch is separate for every state.
- `js/site-config.js`: site name, provisional production URL, ownership flag, blank tracking IDs, brand/social asset slots, social profiles and shipping slots. Public values only, never secrets.
- `scripts/build.cjs` and `scripts/metadata.cjs`: static HTML, footer/cart, metadata, schema, sitemap and robots. No runtime SEO injection.
- `css/styles.css`: original colours, typography, silhouettes and responsive design, with restrained consent styling.
- `js/main.js`: gallery, sizes and unconnected Shopify adapter. `js/consent.js`: preferences. `js/tracking.js`: gated SDKs and lean event helper.

Product schema is withheld for `development: true`. Do not clear that flag just to obtain schema: visible copy, imagery, price and availability must be real. Offers also require `commerceReady: true`; coming-soon products have no orderable Offer. Rebuild after catalogue/metadata changes.

Keep `domainConfirmed: false` until ownership is verified. It gates robots' sitemap line, **not deployment**. Final hosting/deployment remains a separate task.

## Assets and collection

Real supplied photographs now cover Hoodie 01, T-shirt 01 and T-shirt 02. Each has a full-garment primary and one print detail. The header/footer use an exact temporary extraction of the blue-and-white logo; the original inline SW text favicon is retained. Product JPEG shares and a neutral logo share are configured. See [ASSET-INTEGRATION.md](ASSET-INTEGRATION.md) for source selections, derivative sizes, QA and outstanding assets.

Image interactions: hover over a product's image on a fine-pointer device to see the selected print detail; move out to return to the full garment. Keyboard focus also previews it. Touch cards remain one-tap links and do not preload hover images. PDP galleries have 44px previous/next buttons, a live image counter, left/right keyboard keys and horizontal swipe; they do not loop or autoplay. See [IMAGE-INTERACTIONS.md](IMAGE-INTERACTIONS.md) for implementation and QA. A one-image product automatically omits both hover and gallery controls. Gallery failures retain the current photograph and allow retry.

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
Start-Process -FilePath 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList '--headless=new','--disable-gpu','--no-first-run','--disable-background-networking','--remote-debugging-port=9222','--user-data-dir=C:\Users\User\Documents\StayWide\checks\chrome-profile','about:blank' -WindowStyle Hidden
node --preserve-symlinks --preserve-symlinks-main scripts/check.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-readiness.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-tracking.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-metadata.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-assets.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-image-interactions.cjs
```

Run browser scripts sequentially; they share the dedicated tab. Keep debugging local and close that dedicated browser afterwards. `checks/results.json`, `checks/readiness-results.json` and PNG screenshots record evidence. SDK tests use isolated fake IDs only in a VM, with no network; actual provider delivery remains unverified until real properties exist.

No Git repository was found. Nothing was committed, pushed, deployed or migrated. No dependency, framework, live commerce or active tracker was added.
