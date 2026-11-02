/* Isolated fake SDK environment: no network and no IDs written to site config. */
const vm = require('node:vm');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const code = fs.readFileSync('js/tracking.js','utf8');
function fixture(ids = true, product = false) {
  let choice = { analytics:false, advertising:false };
  const scripts = [], cookies = [], listeners = {};
  let reloads = 0;
  const document = { head:{append:s=>scripts.push(s.src)},createElement:()=>({}),body:{dataset:{product:product?'real-item':undefined}} };
  Object.defineProperty(document,'cookie',{get:()=> '_ga=1; _ga_TEST=2; _fbp=3; _fbc=4; unrelated=5',set:v=>cookies.push(v)});
  const window = { stayWideConfig: {GA_MEASUREMENT_ID:ids?'G-TESTONLY':'',META_PIXEL_ID:ids?'123456789':''},
    stayWideConsent:{get:()=>({...choice})},addEventListener:(name,fn)=>listeners[name]=fn,
    stayWideCatalog:{products: product ? [{id:'real-item',name:'Test garment',development:false,price:12,currency:'EUR'}] : []} };
  vm.runInNewContext(code,{window,document,location:{hostname:'shop.example.test',origin:'https://shop.example.test',pathname:'/products/real-item.html',reload:()=>reloads++},Set,Date});
  return {window,scripts,cookies,get reloads(){return reloads},set(a,b){choice={analytics:a,advertising:b};listeners['staywide:consent']()},gaEvents(){return (window.dataLayer||[]).filter(a=>a[0]==='event')},metaEvents(){return (window.fbq?.queue||[]).filter(a=>a[0]==='track')} };
}
let f = fixture(false); f.set(true,true);
assert.equal(f.scripts.length,0); assert.equal(f.window.stayWideTrack('purchase'),false);
f=fixture(); assert.equal(f.scripts.length,0); assert.equal(f.window.stayWideTrack('add_to_cart'),false);
f.set(true,false); assert.equal(f.scripts.length,1); assert(f.scripts[0].includes('gtag/js'));
assert.deepEqual(Array.from(f.gaEvents(),a=>a[1]),['page_view']); assert.equal(f.window.fbq,undefined);
f.set(true,false); assert.equal(f.scripts.length,1); assert.equal(f.gaEvents().length,1);
f.window.stayWideTrack('size_selection'); assert.equal(f.gaEvents().length,1);
f.set(true,true); assert.equal(f.scripts.length,2); assert.equal(f.metaEvents()[0][1],'PageView');
assert.equal(f.window.stayWideTrack('email_signup',{email:'never@example.test'}),true);
assert.equal(f.gaEvents().at(-1)[2].email,undefined); assert.equal(f.metaEvents().length,1);
f.window.stayWideTrack('add_to_cart',{currency:'EUR',value:12,items:[{item_id:'real-item',quantity:1,price:12}]});
assert.equal(f.gaEvents().at(-1)[1],'add_to_cart'); assert.equal(f.metaEvents().at(-1)[1],'AddToCart');
// Withdraw while SDKs are still queued: drop pending events, disable GA, revoke Meta, reload.
f.set(false,false); assert.equal(f.reloads,1); assert.equal(f.window['ga-disable-G-TESTONLY'],true);
assert.equal(f.gaEvents().length,0); assert.equal(f.metaEvents().length,0);
assert(f.cookies.some(s=>s.startsWith('_ga='))); assert(f.cookies.some(s=>s.startsWith('_fbp=')));
assert(!f.cookies.some(s=>s.startsWith('unrelated='))); assert.equal(f.window.stayWideTrack('purchase'),false);
f=fixture(true,true); f.set(false,true); assert.equal(f.scripts.length,1); assert(f.scripts[0].includes('facebook.net'));
assert.deepEqual(Array.from(f.metaEvents(),a=>a[1]),['PageView','ViewContent']); assert.equal(f.window.gtag,undefined);
f.set(false,true); assert.equal(f.metaEvents().length,2);
f=fixture(true,true); f.set(true,false); assert.deepEqual(Array.from(f.gaEvents(),a=>a[1]),['page_view','view_item']);
console.log('PASS: isolated tracking gates, independent categories, blank IDs, no replay, view deduplication, event mapping, field filtering and withdrawal during SDK load. No network used.');
