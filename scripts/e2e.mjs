import { spawn, spawnSync } from 'node:child_process';
const origin = 'http://127.0.0.1:8001';
let proxy;
async function fixtureReady() {
  try {
    const response = await fetch(`${origin}/__test/status`, { signal: AbortSignal.timeout(500) });
    const body = await response.json();
    return response.ok && typeof body.held === 'boolean';
  } catch { return false; }
}
const exitCode = result => result.error || result.signal || result.status === null ? 1 : result.status;
let code = 1;
try {
  if (!await fixtureReady()) {
    proxy = spawn(process.execPath, ['tests/fixtures/catalog-proxy.mjs'], { stdio: 'inherit' });
    let ready = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      if (await fixtureReady()) { ready = true; break; }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (!ready) throw new Error('Catalog test fixture could not start on port 8001.');
  }
  const test = spawnSync(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2)], {
    stdio: 'inherit', env: { ...process.env, API_ORIGIN: origin, NEXT_PUBLIC_API_ORIGIN: 'http://127.0.0.1:8000' },
  });
  const video = spawnSync(process.execPath, ['scripts/videos.mjs'], { stdio: 'inherit' });
  code = exitCode(test) || exitCode(video);
} catch (error) { console.error(error.message); }
finally { proxy?.kill('SIGTERM'); }
process.exitCode = code;
