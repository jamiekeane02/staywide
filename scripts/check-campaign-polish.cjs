/* Local homepage acceptance: preview :8080, dedicated Chrome :9223. */
const fs = require('node:fs'), assert = require('node:assert/strict');
(async () => {
  const c = await require('./shopify-cdp.cjs')();
  const { ev, send, visit, wait } = c, results = [];
  try {
    await visit('products/hoodie-01.html');
    await ev(`document.querySelector('[data-cookie-reject]').click();window.qaAdded=false;window.stayWideTrack=n=>{if(n==='add_to_cart')qaAdded=true};document.querySelector('[data-shopify-product] iframe').contentDocument.querySelector('button').click()`);
    await wait('qaAdded');
    await ev(`document.querySelector('iframe[title="YOUR BAG"]').contentDocument.querySelector('[data-element="cart.close"]').click()`);
    for (const [width,height] of [[375,812],[390,844],[430,932],[768,1024],[1024,768],[1366,768],[1440,900],[1440,1000],[1920,1080]]) {
      await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:2,mobile:width<700});
      await send('Emulation.setTouchEmulationEnabled',{enabled:width<700});
      await visit('index.html');
      await ev(`document.documentElement.style.scrollBehavior='auto';document.activeElement?.blur();window.scrollTo(0,0)`);
      const base = await ev(`(()=>{const i=document.querySelector('.campaign-media img'),r=i.getBoundingClientRect(),g=document.querySelector('.collection-grid').getBoundingClientRect(),f=document.querySelector('.site-footer').getBoundingClientRect(),introBottom=Math.max(...[...document.querySelector('.opening').children].map(e=>e.getBoundingClientRect().bottom));return {width:innerWidth,height:innerHeight,imageWidth:r.width,imageHeight:r.height,gapBefore:r.top-introBottom,gapAfter:document.querySelector('#shop').getBoundingClientRect().top-r.bottom,footerGap:f.top-g.bottom,firstRowTop:g.top,order:[...document.querySelector('main').children].map(e=>e.classList[0]),focalPosition:getComputedStyle(i).objectPosition,centered:Math.abs((r.left+r.right)-(g.left+g.right))<1,insideCollection:r.left>=g.left&&r.right<=g.right,overflow:document.documentElement.scrollWidth>innerWidth,loading:i.loading,priority:i.fetchPriority,alt:i.alt,linked:!!i.closest('a'),products:[...document.querySelectorAll('.collection-grid .product-card')].map(e=>({id:e.dataset.product,price:e.querySelector('.product-price').textContent,href:e.getAttribute('href'),top:e.getBoundingClientRect().top,left:e.getBoundingClientRect().left})),unwanted:/COMING SOON|DROP 001|€60|TO BE CONFIRMED/.test(document.body.innerText)};})()`);
      assert(!base.overflow&&!base.linked&&!base.unwanted&&base.insideCollection&&base.centered);
      assert.equal(base.loading,'eager'); assert.equal(base.priority,'high');
      assert.deepEqual(base.order,['opening','campaign-media','shop']);
      assert(base.imageHeight<=(width<700?300:430));
      assert.equal(base.gapBefore,width<700?24:30);
      assert.equal(base.gapAfter,width<700?28:width<1100?32:40);
      assert.equal(base.footerGap,width<1100?48:64);
      if(width<700) assert(base.firstRowTop<height,'First product row starts within the initial mobile viewport');
      assert.deepEqual(base.products.map(p=>p.id),['hoodie-01','hoodie-02','tshirt-01','tshirt-02']);
      assert.deepEqual(base.products.map(p=>p.price),['€55','€55','€25','€25']);
      if(width<1240) { assert.equal(base.products[0].top,base.products[1].top);assert.equal(base.products[2].top,base.products[3].top); }
      else assert(base.products.every(p=>p.top===base.products[0].top));
      await ev(`document.querySelector('.opening a').click()`);
      base.anchor = await ev(`({heading:document.querySelector('.collection-heading').getBoundingClientRect().top,headerBottom:document.querySelector('.site-header').getBoundingClientRect().bottom})`);
      assert(base.anchor.heading>=base.anchor.headerBottom);
      if(width>=1100) {
        for(const id of base.products.map(p=>p.id)) {
          const point = await ev(`(()=>{const r=document.querySelector('[data-product="${id}"] .product-image').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);
          await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});
          await wait(`!!document.querySelector('[data-product="${id}"] .image-secondary[data-ready]')`);
          await ev('new Promise(r=>setTimeout(r,200))');
          assert.equal(await ev(`getComputedStyle(document.querySelector('[data-product="${id}"] .image-secondary')).opacity`),'1');
        }
        base.hover='all four pass';
      }
      await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:0,y:0});
      await ev(`document.querySelector('.campaign-media img').scrollIntoView({block:'center'});document.querySelector('.campaign-media img').decode()`);
      await ev('new Promise(r=>setTimeout(r,450))');
      base.afterLoad = await ev(`(()=>{const i=document.querySelector('.campaign-media img'),r=i.getBoundingClientRect(),t=document.querySelector('.shopify-buy-frame--toggle')?.getBoundingClientRect(),f=document.querySelector('.site-footer').getBoundingClientRect();const overlaps=(a,b)=>a&&b&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;return {width:r.width,height:r.height,source:i.currentSrc,cartOverlapsCampaign:overlaps(r,t),cartOverlapsFooter:overlaps(f,t),toggle:t?.toJSON(),image:r.toJSON()}})()`);
      assert(Math.abs(base.afterLoad.height-base.imageHeight)<1,'Stable reserved image height');
      assert(!base.afterLoad.cartOverlapsCampaign&&!base.afterLoad.cartOverlapsFooter,'Cart remains clear of campaign/footer');
      const name=width+'x'+height;
      fs.writeFileSync(`checks/campaign-opening/campaign-${name}.png`,Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
      await ev('window.scrollTo(0,0)');
      const pageHeight=await ev('document.documentElement.scrollHeight');
      fs.writeFileSync(`checks/campaign-opening/home-${name}.png`,Buffer.from((await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:pageHeight,scale:1}})).data,'base64'));
      results.push(base);
    }
    assert.deepEqual(c.errors,[]);
    fs.writeFileSync('checks/campaign-opening/results.json',JSON.stringify({viewports:results,errors:c.errors},null,2)+'\n');
    console.log(results.map(r=>({viewport:r.width+'x'+r.height,image:[r.imageWidth,r.imageHeight],gap:r.gapBefore,cartOverlap:r.afterLoad.cartOverlapsCampaign,footerOverlap:r.afterLoad.cartOverlapsFooter})));
  } finally { c.close(); }
})().catch(error=>{console.error(error);process.exitCode=1});
