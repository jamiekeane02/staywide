/* Browser network + consent checks against the local preview, using Chrome CDP. */
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  const tabs = await (await fetch('http://127.0.0.1:9222/json')).json();
  const socket = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  let id = 0; const pending = new Map(); const requests = []; const errors = [];
  socket.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (m.method === 'Network.requestWillBeSent') requests.push(m.params.request.url);
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails);
    if (m.id) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(m.error) : p.resolve(m.result); }
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => { const n = ++id; pending.set(n, { resolve, reject }); socket.send(JSON.stringify({ id: n, method, params })); });
  const ev = async expression => { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if(r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
  const root = 'http://127.0.0.1:8080/';
  async function visit(route) {
    await send('Page.navigate', { url: root + route });
    for (let i = 0; i < 100; i++) {
      if (await ev(`location.href===${JSON.stringify(root + route)} && document.readyState==='complete'`)) return;
      await new Promise(r => setTimeout(r, 30));
    }
    throw Error('Navigation timeout: ' + route);
  }
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
  const results = [];
  for (const [width,height] of [[375,812],[390,844],[430,932],[1440,1000]]) {
    await send('Emulation.setDeviceMetricsOverride', { width,height,deviceScaleFactor:1,mobile:width<700 });
    await visit('index.html'); await ev(`localStorage.clear()`); await visit('index.html');
    assert(await ev(`!document.querySelector('#cookie-panel').hidden && !stayWideConsent.get().analytics && !stayWideConsent.get().advertising`));
    assert(await ev(`(()=>{const p=document.querySelector('#cookie-panel');return p.scrollWidth<=p.clientWidth && p.getBoundingClientRect().height<innerHeight*.7+1 && [...p.querySelectorAll('.cookie-actions button')].every(b=>b.getBoundingClientRect().height>=44)})()`));
    if(width===390) {
      const shot=await send('Page.captureScreenshot',{format:'png'}); fs.writeFileSync('checks/consent-mobile.png',Buffer.from(shot.data,'base64'));
    }
    await ev(`document.querySelector('[data-cookie-manage]').click()`);
    assert(await ev(`!document.querySelector('#consent-analytics').checked && !document.querySelector('#consent-advertising').checked && document.activeElement.id==='consent-analytics'`));
    assert(await ev(`document.querySelector('#cookie-panel').scrollWidth<=document.querySelector('#cookie-panel').clientWidth`));
    await ev(`document.querySelector('#consent-analytics').click();document.querySelector('[data-cookie-save]').click()`);
    assert(await ev(`stayWideConsent.get().analytics && !stayWideConsent.get().advertising && document.querySelector('#cookie-panel').hidden`));
    await visit('products/hoodie-01.html?size=M');
    assert(await ev(`stayWideConsent.get().analytics && document.querySelector('#cookie-panel').hidden && document.querySelector('[rel=canonical]').href==='https://staywide.com/products/hoodie-01.html'`));
    await ev(`document.querySelector('[data-cookie-settings]').click();document.querySelector('#consent-analytics').click();document.querySelector('#consent-advertising').click();document.querySelector('[data-cookie-save]').click()`);
    assert(await ev(`!stayWideConsent.get().analytics && stayWideConsent.get().advertising`));
    await ev(`document.querySelector('[data-cookie-settings]').click();document.querySelector('[data-cookie-reject]').click()`);
    assert(await ev(`!stayWideConsent.get().analytics && !stayWideConsent.get().advertising`));
    await ev(`document.querySelector('[data-cookie-settings]').click();document.querySelector('[data-cookie-accept]').click()`);
    assert(await ev(`stayWideConsent.get().analytics && stayWideConsent.get().advertising && !window.gtag && !window.fbq && stayWideTrack('add_to_cart')===false`));
    await ev(`document.querySelector('[data-cookie-settings]').click()`);
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    assert(await ev(`document.querySelector('#cookie-panel').hidden && document.activeElement.hasAttribute('data-cookie-settings')`));
    await ev(`localStorage.setItem('staywide.consent','{invalid')`); await visit('info.html');
    assert(await ev(`!stayWideConsent.get().analytics && !document.querySelector('#cookie-panel').hidden`));
    await ev(`localStorage.setItem('staywide.consent',JSON.stringify({version:1,savedAt:1,analytics:true,advertising:true}))`); await visit('info.html');
    assert(await ev(`!stayWideConsent.get().analytics`));
    await ev(`localStorage.removeItem('staywide.consent');window.dispatchEvent(new StorageEvent('storage',{key:'staywide.consent'}))`);
    assert(await ev(`!stayWideConsent.get().advertising`));
    await visit('missing/deep/page');
    assert(await ev(`document.querySelector('h1').textContent==='Page not found.' && document.documentElement.scrollWidth<=innerWidth && document.querySelector('main a').href===${JSON.stringify(root+'index.html#shop')}`));
    results.push({viewport:`${width}x${height}`,consent:'pass',notFound:'pass'});
  }
  // Blocked storage must remain usable and fail closed on the next page.
  await visit('index.html');
  await ev(`Storage.prototype.setItem=function(){throw new Error('Blocked storage')};document.querySelector('[data-cookie-reject]').click()`);
  assert(await ev(`document.querySelector('#cookie-status').textContent.includes('could not save') && !stayWideConsent.get().analytics`));
  // All metadata and product text must survive with JavaScript disabled.
  await send('Emulation.setScriptExecutionDisabled',{value:true});
  for(const page of ['index.html','info.html','products/hoodie-01.html','products/tshirt-01.html','products/tshirt-02.html']) {
    await visit(page);
    assert(await ev(`document.querySelectorAll('h1').length===1 && document.querySelectorAll('title').length===1 && document.querySelectorAll('meta[name=description]').length===1 && document.querySelectorAll('[rel=canonical]').length===1 && !document.querySelector('meta[name=robots]')`));
    assert(await ev(`document.querySelector('meta[property="og:image"]') && [...document.images].filter(i=>i.loading!=='lazy').every(i=>i.complete && i.naturalWidth>0)`));
    if(page.startsWith('products')) assert(await ev(`document.querySelector('.dispatch').textContent.includes('Estimated dispatch') && document.querySelector('.description-placeholder').textContent && document.querySelector('.detail-price').textContent`));
  }
  await send('Emulation.setScriptExecutionDisabled',{value:false});
  assert.equal((await fetch(root+'missing/deep/page')).status,404);
  assert.equal((await fetch(root+'products/hoodie-02.html')).status,404);
  assert.equal((await fetch(root+'templates/home.html')).status,404);
  assert.deepEqual(errors,[]);
  const external = requests.filter(u=>/^https?:/.test(u) && !u.startsWith(root));
  assert.deepEqual(external,[], 'No external requests, even after accept with blank IDs');
  fs.writeFileSync('checks/readiness-results.json',JSON.stringify({results,externalRequests:external,runtimeErrors:errors,requestsObserved:requests.length,staticHTML:'pass',storageFallback:'pass',http404:'pass'},null,2));
  console.log('PASS: consent, persistence, category withdrawal, blank-ID network silence, malformed/expired/blocked storage, static metadata/content, mobile 404.');
  socket.close();
})().catch(e=>{console.error(e);process.exit(1)});
