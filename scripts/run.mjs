import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { root, env, frontendPort, backendPort } from './env.mjs';

const python = path.join(root, 'server/.venv/bin/python');
const production = process.argv.includes('--production');
const children = [];
let stopping = false;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    try { process.kill(-child.pid, 'SIGTERM'); } catch { /* Process already exited. */ }
  }
  setTimeout(() => {
    for (const child of children) {
      try { process.kill(-child.pid, 'SIGKILL'); } catch { /* Process already exited. */ }
    }
    process.exit(code);
  }, 1500);
}

function run(command, args, cwd) {
  const child = spawn(command, args, { cwd, env, stdio: 'inherit', detached: true });
  children.push(child);
  child.on('error', error => { console.error(error.message); stop(1); });
  child.on('exit', code => { if (!stopping) stop(code || 1); });
}

async function checkPort(port) {
  await new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', () => reject(new Error(`Port ${port} is occupied. Stop the existing app first.`)));
    probe.listen(port, '127.0.0.1', () => probe.close(resolve));
  });
}

async function ready(url) {
  for (let attempt = 0; attempt < 120 && !stopping; attempt++) {
    try { if ((await fetch(url, { signal: AbortSignal.timeout(1000) })).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error('Backend did not become ready. Check the startup output above.');
}

process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
try {
  if (!existsSync(python) || !existsSync(path.join(root, 'client/node_modules'))) {
    throw new Error('Install frontend and backend dependencies first; see README setup.');
  }
  await checkPort(frontendPort);
  await checkPort(backendPort);
  run(python, ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', String(backendPort)], path.join(root, 'server'));
  await ready(`http://127.0.0.1:${backendPort}/api/v1/items?pageSize=1`);
  if (!stopping) {
    run(process.execPath, ['node_modules/next/dist/bin/next', production ? 'start' : 'dev', '--hostname', '127.0.0.1', '--port', String(frontendPort)], path.join(root, 'client'));
    console.log(`Tandem: http://127.0.0.1:${frontendPort} — Ctrl+C stops both services.`);
  }
} catch (error) { console.error(error.message); stop(1); }
