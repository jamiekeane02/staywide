# Stay Wide — technical launch readiness

Updated 2 November 2026. The website is public at **https://staywide.cc** and remains **not ready to accept orders or enable tracking**. This polish pass changed local source/templates and rebuilt the public files; it did not deploy, migrate, commit or push. The existing configuration confirms staywide.cc. Git is present; publication remains separate.

Public presentation now uses concise drop/coming-soon copy, hiding unconfirmed prices, sizes, dispatch and specifications. Internal catalogue fields and commerce gates remain. Faithful square icons and four 1200x630 social cards are complete. See [PUBLIC-POLISH.md](PUBLIC-POLISH.md) for exact metadata, metrics, file lists and QA. The campaign placeholder remains intact.

Asset update, 30 October 2026: three real photographed products now appear; Hoodie 02 is withheld with a genuine local 404. Header/footer use a faithful temporary logo extraction. Product and default social images are configured. All launch gates below remain in place. See [ASSET-INTEGRATION.md](ASSET-INTEGRATION.md) for the complete inventory, image metrics and new QA evidence; the earlier QA record below describes the pre-photography iteration.

Image interaction follow-up: fine-pointer image-area hover and keyboard focus preview the selected detail; touch cards remain one-tap links. PDPs now have non-looping arrows, swipe, keyboard navigation and a counter, with decoded-image switching and failure recovery. See [IMAGE-INTERACTIONS.md](IMAGE-INTERACTIONS.md) for the viewport and edge-case checks. No launch gate or commercial value changed.

## COMPLETE

- Preserved static generation, three photographed products, withheld Hoodie 02, identity, gallery, underlying sizes/details and unconnected cart. Unconfirmed information is hidden publicly. No dependency added.
- Central js/site-config.js; build-time titles, concise descriptions, canonicals, OG and X in initial HTML. Query/size states share the product canonical. Only 404 is noindexed.
- Homepage WebSite/Organization JSON-LD uses the faithful logo extraction and staywide.cc. Social profiles remain empty. Product/Offer schema stays withheld for development products; no fabricated rich results.
- Development cards/PDP status use DROP 001. Purchase actions use COMING SOON and stay disabled. Underlying status/dispatch fields remain for future confirmation; no preorder default/schema.
- Sitemap includes home, Info and three product URLs. Robots allows storefront/assets, excludes source/check directories, and declares https://staywide.cc/sitemap.xml. Robots exclusions are not access control; publish public files only.
- Script-free branded 404; local server returns actual HTTP 404 for unknown nested paths. Production must configure equivalent handling.
- Equal-weight Accept all / Reject non-essential / Manage. Analytics and Advertising independent, off by default; Essential always active. Footer/Info Cookie settings, non-modal banner, safe-area spacing and keyboard support.
- Versioned 180-day local preferences with invalid/expired/blocked-storage fallback and cross-tab changes. Optional SDKs require both their consent and a valid configured ID. Both IDs are blank.
- Withdrawal stops helper forwarding, disables GA/revokes Meta, removes accessible associated first-party cookies and queued events, and reloads if an SDK had started. No pre-consent event replay. Previously transmitted requests cannot be retracted; provider-owned third-party cookies cannot be cleared here.
- Only lean GA events and corresponding Meta events prepared. No generic click/size/gallery/scroll tracking or fake commerce/signup success. GA payloads omit URL queries and referrers.
- Compact Info sections retain Shipping, Dispatch, Sizing, Contact, Returns, Privacy, Cookies and Terms. Unconfirmed information uses brief public notices; these are not completed policies. Cookie facts and preference controls remain.
- System fonts and existing responsive styling retained. Product dimensions/aspect ratios reserved; primary gallery and first-row collection images eager, secondary/recommendation images lazy. Real photography replaces rendered silhouettes; unused silhouette CSS remains available in the retained styles.

## FOUNDER REQUIRED

All unchecked items remain unresolved. Do not replace them with guesses.

