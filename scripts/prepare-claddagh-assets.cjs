/* Technical resize/encoding only, matching the existing Chrome canvas pipeline.
 * node scripts/prepare-claddagh-assets.cjs <photo-directory>
 * Requires dedicated Chrome on :9223. Originals are never modified.
 */
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const source = path.resolve(process.argv[2] || '');
const photos = [['IMG_1464.jpeg', 'front'], ['IMG_1457.jpeg', 'detail']];
(async () => {
  const server = http.createServer((req, res) => {
    const name = decodeURIComponent(req.url.slice(1));
    if (!name) { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><title>Claddagh asset preparation</title>'); }
    const file = photos.some(([photo]) => photo === name) ? path.join(source, name) : name === 'logo.png' ? 'assets/brand/stay-wide-logo.png' : null;
    if (!file) { res.writeHead(404); return res.end(); }
    res.setHeader('Content-Type', name.endsWith('.png') ? 'image/png' : 'image/jpeg');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(8081, '127.0.0.1', resolve));
  let c;
  try {
    c = await require('./shopify-cdp.cjs')();
    await c.send('Page.navigate', { url: 'http://127.0.0.1:8081/' });
    await c.wait("location.port==='8081' && document.readyState==='complete'");
    await c.ev(`window.load=async src=>{const i=new Image();i.src='/'+src;await i.decode();return i;};window.canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').imageSmoothingQuality='high';return c;};`);
    const outputs = [];
    const save = async (file, expression, metadata) => {
      const data = await c.ev(expression);
      fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
      outputs.push({ file, ...metadata, bytes: fs.statSync(file).size });
    };
    for (const [photo, view] of photos) {
      const dimensions = await c.ev(`(async()=>{window.photo=await load(${JSON.stringify(photo)});return {width:photo.naturalWidth,height:photo.naturalHeight};})()`);
      if (dimensions.width !== 6048 || dimensions.height !== 8064) throw Error('Unexpected upright photo dimensions: ' + JSON.stringify(dimensions));
      for (const width of [480,800,1200,1600]) {
        const height = Math.round(width * dimensions.height / dimensions.width);
        await save(`assets/products/hoodie-02-${view}-${width}.webp`, `(()=>{const c=canvas(${width},${height});c.getContext('2d').drawImage(photo,0,0,c.width,c.height);return c.toDataURL('image/webp',.88);})()`, { source: photo, width, height, sourceDimensions: dimensions, crop: 'none; browser EXIF orientation' });
      }
    }
    await c.ev(`(async()=>{window.photo=await load('IMG_1464.jpeg');window.logo=await load('logo.png');window.card=canvas(1200,630);const ctx=card.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,1200,630);window.contain=(i,bx,by,bw,bh)=>{const s=Math.min(bw/i.width,bh/i.height),w=i.width*s,h=i.height*s;ctx.drawImage(i,bx+(bw-w)/2,by+(bh-h)/2,w,h);};contain(photo,300,32,600,566);contain(logo,996,478,144,100);})()`);
    await save('assets/products/hoodie-02-share.jpg', "card.toDataURL('image/jpeg',.94)", { source: 'IMG_1464.jpeg', width: 1200, height: 630, composition: 'Full primary photograph contained on white; existing restrained logo treatment' });
    fs.mkdirSync('checks/claddagh', { recursive: true });
    fs.writeFileSync('checks/claddagh/assets.json', JSON.stringify({ outputs }, null, 2) + '\n');
    console.log(JSON.stringify(outputs, null, 2));
  } finally { c?.close(); server.close(); server.closeAllConnections(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
