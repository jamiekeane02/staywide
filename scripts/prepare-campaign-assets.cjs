/* Technical responsive encoding only. Requires dedicated Chrome on :9223.
 * node scripts/prepare-campaign-assets.cjs <supplied-asset-directory>
 * Charts are copied unchanged. Source photograph is never cropped or modified.
 */
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const source = path.resolve(process.argv[2] || '');
const inputs = ['hoodie size chart.jpeg', 'tsshirt size chart.jpeg', 'stay wide campaign image.png'];
(async () => {
  for (const name of inputs) if (!fs.existsSync(path.join(source, name))) throw Error('Missing supplied file: ' + name);
  const server = http.createServer((req, res) => {
    const name = decodeURIComponent(req.url.slice(1));
    if (!name) { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><title>Asset preparation</title>'); }
    if (!inputs.includes(name)) { res.writeHead(404); return res.end(); }
    res.setHeader('Content-Type', name.endsWith('.png') ? 'image/png' : 'image/jpeg');
    fs.createReadStream(path.join(source, name)).pipe(res);
  });
  await new Promise(resolve => server.listen(8081, '127.0.0.1', resolve));
  let c;
  try {
    c = await require('./shopify-cdp.cjs')();
    await c.send('Page.navigate', { url: 'http://127.0.0.1:8081/' });
    await c.wait("location.port==='8081' && document.readyState==='complete'");
    fs.mkdirSync('assets/size-guides', { recursive: true });
    fs.mkdirSync('assets/campaign', { recursive: true });
    const outputs = [];
    for (const [index, name] of inputs.entries()) {
      const dimensions = await c.ev(`(async()=>{window.photo=new Image();photo.src='/' + ${JSON.stringify(name)};await photo.decode();return {width:photo.naturalWidth,height:photo.naturalHeight};})()`);
      if (index < 2) {
        const file = 'assets/size-guides/' + (index === 0 ? 'hoodie' : 'tee') + '-size-chart.jpeg';
        fs.copyFileSync(path.join(source, name), file);
        outputs.push({ source: name, file, ...dimensions, bytes: fs.statSync(file).size, processing: 'unchanged copy' });
      } else {
        for (const width of [480, 800, 1200, 1600, 2400]) {
          const height = Math.round(width * dimensions.height / dimensions.width);
          const data = await c.ev(`(()=>{const canvas=document.createElement('canvas');canvas.width=${width};canvas.height=${height};const ctx=canvas.getContext('2d');ctx.imageSmoothingQuality='high';ctx.drawImage(photo,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/webp',.9);})()`);
          const file = `assets/campaign/stay-wide-campaign-${width}.webp`;
          fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
          outputs.push({ source: name, sourceDimensions: dimensions, file, width, height, bytes: fs.statSync(file).size, processing: 'full composition, WebP quality 0.9' });
        }
      }
    }
    fs.mkdirSync('checks/size-campaign', { recursive: true });
    fs.writeFileSync('checks/size-campaign/assets.json', JSON.stringify(outputs, null, 2) + '\n');
    console.log(JSON.stringify(outputs, null, 2));
  } finally { c?.close(); server.close(); server.closeAllConnections(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