- [x] Public production domain supplied and configured: staywide.cc; ownership flag already true.
- [x] Faithful favicon.ico (16/32/48px), PNG 48px and Apple touch 180px, with root-relative references on every generated page. No invented mark or fake vector.
- [ ] Original designer vector/high-resolution logo package and dedicated designer favicon for stronger tiny-size legibility.
- [x] Approved white homepage/logo share and three primary-photo shares are 1200x630 with matching OG/X metadata and alt.
- [ ] Real campaign photography/film; retain the placeholder until supplied. Campaign artwork is not required to complete this polish pass.
- [ ] Hoodie 02 photography and approved product information before listing it.
- [ ] Final collection count, names, descriptions/meta descriptions, EUR prices, actual availability, sizes/fit/measurements/model sizing, photographs/alt, material/colour/SKU, decoration and care. No invented identifiers/reviews.
- [ ] Honest estimated dispatch/processing date range. Longer fulfilment is separate from order availability; do not assume preorder.
- [ ] Shipping regions and rates. Ireland/UK likely, EU possible, all unconfirmed; no worldwide claim. Fill shipping configuration and authoritative Shopify rules together.
- [ ] Returns policy and practical operational process — launch blocker.
- [ ] Public support email and business/data-controller/seller details.
- [ ] Final privacy/cookies/terms: purposes, providers, retention, transfers, rights/contact, final cookie inventory and durations. Current Info is not a final policy. Review before activation; this work is not legal sign-off.
- [ ] Final Instagram and TikTok URLs/handles.
- [ ] Real GA4 Measurement ID and Meta Pixel/Dataset ID; no secrets in public configuration.
- [ ] **OFFICIAL EU CONSUMER-RIGHTS NOTICE / ASSET REQUIRED BEFORE ACCEPTING ORDERS**. Obtain applicable official asset and verify its source. None existed locally; nothing was paraphrased/redrawn. Slot: Info Terms section; confirm final placement before orders.
- [ ] Shopify reactivation/integration. Select an email provider only if capture is introduced later; email-only with explicit marketing consent and completed Privacy Policy link.

## PLATFORM SETUP REQUIRED

1. Validate production DNS/HTTPS, redirects and custom HTTP 404 responses for staywide.cc when publishing. The public domain/configuration are supplied; this local pass does not verify hosting behavior.
2. Verify a Google Search Console **Domain property via DNS**, submit final sitemap, inspect homepage and every launch product URL, then monitor indexing. No verification tag added.
3. Connect Shopify authoritative products/variants, prices, inventory, cart mutations and hosted checkout. Configure shipping, taxes and payments. Keep checkout disabled until ordering and policies are verified. No legacy Buy Buttons.
4. Create/configure GA4 property; disable enhanced measurement/unwanted automatic events, retain Google signals/ads personalisation off, check duplicate pageviews and consent gates with a real test property. No GTM container required.
5. Configure Meta business/dataset/pixel/domain settings. Disable automatic events and advanced matching. Test configured requests only after Advertising consent. Coordinate later Shopify purchase attribution/deduplication.
6. Final privacy review and provider/cookie inventory before enabling IDs. Revisit retention and bump `consentVersion` to require fresh choice when purposes/providers change.
7. **P2 — Configure Merchant Center / free product listings once final product and policy data exists.**

## DEFERRED

- TikTok tracking intentionally deferred until paid TikTok plan is confirmed. Advertising category can support it later; no TikTok SDK/API exists.
- Merchant Center until product, price, imagery, shipping and returns information is final.
- Advanced Consent Mode, server-side tagging/GTM, custom CAPI, heatmaps/session replay, A/B testing, advanced attribution and ProductGroup variant schema.
- No paid CMP, SEO plugins, fake ratings/reviews, FAQ/LocalBusiness schema, countdowns, PWA/service worker, push, blog, international SEO or extra marketing software.

## Domain-dependent values and release gate

Source: js/site-config.js: productionUrl is https://staywide.cc and domainConfirmed is true. The flag gates the robots sitemap line, not manual uploading. **Do not deploy this iteration automatically.** Ordering and tracking remain gated independently.

Generated consumers (do not hand-edit):

- `index.html`: canonical, og:url, WebSite/Organization URL and @id.
- info.html, products/hoodie-01.html, products/tshirt-01.html, products/tshirt-02.html: canonical, og:url and future Product/Offer URLs. Hoodie 02 remains withheld.
- `404.html`: og:url; no canonical and noindex.
- `sitemap.xml`: all loc values.
- robots.txt: sitemap declaration with the existing true ownership flag.
- Future social/organisation images: absolute URLs derived by the metadata builder; favicon links use local paths.
- Documentation and canonical test expectation in `scripts/check-readiness.cjs`: update if domain changes.

Only publish public HTML, css, js, assets, robots and sitemap. Exclude templates, scripts, checks, docs, typo file, browser profiles and private files. Resolve data/policy/platform blockers before enabling ordering or tracking. A staging URL must be protected or noindexed and must not become the production canonical. No storefront noindex remains here.

## Old URL / redirect preparation

No AYW URL inventory, export, legacy routes or hosting config exists locally. Current development slugs are not evidence of old live AYW URLs. Obtain a crawl/export and Search Console links before approving exact mappings. No migration now.

