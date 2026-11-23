# Stay Wide size guides, campaign, pricing and checkout return

22 November 2026. Local repository implementation only. Nothing committed, pushed or deployed. Supplied originals were inspected and remain untouched. Shopify admin/products/variants were not modified; test cart additions did not place orders.

## Size-guide assets and implementation

| Supplied filename | Web file | Dimensions | Mapping |
| --- | --- | --- | --- |
| `hoodie size chart.jpeg` | `assets/size-guides/hoodie-size-chart.jpeg` | 1560 × 260 | Blower and Claddagh hoodies |
| `tsshirt size chart.jpeg` | `assets/size-guides/tee-size-chart.jpeg` | 1065 × 736 | Stay Wide and Ashtray tees |

Both JPEGs are unchanged copies, approximately 78/91 KiB. One shared builder selects the chart by product `kind`, never catalogue position. One shared JavaScript controller opens a native labelled `<dialog>` beside CHOOSE SIZE, directly above the Shopify selector. The close control stays outside the scrolling content, Escape closes natively, and focus returns to SIZE GUIDE. Background scrolling is locked while open. The dialog is at most 760px wide / 94vw, within 90dvh.

All supplied values were legible and transcribed without conversion, correction or inference. Tables rotate the source layout so sizes become rows; units, values, hoodie ±2cm tolerances, tee 2XL naming and the source's jump from 5XL to 7XL are retained. No 6XL or missing sleeve measurements were invented. Images retain their full aspect ratio. On narrow screens the original wide chart text is small, so the accompanying 14px semantic table provides readable measurements without horizontal overflow. Tee measurement instructions are also available as text. Chart sizes never determine purchasable Shopify variants or availability.

Shopify's supported product template places “Size up for a looser fit.” below its selector and above ADD TO BAG. The existing host fit note remains available during loading/failure. Opening the guide does not recreate Shopify controls or touch the gallery.

## Prices and Shopify

| Product | Local public price | Live Shopify price checked | Preserved Shopify ID |
| --- | --- | --- | --- |
| Blower Hoodie | €55 | All variants €55 EUR | `16690527011207` |
| Claddagh Hoodie | €55 | All variants €55 EUR | `16718244217223` |
| Stay Wide Tee | €25 | All variants €25 EUR | `16690535891335` |
| Ashtray Tee | €25 | All variants €25 EUR | `16690540020103` |

Homepage, PDP and recommendation prices derive from `js/catalog.js`. The existing metadata gates are retained; no new offer schema is invented. Existing price validation is unchanged and naturally expects €55 for hoodies. A contract test specifically confirms that a €60 Shopify response against a €55 catalogue fails closed. Domain/token/configuration and product IDs are unchanged, with no new Buy Buttons or products. No customer-facing €60 remains in generated pages/catalogue.

## Campaign image

Source: `stay wide campaign image.png`, 4961 × 2827. Technical resize/WebP encoding only, quality 0.9, without cropping or retouching:

| Web filename in `assets/campaign/` | Dimensions | Bytes |
| --- | --- | --- |
| `stay-wide-campaign-480.webp` | 480 × 274 | 14520 |
| `stay-wide-campaign-800.webp` | 800 × 456 | 26260 |
| `stay-wide-campaign-1200.webp` | 1200 × 684 | 41432 |
| `stay-wide-campaign-1600.webp` | 1600 × 912 | 59590 |
| `stay-wide-campaign-2400.webp` | 2400 × 1368 | 97252 |

The existing campaign section is now active after the collection and before the footer. Image only, without added copy or overlays. Full composition on mobile retains the foreground boxer, red gloves, background person and Stay Wide graphic. No centre crop is used. Explicit dimensions, responsive srcset, lazy loading and async decoding preserve collection priority. The deliberate homepage OG/share image is unchanged.

## Checkout return

`cart.popup: true` delegates separate-window/tab checkout to BuyButton.js. The original Stay Wide tab stays open; shoppers return by switching to it or closing checkout. No custom checkout URL, manual `window.open`, hosted-checkout injection or cross-frame application DOM manipulation was added.

CONTINUE SHOPPING appears in the cart header using Shopify's supported `templates.title` configuration and its existing `cart.close` action. It closes the cart on the current Stay Wide page. Cart contents, discounts and checkout remain Shopify-managed. The existing `openCheckout` event is the sole begin_checkout hook, and purchase tracking was untouched.

