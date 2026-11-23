/* Real Shopify + local browser QA. No payment or order is submitted.
 * Preview :8080 and dedicated headless Chrome :9223 must be running.
 */
const fs = require('node:fs');
const assert = require('node:assert/strict');
const products = require('../js/catalog.js').products.filter(p => p.listed !== false);
const output = process.env.STAYWIDE_QA_OUTPUT || 'checks/size-campaign';
const hasCampaign = /class="campaign-media\b/.test(fs.readFileSync('templates/home.html','utf8'));
const pd = `document.querySelector('[data-shopify-product] iframe').contentDocument`;
const cd = `document.querySelector('iframe[title="YOUR BAG"]').contentDocument`;
(async () => {
  const c = await require('./shopify-cdp.cjs')();
  const { ev, send, visit, wait } = c;
  const results = { prices: [], viewports: [], campaign: [], checkout: null };
  const shot = async name => {
    await ev('new Promise(resolve=>setTimeout(resolve,450))'); // Let native cart transitions and scroll settle.
    fs.writeFileSync(`${output}/${name}.png`, Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
  };
  try {
    fs.mkdirSync(output, { recursive: true });
    await visit('index.html');
    await ev('localStorage.clear();sessionStorage.clear()');
    await visit('index.html');
    await ev("document.querySelector('[data-cookie-reject]').click()");
    for (const p of products) {
      await visit(`products/${p.id}.html`);
      const live = await ev('stayWideShopify.validation');
      assert(live?.passed, `${p.id}: live validation must pass`);
      assert.equal(live.productId, 'gid://shopify/Product/' + p.shopifyProductId);
      assert(live.variants.every(v => Number(v.price) === p.price && v.currency === 'EUR'), `${p.id}: Shopify price must match catalogue`);
      results.prices.push({ localId: p.id, localPrice: p.price, ...live });
    }
    for (const [width,height] of [[375,812],[390,844],[430,932],[1440,1000]]) {
      await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:2,mobile:width<700});
      await send('Emulation.setTouchEmulationEnabled',{enabled:width<700});
      for (const p of products) {
        await visit(`products/${p.id}.html`);
        assert.equal(await ev('stayWideShopify.status'), 'ready');
        await ev(`document.documentElement.style.scrollBehavior='auto';document.querySelector('#image-0 img').decode()`);
        const choices = await ev(`[...${pd}.querySelector('select').options].map(o=>o.value)`);
        let selected;
        for (const value of choices.slice().reverse()) {
          await ev(`(()=>{const s=${pd}.querySelector('select');s.value=${JSON.stringify(value)};s.dispatchEvent(new Event('change',{bubbles:true}));})()`);
          if (await ev(`!${pd}.querySelector('button').disabled`)) { selected = value; break; }
        }
        assert(selected, 'Available size required for add-to-bag QA');
        const layout = await ev(`(()=>{const trigger=document.querySelector('[data-size-guide-open]'),heading=document.querySelector('.size-heading'),d=${pd},s=d.querySelector('select'),b=d.querySelector('button'),f=document.querySelector('[data-shopify-product] iframe'),box=trigger.getBoundingClientRect(),h=heading.getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,title:document.querySelector('#product-title').textContent,price:document.querySelector('.detail-price').textContent,galleryHeight:document.querySelector('.gallery-frame').getBoundingClientRect().height,triggerHeight:box.height,triggerOnRow:box.top>=h.top&&box.bottom<=h.bottom+1,fit:d.body.innerText.includes('Size up for a looser fit.'),fitBetween:s.getBoundingClientRect().bottom<d.querySelector('p').getBoundingClientRect().top&&d.querySelector('p').getBoundingClientRect().bottom<b.getBoundingClientRect().top,buttonBottom:f.getBoundingClientRect().top+b.getBoundingClientRect().bottom,buttonHeight:b.getBoundingClientRect().height,selectorHeight:s.getBoundingClientRect().height};})()`);
        assert(!layout.overflow); assert(layout.triggerOnRow); assert(layout.fit && layout.fitBetween);
        assert.deepEqual(await ev(`[...document.querySelectorAll('.recommendation-grid .product-price')].map(e=>e.textContent)`),products.filter(other=>other.id!==p.id).map(other=>`€${other.price}`));
        assert.equal(layout.price, `€${p.price}`); assert(layout.triggerHeight>=44); assert(layout.buttonHeight>=52);assert(layout.selectorHeight>=48);
        await ev("document.querySelector('[data-size-guide-open]').click()");
        await wait("document.querySelector('dialog[data-size-guide-dialog]').open");
        await ev("document.querySelector('.size-guide-content img').decode()");
        const guide = await ev(`(()=>{const d=document.querySelector('[data-size-guide-dialog]'),i=d.querySelector('img'),r=d.getBoundingClientRect(),b=d.querySelector('button').getBoundingClientRect();return {category:d.querySelector('#size-guide-category').textContent,image:i.getAttribute('src'),imageWidth:i.naturalWidth,imageHeight:i.naturalHeight,width:r.width,inside:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight,closeVisible:b.top>=0&&b.bottom<=innerHeight,contentOverflow:d.querySelector('.size-guide-content').scrollWidth>d.querySelector('.size-guide-content').clientWidth,fontSize:getComputedStyle(d.querySelector('td')).fontSize,focusedClose:document.activeElement===d.querySelector('button'),rowCount:d.querySelectorAll('tbody tr').length};})()`);
        assert.equal(guide.category, p.kind === 'hoodie' ? 'HOODIES' : 'TEES');
        assert(guide.image.endsWith(`${p.kind === 'hoodie' ? 'hoodie' : 'tee'}-size-chart.jpeg`));
        assert(guide.inside && guide.closeVisible && guide.focusedClose);assert(!guide.contentOverflow);assert.equal(guide.fontSize,'14px');
        if (p.id.endsWith('01') && [375,1440].includes(width)) await shot(`${p.kind}-guide-${width}`);
        await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
        await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
        await wait("!document.querySelector('[data-size-guide-dialog]').open && document.activeElement===document.querySelector('[data-size-guide-open]')");
        await ev("document.querySelector('[data-size-guide-open]').click();document.querySelector('[data-size-guide-close]').click()");
        await wait("!document.querySelector('[data-size-guide-dialog]').open && document.activeElement===document.querySelector('[data-size-guide-open]')");
        assert.equal(await ev(`${pd}.querySelector('select').value`),selected);
        await ev('window.scrollTo(0,0)');
        await shot(`${p.id}-${width}`);
        if(width===375) {
          await ev(`window.qaEvents=[];window.stayWideTrack=(name,data)=>qaEvents.push({name,data});${pd}.querySelector('button').click()`);
          await wait("qaEvents.some(e=>e.name==='add_to_cart')");
          const events=await ev('qaEvents');
          assert.equal(events.filter(e=>e.name==='add_to_cart').length,1);assert.equal(events[0].data.value,p.price);
          await wait("document.querySelector('.shopify-buy-frame--cart').classList.contains('is-active')");
          await ev(`${cd}.querySelector('[data-element="cart.close"]').click()`);
          await wait("!document.querySelector('.shopify-buy-frame--cart').classList.contains('is-active')");
          assert.equal(await ev('location.pathname'),`/products/${p.id}.html`);
        }
        // Native gallery buttons and keyboard remain independent of the dialog.
        await ev("document.querySelector('[data-gallery-next]').click()");
        await wait("document.querySelector('[data-gallery-current]').textContent==='2'");
        await ev("document.querySelector('[data-gallery]').focus()");
        await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowLeft',code:'ArrowLeft',windowsVirtualKeyCode:37});
        await wait("document.querySelector('[data-gallery-current]').textContent==='1'");
        if(width<700) {
          await ev("document.querySelector('[data-gallery]').scrollIntoView({block:'center'})");
          const point=await ev("(()=>{const r=document.querySelector('[data-gallery]').getBoundingClientRect();return {x:r.left+r.width*.7,y:r.top+r.height*.3}})()");
          await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});
          await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:point.x-90,y:point.y}]});
          await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
          await wait("document.querySelector('[data-gallery-current]').textContent==='2'");
        }
        results.viewports.push({product:p.id,width,height,selectedSize:selected,selectionPreserved:true,escapeAndClose:true,focusRestored:true,layout,guide});
      }
      await visit('index.html');
      await ev("document.documentElement.style.scrollBehavior='auto'");
      assert.equal(await ev("!!document.querySelector('.campaign-media')"),hasCampaign,'Preserve current local campaign presence');
      assert.deepEqual(await ev("[...document.querySelectorAll('.collection-grid .product-price')].map(e=>e.textContent)"),products.map(p=>`€${p.price}`));
      assert(!await ev('document.documentElement.scrollWidth>innerWidth'));
      if (hasCampaign) {
      const campaign=await ev(`(async()=>{const i=document.querySelector('.campaign-media img');i.scrollIntoView({block:'center'});await i.decode();const r=i.getBoundingClientRect();return {loading:i.loading,priority:i.fetchPriority,source:i.currentSrc,width:r.width,height:r.height,ratio:r.width/r.height,overflow:document.documentElement.scrollWidth>innerWidth,beforeCollection:!!(i.compareDocumentPosition(document.querySelector('#shop'))&Node.DOCUMENT_POSITION_FOLLOWING),prices:[...document.querySelectorAll('.collection-grid .product-price')].map(e=>e.textContent),recommendationsNotApplicable:true};})()`);
      assert(!campaign.overflow);assert(campaign.beforeCollection);assert.equal(campaign.loading,'eager');assert.equal(campaign.priority,'high');assert(Math.abs(campaign.ratio-(width<700?7/5:4961/2827))<.01);
      assert.deepEqual(campaign.prices,['€55','€55','€25','€25']);
      results.campaign.push({width,height,...campaign});await shot(`campaign-${width}`);
      } else {
        results.campaign.push({width,height,present:false,localTemplatePreserved:true});
        await shot(`home-${width}`);
      }
    }
    await send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:2,mobile:true});
    await visit('index.html');
    await ev("document.querySelector('iframe[title=\"Cart toggle\"]').contentDocument.querySelector('.shopify-buy__cart-toggle').click()");
    await wait("document.querySelector('.shopify-buy-frame--cart').classList.contains('is-active')");
    const cart=await ev(`({text:${cd}.body.innerText,lines:${cd}.querySelectorAll('[data-element="lineItem.quantityInput"]').length,count:document.querySelector('iframe[title="Cart toggle"]').contentDocument.body.innerText,carts:document.querySelectorAll('iframe[title="YOUR BAG"]').length})`);
    assert.equal(cart.lines,4);assert.equal(cart.carts,1);assert.match(cart.text,/160[,.]00/);assert.match(cart.count,/4/);
    results.mixedCart=cart;await shot('cart-375');
    assert(await ev(`(()=>{const d=${cd};return d.querySelector('[data-element="lineItem.itemTitle"]').getBoundingClientRect().top>=d.querySelector('[data-element="cart.header"]').getBoundingClientRect().bottom})()`),'Cart header must not overlap first product');
    const before=(await send('Target.getTargets')).targetInfos.map(t=>t.targetId);
    await ev('window.qaEvents=[];window.stayWideTrack=(name,data)=>qaEvents.push({name,data})');
    const checkoutPoint=await ev(`(()=>{const f=document.querySelector('iframe[title="YOUR BAG"]').getBoundingClientRect(),b=${cd}.querySelector('[data-element="cart.button"]').getBoundingClientRect();return {x:f.left+b.left+b.width/2,y:f.top+b.top+b.height/2};})()`);
    // A trusted user gesture is required for browser popup permission.
    await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...checkoutPoint});
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...checkoutPoint});
    let popup;
    for(let n=0;n<80;n++) {
      popup=(await send('Target.getTargets')).targetInfos.find(t=>!before.includes(t.targetId)&&t.type==='page'&&/myshopify\.com|checkout\.shopify\.com/.test(t.url));
      if(popup)break;await new Promise(r=>setTimeout(r,250));
    }
    assert(popup,'Shopify checkout opened separately');
    assert.equal(await ev('location.pathname'),'/index.html');assert.equal(await ev('location.hostname'),'127.0.0.1');
    const checkoutEvents=await ev("qaEvents.filter(e=>e.name==='begin_checkout')");assert.equal(checkoutEvents.length,1);assert.equal(checkoutEvents[0].data.value,160);
    assert(!(await ev("qaEvents.some(e=>e.name==='purchase')")));
    results.checkout={separateWindow:true,host:new URL(popup.url).hostname,storefrontStayedOpen:true,beginCheckoutEvents:1,continueShoppingClosesCart:true,orderSubmitted:false};
    await send('Target.closeTarget',{targetId:popup.targetId});
    assert.deepEqual(c.errors,[]);
    results.runtimeErrors=c.errors;
    fs.writeFileSync(`${output}/results.json`,JSON.stringify(results,null,2)+'\n');
    console.log('PASS: four live Shopify prices, 16 PDP viewport checks, exact category mapping, dialog/selection/focus, all four adds, cart count/persistence, popup checkout, one begin_checkout event, current homepage at all widths.');
  } finally { c.close(); }
})().catch(error=>{console.error(error);process.exitCode=1});
