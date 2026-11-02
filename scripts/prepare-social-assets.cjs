/* Faithful bitmap composition with the existing Chrome canvas toolchain.
 * Requires dedicated local Chrome on :9222; no packages or original-photo changes.
 * node scripts/prepare-social-assets.cjs
 */
const fs = require('node:fs');
const http = require('node:http');
const assert = require('node:assert/strict');
const products = require('../js/catalog.js').products.filter(p => p.listed !== false);
async function prepareSocialAssets() {
  const logo = 'assets/brand/stay-wide-logo.png';
  const allowed = new Set([logo, ...products.map(p => p.images[0].src)]);
  const server = http.createServer((req, res) => {
    const file = req.url.slice(1);
    if (!file) { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><title>Local social asset composition</title>'); }
    if (!allowed.has(file)) { res.writeHead(404); return res.end(); }
    res.setHeader('Content-Type', file.endsWith('.png') ? 'image/png' : 'image/webp');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(8082, '127.0.0.1', resolve));
  let socket;
  try {
    const tabs = await (await fetch('http://127.0.0.1:9222/json')).json();
    socket = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
    await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
    let id = 0;
    const pending = new Map();
    socket.addEventListener('message', e => {
      const m = JSON.parse(e.data);
      if (m.id) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(m.error) : p.resolve(m.result); }
    });
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const n = ++id; pending.set(n, { resolve, reject }); socket.send(JSON.stringify({ id: n, method, params }));
    });
    const ev = async expression => {
      const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, replMode: true });
      if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails));
      return r.result.value;
    };
    await send('Page.navigate', { url: 'http://127.0.0.1:8082/' });
    let ready = false;
    for (let i = 0; i < 100; i++) {
      if (await ev("location.port==='8082' && document.readyState==='complete'")) { ready = true; break; }
      await new Promise(r => setTimeout(r, 30));
    }
    assert(ready, 'Asset canvas navigation');
    // Every draw uses one scale for both dimensions, including fractional destination pixels.
    await ev(`window.loadImage=async src=>{const i=new Image();i.src='/'+src;await i.decode();return i;};
      window.canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.imageSmoothingQuality='high';return c;};
      window.contain=(c,i,bx,by,bw,bh)=>{const scale=Math.min(bw/i.width,bh/i.height),width=i.width*scale,height=i.height*scale,x=bx+(bw-width)/2,y=by+(bh-height)/2;c.getContext('2d').drawImage(i,x,y,width,height);return {x,y,width,height,scale,sourceWidth:i.width,sourceHeight:i.height};};
      window.logo=await loadImage(${JSON.stringify(logo)});window.cards=[];window.icons=[];`);
    const outputs = [];
    const save = async (file, expression, dimensions, source, composition) => {
      const data = await ev(expression);
      fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
      const entry = { file, ...dimensions, bytes: fs.statSync(file).size, source, composition };
      outputs.push(entry);
      return entry;
    };
    const homeComposition = await ev(`(()=>{window.home=canvas(1200,630);const placement=contain(home,logo,240,0,720,630);cards.push(home);return placement;})()`);
    await save('assets/brand/stay-wide-share.jpg', "home.toDataURL('image/jpeg',.94)", { width: 1200, height: 630 }, logo, homeComposition);
    for (const product of products) {
      const composition = await ev(`await (async()=>{window.card=canvas(1200,630);const photo=await loadImage(${JSON.stringify(product.images[0].src)});const photograph=contain(card,photo,300,32,600,566);const brand=contain(card,logo,996,478,144,100);cards.push(card);return {photograph,brand};})()`);
      assert(composition.photograph?.sourceWidth > 0, 'Primary photograph decoded');
      await save(`assets/products/${product.id}-share.jpg`, "card.toDataURL('image/jpeg',.94)", { width: 1200, height: 630 }, product.images[0].src, composition);
    }
    const iconBuffers = [];
    for (const size of [16, 32, 48, 180]) {
      const composition = await ev(`(()=>{window.icon=canvas(${size},${size});const placement=contain(icon,logo,${size * .06},0,${size * .88},${size});icons.push(icon);return placement;})()`);
      const data = await ev("icon.toDataURL('image/png')");
      const buffer = Buffer.from(data.split(',')[1], 'base64');
      if (size < 180) iconBuffers.push({ size, buffer });
      if (size >= 48) await save(size === 180 ? 'assets/brand/apple-touch-icon.png' : 'assets/brand/favicon-48.png', "icon.toDataURL('image/png')", { width: size, height: size }, logo, composition);
    }
    // ICO directory with standard PNG-compressed 16, 32 and 48px frames.
    const directory = Buffer.alloc(6 + iconBuffers.length * 16);
    directory.writeUInt16LE(1, 2); directory.writeUInt16LE(iconBuffers.length, 4);
    let offset = directory.length;
    iconBuffers.forEach(({ size, buffer }, index) => {
      const start = 6 + index * 16;
      directory[start] = size; directory[start + 1] = size;
      directory.writeUInt16LE(1, start + 4); directory.writeUInt16LE(32, start + 6);
      directory.writeUInt32LE(buffer.length, start + 8); directory.writeUInt32LE(offset, start + 12);
      offset += buffer.length;
    });
    const ico = 'assets/brand/favicon.ico';
    fs.writeFileSync(ico, Buffer.concat([directory, ...iconBuffers.map(i => i.buffer)]));
    outputs.push({ file: ico, sizes: [16, 32, 48], bytes: fs.statSync(ico).size, source: logo });
    await ev(`window.sheet=canvas(1200,950);const x=sheet.getContext('2d');x.fillStyle='#e9e9e5';x.fillRect(0,0,1200,950);cards.forEach((c,i)=>{const left=(i%2)*600,top=Math.floor(i/2)*355;x.drawImage(c,left,top,600,315);x.fillStyle='#161616';x.font='16px Arial';x.fillText(['Homepage','Hoodie 01','T-shirt 01','T-shirt 02'][i],left+16,top+340);});icons.forEach((c,i)=>{const left=30+i*270;x.drawImage(c,left,750);x.fillStyle='#161616';x.fillText(c.width+'px (actual size)',left,735);});`);
    const sheet = await ev("sheet.toDataURL('image/jpeg',.94)");
    fs.writeFileSync('checks/social-assets-contact-sheet.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
    fs.writeFileSync('checks/social-assets-manifest.json', JSON.stringify({ outputs }, null, 2) + '\n');
    console.log('Prepared four 1200x630 social cards, ICO, 48px PNG, Apple icon and QA contact sheet.');
  } finally { socket?.close(); server.close(); server.closeAllConnections(); }
}
module.exports = prepareSocialAssets;
if (require.main === module) prepareSocialAssets().catch(e => { console.error(e); process.exitCode = 1; });