References: [Shopify customization options](https://shopify.github.io/buy-button-js/customization/), [Shopify cart template](https://github.com/Shopify/buy-button-js/blob/master/src/templates/cart.js), [Shopify cart close binding](https://github.com/Shopify/buy-button-js/blob/master/src/components/cart.js).

## QA

Chrome browser emulation: 375 × 812, 390 × 844, 430 × 932 and 1440 × 1000. All four PDPs checked at each viewport (16 combinations): prices and recommendations, no horizontal overflow, usable image/title/purchase layout, 44px guide trigger, correct chart, readable table, reachable Close, Escape, focus restoration, selected size preservation, gallery buttons and keyboard. Real touch dispatch verifies gallery swipe at each mobile width. Campaign aspect ratio, lazy loading, placement and width are checked at all four viewports, with screenshot review of mobile and desktop presentation.

Live commerce: each of the four products successfully added at its approved price; one persisted bag held four product lines, count 4, subtotal €160. Continue Shopping closed the cart without navigation. A real checkout click opened Shopify separately while Stay Wide remained open. One begin_checkout event fired with value 160; no purchase event or order submission. No browser runtime exceptions. Browser emulation is not a physical iPhone/Safari test.

Passing commands:

```powershell
node --preserve-symlinks --preserve-symlinks-main scripts/build.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-size-campaign.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-shopify-events.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-tracking.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/check-metadata.cjs
```

The commerce contract covers a mismatched €60 hoodie, failed SDK/missing product, success-only add tracking and a single checkout event. Tracking checks cover consent gates, no replay, independent categories and withdrawal. Existing consent scripts and gallery code were not modified. Shared CSS/JS retain the build-generated content version. Earlier reports and their browser scripts contain historical €60/same-tab assumptions; this report and `check-size-campaign.cjs` are current.

## Build and preview

From `C:\Users\User\Documents\StayWide`:

```powershell
node --preserve-symlinks --preserve-symlinks-main scripts/build.cjs
node --preserve-symlinks --preserve-symlinks-main scripts/preview.cjs
```

Open http://127.0.0.1:8080/. Stop preview with Ctrl+C. For browser QA, start dedicated headless Chrome on 9223 using a temporary profile (as in README, substituting port 9223), then run the feature check above. Asset regeneration uses the same dedicated browser:

```powershell
node --preserve-symlinks --preserve-symlinks-main scripts/prepare-campaign-assets.cjs 'C:\Users\User\Downloads'
```

## Files modified

- `README.md`
- `css/styles.css`
- `js/catalog.js`
- `js/shopify-buy.js`
- `scripts/build.cjs`
- `scripts/check-shopify-events.cjs`
- `templates/home.html`
- `templates/product.html`
- `index.html` (generated)
- `info.html` (generated cache version)
- `404.html` (generated cache version)
- `products/hoodie-01.html` (generated)
- `products/hoodie-02.html` (generated)
- `products/tshirt-01.html` (generated)
- `products/tshirt-02.html` (generated)

## Files created

- `SIZE-CAMPAIGN-UPDATE.md`
- `js/size-guide.js`
- `scripts/size-guides.cjs`
- `scripts/prepare-campaign-assets.cjs`
- `scripts/check-size-campaign.cjs`
- `assets/size-guides/hoodie-size-chart.jpeg`
- `assets/size-guides/tee-size-chart.jpeg`
- `assets/campaign/stay-wide-campaign-480.webp`
- `assets/campaign/stay-wide-campaign-800.webp`
- `assets/campaign/stay-wide-campaign-1200.webp`
- `assets/campaign/stay-wide-campaign-1600.webp`
- `assets/campaign/stay-wide-campaign-2400.webp`
- `checks/size-campaign/assets.json`
- `checks/size-campaign/results.json`
- `checks/size-campaign/campaign-375.png`
- `checks/size-campaign/campaign-390.png`
- `checks/size-campaign/campaign-430.png`
- `checks/size-campaign/campaign-1440.png`
- `checks/size-campaign/cart-375.png`
- `checks/size-campaign/hoodie-guide-375.png`
- `checks/size-campaign/hoodie-guide-1440.png`
- `checks/size-campaign/tee-guide-375.png`
- `checks/size-campaign/tee-guide-1440.png`
- `checks/size-campaign/hoodie-01-375.png`
- `checks/size-campaign/hoodie-01-390.png`
- `checks/size-campaign/hoodie-01-430.png`
- `checks/size-campaign/hoodie-01-1440.png`
- `checks/size-campaign/hoodie-02-375.png`
- `checks/size-campaign/hoodie-02-390.png`
- `checks/size-campaign/hoodie-02-430.png`
- `checks/size-campaign/hoodie-02-1440.png`
- `checks/size-campaign/tshirt-01-375.png`
- `checks/size-campaign/tshirt-01-390.png`
- `checks/size-campaign/tshirt-01-430.png`
- `checks/size-campaign/tshirt-01-1440.png`
- `checks/size-campaign/tshirt-02-375.png`
- `checks/size-campaign/tshirt-02-390.png`
- `checks/size-campaign/tshirt-02-430.png`
- `checks/size-campaign/tshirt-02-1440.png`

Pre-existing inaccessible/deleted tracked Chrome-profile entries were left alone. No old GitHub files were restored.
