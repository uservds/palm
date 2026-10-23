import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { config } from './config/env.js';
import { scanRouter } from './routes/scan.routes.js';
import { visionRouter } from './routes/vision.routes.js';

export function buildApp() {
  const app = express();

  app.use(cors({
    origin: config.FRONTEND_URL,
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  }));

  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use(scanRouter);
  app.use(visionRouter);

  app.use((err, _req, res, _next) => {
    const isMulterError =
      err instanceof multer.MulterError ||
      (err && typeof err.code === 'string' && err.code.startsWith('LIMIT_'));

    if (isMulterError) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? `Р¤Р°Р№Р» СЃР»РёС€РєРѕРј Р±РѕР»СЊС€РѕР№. РњР°РєСЃРёРјСѓРј ${config.MAX_IMAGE_MB} MB.`
          : 'РќРµРґРѕРїСѓСЃС‚РёРјС‹Р№ С„Р°Р№Р».';

      return res.status(400).json({
        ok: false,
        error: {
          code: 'INVALID_FILE',
          user_message: message,
        },
      });
    }

    console.error('[App] Unhandled error:', err?.message || err);

    res.status(500).json({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        user_message: 'Р’РЅСѓС‚СЂРµРЅРЅСЏСЏ РѕС€РёР±РєР° СЃРµСЂРІРµСЂР°. РџРѕРїСЂРѕР±СѓР№С‚Рµ РїРѕР·Р¶Рµ.',
      },
    });
  });

  return app;
}