import { spawnSync } from 'node:child_process';
const test = spawnSync(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2)], { stdio: 'inherit' });
const video = spawnSync(process.execPath, ['scripts/videos.mjs'], { stdio: 'inherit' });
process.exit(test.status || video.status || 0);
