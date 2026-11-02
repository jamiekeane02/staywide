const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const products = require('../js/catalog.js').products.filter(p => p.listed !== false);
const config = require('../js/site-config.js');
const { head, productSchema } = require('./metadata.cjs');
for(const page of ['index.html','info.html',...products.map(p=>'products/'+p.id+'.html'),'404.html']) {
  const html=fs.readFileSync(page,'utf8');
  assert(!html.includes('{{'), 'Unexpanded template in '+page);
  assert(!/preorder|PreOrder|AggregateRating|gtin|mpn/i.test(html));
  for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const ref=match[1].replaceAll('&amp;','&');
    if(/^(?:https?:|data:|#)/.test(ref)) continue;
    const file=ref.split('#')[0].split('?')[0];
    const target=ref.startsWith('/')?'.'+file:path.join(path.dirname(page),file);
    assert(fs.existsSync(target),`${page}: missing ${ref}`);
  }
  for(const match of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) JSON.parse(match[1]);
}
assert.equal(fs.readFileSync('robots.txt','utf8').includes('Sitemap: https://staywide.cc/sitemap.xml'), config.domainConfirmed);
assert.equal((fs.readFileSync('sitemap.xml','utf8').match(/<loc>/g)||[]).length,2+products.length);
assert(productSchema(products[0],'products/hoodie-01.html').includes('withheld'));
assert.throws(()=>productSchema({...products[0],development:false},'products/hoodie-01.html'),/Incomplete/);
// Isolated fixture: no generated page or actual product is changed.
const fixture={...products[0],development:false,commerceReady:true,description:'Fixture description',price:70,images:[{src:'checks/home-mobile.png'}],materials:'Cotton',sku:'TEST',colour:'Black'};
const parse=s=>JSON.parse(s.match(/<script[^>]*>(.*)<\/script>/s)[1]);
assert.equal(parse(productSchema(fixture,'products/hoodie-01.html')).offers.availability,'https://schema.org/InStock');
assert.equal(parse(productSchema({...fixture,status:'sold_out'},'products/hoodie-01.html')).offers.availability,'https://schema.org/OutOfStock');
assert.equal(parse(productSchema({...fixture,status:'coming_soon'},'products/hoodie-01.html')).offers,undefined);
assert.throws(()=>productSchema({...fixture,commerceReady:false},'products/hoodie-01.html'),/Unverified/);
assert.throws(()=>head({title:'Test',description:'Test',route:'/',product:{...products[0],socialImage:{src:'missing.png',width:1200,height:630,alt:'Test'}}}));
assert.equal(config.GA_MEASUREMENT_ID,''); assert.equal(config.META_PIXEL_ID,''); assert.equal(config.domainConfirmed,true); assert.equal(config.productionUrl,'https://staywide.cc');
console.log('PASS: local references, static metadata/JSON-LD, sitemap, blank IDs, preview schema suppression and future Offer states.');
