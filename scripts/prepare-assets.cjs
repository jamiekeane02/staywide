/* Deterministic crop/resize/encoding only; no retouching or generated imagery.
 * Uses the existing local Chrome QA session on :9222. Originals are read-only.
 * node scripts/prepare-assets.cjs <source-directory> [--review-only]
 */
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const source = path.resolve(process.argv[2] || '');
const files = ['GANGSHEET2.1.png', ...['1190','1193','1197','1198','1216','1218','1219','1224','1228','1230','1231'].map(n => `IMG_${n}.JPG`)];
const rotations = new Set(['IMG_1193.JPG','IMG_1197.JPG','IMG_1198.JPG']);
async function main() {
  const server = http.createServer((req, res) => {
    const name = decodeURIComponent(req.url.slice(1));
    if (!name) { res.setHeader('Content-Type', 'text/html'); return res.end('<!doctype html><title>Local asset preparation</title>'); }
    if (!files.includes(name)) { res.writeHead(404); return res.end(); }
    res.setHeader('Content-Type', name.endsWith('.png') ? 'image/png' : 'image/jpeg');
    fs.createReadStream(path.join(source, name)).pipe(res);
  });
  await new Promise(resolve => server.listen(8081, '127.0.0.1', resolve));
  let socket;
  try {
    const tabs = await (await fetch('http://127.0.0.1:9222/json')).json();
    socket = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
    await new Promise(resolve => socket.addEventListener('open', resolve, {once:true}));
    let id=0; const pending=new Map();
    socket.addEventListener('message', e => { const m=JSON.parse(e.data); if(m.id) { const p=pending.get(m.id); pending.delete(m.id); m.error?p.reject(m.error):p.resolve(m.result); } });
    const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));});
    const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,replMode:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
    await send('Page.navigate',{url:'http://127.0.0.1:8081/'});
    for(let i=0;i<100;i++){if(await ev("location.port==='8081' && document.readyState==='complete'"))break;await new Promise(r=>setTimeout(r,30));}
    await ev(`window.loadImage = async name => {const im=new Image();im.src='/'+name;await im.decode();return im;}; window.canvas = (w,h) => {const c=document.createElement('canvas');c.width=w;c.height=h;return c;}; window.upright = async (name,rotate) => {const im=await loadImage(name);const c=canvas(rotate?im.height:im.width,rotate?im.width:im.height);const x=c.getContext('2d');if(rotate){x.translate(c.width,0);x.rotate(Math.PI/2);}x.drawImage(im,0,0);return c;};window.review=canvas(1040,1200);window.rx=review.getContext('2d');rx.fillStyle='#f2f2ed';rx.fillRect(0,0,1040,1200);`);
    const inventory=[];
    for(const [index,name] of files.entries()) {
      const dimensions=await ev(`await (async()=>{const c=await upright(${JSON.stringify(name)},${rotations.has(name)});const col=${index}%4,row=Math.floor(${index}/4);const scale=Math.min(248/c.width,360/c.height);rx.drawImage(c,col*260+(260-c.width*scale)/2,row*400,c.width*scale,c.height*scale);rx.fillStyle='#161616';rx.font='16px Arial';rx.fillText(${JSON.stringify(name)},col*260+10,row*400+385);return {width:c.width,height:c.height};})()`);
      inventory.push({file:name,bytes:fs.statSync(path.join(source,name)).size,upright:dimensions,manualClockwiseRotation:rotations.has(name)});
    }
    fs.mkdirSync('checks',{recursive:true});
    const save=async (file,expression)=>{const data=await ev(expression);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,Buffer.from(data.split(',')[1],'base64'));};
    await save('checks/source-review.jpg',"review.toDataURL('image/jpeg',.9)");
    fs.writeFileSync('checks/source-inventory.json',JSON.stringify(inventory,null,2));
    if(process.argv.includes('--review-only')) return;
    // Crop coordinates refer to upright, EXIF-normalised pixels, selected by visual review.
    const selections = [
      { source:'IMG_1228.JPG', name:'hoodie-01-front', crop:[150,1050,5700,7000] },
      { source:'IMG_1231.JPG', name:'hoodie-01-detail', crop:[0,0,3928,5236] },
      { source:'IMG_1193.JPG', name:'tshirt-01-front', crop:[350,1400,5400,6650] },
      { source:'IMG_1197.JPG', name:'tshirt-01-detail', crop:[1800,2100,2600,3250] },
      { source:'IMG_1219.JPG', name:'tshirt-02-front', crop:[450,1100,5350,6500] },
      { source:'IMG_1218.JPG', name:'tshirt-02-detail', crop:[0,0,6048,8064] }
    ];
    const outputs=[];
    for(const item of selections){
      await ev(`window.current=await upright(${JSON.stringify(item.source)},${rotations.has(item.source)});`);
      for(const width of [480,800,1200,1600]){
        const height=Math.round(width*item.crop[3]/item.crop[2]);
        const file=`assets/products/${item.name}-${width}.webp`;
        await save(file,`(()=>{const c=canvas(${width},${height});const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(current,${item.crop.join(',')},0,0,c.width,c.height);return c.toDataURL('image/webp',.88);})()`);
        outputs.push({source:item.source,file,width,height,bytes:fs.statSync(file).size,crop:item.crop});
      }
      if(item.name.endsWith('-front')){
        const width=1200,height=Math.round(width*item.crop[3]/item.crop[2]);
        const file=`assets/products/${item.name}-share.jpg`;
        await save(file,`(()=>{const c=canvas(${width},${height});const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(current,${item.crop.join(',')},0,0,c.width,c.height);return c.toDataURL('image/jpeg',.9);})()`);
        outputs.push({source:item.source,file,width,height,bytes:fs.statSync(file).size});
      }
    }
    // Isolated upright blue/white wordmark near the lower centre of the gang sheet.
    // Remove only exterior connected black pixels; preserve every interior pixel.
    await ev(`window.sheet=await loadImage('GANGSHEET2.1.png');window.logo=canvas(2300,1280);window.lx=logo.getContext('2d');lx.drawImage(sheet,1850,9720,2300,1280,0,0,2300,1280);const p=lx.getImageData(0,0,logo.width,logo.height);const seen=new Uint8Array(logo.width*logo.height),queue=new Int32Array(seen.length);let head=0,tail=0;const add=i=>{if(seen[i])return;seen[i]=1;const k=i*4;if(Math.max(p.data[k],p.data[k+1],p.data[k+2])>12)return;queue[tail++]=i;};for(let x=0;x<logo.width;x++){add(x);add((logo.height-1)*logo.width+x);}for(let y=0;y<logo.height;y++){add(y*logo.width);add(y*logo.width+logo.width-1);}while(head<tail){const i=queue[head++];p.data[i*4+3]=0;const x=i%logo.width,y=Math.floor(i/logo.width);if(x)add(i-1);if(x<logo.width-1)add(i+1);if(y)add(i-logo.width);if(y<logo.height-1)add(i+logo.width);}lx.putImageData(p,0,0);`);
    await save('checks/logo-extraction.png',"logo.toDataURL('image/png')");
    await save('assets/brand/stay-wide-logo.png',"(()=>{const c=canvas(920,512);c.getContext('2d').drawImage(logo,0,0,920,512);return c.toDataURL('image/png');})()");
    await save('assets/brand/stay-wide-logo-320.png',"(()=>{const c=canvas(320,178);c.getContext('2d').drawImage(logo,0,0,320,178);return c.toDataURL('image/png');})()");
    await save('assets/brand/stay-wide-share.jpg',"(()=>{const c=canvas(1200,630);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,1200,630);x.drawImage(logo,285,140,630,350.609);return c.toDataURL('image/jpeg',.94);})()");
    fs.writeFileSync('checks/asset-manifest.json',JSON.stringify({sourceDirectory:source,inventory,outputs},null,2));
    console.log(`Prepared ${outputs.length} product derivatives and faithful logo/share assets.`);
  } finally {socket?.close();server.close();server.closeAllConnections();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
