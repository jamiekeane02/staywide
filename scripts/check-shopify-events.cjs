/* Integration contract tests: no network, no fake storefront rendered. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('js/shopify-buy.js','utf8');
const flush = async () => { for(let i=0;i<20;i++) await Promise.resolve(); };
async function fixture({ mismatch=false, missing=false, cdn=false }={}) {
  const nodes = { mount:{hidden:true},status:{textContent:''},notice:{hidden:true},body:{dataset:{page:'product',product:'hoodie-01'},appendChild:n=>n} };
  const events=[],components={},timers=new Map();let timerId=0,clients=0;
  const variant={id:'gid://shopify/ProductVariant/1',available:true,price:{amount:'60.0',currencyCode:'EUR'},product:{id:'gid://shopify/Product/16690527011207'}};
  const product={id:'hoodie-01',name:'Blower Hoodie',price:60,currency:'EUR',shopifyProductId:'16690527011207',listed:true};
  const ui={createComponent(type,config){
    components[type]={config,model:type==='cart'?null:{id:'gid://shopify/Product/16690527011207',variants:[{...variant,price:{amount:mismatch?'65':'60',currencyCode:'EUR'}}]},selectedVariant:variant,selectedQuantity:1};
    if(type==='product'&&missing)return;
    config.options[type].events.beforeRender?.(components[type]);
    config.options[type].events.afterInit(components[type]);
    // Deliberately returns undefined, matching supplied CDN onReady wrapper.
  }};
  const window={stayWideConfig:{shopify:require('../js/site-config.js').shopify},stayWideCatalog:{products:[product]},stayWideTrack:(name,data)=>events.push({name,data})};
  if(!cdn)window.ShopifyBuy={buildClient(){clients++;return{}},UI:{onReady:async()=>ui}};
  let script;
  const document={body:nodes.body,scripts:[],querySelector:s=>({'[data-shopify-product]':nodes.mount,'[data-shopify-status]':nodes.status,'[data-shopify-error]':nodes.notice}[s]),head:{append(n){script=n}},createElement:()=>({listeners:{},addEventListener(name,cb){this.listeners[name]=cb}})};
  const context={window,document,console:{warn(){}},setTimeout(fn){timers.set(++timerId,fn);return timerId},clearTimeout(id){timers.delete(id)}};
  vm.runInNewContext(source,context);await flush();
  return {window,nodes,events,components,variant,timers,script,context,get clients(){return clients}};
}
(async()=>{
  const f=await fixture();assert.equal(f.window.stayWideShopify.status,'ready');assert.equal(f.nodes.mount.hidden,false);assert.equal(f.clients,1);
  vm.runInNewContext(source,f.context);assert.equal(f.clients,1,'duplicate loader guard');
  const p=f.components.product,c=f.components.cart,pe=p.config.options.product.events,ce=c.config.options.cart.events;
  pe.addVariantToCart(p);assert.equal(f.events.length,0,'click is not success');
  ce.afterRender(c);assert.equal(f.events.length,0,'optimistic render is not success');
  c.model={lineItems:[{title:'Blower Hoodie',variant:f.variant,quantity:1}],webUrl:'https://example.invalid/from-shopify',subtotalPriceV2:{amount:'60',currencyCode:'EUR'}};
  ce.afterRender(c);assert.equal(f.events.length,1);assert.equal(f.events[0].name,'add_to_cart');assert.equal(f.events[0].data.value,60);
  ce.afterRender(c);assert.equal(f.events.length,1,'render cannot duplicate event');
  pe.addVariantToCart(p);ce.updateItemQuantity(c);c.model={...c.model,lineItems:[{...c.model.lineItems[0],quantity:2}]};ce.afterRender(c);assert.equal(f.events.length,1,'quantity edit cannot confirm failed add');
  ce.openCheckout(c);assert.equal(f.events[1].name,'begin_checkout');assert(!f.events.some(e=>e.name==='purchase'));
  const mismatch=await fixture({mismatch:true});assert.equal(mismatch.nodes.mount.hidden,true);assert.equal(mismatch.window.stayWideShopify.status,'unavailable');
  const missing=await fixture({missing:true});for(const fn of [...missing.timers.values()])fn();await flush();assert.equal(missing.window.stayWideShopify.status,'unavailable');assert(missing.window.stayWideShopify.reason.includes('hoodie-01'));
  const cdn=await fixture({cdn:true});cdn.script.listeners.error();await flush();assert.equal(cdn.window.stayWideShopify.status,'unavailable');assert(cdn.nodes.mount.hidden);assert(!cdn.nodes.notice.hidden);
  console.log('PASS: single initialization; success-only/deduplicated add events; quantity cancellation; checkout event; no purchase; price mismatch; missing product; CDN failure.');
})().catch(e=>{console.error(e);process.exit(1)});
