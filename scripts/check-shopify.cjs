/* Real Shopify smoke test; creates carts, never submits payment or changes stock. */
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  const c = await require('./shopify-cdp.cjs')();
  const { ev, send, visit, wait } = c;
  const cartDoc = `document.querySelector('iframe[title="YOUR BAG"]').contentDocument`;
  const productDoc = `document.querySelector('[data-shopify-product] iframe').contentDocument`;
  const count = `${cartDoc}.querySelectorAll('[data-element="lineItem.quantityInput"]').length`;
  const results = { products: [], viewports: [], errors: [] };
  await visit('index.html');
  await ev(`localStorage.clear();sessionStorage.clear()`);
  await visit('products/hoodie-01.html');
  await ev(`document.querySelector('[data-cookie-reject]').click()`);
  const record = () => ev(`window.testEvents=[];window.stayWideTrack=(name,data)=>testEvents.push({name,data})`);
  const add = async () => {
    await record();
    await ev(`${productDoc}.querySelector('button').click()`);
    await wait(`testEvents.filter(e=>e.name==='add_to_cart').length===1`);
    assert.equal(await ev(`testEvents[0].data.items[0].quantity`), 1);
    assert.equal(await ev(`testEvents[0].data.currency`), 'EUR');
  };
  await ev(`const select=${productDoc}.querySelector('select');select.value='M';select.dispatchEvent(new Event('change',{bubbles:true}))`);
  await add();
  assert.equal(await ev(count), 1);
  await visit('index.html');
  assert.equal(await ev(`document.querySelectorAll('iframe[title="Cart toggle"]').length`), 1);
  assert.match(await ev(`document.querySelector('iframe[title="Cart toggle"]').contentDocument.body.innerText`), /1/);
  await visit('products/tshirt-02.html');
  await add();
  assert.equal(await ev(count), 2);
  assert.match(await ev(`${cartDoc}.body.innerText`), /€85,00/);
  results.crossPageCart = 'Hoodie → collection → Ashtray: one cart, two lines, EUR 85';
  await visit('products/tshirt-01.html');
  await add();
  assert.equal(await ev(count), 3);
  assert.match(await ev(`${cartDoc}.body.innerText`), /€110,00/);
  // Quantity and removal are exclusively Shopify controls. No add event for edits.
  await ev(`${cartDoc}.querySelector('[data-element="lineItem.quantityIncrement"]').click()`);
  await wait(`${cartDoc}.querySelector('[data-element="lineItem.quantityInput"]').value==='2'`);
  await wait(`${cartDoc}.body.innerText.includes('€135,00')`);
  await ev(`${cartDoc}.querySelector('[data-element="lineItem.quantityDecrement"]').click()`);
  await wait(`${cartDoc}.querySelector('[data-element="lineItem.quantityInput"]').value==='1'`);
  await ev(`${cartDoc}.querySelector('[data-element="lineItem.quantityDecrement"]').click()`);
  await wait(`${count}===2`);
  assert.equal(await ev(`testEvents.length`), 1);
  results.quantityAndRemoval = 'pass';
  for (const id of ['hoodie-01','tshirt-01','tshirt-02']) {
    await visit('products/'+id+'.html');
    const states = await ev(`(()=>{const d=${productDoc},select=d.querySelector('select');return [...select.options].map(o=>{select.value=o.value;select.dispatchEvent(new Event('change',{bubbles:true}));const b=d.querySelector('button');return {size:o.value,disabled:b.disabled,label:b.textContent}})})()`);
    assert(states.length);
    results.products.push({ id, states });
  }
  for (const [width,height] of [[375,812],[390,844],[430,932],[768,1024],[1440,1000]]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<700});
    for (const route of ['index.html','products/hoodie-01.html','products/tshirt-01.html','products/tshirt-02.html','info.html']) {
      await visit(route);
      await ev(`document.querySelector('[data-cookie-reject]').click()`);
      const layout = await ev(`({overflow:document.documentElement.scrollWidth>innerWidth,oldControls:!!document.querySelector('#purchase-form,#cart-dialog,#cart-open'),cartCount:document.querySelectorAll('iframe[title="Cart toggle"]').length,cdn:[...document.scripts].filter(s=>s.src===stayWideConfig.shopify.scriptURL).length})`);
      assert.equal(layout.overflow,false,route+' overflow at '+width);
      assert.equal(layout.oldControls,false);
      assert.equal(layout.cartCount,1); assert.equal(layout.cdn,1);
      if (route.startsWith('products/')) {
        const controls = await ev(`(()=>{const d=${productDoc},s=d.querySelector('select'),b=d.querySelector('button');s.focus();return {selectHeight:s.getBoundingClientRect().height,buttonHeight:b.getBoundingClientRect().height,overflow:d.documentElement.scrollWidth>d.documentElement.clientWidth,focus:d.activeElement===s,note:document.querySelector('#size-note').textContent,images:d.images.length}})()`);
        assert(controls.selectHeight>=48);assert(controls.buttonHeight>=52);assert(controls.focus);assert(!controls.overflow);assert.equal(controls.images,0);assert.equal(controls.note,'Size up for a looser fit.');
        await ev(`document.querySelector('[data-gallery-next]').click()`);
        await wait(`document.querySelector('[data-gallery-current]').textContent==='2'`);
        await ev(`document.querySelector('[data-gallery-previous]').click()`);
        await wait(`document.querySelector('[data-gallery-current]').textContent==='1'`);
        if(route==='products/hoodie-01.html') {
          await ev(`document.querySelector('.purchase-panel').scrollIntoView()`);
          fs.writeFileSync(`checks/shopify/product-${width}.png`,Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
        }
      }
      await ev(`document.querySelector('iframe[title="Cart toggle"]').contentDocument.querySelector('.shopify-buy__cart-toggle').click()`);
      await wait(`document.querySelector('.shopify-buy-frame--cart').classList.contains('is-active')`);
      await new Promise(resolve => setTimeout(resolve, 350)); // Native cart slide/line animation.
      const bag = await ev(`(()=>{const d=${cartDoc},b=d.querySelector('[data-element="cart.button"]');b.focus();const r=b.getBoundingClientRect();return {overflow:d.documentElement.scrollWidth>d.documentElement.clientWidth,reachable:r.top>=0&&r.bottom<=d.documentElement.clientHeight,focus:d.activeElement===b,height:r.height}})()`);
      assert(!bag.overflow);assert(bag.reachable);assert(bag.focus);assert(bag.height>=52);
      if(route==='products/hoodie-01.html') fs.writeFileSync(`checks/shopify/cart-${width}.png`,Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
      await ev(`${cartDoc}.querySelector('[data-element="cart.close"]').click()`);
      results.viewports.push({route,width,height,...layout});
    }
  }
  // Real same-tab handoff; no personal information or order submission.
  await visit('products/hoodie-01.html');
  await ev(`window.stayWideTrack=(name,data)=>sessionStorage.setItem('checkoutTest',JSON.stringify({name,data}));document.querySelector('iframe[title="Cart toggle"]').contentDocument.querySelector('.shopify-buy__cart-toggle').click();${cartDoc}.querySelector('[data-element="cart.button"]').click()`);
  await wait(`location.hostname==='zw8sj5-yw.myshopify.com'`);
  results.checkout = { host: await ev('location.hostname'), sameTab: true };
  await visit('index.html');
  const event = JSON.parse(await ev(`sessionStorage.getItem('checkoutTest')`));
  assert.equal(event.name,'begin_checkout');assert.equal(event.data.value,85);
  results.checkout.event = event.name;
  assert.deepEqual(c.errors,[]);
  results.errors=c.errors;
  fs.writeFileSync('checks/shopify/results.json',JSON.stringify(results,null,2));
  console.log('PASS: three live products; cross-page cart; quantity/removal; 25 layouts; iframe/touch/focus checks; gallery; same-tab hosted checkout; successful-add tracking.');
  c.close();
})().catch(error=>{console.error(error);process.exit(1)});
