# Stay Wide — Shopify Buy Button integration

6 November 2026. Implemented in the current local checkout, preserving the existing uncommitted copy, photography and gallery work. No deployment, commit, push, payment or order submission.

## 1. Extracted configuration

- Store: `zw8sj5-yw.myshopify.com`.
- Public browser configuration: `js/site-config.js`, under `shopify`. The token is the Storefront token supplied in all three official snippets; it is intentionally not repeated here. No Admin token, password or private secret was used.
- Exact supplied CDN: `https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js`. This is Shopify's rolling `latest` channel, not a pinned release. Recheck behavior when Shopify updates it.
- Supplied EUR money format is retained.
- `shopify.enabled` is the shared initialization switch. No dependency or framework was introduced.

## 2. Product mapping

| Local product | Shopify product | Shopify ID | Approved price |
| --- | --- | --- | --- |
| `hoodie-01` | Blower Hoodie | `16690527011207` | €60 |
| `tshirt-01` | Stay Wide Tee | `16690535891335` | €25 |
| `tshirt-02` | Ashtray Tee | `16690540020103` | €25 |

Mappings came respectively from `blower buy button.txt`, `LOGO TEE BUY BUTON.txt`, and `ASHTRAY BUY BUTTON.txt`. Hoodie 02 remains unlisted, unmapped and not commerce-ready; its route returns 404. All three mapped products loaded, selected variants and added successfully, so their `commerceReady` verification flags are true. `development` remains true for unapproved editorial details and static schema; it no longer controls Shopify purchasing.

## 3. Product pages

The shared PDP template has one `data-shopify-product` mount in the existing purchase panel. The preview form, static size radios, selected-size display and disabled preview submit button were removed, along with the fake adapter in `main.js`. Only Shopify options and ADD TO BAG render inside the mount. Duplicate image, title, price, description, quantity and variant title are disabled.

The local title, approved price, gallery, photographs, gallery controls, recommendations and metadata remain. CHOOSE SIZE and **Size up for a looser fit.** sit immediately above the mount. The fit note stays outside the iframe, adjacent to the selector, avoiding overrides of Shopify's templates. Unconfirmed product details remain hidden.

## 4. Styling

Product, cart and toggle retain iframe isolation. Supported `styles`, `contents`, `order`, `text`, and lifecycle events customize them; no production code reads or modifies iframe DOM. Arial/Helvetica, near-black, blue focus/hover, square borders, a full-width 52px purchase button, and 48px selector match the existing site. Cart quantity controls have 44px targets on one row. The supplied products have no Shopify cart images, so generic bag-image placeholders are hidden. Local PDP photography is unaffected.

## 5. Cart

One client, one UI instance and one authoritative Shopify cart per page. Cart initializes before the PDP component, whose native integration reuses it. Shopify persists the cart across navigation on the same origin. Homepage, all PDPs and Info load the shared module; 404 does not.

The fake header Cart 0 and dialog were removed. The official restrained black side toggle owns its title, live quantity, keyboard behavior and focus restoration. Shopify hides this native toggle when the cart is empty; it appears after an item is added. This avoids copying counts or calling undocumented methods to preserve the old header button. The native cart supports different products/variants, quantity changes, removal by decrementing to zero, subtotal and checkout. No second cart is stored by Stay Wide.

## 6. Checkout

`cart.popup: false` opens Shopify-hosted checkout in the same tab. Shopify supplies the URL. No URL is constructed locally, and there are no payment forms, proxies or checkout iframes. A real browser handoff reached the store's “Checkout - My Store” page. No payment details were entered and no order was placed.

## 7. Availability and pricing

The Shopify component receives live variants and availability. Old `sizes`, `variants` and `status` fields remain only for historical/build compatibility; the integration never uses them to decide stock. Shopify's native button labels are ADD TO BAG, SOLD OUT and UNAVAILABLE.

