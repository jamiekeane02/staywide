// Shared dependency-free test driver. Uses a dedicated headless Chrome on 9223.
module.exports = async function connect() {
  const tabs = await (await fetch('http://127.0.0.1:9223/json')).json();
  const socket = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  let id = 0; const pending = new Map(), errors = [], requests = [];
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
    if (message.method === 'Network.requestWillBeSent') requests.push(message.params.request.url);
    if (message.id) { const task = pending.get(message.id); pending.delete(message.id); message.error ? task.reject(message.error) : task.resolve(message.result); }
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => { const n = ++id; pending.set(n, { resolve, reject }); socket.send(JSON.stringify({ id: n, method, params })); });
  const ev = async expression => { const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails)); return result.result.value; };
  const wait = async expression => { for (let n = 0; n < 180; n++) { if (await ev(expression)) return; await new Promise(r => setTimeout(r, 250)); } throw Error('Timed out: ' + expression); };
  const visit = async route => { await send('Page.navigate', { url: 'http://127.0.0.1:8080/' + route }); await wait(`location.pathname === ${JSON.stringify('/' + route)} && document.readyState === 'complete'`); await wait(`window.stayWideShopify?.status !== 'loading' && !!window.stayWideShopify`); };
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
  return { send, ev, wait, visit, errors, requests, close: () => socket.close() };
};
