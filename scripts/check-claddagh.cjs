/* Local preview + dedicated Chrome :9223. Real Shopify carts; no payment/order. */
const fs = require('node:fs');
const assert = require('node:assert/strict');
const products = require('../js/catalog.js').products.filter(p => p.listed !== false);
(async () => {
  const c = await require('./shopify-cdp.cjs')();
  const { ev, send, visit, wait } = c;
  const out = 'checks/claddagh';
  fs.mkdirSync(out, { recursive: true });
  const pd = `document.querySelector('[data-shopify-product] iframe').contentDocument`;
  const cd = `document.querySelector('iframe[title="YOUR BAG"]').contentDocument`;
  const results = { viewports: [], inventory: [], assets: [], errors: [] };
  try {
    await visit('index.html');
    await ev('localStorage.clear();sessionStorage.clear()');
    await visit('products/hoodie-02.html');
    await ev(`document.querySelector('[data-cookie-reject]').click()`);
    for (const id of ['hoodie-02', 'hoodie-01']) {
      await visit(`products/${id}.html`);
      assert.equal(await ev('stayWideShopify.status'), 'ready');
      await ev(`window.addEvents=[];window.stayWideTrack=(name,data)=>addEvents.push({name,data});${pd}.querySelector('button').click()`);
      await wait(`addEvents.some(e=>e.name==='add_to_cart')`);
      const event = await ev(`addEvents.find(e=>e.name==='add_to_cart')`);
      assert.equal(event.data.value, 60); assert.equal(event.data.currency, 'EUR');
      assert.equal(event.data.items[0].item_id, id);
    }
    await visit('index.html');
    await ev(`document.querySelector('iframe[title="Cart toggle"]').contentDocument.querySelector('button,.shopify-buy__cart-toggle').click()`);
    await wait(`document.querySelector('.shopify-buy-frame--cart').classList.contains('is-active')`);
    const cart = await ev(`({text:${cd}.body.innerText,lines:${cd}.querySelectorAll('[data-element="lineItem.quantityInput"]').length,carts:document.querySelectorAll('iframe[title="YOUR BAG"]').length})`);
    assert.equal(cart.lines, 2); assert.equal(cart.carts, 1);
    assert.match(cart.text, /Claddagh Hoodie/); assert.match(cart.text, /Blower Hoodie/); assert.match(cart.text, /€120,00/);
    results.mixedCart = { products: ['Claddagh Hoodie','Blower Hoodie'], lines: 2, carts: 1, subtotal: 'EUR 120', persistedAcrossPages: true };
    for (const p of products) {
      await visit(`products/${p.id}.html`);
      assert.equal(await ev('stayWideShopify.status'), 'ready', p.id);
      const states = await ev(`(()=>{const d=${pd},s=d.querySelector('select');return [...s.options].map(o=>{s.value=o.value;s.dispatchEvent(new Event('change',{bubbles:true}));return {size:o.value,label:d.querySelector('button').textContent,disabled:d.querySelector('button').disabled};});})()`);
      assert(states.length > 0);
      results.inventory.push({ id:p.id, source:'Live Shopify selector', states });
    }
    for (const [width,height] of [[375,812],[390,844],[430,932],[768,1024],[1440,1000]]) {
      await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:2,mobile:width<700});
      await send('Emulation.setTouchEmulationEnabled',{enabled:width<700});
      for (const route of ['index.html','products/hoodie-02.html','info.html']) {
        await visit(route);
        await ev(`document.querySelector('[data-cookie-reject]').click();document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,0)`);
        const base = await ev(`({overflow:document.documentElement.scrollWidth>innerWidth,announcement:document.querySelector('.announcement').textContent,footer:[...document.querySelectorAll('.footer-links a')].map(a=>a.textContent),cookieSettings:!document.querySelector('[data-cookie-settings]').disabled,scripts:[...document.scripts].filter(s=>s.src===stayWideConfig.shopify.scriptURL).length,carts:document.querySelectorAll('iframe[title="YOUR BAG"]').length})`);
        assert(!base.overflow); assert.equal(base.announcement,'STAY WIDE');
        assert.deepEqual(base.footer,['Shipping / Returns','Contact']); assert(base.cookieSettings);
        assert.equal(base.scripts,1); assert.equal(base.carts,1);
        const entry = {width,height,route,...base};
        if (route==='index.html') {
          const cards=await ev(`[...document.querySelectorAll('.collection-grid .product-card')].map(e=>{const r=e.getBoundingClientRect();return {id:e.dataset.product,width:r.width,top:r.top,left:r.left,href:e.getAttribute('href')};})`);
          assert.deepEqual(cards.map(p=>p.id),['hoodie-01','hoodie-02','tshirt-01','tshirt-02']);
          if(width>=1240){assert(cards.every(p=>p.width>=260&&Math.abs(p.top-cards[0].top)<1));}
          else {assert.equal(cards[0].top,cards[1].top);assert.equal(cards[2].top,cards[3].top);assert.equal(cards[0].left,cards[2].left);}
          entry.cards=cards;
          assert(await ev(`[...document.querySelectorAll('.collection-grid .image-primary img')].every(i=>i.getBoundingClientRect().height<=i.closest('.product-image').getBoundingClientRect().height+1)`),'Card photo remains contained');
          await ev(`Promise.all([...document.querySelectorAll('.image-primary img')].map(i=>{i.loading='eager';return i.decode()}))`);
        } else if (route.startsWith('products/')) {
          const layout=await ev(`(()=>{const d=${pd},b=d.querySelector('button'),s=d.querySelector('select'),f=document.querySelector('[data-shopify-product] iframe'),fr=f.getBoundingClientRect(),br=b.getBoundingClientRect();return {titleTop:document.querySelector('#product-title').getBoundingClientRect().top,galleryHeight:document.querySelector('.gallery-frame').getBoundingClientRect().height,buttonBottom:fr.top+br.bottom,buttonHeight:br.height,selectHeight:s.getBoundingClientRect().height,buttonRadius:getComputedStyle(b).borderRadius,selectCount:d.querySelectorAll('select').length,fit:document.querySelector('#size-note').textContent,images:[...document.querySelectorAll('.gallery-panel img')].map(i=>({loading:i.loading,priority:i.fetchPriority,src:i.currentSrc,fit:getComputedStyle(i).objectFit,height:i.getBoundingClientRect().height}))};})()`);
          assert(layout.buttonHeight>=52);assert(layout.selectHeight>=48);assert.equal(layout.buttonRadius,'0px');assert.equal(layout.selectCount,1);assert.equal(layout.fit,'Size up for a looser fit.');
          assert.equal(layout.images[0].loading,'eager'); assert.equal(layout.images[0].priority,'high');assert(layout.images.every(i=>i.fit==='contain'));assert(layout.images[0].height<=layout.galleryHeight+1,'Full photo stays inside gallery');
          if(width<700) {assert(layout.titleTop<height*.8);assert(layout.buttonBottom<=height+60);}
          entry.purchase=layout;
          await ev(`document.querySelector('#image-0 img').decode()`);
        } else {
          assert(await ev(`!document.querySelector('#privacy,#terms')&&!document.body.innerText.includes('before orders open')&&!document.body.innerText.includes('Orders are not open yet')&&!!document.querySelector('#cookies')`));
        }
        results.viewports.push(entry);
        if(route!=='info.html') fs.writeFileSync(`${out}/${route==='index.html'?'home':'product'}-${width}.png`,Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
      }
    }
    for(const asset of require('../checks/claddagh/assets.json').outputs) {
      const actual=await ev(`(async()=>{const i=new Image();i.src='/${asset.file}';await i.decode();return {width:i.naturalWidth,height:i.naturalHeight};})()`);
      assert.equal(actual.width,asset.width);assert.equal(actual.height,asset.height);assert.equal(fs.statSync(asset.file).size,asset.bytes);
      results.assets.push({file:asset.file,...actual});
    }
    await visit('products/hoodie-02.html');
    await ev(`document.querySelector('iframe[title="Cart toggle"]').contentDocument.querySelector('.shopify-buy__cart-toggle').click();${cd}.querySelector('[data-element="cart.button"]').click()`);
    await wait(`location.hostname==='zw8sj5-yw.myshopify.com'`);
    results.checkout={host:await ev('location.hostname'),sameTab:true,orderSubmitted:false};
    assert.deepEqual(c.errors,[]);
    fs.writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2)+'\n');
    console.log('PASS: live Claddagh price/mapping, mixed persisted Shopify cart, all four live size selectors, five viewport layouts, controls, cleanup, nine assets, hosted checkout.');
  } finally { c.close(); }
})().catch(error=>{console.error(error);process.exitCode=1});
