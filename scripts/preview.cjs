/* Local preview only. No deployment, SPA fallback or domain redirects. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.xml':'application/xml', '.txt':'text/plain', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.avif':'image/avif', '.ico':'image/x-icon' };
http.createServer((req, res) => {
  let route;
  try { route = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400); return res.end(); }
  if (route === '/') route = '/index.html';
  const file = path.resolve(root, '.' + route);
  const publicRoute = /^\/(index\.html|info\.html|404\.html|robots\.txt|sitemap\.xml|products\/[^/]+\.html|(?:css|js|assets)\/.+)$/;
  const found = file.startsWith(root + path.sep) && publicRoute.test(route) && fs.existsSync(file) && fs.statSync(file).isFile();
  res.writeHead(found && route !== '/404.html' ? 200 : 404, { 'Content-Type': found ? types[path.extname(file)] || 'application/octet-stream' : types['.html'], 'Cache-Control':'no-store' });
  fs.createReadStream(found ? file : path.join(root, '404.html')).pipe(res);
}).listen(8080, '127.0.0.1', () => console.log('Stay Wide local preview: http://127.0.0.1:8080'));
