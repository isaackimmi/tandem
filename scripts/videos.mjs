import { readdir, readFile, writeFile, rm, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import ffmpeg from 'ffmpeg-static';

async function visit(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const outputs = [];
  for (const entry of entries) {
    const source = path.join(directory, entry.name);
    if (entry.isDirectory()) outputs.push(...await visit(source));
    else if (entry.name.endsWith('.webm')) {
      const destination = source.replace(/\.webm$/, '.mp4');
      const conversion = spawnSync(ffmpeg, ['-y', '-i', source, '-c:v', 'libx264', '-threads', '1', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', destination], { encoding: 'utf8' });
      if (conversion.status !== 0) throw new Error(conversion.stderr);
      const decode = spawnSync(ffmpeg, ['-v', 'error', '-i', destination, '-f', 'null', '-'], { encoding: 'utf8' });
      if (decode.status !== 0 || !(await stat(destination)).size) throw new Error(`Invalid MP4: ${destination}`);
      outputs.push(destination);
      await rm(source);
    }
  }
  return outputs;
}
const directory = process.argv[2] || 'test-results';
const outputs = await visit(directory);
if (outputs.length) await writeFile(path.join(directory, 'videos.md'), '# Playable MP4 evidence\n\n' + outputs.map(p => `- [${path.basename(path.dirname(p))}](${path.relative(directory, p)})`).join('\n'));
const reportPath = path.join(directory, 'results.json');
const report = await readFile(reportPath, 'utf8').catch(() => null);
if (report) await writeFile(reportPath, report.replaceAll('.webm', '.mp4').replaceAll('video/webm', 'video/mp4'));
console.log(`Converted and decode-verified ${outputs.length} MP4 recordings.`);