All variants of a loaded product must match both its approved EUR price and the mapped Shopify resource ID before its controls become visible. A different price, currency, missing model or unexpected variant-specific price fails closed and identifies the local product in a console warning. The editorial price is not silently changed. Live checks found S/M/L/XL for all three products; Shopify's ordering differs between products. All tested variants were available, so a real zero-stock test remains required. No inventory was changed or locally fabricated for that test.

Product/Offer schema remains withheld. Static development stock is never published as InStock. Existing canonicals, titles, Open Graph/X metadata, images, sitemap, robots and favicon remain under Stay Wide's ownership.

## 8. Tracking and consent

The documented `product.events.addVariantToCart` hook in the supplied CDN runs **before** the cart request. It records an in-memory pending variant and baseline only. `cart.events.afterRender` emits one `add_to_cart` only after a new authoritative cart model shows the variant quantity increased. Opening a cart, option changes, optimistic renders, failed adds and repeated renders do not emit success. Quantity updates cancel a pending add. A confirmation timeout advises checking the bag before retrying.

`cart.events.openCheckout` emits `begin_checkout` for the real nonempty Shopify cart just before native navigation. Events include actual Shopify variant IDs, amounts, currency and quantities; known products use local catalogue IDs consistently. No `purchase` event was added: verified Shopify order completion must own purchase attribution and deduplication later.

The existing `stayWideTrack` helper and consent implementation are unchanged. GA and Meta still require their independent consent categories and configured IDs; IDs remain blank. Essential commerce loads regardless of marketing consent. Shopify's SDK makes its own commerce/telemetry requests; it is not accurate to describe the integrated site as making zero external requests. The provider/privacy inventory still needs the existing prelaunch review.

## 9. Failure handling

- CDN error or timeout: restrained unavailable message, no fake purchase fallback; gallery/navigation continue working. Reload retries normally.
- Missing/unloadable ID: component initialization times out, controls remain hidden, and the local product is reported. No substitute product is selected.
- Mapping or price mismatch: controls remain hidden and a diagnostic identifies the local product.
- Sold-out product/variant: Shopify controls native unavailable state and disabled purchasing; local stock never overrides it.
- Slow/unconfirmed add: no success event; the status asks customers to inspect their bag before retrying. Shopify retains responsibility for cart mutations and checkout inventory validation.

## 10. Modified files

Authoritative sources:

- `js/site-config.js`, `js/catalog.js`, `js/main.js`
- `templates/product.html`, `templates/home.html`, `templates/info.html`
- `scripts/build.cjs`, `css/styles.css`
- `LAUNCH-READINESS.md`, `README.md`

Generated pages: `index.html`, `info.html`, `products/hoodie-01.html`, `products/tshirt-01.html`, `products/tshirt-02.html`.

Existing checks updated to remove preview-commerce assumptions or support the dedicated debugging port: `scripts/check.cjs`, `scripts/check-readiness.cjs`, `scripts/check-public-polish.cjs`, `scripts/check-image-interactions.cjs`, `scripts/check-assets.cjs`.

Refreshed existing QA artifacts: `checks/results.json`, `checks/readiness-results.json`, `checks/public-polish-results.json`, `checks/home-mobile.png`, `checks/home-desktop.png`, `checks/product-mobile.png`, `checks/consent-mobile.png`, and `checks/polish-home-{375,390,430,1440}.png`.

The working tree already contained other edits/deletions before this task. Those are not all integration changes. The existing gallery failed-image retry issue recorded in LAUNCH-READINESS.md remains outside this integration's scope; gallery source was preserved.

## 11. Created files

- `js/shopify-buy.js`
- `scripts/shopify-cdp.cjs`
- `scripts/check-shopify.cjs`
- `scripts/check-shopify-events.cjs`
- `scripts/check-shopify-failure.cjs`
- `SHOPIFY-INTEGRATION.md`
- `checks/shopify/results.json`, `failure-results.json`, `keyboard-results.json`
- `checks/shopify/product-{375,390,430,768,1440}.png`, `cart-{375,390,430,768,1440}.png`

Temporary SDK inspection downloads and the isolated browser profile were removed after testing.

## 12. Tests and limits

