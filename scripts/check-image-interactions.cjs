/* Local Chrome/CDP integration checks. No packages, no production network. */
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const root='http://127.0.0.1:8080/';
const catalog=require('../js/catalog.js');
const products=catalog.products.filter(p=>p.listed!==false);
function fixture(count) {
  const source=fs.readFileSync('js/catalog.js','utf8')+`\nconst fixtureProduct=stayWideCatalog.products[0];fixtureProduct.images=${count===1?'fixtureProduct.images.slice(0,1)':'[...fixtureProduct.images,{...fixtureProduct.images[0],view:"third view fixture"}]'};`;
  const output={};
  const fakeFS={...fs,readFileSync:(p,...args)=>p==='js/catalog.js'?source:fs.readFileSync(p,...args),writeFileSync:(p,s)=>{output[p]=s;},rmSync:()=>{}};
  vm.runInNewContext(fs.readFileSync('scripts/build.cjs','utf8'),{console:{log(){}},require:n=>n==='node:fs'?fakeFS:n.startsWith('./')?require(n):require(n),Intl});
  return {html:output['products/hoodie-01.html'],catalog:source};
}
(async()=>{
  const tabs=await(await fetch('http://127.0.0.1:9222/json')).json();
  const socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise(r=>socket.addEventListener('open',r,{once:true}));
  let id=0,intercept=null;const pending=new Map(),errors=[],requests=[],results=[];
  const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));});
  socket.addEventListener('message',e=>{
    const m=JSON.parse(e.data);
    if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);
    if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);
    if(m.method==='Fetch.requestPaused') {
      const p=m.params;
      if(intercept?.failure && p.request.url.includes(intercept.failure))send('Fetch.failRequest',{requestId:p.requestId,errorReason:'Failed'});
      else if(intercept?.html){const body=p.request.url.includes('/js/catalog.js')?intercept.catalog:intercept.html;send('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:p.request.url.includes('.js')?'text/javascript':'text/html'}],body:Buffer.from(body).toString('base64')});}
      else send('Fetch.continueRequest',{requestId:p.requestId});
    }
    if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}
  });
  const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  const pause=ms=>new Promise(r=>setTimeout(r,ms));
  async function until(expression,label){for(let n=0;n<150;n++){if(await ev(expression))return;await pause(20);}throw Error('Timed out: '+label);}
  async function visit(page){requests.length=0;await send('Page.navigate',{url:root+page});await until(`location.href===${JSON.stringify(root+page)}&&document.readyState==='complete'&&document.querySelector('#cart-open')?.disabled===false`,'navigation');await ev(`document.querySelector('[data-cookie-reject]').click();document.activeElement?.blur()`);}
  async function settled(){await until(`!document.querySelector('[data-gallery]')?.hasAttribute('aria-busy')`,'decoded gallery');await pause(170);}
  async function key(key){await send('Input.dispatchKeyEvent',{type:'keyDown',key,code:key});await send('Input.dispatchKeyEvent',{type:'keyUp',key,code:key});}
  async function move(selector){const p=await ev(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()`);await send('Input.dispatchMouseEvent',{type:'mouseMoved',...p});await pause(180);}
  async function swipe(dx,dy=0){const p=await ev(`(()=>{const r=document.querySelector('.gallery-frame').getBoundingClientRect();return{x:r.left+r.width*.55,y:r.top+r.height*.55}})()`);await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p.x+dx,y:p.y+dy}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await settled();}
  await send('Runtime.enable');await send('Page.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
  for(const [width,height] of [[375,812],[390,844],[430,932],[768,1024],[1440,1000]]){
    const mobile=width<700;
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:2,mobile});
    await send('Emulation.setTouchEmulationEnabled',{enabled:mobile,maxTouchPoints:2});
    await visit('index.html');
    assert.equal(await ev(`matchMedia('(hover:hover) and (pointer:fine)').matches`),!mobile,'Pointer emulation');
    assert.equal(await ev(`document.querySelectorAll('.collection-grid .product-card').length`),3);
    await ev(`document.documentElement.style.scrollBehavior='auto';document.querySelector('.collection-grid').scrollIntoView()`);
    for(const p of products){
      const card=`.collection-grid [data-product="${p.id}"]`;
      if(mobile){
        assert(await ev(`!document.querySelector(${JSON.stringify(card)}+' .image-secondary')`),'No touch hover download');
      }else{
        await until(`document.querySelector(${JSON.stringify(card)}+' .image-secondary[data-ready]')`,'prepared hover');
        await move(card+' .product-image');
        assert.equal(await ev(`getComputedStyle(document.querySelector(${JSON.stringify(card)}+' .image-secondary')).opacity`),'1');
        const rect=await ev(`document.querySelector(${JSON.stringify(card)}).getBoundingClientRect().height`);
        await move(card+' .product-caption');
        assert.equal(await ev(`getComputedStyle(document.querySelector(${JSON.stringify(card)}+' .image-secondary')).opacity`),'0','Caption is not image hover');
        assert.equal(await ev(`document.querySelector(${JSON.stringify(card)}).getBoundingClientRect().height`),rect);
        const source=await ev(`document.querySelector(${JSON.stringify(card)}+' .image-secondary img').currentSrc`);
        assert(source.includes(p.id+'-detail-')&&/-[48]00\.webp$|-480\.webp$/.test(source),source);
      }
    }
    if(mobile){
      assert(!requests.some(u=>u.includes('-detail-')),'Mobile homepage requests no hover detail');
      const r=await ev(`(()=>{const r=document.querySelector('.collection-grid .product-image').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()`);
      await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[r]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await until(`location.pathname==='/products/hoodie-01.html'`,'one-tap PDP');
    }else{
      await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:2,y:2});
      await key('Tab');await ev(`document.querySelector('.collection-grid .product-card').focus()`);await pause(180);
      assert(await ev(`document.activeElement.matches(':focus-visible')&&getComputedStyle(document.activeElement.querySelector('.image-secondary')).opacity==='1'`),'Keyboard image preview');
      await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
      assert.equal(await ev(`getComputedStyle(document.querySelector('.image-secondary')).transitionDuration`),'0s');
      await send('Emulation.setEmulatedMedia',{features:[]});
    }
    for(const p of products){
      await visit(`products/${p.id}.html`);
      const geometry=await ev(`({frame:document.querySelector('.gallery-frame').getBoundingClientRect().height,purchase:document.querySelector('.purchase-panel').getBoundingClientRect().top})`);
      assert(await ev(`document.querySelector('[data-gallery-current]').textContent==='1'&&document.querySelector('[data-gallery-previous]').getAttribute('aria-disabled')==='true'&&[...document.querySelectorAll('.gallery-arrow')].every(b=>b.offsetWidth>=44&&b.offsetHeight>=44)`));
      await ev(`document.querySelector('[data-gallery-next]').click()`);await settled();
      assert(await ev(`document.querySelector('[data-gallery-current]').textContent==='2'&&!document.querySelector('#image-1').hidden&&document.querySelector('#image-0').hidden&&document.querySelector('[data-gallery-next]').getAttribute('aria-disabled')==='true'`));
      await ev(`document.querySelector('[data-gallery-next]').click()`);await settled();
      assert.equal(await ev(`document.querySelector('[data-gallery-current]').textContent`),'2','No loop');
      assert.deepEqual(await ev(`({frame:document.querySelector('.gallery-frame').getBoundingClientRect().height,purchase:document.querySelector('.purchase-panel').getBoundingClientRect().top})`),geometry,'Stable image/purchase geometry');
      await ev(`document.querySelector('[data-gallery]').focus({preventScroll:true})`);await key('ArrowLeft');await settled();
      assert.equal(await ev(`document.querySelector('[data-gallery-current]').textContent`),'1');
      await key('Tab');assert(await ev(`document.activeElement.hasAttribute('data-gallery-previous')`),'Tab reaches previous');
      await key('Tab');assert(await ev(`document.activeElement.hasAttribute('data-gallery-next')`),'Tab reaches next');
      await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await settled();
      assert.equal(await ev(`document.querySelector('[data-gallery-current]').textContent`),'2');
      await key('ArrowLeft');await settled();
      if(mobile){
        await ev(`document.querySelector('[data-gallery]').scrollIntoView({behavior:'instant',block:'center'})`);
        await swipe(-100);assert.equal(await ev(`document.querySelector('[data-gallery-current]').textContent`),'2','Swipe next');
        await swipe(100);assert.equal(await ev(`document.querySelector('[data-gallery-current]').textContent`),'1','Swipe previous');
        await swipe(10,-70);assert.equal(await ev(`document.querySelector('[data-gallery-current]').textContent`),'1','Vertical scroll does not navigate');
      }
      assert(await ev(`document.documentElement.scrollWidth<=innerWidth`));
      results.push({product:p.id,viewport:`${width}x${height}`,dpr:2,arrows:'pass',keyboard:'pass',swipe:mobile?'pass':'not applicable',layout:'stable'});
      if(width===390||width===1440){await pause(700);await ev(`document.activeElement?.blur();window.scrollTo({top:0,behavior:'instant'})`);await until('scrollY===0','screenshot scroll reset');await pause(100);const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`checks/gallery-${p.id}-${width}.png`,Buffer.from(shot.data,'base64'));}
    }
  }
  // Browser-only catalogue/build fixtures. No real source or public output is changed.
  await send('Fetch.enable',{patterns:[{urlPattern:'*products/hoodie-01.html'},{urlPattern:'*js/catalog.js'}]});
  for(const count of [1,3]){
    intercept=fixture(count);await visit('products/hoodie-01.html');
    assert.equal(await ev(`document.querySelectorAll('.gallery-panel').length`),count);
    if(count===1)assert(await ev(`!document.querySelector('[data-gallery]')&&!document.querySelector('.gallery-arrow')&&!document.querySelector('.gallery-counter')`));
    else{for(const expected of ['2','3']){await ev(`document.querySelector('[data-gallery-next]').click()`);await settled();assert.equal(await ev(`document.querySelector('[data-gallery-current]').textContent`),expected);}assert(await ev(`document.querySelector('[data-gallery-next]').getAttribute('aria-disabled')==='true'`));}
  }
  await send('Fetch.disable');intercept=null;
  // Failed detail load must leave the primary visible and the count unchanged.
  await send('Fetch.enable',{patterns:[{urlPattern:'*hoodie-01-detail-*'}]});intercept={failure:'hoodie-01-detail-'};
  await visit('products/hoodie-01.html');await ev(`document.querySelector('[data-gallery-next]').click()`);await settled();
  assert(await ev(`!document.querySelector('#image-0').hidden&&document.querySelector('[data-gallery-current]').textContent==='1'&&document.querySelector('[data-gallery-error]').textContent.includes('try again')`));
  await send('Fetch.disable');intercept=null;
  await ev(`document.querySelector('[data-gallery-next]').click()`);await settled();
  const recovered=await ev(`document.querySelector('[data-gallery-current]').textContent`)==='2';
  assert.deepEqual(errors,[]);
  fs.writeFileSync('checks/image-interactions-results.json',JSON.stringify({results,hover:'image area only; decoded before reveal',mobileCards:'one tap; no hover downloads',reducedMotion:'pass',singleImage:'pass',threeImages:'pass',failedImage:'primary retained',failedImageRecovery:recovered?'pass':'fail',runtimeErrors:errors},null,2));
  assert(recovered, 'Failed-image retry did not recover (existing gallery failure-marker condition)');
  console.log(`PASS: ${results.length} product/viewport cases; desktop hover/focus/reduced motion, touch one-tap/no secondary downloads, gallery buttons/swipes/keyboard/count/boundaries, 1/3-image fixtures and failed-image fallback.`);
  socket.close();
})().catch(e=>{console.error(e);process.exit(1)});
