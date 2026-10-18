import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { root, env } from './env.mjs';

const result = spawnSync(process.execPath, ['node_modules/next/dist/bin/next', 'build'], {
  cwd: path.join(root, 'client'), env, stdio: 'inherit',
});
process.exit(result.error || result.signal ? 1 : (result.status ?? 1));
