// Test-only network boundary for requests made by Next.js on the server.
// Run with API_ORIGIN=http://127.0.0.1:8001; browser API requests use :8000.
import http from 'node:http';

const upstream = process.env.TEST_BACKEND_ORIGIN || 'http://127.0.0.1:8000';
const port = Number(process.env.TEST_PROXY_PORT || 8001);
let nextMode = null;
let release = null;
let held = false;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  if (url.pathname.startsWith('/__test/')) {
    if (req.method === 'POST' && url.pathname === '/__test/hold') nextMode = 'hold';
    if (req.method === 'POST' && url.pathname === '/__test/fail') nextMode = 'fail';
    if (req.method === 'POST' && url.pathname === '/__test/reset') {
      nextMode = null;
      release?.();
    }
    if (req.method === 'POST' && url.pathname === '/__test/release') release?.();
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ held, nextMode }));
    return;
  }
  const mode = url.pathname === '/api/v1/items' ? nextMode : null;
  if (mode) nextMode = null;
  if (mode === 'fail') {
    res.writeHead(503, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ detail: 'Controlled initial catalog failure' }));
    return;
  }
  if (mode === 'hold') {
    held = true;
    await new Promise(resolve => { release = resolve; });
    held = false;
    release = null;
  }
  try {
    const response = await fetch(new URL(req.url, upstream), { signal: AbortSignal.timeout(10_000) });
    res.writeHead(response.status, { 'content-type': response.headers.get('content-type') || 'application/json' });
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.writeHead(502, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ detail: 'Test proxy upstream unavailable' }));
  }
});

server.listen(port, '127.0.0.1', () => console.log(`Catalog test proxy listening on ${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => { release?.(); server.close(() => process.exit(0)); });
}