- Build passed; generated HTML comes from the shared source/templates.
- Real CDN/store loading and all three products passed through the HTTP preview.
- Required Hoodie → collection → Ashtray sequence passed: one cart, two lines, €85. Adding Stay Wide Tee produced three lines and €110. Increasing its quantity produced €135, and removing it restored two lines and €85.
- Live suite: 25 page/viewport combinations, covering home, Info and three PDPs at **375×812, 390×844, 430×932, 768×1024, 1440×1000**. No horizontal/iframe overflow, duplicate cart/loader, clipped checkout or runtime exceptions. Native selection/button focus and minimum touch sizes passed; controls were visually inspected in screenshots.
- Native toggle Enter, cart Escape and restored toggle focus passed for a populated cart.
- Same-tab real Shopify checkout handoff and exactly one begin_checkout passed; no payment/order test was performed.
- Event contract tests passed for initialization deduplication, successful adds, duplicate renders, failed/unconfirmed adds, quantity edits, checkout, price mismatch, missing product and CDN failure.
- Real browser blocked-CDN test passed, including useful error, working gallery, recovery on reload and no commerce on 404.
- Existing checks passed: tracking consent/unit tests, metadata, browser consent/readiness, 25 base layout/gallery/swipe cases, and 24 public-copy/metadata cases.
- Real sold-out inventory, payment success/decline, inventory decrement, shipping rules, physical Safari and production hosting are not verified by these local tests.

## 13. Founder tests before launch

- Enable Shopify Payments test mode in a suitable test window; place a successful test order.
- Exercise a declined test payment and recovery.
- Verify inventory decrement and a real zero-stock size; ensure “continue selling when out of stock” matches your intended policy.
- Verify Ireland and UK shipping addresses, rates, delivery options and applicable checkout settings.
- Test the complete flow on real mobile Safari.
- After separately authorized publication, repeat the cross-product cart and checkout on `https://staywide.cc`.
- Complete existing shipping/returns/privacy/terms, support and seller-information release gates.
- Disable test mode before live sales and verify live payment configuration. No Admin access was requested or changed here.

## 14. Preview and reproduce

From `C:\Users\User\Documents\StayWide`:

```powershell
node --preserve-symlinks --preserve-symlinks-main scripts/build.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/preview.cjs
```

Open `http://127.0.0.1:8080/index.html`. Reject non-essential cookies; shopping should still work. Open `/products/hoodie-01.html`, select a size, add to bag, then return to the collection and open `/products/tshirt-02.html`. Add an available size: the bag should show both products and €85. Visit `/products/tshirt-01.html`, add a size, and check three lines / €110. Increase and decrease quantities, remove a line by decreasing to zero, then navigate between pages and verify the retained count. CHECKOUT must navigate the same tab to Shopify. Do not submit a real payment while merely previewing.

Dependency-free local checks:

```powershell
node --preserve-symlinks --preserve-symlinks-main scripts/check-shopify-events.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-tracking.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-metadata.cjs
```

For the live browser suites, keep the preview running and launch a dedicated Chrome profile:

```powershell
Start-Process -FilePath 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList '--headless=new','--remote-debugging-port=9223','--user-data-dir=C:\Users\User\Documents\StayWide\checks\shopify\chrome-profile','--no-first-run','--no-default-browser-check','about:blank' -WindowStyle Hidden
node --preserve-symlinks --preserve-symlinks-main scripts/check-shopify.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-shopify-failure.cjs
$env:CHROME_DEBUG_PORT='9223'
node --preserve-symlinks --preserve-symlinks-main scripts/check.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-readiness.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-public-polish.cjs
```

Run browser suites sequentially because they share the dedicated test tab. They clear that profile's local storage and create real Shopify carts, but never submit payments. Keep browser profiles and `checks/` out of publication.

Implementation references: Shopify's [supported customization and lifecycle events](https://shopify.github.io/buy-button-js/customization/), [component contents/order and iframe guidance](https://shopify.github.io/buy-button-js/advanced/), and the supplied CDN source inspected during this task. The successful-add confirmation accounts for the source's pre-request product event timing rather than assuming that event means success.
