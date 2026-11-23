/* Local HTTP preview :8080, dedicated Chrome :9223. No payment or order. */
const fs = require('node:fs');
const assert = require('node:assert/strict');
const guides = require('./size-guides.cjs');
const products = require('../js/catalog.js').products;
const output = 'checks/info-commerce';
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const results = { products: [], viewports: [], mixedCart: null };
  const c = await require('./shopify-cdp.cjs')();
  const { ev, visit, wait, send } = c;
  try {
    for (const route of ['index.html','info.html',...products.map(p=>'products/'+p.id+'.html')]) {
      const html = fs.readFileSync(route,'utf8');
      assert(!/returns|€60/i.test(html), route + ': no obsolete returns references or price');
      assert.match(html,/info.html#shipping">Shipping<\/a>/);
    }
    await visit('info.html');
    await ev('localStorage.clear();sessionStorage.clear()');
    await visit('info.html');
    await ev("document.querySelector('[data-cookie-reject]').click()");
    const referenceTables = await ev("[...document.querySelectorAll('.info-size-guide table')].map(t=>t.outerHTML)");
    for (const p of products) {
      await visit('products/'+p.id+'.html');
      const live = await ev('({status:stayWideShopify.status,...stayWideShopify.validation})');
      results.products.push(live);
      fs.writeFileSync(output+'/live-products.json',JSON.stringify(results.products,null,2)+'\n');
      assert.equal(live.status,'ready'); assert(live.passed);
      assert.equal(live.productId,'gid://shopify/Product/'+p.shopifyProductId);
      assert(live.variants.every(v=>v.currency===p.currency && Number(v.price)===p.price));
      assert.equal(await ev("document.querySelector('.size-guide-content table').outerHTML"),referenceTables[p.kind==='hoodie'?0:1]);
    }
    for (const [width,height] of [[375,812],[390,844],[430,932],[1440,1000]]) {
      await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<700});
      await visit('info.html');
      await ev("document.documentElement.style.scrollBehavior='auto';Promise.all([...document.querySelectorAll('.info-size-guide img')].map(i=>i.decode()))");
      const layout = await ev(`(()=>{
        const sections=[...document.querySelectorAll('.info-page section')];
        const email=document.querySelector('#contact a');
        const charts=[...document.querySelectorAll('.info-size-guide')].map(g=>{
          const image=g.querySelector('img'),table=g.querySelector('table'),scrollers=[...g.querySelectorAll('[role=region]')];
          return {title:g.querySelector('h3').textContent,image:[image.naturalWidth,image.naturalHeight],
            rows:[...table.tBodies[0].rows].map(r=>[...r.cells].map(c=>c.textContent)),
            headers:[...table.tHead.rows[0].cells].map(c=>({text:c.textContent,scope:c.scope})),
            rowHeaders:[...table.tBodies[0].rows].every(r=>r.cells[0].scope==='row'),
            tableFont:getComputedStyle(table).fontSize,
            scrollers:scrollers.map(s=>{s.scrollLeft=200;return {client:s.clientWidth,scroll:s.scrollWidth,moved:s.scrollLeft>0,focusable:s.tabIndex===0}})};
        });
        return {overflow:document.documentElement.scrollWidth>innerWidth,sections:sections.map(s=>s.id),charts,
          headingsFit:[...document.querySelectorAll('.info-page h1,.info-page h2,.info-page h3')].every(h=>h.getBoundingClientRect().right<=innerWidth),
          email:{text:email.textContent,href:email.getAttribute('href'),fits:email.getBoundingClientRect().right<=innerWidth}};
      })()`);
      assert(!layout.overflow); assert(layout.headingsFit); assert(layout.email.fits);
      assert.deepEqual(layout.sections,['shipping','sizing','contact','cookies']);
      assert.equal(layout.email.text,'areyawide@gmail.com'); assert.equal(layout.email.href,'mailto:areyawide@gmail.com');
      for(const [i,kind] of ['hoodie','tee'].entries()) {
        const chart=layout.charts[i],guide=guides[kind];
        assert.deepEqual(chart.rows,guide.rows); assert.deepEqual(chart.headers.map(h=>h.text),guide.headers);
        assert(chart.headers.every(h=>h.scope==='col') && chart.rowHeaders);
        assert.deepEqual(chart.image,[guide.width,guide.height]); assert.equal(chart.tableFont,'16px');
        assert(chart.scrollers.every(s=>s.client<=width && s.focusable));
        if(width<700 && kind==='hoodie') assert(chart.scrollers.every(s=>s.moved),'Wide chart/table scroll within their own region');
      }
      for(const selector of ['#cookies [data-cookie-settings]','.site-footer [data-cookie-settings]']) {
        await ev(`document.querySelector(${JSON.stringify(selector)}).click()`);
        assert(await ev("!document.querySelector('#cookie-panel').hidden"));
        await ev("document.querySelector('[data-cookie-reject]').click()");
        assert(await ev("document.querySelector('#cookie-panel').hidden"));
      }
      await ev("document.querySelectorAll('.size-chart-scroll,.size-table-scroll').forEach(s=>s.scrollLeft=0);window.scrollTo(0,0)");
      const pageHeight=await ev('document.documentElement.scrollHeight');
      fs.writeFileSync(`${output}/info-${width}.png`,Buffer.from((await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:pageHeight,scale:1}})).data,'base64'));
      results.viewports.push({width,height,...layout,cookieSettings:'pass'});
    }
    // Explicit one-hoodie + one-tee check, using only Shopify's live controls.
    for(const id of ['hoodie-02','tshirt-02']) {
      await visit('products/'+id+'.html');
      await ev(`(()=>{window.qaEvents=[];window.stayWideTrack=(name,data)=>qaEvents.push({name,data});const d=document.querySelector('[data-shopify-product] iframe').contentDocument;const s=d.querySelector('select');s.value='M';s.dispatchEvent(new Event('change',{bubbles:true}));d.querySelector('button').click()})()`);
      await wait("qaEvents.some(e=>e.name==='add_to_cart')");
    }
    await visit('info.html');
    const cart = await ev(`(()=>{const d=document.querySelector('iframe[title="YOUR BAG"]').contentDocument;return {carts:document.querySelectorAll('iframe[title="YOUR BAG"]').length,text:d.body.innerText,sizes:[...d.querySelectorAll('[data-element="lineItem.variantTitle"]')].map(e=>e.textContent.trim()),lines:d.querySelectorAll('[data-element="lineItem.quantityInput"]').length}})()`);
    assert.equal(cart.carts,1); assert.equal(cart.lines,2);
    for(const pattern of [/Claddagh Hoodie/,/Ashtray Tee/,/55[,.]00/,/25[,.]00/,/80[,.]00/]) assert.match(cart.text,pattern);
    assert.deepEqual(cart.sizes,['M','M']);
    results.mixedCart={...cart,selectedSizes:['M','M'],subtotalEUR:80,persistedAcrossNavigation:true};
    assert.deepEqual(c.errors,[]); results.runtimeErrors=c.errors;
    fs.writeFileSync(output+'/results.json',JSON.stringify(results,null,2)+'\n');
    console.log('PASS: live product diagnostics; shared Info/PDP tables; four Info viewports; contained scroll; contact; cookie settings; one persisted mixed cart at EUR 80.');
  } finally { c.close(); }
})().catch(error=>{console.error(error);process.exitCode=1});
