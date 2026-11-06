# Stay Wide product copy update — 3 November 2026

Completed in the local checkout. Nothing deployed, committed or pushed. Shopify remains unconnected, ordering and checkout remain disabled, and Product/Offer schema remains withheld. No stock levels, launch dates or additional product facts were introduced. Pre-existing browser-profile changes were left alone.

## Product data

Authoritative source: `js/catalog.js`. Prices are numeric with currency EUR. Existing product IDs, URLs and image filenames are retained.

| Public name | Working price | Existing route | Existing development sizes |
| --- | --- | --- | --- |
| Blower Hoodie | €60 | products/hoodie-01.html | XS, S, M, L, XL, XXL |
| Stay Wide Tee | €25 | products/tshirt-01.html | S, M, L, XL |
| Ashtray Tee | €25 | products/tshirt-02.html | S, M, L, XL |

Names also propagate to recommendations, image/gallery accessibility text, social-image alt text, and future product/cart data. Hoodie 02 remains unlisted with its existing development name. Sizes are selectable previews, not confirmed inventory. No cart lines or fake subtotal are created.

## Homepage

Exact main visible copy:

- Announcement left: `STAY WIDE`; right: `COMING SOON`.
- Navigation: `Shop`, `Info`, `Cart 0`.
- Main heading: `STAY WIDE.`
- CTA: `View collection ↓`.
- Collection heading: `Collection`.
- Cards: `Blower Hoodie` / `€60`; `Stay Wide Tee` / `€25`; `Ashtray Tee` / `€25`.
- Footer: `Shipping / Returns`, `Contact`, `Privacy`, `Terms`, `Cookie settings`, and `© 2026 STAY WIDE / IRELAND` (year remains dynamic).

No hero kicker, duplicated collection micro-label, or product status badge. Existing cookie UI is unchanged. Cart notice is `Orders are not open yet.`

## Campaign area

Hidden with the native `hidden` attribute; the literal placeholder and filler treatment were removed from the markup. The retained section has zero layout height. To reactivate, supply one real editorial photograph or film in `templates/home.html`, remove `hidden`, and rebuild. No image was generated or replaced.

## Product pages

Hierarchy: category kicker (`STAY WIDE / HOODIE` or `STAY WIDE / TEE`), name/price, `Choose size`, existing size buttons, `Size up for a looser fit.`, disabled `COMING SOON` button. The note uses the existing secondary typography and is associated with the fieldset for accessibility.

Dispatch UI is absent from PDPs, Info and cart templates. The optional internal catalogue dispatch field remains null. Unconfirmed specifications and size-guide detail remain hidden.

## Metadata

The following exact titles/descriptions are used in the page metadata, Open Graph and X/Twitter:

| Page | Title | Description |
| --- | --- | --- |
| Homepage | Stay Wide | Stay Wide. |
| Blower Hoodie | Blower Hoodie — Stay Wide | Blower Hoodie by Stay Wide. |
| Stay Wide Tee | Stay Wide Tee — Stay Wide | Stay Wide Tee. |
| Ashtray Tee | Ashtray Tee — Stay Wide | Ashtray Tee by Stay Wide. |

The existing homepage share and three dedicated product social images were retained. They contain photographs/logo artwork without the old names embedded; historical contact-sheet captions are internal only.

## Public copy cleanup

Removed numbered-drop wording from announcement bars on home/Info/PDPs; home hero, CTA and collection labels; homepage and recommendation card status text; PDP breadcrumb, kicker and status; homepage/product page titles and descriptions, including OG/X; cart notice; and Info intro. Also replaced generic drop references in the recommendation kicker, Info sizing notice and 404 return copy. Historical internal documentation is retained.

No old product names, Drop 001, €XX, dispatch placeholders or campaign placeholders remain in generated customer HTML or its source templates.

## Tests

- Static build succeeded. Metadata/JSON-LD, local references, sitemap, withheld commerce schema, dedicated social-image assignments and blank analytics IDs passed.
- Tracking gate tests passed without network access.
- Copy/layout checked at **375×812, 390×844, 430×932 and 1440×1000**: names/prices fit without collision, exact copy/metadata, size sets and every size choice, visible fit note, disabled purchase after selection/submission, cart notice, campaign zero-height/no extra gap, no horizontal overflow. 24 page/viewport cases passed.
- General layout/cart tests also covered **768×1024**: 25 page/viewport cases passed, including gallery buttons/swipes, cart Escape/focus/scroll restoration and disabled checkout.
- Consent persistence, category withdrawal, invalid/expired/blocked storage, static content with JavaScript off and actual nested HTTP 404 passed. Zero external requests or JavaScript exceptions observed in that suite.
- Normal hover, keyboard preview, reduced motion, mobile one-tap links/no hover downloads, gallery arrows/keyboard/swipes/counters/boundaries and stable layout passed at all five widths. One-image and three-image fixtures and initial failed-image fallback passed.
- **Known existing failure:** the final failed-image retry assertion still fails because the unchanged gallery checks an empty failure marker for truthiness. This was already documented before this task; the interaction suite is not fully green. No gallery behavior was changed. Its fixed-delay transition assertions were made reliable by waiting for completed transitions.
- Reviewed mobile and desktop screenshots. Existing Chrome emulation was used; no physical-device claim.
- `git diff --check` passed.

## Preserved functionality

Product photography, crops, hover selections, gallery order/arrows/swipes/counter, social cards, consent, GA4/Meta readiness, favicons/logo assets, domain, sitemap/robots infrastructure and cart/Shopify integration points are preserved. CSS, metadata infrastructure, consent/tracking modules and image assets have no content changes. 404 behavior remains intact.

## Files changed

The list below includes source, generated pages, documentation and refreshed QA artifacts. Existing changes under `checks/chrome-profile/` are excluded because they predate this work.

- `404.html`
- `checks/consent-mobile.png`
- `checks/gallery-hoodie-01-1440.png`
- `checks/gallery-hoodie-01-390.png`
- `checks/gallery-tshirt-01-1440.png`
- `checks/gallery-tshirt-01-390.png`
- `checks/gallery-tshirt-02-1440.png`
- `checks/gallery-tshirt-02-390.png`
- `checks/home-desktop.png`
- `checks/home-mobile.png`
- `checks/polish-home-1440.png`
- `checks/polish-home-375.png`
- `checks/polish-home-390.png`
- `checks/polish-home-430.png`
- `checks/product-mobile.png`
- `checks/public-polish-results.json`
- `checks/readiness-results.json`
- `checks/results.json`
- `index.html`
- `info.html`
- `js/catalog.js`
- `js/main.js`
- `LAUNCH-READINESS.md`
- `PRODUCT-COPY-UPDATE.md`
- `products/hoodie-01.html`
- `products/tshirt-01.html`
- `products/tshirt-02.html`
- `scripts/build.cjs`
- `scripts/check.cjs`
- `scripts/check-image-interactions.cjs`
- `scripts/check-public-polish.cjs`
- `scripts/check-readiness.cjs`
- `templates/404.html`
- `templates/home.html`
- `templates/info.html`
- `templates/product.html`
