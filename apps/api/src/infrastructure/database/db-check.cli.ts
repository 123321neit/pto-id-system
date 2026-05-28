import { loadApiEnv } from '../../config/env.js';
import { PrismaDatabaseHealthAdapter } from './prisma-database-health.adapter.js';

const env = loadApiEnv();
const result = await new PrismaDatabaseHealthAdapter(env.DATABASE_URL).check();

console.log(`Database technical status: ${result.status}`);

if (result.status === 'error') {
  process.exitCode = 1;
}
