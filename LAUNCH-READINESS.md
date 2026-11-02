# Stay Wide — technical launch readiness

Local iteration, 11 October 2026. **NOT ready for deployment or accepting orders.** The current local build is the source of truth. `staywide.com` is provisional; ownership is not confirmed. No migration, deployment, commit or push occurred. No Git repository or hosting configuration was found.

Asset update, 30 October 2026: three real photographed products now appear; Hoodie 02 is withheld with a genuine local 404. Header/footer use a faithful temporary logo extraction. Product and default social images are configured. All launch gates below remain in place. See [ASSET-INTEGRATION.md](ASSET-INTEGRATION.md) for the complete inventory, image metrics and new QA evidence; the earlier QA record below describes the pre-photography iteration.

Image interaction follow-up: fine-pointer image-area hover and keyboard focus preview the selected detail; touch cards remain one-tap links. PDPs now have non-looping arrows, swipe, keyboard navigation and a counter, with decoded-image switching and failure recovery. See [IMAGE-INTERACTIONS.md](IMAGE-INTERACTIONS.md) for the viewport and edge-case checks. No launch gate or commercial value changed.

## COMPLETE

- Preserved existing static generation, three visible development products and a withheld fourth record, visual identity, gallery, sizes, details and unconnected cart. No framework/dependency added.
- Central `js/site-config.js`; build-time titles, unique descriptions, canonicals, OG and X in initial HTML. Size/query states share the primary product canonical. Removed storefront noindex; only 404 is noindexed.
- Homepage WebSite/Organization JSON-LD includes the temporary exact logo extraction and provisional URL. Social profile slots remain empty. Product/Offer builder uses the real catalogue images but still withholds schema for development products; no fabricated rich results.
- AVAILABLE / SOLD OUT explicitly labelled preview examples; COMING SOON supported. Every product has a separate estimated-dispatch field. No preorder default/schema.
- Sitemap includes home, Info and three current product URLs. Robots allows storefront/assets, excludes source/check directories, and withholds its sitemap declaration until ownership confirmation. Robots exclusions are not access control; publish public files only.
- Script-free branded 404; local server returns actual HTTP 404 for unknown nested paths. Production must configure equivalent handling.
- Equal-weight Accept all / Reject non-essential / Manage. Analytics and Advertising independent, off by default; Essential always active. Footer/Info Cookie settings, non-modal banner, safe-area spacing and keyboard support.
- Versioned 180-day local preferences with invalid/expired/blocked-storage fallback and cross-tab changes. Optional SDKs require both their consent and a valid configured ID. Both IDs are blank.
- Withdrawal stops helper forwarding, disables GA/revokes Meta, removes accessible associated first-party cookies and queued events, and reloads if an SDK had started. No pre-consent event replay. Previously transmitted requests cannot be retracted; provider-owned third-party cookies cannot be cleared here.
- Only lean GA events and corresponding Meta events prepared. No generic click/size/gallery/scroll tracking or fake commerce/signup success. GA payloads omit URL queries and referrers.
- Compact Info sections: Shipping, Dispatch, Sizing, Contact, Returns, Privacy, Cookies and Terms. Unfinished policies are explicit development placeholders.
- System fonts and existing responsive styling retained. Product dimensions/aspect ratios reserved; primary gallery and first-row collection images eager, secondary/recommendation images lazy. Real photography replaces rendered silhouettes; unused silhouette CSS remains available in the retained styles.

## FOUNDER REQUIRED

All unchecked items remain unresolved. Do not replace them with guesses.

- [ ] Purchase/connect final domain; confirm ownership of `staywide.com` or supply a replacement.
- [ ] Final logo exports: favicon.ico, PNG 48px+, optional SVG, Apple touch 180×180, organisation/logo PNG. The existing inline SW text favicon is retained temporarily; no obsolete AYW asset files were found.
- [ ] **FINAL CAMPAIGN OG SHARE IMAGE REQUIRED**: temporary homepage/drop 1200×630 exact-logo share and real individual product shares are configured with dimensions and alt. X now uses summary_large_image. Replace the temporary default when approved campaign artwork arrives.
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

1. Confirm domain ownership, DNS, HTTPS and hosting. Update config, rebuild and inspect all URLs. Hosting must support real HTTP 301 redirects and custom HTTP 404 responses. No host is identified, so production support cannot yet be confirmed.
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

Source: `js/site-config.js` → `productionUrl`, `domainConfirmed: false`. The flag gates robots' sitemap line only, not manual uploading. **Do not upload this preview.**

Generated consumers (do not hand-edit):

- `index.html`: canonical, og:url, WebSite/Organization URL and @id.
- `info.html`, `products/hoodie-01.html`, `products/hoodie-02.html`, `products/tshirt-01.html`, `products/tshirt-02.html`: canonical, og:url and future Product/Offer URLs.
- `404.html`: og:url; no canonical and noindex.
- `sitemap.xml`: all loc values.
- `robots.txt`: future sitemap declaration when ownership flag is true.
- Future social/organisation images: absolute URLs derived by the metadata builder; favicon links use local paths.
- Documentation and canonical test expectation in `scripts/check-readiness.cjs`: update if domain changes.

Only publish public HTML, css, js, final assets, robots and sitemap. Exclude templates, scripts, checks, docs, typo file, browser profiles and private files. Resolve domain/data/policy/platform blockers first. If a public staging URL is created later, staging must be protected or noindexed and must not become the canonical production site. No production storefront noindex remains here.

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