| Old URL evidence / candidate | Stay Wide destination | Required decision |
| --- | --- | --- |
| `areyawide.com/` (domain supplied by founder) | Final owned domain `/` | Confirm ownership, hosting, date; eventual HTTP 301 |
| Old product URLs — exact paths unknown | Matching retained product only if equivalent | Inventory old slugs; retired items may need an archive or genuine 404/410 |
| Old collection/shop paths — unknown | `/index.html#shop` or final shop route | Confirm each path and content match |
| Old shipping/sizing/contact/policy paths — unknown | Relevant `/info.html` section | Inventory paths and final replacement content |
| Local `/info.html#preorders` bookmark | `/info.html#dispatch` | Development anchor only; servers cannot inspect URL fragments |

Never send all old URLs blindly to home. No JavaScript redirects or production rules installed. Real production 301/404 support remains a hosting requirement.

## Commerce handoff

`commerce.addItem` in `js/main.js` returns `accepted: false`; Shopify IDs are null. Connect successful authoritative cart responses before rendering lines/counts/subtotal or firing add_to_cart. Quantity/removal must use successful mutations; availability must come from Shopify. Carry visible status/dispatch into cart lines. Enable checkout only with a verified Shopify checkout URL; emit begin_checkout immediately before real handoff.

Purchase requires verified checkout/order integration, transaction IDs and one measurement owner to avoid frontend/Shopify/Meta duplication. No purchase hook is attached to preview actions. Email signup awaits provider success. Verify adapter failures and error messages at integration time.

## Performance and QA evidence

Current polish QA: 25 layout cases, 24 public-polish cases, 16 DPR-2 asset cases, all 24 responsive WebP dimensions, four social dimensions and all favicon frames passed. Consent, tracking, static metadata/schema and 404 passed. At 375x812, 390x844, 430x932, 768x1024 and 1440x1000, normal hover/focus and gallery arrows/swipe/keyboard/boundaries passed.

The final failed-image retry assertion in the existing interaction suite fails: dataset.failed is set to an empty string, but the unchanged gallery tests it for truthiness. Initial failure correctly retains the primary. The gallery implementation is byte-identical to HEAD; this unrelated defect remains for a separately scoped fix. See PUBLIC-POLISH.md and checks/image-interactions-results.json.

The following bullets preserve earlier implementation/QA history; current results supersede demo-size and retry-recovery claims.

- Real product files now use responsive WebP; no campaign file, custom fonts or videos were added. Local LCP candidates are first-row home product imagery and PDP lead photos. See ASSET-INTEGRATION.md for weights and local observations; no Lighthouse or production CWV claim is made.
- Arial/Helvetica and Courier New use system fallbacks: no font downloads or unused weights. No continuous animation; hover transition respects reduced motion.
- Config + consent + tracking add about 10.5 KB uncompressed. Scripts are deferred and local; no external requests with blank IDs, no dependency added.
- `checks/results.json`: all six storefront pages at 375×812, 390×844, 430×932, 768×1024 and 1440×1000 (30 combinations). No horizontal overflow/header collisions/runtime exceptions. Sizes, sold-out example, gallery buttons/swipes, keyboard details, cart Escape/focus/scroll restoration and disabled checkout passed.
- `checks/readiness-results.json`: consent and nested 404 at 375×812, 390×844, 430×932 and 1440×1000. First visit/accept/reject/manage/save/reopen, independent withdrawal, persistence, invalid/expired/blocked storage and storage events; static metadata/content without JS; actual HTTP 404; zero external requests observed. Focus restoration corrected during testing.
- `scripts/check-tracking.cjs`: isolated fake IDs/SDK queues, no network; gates, independent categories, supported names, no replay, view deduplication, mapping, field filtering and withdrawal during SDK loading. Does not verify actual provider delivery.
- `scripts/check-metadata.cjs`: links/assets, JSON-LD parsing, sitemap scope, missing social image rejection, preview schema suppression and future Offer states with isolated fixture data.
- Screenshots: `checks/home-mobile.png`, `checks/product-mobile.png`, `checks/home-desktop.png`, `checks/consent-mobile.png`. Chrome emulation only; physical Safari/iPhone/Android, real provider delivery, final photography and checkout remain prelaunch checks.

## Technical references

Google's [consent setup](https://developers.google.com/tag-platform/security/guides/consent) and [privacy controls](https://developers.google.com/tag-platform/security/guides/privacy) informed the delayed loading, disable flag and manual pageview settings. Meta's [consent implementation reference](https://developers.facebook.com/docs/meta-pixel/implementation/gdpr/) was unavailable to the documentation fetch; validate actual Meta SDK behavior and current setup requirements before activation. Neither live SDK was loaded in testing.

## Recommended next task

Populate and validate the approved launch catalogue with final product information, photography and honest dispatch timing. This supplies the visible source of truth for product schema and subsequent Shopify integration. Do not begin automatically.
