/* Local Chrome checks using its debugging protocol; no test dependency.
 * Start a dedicated headless Chrome on port 9222, then node scripts/check.cjs.
 */
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  const tabs = await (await fetch('http://127.0.0.1:9222/json')).json();
  const socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  let sequence = 0;
  const pending = new Map();
  const errors = [];
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    if (message.id) { const task = pending.get(message.id); pending.delete(message.id); message.error ? task.reject(message.error) : task.resolve(message.result); }
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  await send('Runtime.enable');
  await send('Page.enable');
  const root = 'http://127.0.0.1:8080/';
  const pages = ['index.html', 'info.html', ...fs.readdirSync('products').filter(file => file.endsWith('.html')).map(file => 'products/' + file)];
  const results = [];
  const productCount = require('../js/catalog.js').products.filter(p => p.listed !== false).length;
  for (const [width, height] of [[375,812],[390,844],[430,932],[768,1024],[1440,1000]]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 700 });
    for (const page of pages) {
      await send('Page.navigate', { url: root + page });
      // Wait for this document's deferred scripts, not a previous document.
      for (let retry = 0; retry < 50; retry++) {
        if (await evaluate(`location.href === ${JSON.stringify(root + page)} && document.readyState === 'complete' && document.querySelector('#cart-open')?.disabled === false`)) break;
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      await evaluate(`document.querySelector('[data-cookie-reject]').click()`);
      const layout = await evaluate(`({width: innerWidth, scroll: document.documentElement.scrollWidth, cards: document.querySelectorAll('.collection-grid .product-card').length, firstProduct: document.querySelector('.collection-grid')?.getBoundingClientRect().top, headerFits: document.querySelector('nav').getBoundingClientRect().left >= document.querySelector('.site-header .wordmark').getBoundingClientRect().right})`);
      assert(layout.scroll <= layout.width, `${page} overflow at ${width}`);
      assert(layout.headerFits, `${page} header collision at ${width}`);
      if (page === 'index.html') {
        assert(layout.firstProduct < height, 'Products below first mobile viewport');
        for (const count of [2,3,4]) {
          await evaluate(`(() => {const grid=document.querySelector('.collection-grid');window.originalGrid ||= grid.innerHTML;grid.innerHTML=window.originalGrid;while(grid.children.length<${count})grid.append(grid.firstElementChild.cloneNode(true));})()`);
          assert(await evaluate(`(() => {const cards=[...document.querySelectorAll('.collection-grid .product-card')];cards.forEach((card,i)=>card.hidden=i>=${count});return document.documentElement.scrollWidth<=innerWidth})()`));
        }
      }
      if (page === 'index.html') await evaluate(`document.querySelector('.collection-grid').innerHTML=window.originalGrid`);
      await evaluate(`document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,300);document.querySelector('#cart-open').focus({preventScroll:true});window.beforeCartY=scrollY;document.querySelector('#cart-open').click()`);
      assert(await evaluate(`document.querySelector('#cart-dialog').open && document.querySelector('#checkout').disabled`));
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await new Promise(resolve => setTimeout(resolve, 50));
      assert(await evaluate(`!document.querySelector('#cart-dialog').open && document.activeElement.id==='cart-open' && scrollY===window.beforeCartY`), 'Cart close/focus/scroll');
      if (page.startsWith('products/')) {
        assert.equal(await evaluate(`document.querySelector('[name=size]:checked')===null`), true);
        await evaluate(`document.querySelector('[data-gallery-next]').click()`);
        await evaluate(`(async()=>{while(document.querySelector('[data-gallery]').hasAttribute('aria-busy'))await new Promise(r=>setTimeout(r,10));})()`);
        assert(await evaluate(`!document.querySelector('#image-1').hidden && document.querySelector('#image-0').hidden`));
        if (width < 700) {
          await evaluate(`document.querySelector('.gallery-frame').scrollIntoView();document.querySelector('[data-gallery-previous]').click()`);
          const point = await evaluate(`(() => {const r=document.querySelector('.gallery-frame').getBoundingClientRect();return {x:r.left+r.width*.8,y:Math.max(100,r.top+100)}})()`);
          await send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[point]});
          await send('Input.dispatchTouchEvent', {type:'touchMove',touchPoints:[{x:point.x-100,y:point.y}]});
          await send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
          await evaluate(`(async()=>{while(document.querySelector('[data-gallery]').hasAttribute('aria-busy'))await new Promise(r=>setTimeout(r,10));})()`);
        assert(await evaluate(`!document.querySelector('#image-1').hidden`), 'Swipe gallery');
        }
        if (page.endsWith('tshirt-02.html')) {
          assert(await evaluate(`document.querySelector('.add-to-cart').disabled && [...document.querySelectorAll('[name=size]')].every(input=>input.disabled)`));
        } else {
          await evaluate(`document.querySelector('.add-to-cart').click()`);
          assert(await evaluate(`document.activeElement.name==='size' && document.querySelector('#size-status').textContent.includes('Choose')`), `Size validation ${page} ${width}: ${await evaluate('document.activeElement.outerHTML')}`);
          await evaluate(`document.querySelector('[name=size]:not(:disabled)').click();document.querySelector('.add-to-cart').click()`);
          assert(await evaluate(`document.querySelector('#purchase-status').textContent.includes('nothing was added') && document.querySelector('.cart-count').textContent==='0'`));
        }
        await evaluate(`document.querySelector('.fit-note a').click()`);
        assert(await evaluate(`document.querySelector('#size-guide').open`));
        await new Promise(resolve => setTimeout(resolve, 100));
        await evaluate(`document.querySelector('summary').focus()`);
        await send('Input.dispatchKeyEvent', { type:'keyDown', key:'Enter', code:'Enter', text:'\r', windowsVirtualKeyCode:13 });
        await send('Input.dispatchKeyEvent', { type:'keyUp', key:'Enter', code:'Enter', windowsVirtualKeyCode:13 });
        assert(await evaluate(`!document.querySelector('#size-guide').open`), `Accordion keyboard at ${page} ${width}; focus: ${await evaluate('document.activeElement.outerHTML')}`);
      }
      results.push({ page, viewport: `${width}x${height}`, ...layout });
    }
  }
  assert.deepEqual(errors, []);
  // Inspect a cart line in isolation without simulating a customer cart or checkout.
  await evaluate(`document.querySelector('#cart-lines').append(document.querySelector('#cart-line-template').content.cloneNode(true));document.querySelector('[data-cart-title]').textContent='[TEST PRODUCT]';document.querySelector('[data-cart-size]').textContent='Size: XXL';document.querySelector('[data-cart-dispatch]').textContent='Expected dispatch: [DATE RANGE TO BE CONFIRMED]';document.querySelector('#cart-open').click()`);
  assert(await evaluate(`document.querySelector('#cart-dialog').scrollWidth<=document.querySelector('#cart-dialog').clientWidth`), 'Cart line fits');
  await evaluate(`document.querySelector('#cart-dialog').close()`);
  await send('Emulation.setScriptExecutionDisabled', {value:true});
  await send('Page.navigate', {url:root+'index.html'});
  await new Promise(resolve=>setTimeout(resolve,150));
  assert(await evaluate(`document.querySelectorAll('.collection-grid .product-card').length===${productCount}`), 'Static products without JavaScript');
  await send('Emulation.setScriptExecutionDisabled', {value:false});
  fs.mkdirSync('checks', { recursive: true });
  fs.writeFileSync('checks/results.json', JSON.stringify(results, null, 2));
  for (const [page, width, height, name] of [['index.html',390,844,'home-mobile'],['products/hoodie-01.html',390,844,'product-mobile'],['index.html',1440,1000,'home-desktop']]) {
    await send('Emulation.setDeviceMetricsOverride', { width,height,deviceScaleFactor:1,mobile:width<700 });
    await send('Page.navigate', {url:root+page});
    await new Promise(resolve=>setTimeout(resolve,250));
    const shot=await send('Page.captureScreenshot',{format:'png'});
    fs.writeFileSync(`checks/${name}.png`,Buffer.from(shot.data,'base64'));
  }
  console.log(`PASS: ${results.length} page/viewport checks, 2/3/4-card layouts, size validation, sold out, gallery buttons, keyboard accordions, cart Escape/focus/scroll and disabled checkout. No JS exceptions.`);
  socket.close();
})().catch(error => { console.error(error); process.exit(1); });
