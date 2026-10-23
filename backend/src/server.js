import { buildApp } from './app.js';
import { config }   from './config/env.js';

const app = buildApp();

app.listen(config.PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  ???  Palmis AI Backend');
  console.log(`  > http://0.0.0.0:${config.PORT}`);
  console.log(`  > GET  /health`);
  console.log(`  > POST /api/scan   (legacy)`);
  console.log(`  > POST /api/vision (new)`);
  console.log(`  > Provider : ${config.MOCK_VISION ? 'mock (MOCK_VISION=true)' : config.AI_PROVIDER}`);
  console.log(`  > Model    : ${config.AI_MODEL}`);
  console.log(`  > Frontend : ${config.FRONTEND_URL}`);
  console.log('');
});