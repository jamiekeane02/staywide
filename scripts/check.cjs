/* Local Chrome checks using its debugging protocol; no test dependency.
 * Start a dedicated headless Chrome on port 9222, then node scripts/check.cjs.
 */
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  const tabs = await (await fetch(`http://127.0.0.1:${process.env.CHROME_DEBUG_PORT || 9222}/json`)).json();
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
        if (await evaluate(`location.href === ${JSON.stringify(root + page)} && document.readyState === 'complete' && window.stayWideShopify?.status === 'ready'`)) break;
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
        assert(await evaluate(`!document.querySelector('#purchase-form') && !document.querySelector('[data-shopify-product]').hidden && document.querySelector('.detail-price').textContent.startsWith('€') && document.querySelector('.product-details').hidden`), 'Shopify controls; approved price; withheld editorial details');
      }
      results.push({ page, viewport: `${width}x${height}`, ...layout });
    }
  }
  assert.deepEqual(errors, []);
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
  console.log(`PASS: ${results.length} page/viewport checks, 2/3/4-card layouts, Shopify mounts, withheld unconfirmed details and gallery buttons (live commerce: check-shopify.cjs). No JS exceptions.`);
  socket.close();
})().catch(error => { console.error(error); process.exit(1); });
