import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function num(v, fallback) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

export const config = {
  PORT:              num(process.env.PORT, 3001),
  // Next.js dev server default port (was 5173 — the old Vite frontend's port)
  FRONTEND_URL:      process.env.FRONTEND_URL || 'http://localhost:3000',

  MOCK_VISION:       process.env.MOCK_VISION === 'true',

  AI_PROVIDER:       process.env.AI_PROVIDER || 'mock',
  AI_API_KEY:        process.env.AI_API_KEY || '',
  AI_MODEL:          process.env.AI_MODEL || 'gemini-1.5-flash',
  AI_FALLBACK_PROVIDER: process.env.AI_FALLBACK_PROVIDER || 'mock',
  AI_TIMEOUT_MS:     num(process.env.AI_TIMEOUT_MS, 20000),

  MAX_IMAGE_MB:      num(process.env.MAX_IMAGE_MB, 5),
  ALLOWED_MIME_TYPES:(process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/webp')
                        .split(',').map(s => s.trim()).filter(Boolean),
};
