/* Real imagery / responsive layout QA. Requires local preview and Chrome on :9222. */
const fs = require('node:fs');
const assert = require('node:assert/strict');
const products = require('../js/catalog.js').products.filter(p => p.listed !== false);
(async () => {
  const tabs = await (await fetch(`http://127.0.0.1:${process.env.CHROME_DEBUG_PORT || 9222}/json`)).json();
  const socket = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once:true }));
  let id=0;const pending=new Map(),errors=[],failed=[],results=[];
  socket.addEventListener('message',e=>{
    const m=JSON.parse(e.data);
    if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);
    if(m.method==='Network.responseReceived' && m.params.response.status>=400)failed.push(m.params.response.url);
    if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}
  });
  const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));});
  const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  await send('Runtime.enable');await send('Page.enable');await send('Network.enable');
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`window.assetQA={lcp:null,cls:0};new PerformanceObserver(list=>{for(const e of list.getEntries())window.assetQA.lcp={tag:e.element?.tagName,url:e.url||'',text:e.element?.textContent?.slice(0,80),ms:Math.round(e.startTime)};}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.assetQA.cls+=e.value;}).observe({type:'layout-shift',buffered:true});`});
  const root='http://127.0.0.1:8080/';
  for(const [width,height] of [[375,812],[390,844],[430,932],[1440,1000]]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:2,mobile:width<700});
    for(const page of ['index.html',...products.map(p=>`products/${p.id}.html`)]) {
      await send('Page.navigate',{url:root+page});
      let ready=false;
      for(let i=0;i<100;i++){
        ready=await ev(`location.href===${JSON.stringify(root+page)}&&document.readyState==='complete'&&!document.querySelector('#cart-open')?.disabled`);
        if(ready)break;await new Promise(r=>setTimeout(r,30));
      }
      assert(ready,`Navigation: ${page}`);
      await ev(`document.querySelector('[data-cookie-reject]').click();Promise.all([...document.images].filter(i=>i.loading!=='lazy').map(i=>i.decode()))`);
      await new Promise(r=>setTimeout(r,120));
      const initialPerformance=await ev('window.assetQA');
      const layout=await ev(`(()=>{const header=document.querySelector('.site-header'),logo=header.querySelector('img'),nav=header.querySelector('nav');return {overflow:document.documentElement.scrollWidth>innerWidth,headerHeight:header.offsetHeight,logoLoaded:!!logo?.naturalWidth,headerFits:logo.getBoundingClientRect().right<nav.getBoundingClientRect().left};})()`);
      assert(!layout.overflow && layout.logoLoaded && layout.headerFits && layout.headerHeight<62,`${page}: header/layout at ${width}`);
      if(page==='index.html') {
        const cards=await ev(`[...document.querySelectorAll('.collection-grid .product-card')].map(c=>{const r=c.getBoundingClientRect();return {id:c.dataset.product,href:c.getAttribute('href'),left:r.left,top:r.top,width:r.width};})`);
        assert.deepEqual(cards.map(c=>c.id),['hoodie-01','tshirt-01','tshirt-02']);
        assert(cards.every(c=>c.href===`products/${c.id}.html`));
        if(width>=700)assert(cards.every(c=>Math.abs(c.top-cards[0].top)<1),'Three desktop columns');
        else {assert(Math.abs(cards[2].left+cards[2].width/2-width/2)<1,'Centred third card');assert(Math.abs(cards[2].width-cards[0].width)<1,'Equal mobile image sizes');}
        assert(await ev(`!document.querySelector('a[href*="hoodie-02"]')&&!document.querySelector('.garment')`));
        await ev(`document.querySelector('.collection-grid').scrollIntoView({behavior:'instant'});Promise.all([...document.querySelectorAll('.collection-grid img')].map(i=>i.decode()))`);
      } else {
        assert(await ev(`document.querySelector('#image-0 img').loading==='eager'&&document.querySelector('#image-0 img').fetchPriority==='high'&&document.querySelector('#image-1 img').loading==='lazy'`));
        await ev(`document.querySelector('[data-gallery-next]').click();document.querySelector('#image-1 img').decode()`);
        await ev(`(async()=>{while(document.querySelector('[data-gallery]').hasAttribute('aria-busy'))await new Promise(r=>setTimeout(r,10));})()`);
        assert(await ev(`document.querySelectorAll('.gallery-panel').length===2&&!document.querySelector('#image-1').hidden&&document.querySelector('#image-1 img').naturalWidth>0`));
        await ev(`(async()=>{document.querySelector('[data-gallery-previous]').click();while(document.querySelector('[data-gallery]').hasAttribute('aria-busy'))await new Promise(r=>setTimeout(r,10));})()`);
      }
      const images=await ev(`Promise.all([...document.querySelectorAll('.collection-grid .image-primary img,.gallery-panel img')].map(async i=>{await i.decode();return {src:i.currentSrc.replace(location.origin+'/',''),alt:i.alt,width:i.width,height:i.height,fit:getComputedStyle(i).objectFit,bytes:performance.getEntriesByName(i.currentSrc).at(-1)?.decodedBodySize||0};}))`);
      assert(images.every(i=>i.alt && i.fit==='contain' && i.src.startsWith('assets/products/')));
      assert(images.every(i=>i.bytes<1200000),'Oversized responsive image');
      results.push({page,viewport:`${width}x${height}`,dpr:2,...layout,initialPerformance,images});
      if(page==='index.html' && (width===390||width===1440)) {
        await ev(`document.activeElement?.blur();window.scrollTo({top:0,behavior:'instant'});new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))`);
        const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:await ev('document.documentElement.scrollHeight'),scale:1}});
        fs.writeFileSync(`checks/assets-home-${width}.png`,Buffer.from(shot.data,'base64'));
      }
      if(page.startsWith('products/') && width===390) {
        await ev(`document.activeElement?.blur();window.scrollTo({top:0,behavior:'instant'});new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))`);
        const shot=await send('Page.captureScreenshot',{format:'png'});
        fs.writeFileSync(`checks/assets-${page.split('/')[1].replace('.html','')}-390.png`,Buffer.from(shot.data,'base64'));
      }
    }
  }
  // Verify every derivative and share asset, not just the browser-selected srcset candidate.
  const manifest=JSON.parse(fs.readFileSync('checks/asset-manifest.json','utf8'));
  for(const item of manifest.outputs){
    const response=await fetch(root+item.file);assert.equal(response.status,200,item.file);
    const dimensions=await ev(`(async()=>{const i=new Image();i.src=${JSON.stringify(root+item.file)};await i.decode();return [i.naturalWidth,i.naturalHeight];})()`);
    assert.deepEqual(dimensions,[item.width,item.height],item.file);
  }
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  fs.writeFileSync('checks/asset-results.json',JSON.stringify({results,errors,failed,derivativesVerified:manifest.outputs.length},null,2));
  console.log(`PASS: ${results.length} high-density page/viewport checks; logo, three-card layout, product routes, real imagery, gallery loading, ${manifest.outputs.length} derivative dimensions; no failed assets or runtime errors.`);
  socket.close();
})().catch(e=>{console.error(e);process.exit(1)});
