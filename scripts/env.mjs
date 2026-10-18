import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
for (const file of [path.join(root, '.env'), path.join(root, 'server/.env')]) {
  if (existsSync(file)) process.loadEnvFile(file);
}
export const frontendPort = Number(process.env.PORT || 3000);
export const backendPort = Number(process.env.BACKEND_PORT || 8000);
export const env = { ...process.env, OPENBLAS_NUM_THREADS: '1', OMP_NUM_THREADS: '1',
  MKL_NUM_THREADS: '1', NEXT_TELEMETRY_DISABLED: '1',
  CORS_ORIGINS: process.env.CORS_ORIGINS || `http://127.0.0.1:${frontendPort},http://localhost:${frontendPort}`,
  API_ORIGIN: process.env.API_ORIGIN || `http://127.0.0.1:${backendPort}`,
  NEXT_PUBLIC_API_ORIGIN: process.env.NEXT_PUBLIC_API_ORIGIN || `http://127.0.0.1:${backendPort}` };
