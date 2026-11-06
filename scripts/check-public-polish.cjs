/* Public copy, social asset and header regression checks. Local preview + Chrome :9222. */
const fs = require('node:fs');
const assert = require('node:assert/strict');
const config = require('../js/site-config.js');
const products = require('../js/catalog.js').products.filter(p => p.listed !== false);
const manifest = require('../checks/social-assets-manifest.json');
const root = 'http://127.0.0.1:8080/';
const pages = ['index.html', 'info.html', '404.html', ...products.map(p => `products/${p.id}.html`)];
const forbidden = /Independent clothing from Ireland|development|provisional|collection preview|preview state|€XX|TO BE CONFIRMED|real product photography|Drop 001|Hoodie 01|T-shirt 0[12]|dispatch|CAMPAIGN IMAGE \/ FILM/i;
const metadata = [];
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  const customerHTML = html.replace(/<!--[^]*?-->/g, '').replace(/<script[^>]*>[^]*?<\/script>/g, '');
  assert(!forbidden.test(customerHTML), `${page}: internal copy`);
  const bracketed = customerHTML.match(/\[[^\]\n]+\]/g) || [];
  assert.deepEqual(bracketed, [], 'No public placeholders remain');
  const meta = Object.fromEntries([...html.matchAll(/<meta (?:property|name)="([^"]+)" content="([^"]*)">/g)].map(m => [m[1], m[2]]));
  const p = products.find(p => page === `products/${p.id}.html`);
  if (page === 'index.html' || p) {
    const title = p ? `${p.name} — Stay Wide` : 'Stay Wide';
    const description = p ? p.metaDescription : 'Stay Wide.';
    const social = p ? p.socialImage : config.defaultSocialImage;
    assert.equal(meta['og:title'], title); assert.equal(meta['twitter:title'], title);
    assert.equal(meta['og:description'], description); assert.equal(meta['twitter:description'], description);
    assert.equal(meta.description, description);
    assert(html.includes(`<title>${title}</title>`));
    assert.equal(meta['og:image'], config.productionUrl + '/' + social.src);
    assert.equal(meta['twitter:image'], meta['og:image']);
    assert.equal(meta['og:image:width'], '1200'); assert.equal(meta['og:image:height'], '630');
    assert.equal(meta['og:image:alt'], social.alt); assert.equal(meta['twitter:image:alt'], social.alt);
    assert.equal(meta['og:site_name'], 'Stay Wide'); assert.equal(meta['og:type'], 'website');
    assert.equal(meta['twitter:card'], 'summary_large_image');
    const canonical = config.productionUrl + (p ? '/' + page : '/');
    assert.equal(meta['og:url'], canonical);
    assert(html.includes(`<link rel="canonical" href="${canonical}">`));
    assert(!/"@type":"(?:Product|Offer)"/.test(html), 'No unconfirmed commercial schema');
    metadata.push({ page, title, description, canonical, image: meta['og:image'], alt: social.alt });
  }
  for (const src of Object.values(config.icons).filter(Boolean)) assert(html.includes(`href="/${src}"`), `${page}: root-relative icon`);
}
const ico = fs.readFileSync(config.icons.ico);
assert.equal(ico.readUInt16LE(0), 0); assert.equal(ico.readUInt16LE(2), 1); assert.equal(ico.readUInt16LE(4), 3);
for (const [index, size] of [16, 32, 48].entries()) {
  const entry = 6 + index * 16;
  assert.equal(ico[entry], size); assert.equal(ico[entry + 1], size);
  const offset = ico.readUInt32LE(entry + 12), length = ico.readUInt32LE(entry + 8);
  assert(offset + length <= ico.length);
  assert.equal(ico.toString('ascii', offset + 1, offset + 4), 'PNG');
  assert.equal(ico.readUInt32BE(offset + 16), size); assert.equal(ico.readUInt32BE(offset + 20), size);
}
const ratioCheck = c => assert(Math.abs(c.width / c.height - c.sourceWidth / c.sourceHeight) < 1e-10, 'One proportional scale');
for (const output of manifest.outputs) {
  assert.equal(fs.statSync(output.file).size, output.bytes);
  if (output.composition?.photograph) { ratioCheck(output.composition.photograph); ratioCheck(output.composition.brand); }
  else if (output.composition) ratioCheck(output.composition);
}
(async () => {
  const tabs = await (await fetch(`http://127.0.0.1:${process.env.CHROME_DEBUG_PORT || 9222}/json`)).json();
  const socket = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => socket.addEventListener('open', r, { once: true }));
  let id = 0; const pending = new Map(), requests = [], errors = [], headers = [];
  socket.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (m.method === 'Network.requestWillBeSent') requests.push(m.params.request.url);
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails);
    if (m.id) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(m.error) : p.resolve(m.result); }
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => { const n = ++id; pending.set(n, { resolve, reject }); socket.send(JSON.stringify({ id: n, method, params })); });
  const ev = async expression => { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
  try {
    await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
    for (const [width, height] of [[375, 812], [390, 844], [430, 932], [1440, 1000]]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 700 });
      await send('Emulation.setTouchEmulationEnabled', { enabled: width < 700 });
      for (const page of pages) {
        requests.length = 0;
        await send('Page.navigate', { url: root + page });
        let ready = false;
        for (let i = 0; i < 100; i++) {
          if (await ev(`location.href===${JSON.stringify(root + page)} && document.readyState==='complete'`)) { ready = true; break; }
          await new Promise(r => setTimeout(r, 30));
        }
        assert(ready, page);
        await ev(`document.querySelector('[data-cookie-reject]')?.click();Promise.all([...document.images].filter(i=>i.loading!=='lazy').map(i=>i.decode()))`);
        const layout = await ev(`(()=>{const logo=document.querySelector('.site-header img'),nav=document.querySelector('nav'),header=document.querySelector('.site-header');const l=logo.getBoundingClientRect(),n=nav.getBoundingClientRect();return {logoWidth:l.width,logoHeight:l.height,headerHeight:header.getBoundingClientRect().height,gap:n.left-l.right,overflow:document.documentElement.scrollWidth>innerWidth,navHeights:[...nav.children].map(e=>e.getBoundingClientRect().height),text:document.body.innerText};})()`);
        assert.equal(layout.logoWidth, width < 700 ? 96 : 104);
        assert(Math.abs(layout.logoWidth / layout.logoHeight - 920 / 512) < .002);
        assert(layout.gap >= 8 && !layout.overflow && layout.headerHeight < 62);
        assert(layout.navHeights.every(h => h >= 44 && h < 48), 'Navigation stays on one row');
        assert(!forbidden.test(layout.text), 'No public internal copy');
        assert(!requests.some(u => /-share\.jpg/.test(u)), 'Social images must not load during browsing');
        if (page !== '404.html') assert(await ev(`!document.querySelector('#cart-open,#cart-dialog') && !!window.stayWideShopify`));
        if (page === 'index.html') {
          assert(await ev(`!document.querySelector('.opening .kicker') && document.querySelector('.opening h1').textContent==='STAY WIDE.' && !document.querySelector('.opening-line') && document.querySelector('.opening a').textContent==='View collection ↓' && document.querySelector('.opening a').getAttribute('href')==='#shop'`));
          assert(await ev(`document.querySelector('#shop-title').textContent==='Collection' && document.querySelector('.campaign-media').hidden && document.querySelector('.campaign-media').getBoundingClientRect().height===0 && document.querySelector('#shop').getBoundingClientRect().top===document.querySelector('.opening').getBoundingClientRect().bottom`), 'Campaign leaves no gap');
          await ev(`Promise.all([...document.querySelectorAll('.collection-grid .image-primary img')].map(i=>{i.loading='eager';return i.decode()}))`);
          const shot = await send('Page.captureScreenshot', { format: 'png' });
          fs.writeFileSync(`checks/polish-home-${width}.png`, Buffer.from(shot.data, 'base64'));
        }
        if (page !== '404.html') {
          assert.deepEqual(await ev(`[...document.querySelector('.announcement').children].map(e=>e.textContent)`), ['STAY WIDE', 'COMING SOON']);
          const cards = await ev(`[...document.querySelectorAll('.product-card')].map(card=>{const n=card.querySelector('strong'),p=card.querySelector('.product-price'),nr=n.getBoundingClientRect(),pr=p.getBoundingClientRect();return {id:card.dataset.product,name:n.textContent,price:p.textContent,separate:pr.left>=nr.right || pr.top>=nr.bottom,inside:pr.right<=card.getBoundingClientRect().right+.5};})`);
          for (const card of cards) {
            const product = products.find(p=>p.id===card.id);
            assert.equal(card.name, product.name); assert.equal(card.price, `€${product.price}`);
            assert(card.separate && card.inside, 'Names and prices fit without collision');
          }
          assert(await ev(`!document.querySelector('.product-state') && !document.querySelector('[data-cart-dispatch]')`));

        }
        const product = products.find(p=>page===`products/${p.id}.html`);
        if (product) {
          assert.equal(await ev(`document.querySelector('#product-title').textContent`), product.name);
          assert.equal(await ev(`document.querySelector('.detail-price').textContent`), `€${product.price}`);
          assert(await ev(`!document.querySelector('[name=size]') && !!document.querySelector('[data-shopify-product]') && document.querySelector('#size-note').textContent==='Size up for a looser fit.'`), 'Shopify owns sizes; approved fit note remains adjacent');
        }
        delete layout.text;
        headers.push({ page, viewport: `${width}x${height}`, ...layout });
      }
    }
    for (const output of manifest.outputs.filter(o => o.width)) {
      const response = await fetch(root + output.file); assert.equal(response.status, 200);
      const actual = await ev(`(async()=>{const i=new Image();i.src=${JSON.stringify(root + output.file)};await i.decode();const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;const x=c.getContext('2d');x.drawImage(i,0,0);const px=x.getImageData(0,0,c.width,c.height).data;let nonwhite=0;for(let k=0;k<px.length;k+=4)if(Math.min(px[k],px[k+1],px[k+2])<220)nonwhite++;return {width:i.naturalWidth,height:i.naturalHeight,corner:[...px.slice(0,4)],nonwhite};})()`);
      assert.equal(actual.width, output.width); assert.equal(actual.height, output.height);
      assert.deepEqual(actual.corner, [255, 255, 255, 255], 'Opaque white canvas');
      assert(actual.nonwhite > output.width * output.height * .05, 'Artwork exists; no blank canvas');
    }
    assert.equal((await fetch(root + config.icons.ico)).status, 200);
    assert.deepEqual(errors, []);
    fs.writeFileSync('checks/public-polish-results.json', JSON.stringify({ metadata, headers, productNamesPricesSizesFit: 'pass', campaign: 'hidden without gap', commerce: 'one Shopify mount; no preview cart or static size form (live checks in checks/shopify/results.json)', socialAssets: 'pass', icoFrames: [16, 32, 48], internalCopy: 'absent', noSocialDownloads: true, runtimeErrors: errors }, null, 2) + '\n');
    console.log('PASS: 24 public page/viewport checks, exact OG/X/canonicals, proportional headers, social dimensions/content/ratios, ICO frames, no social downloads or internal public copy.');
  } finally { socket.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
