import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { config } from './config/env.js';
import { visionRouter } from './routes/vision.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { paymentRouter } from './routes/payment.routes.js';
import { compatibilityRouter } from './routes/compatibility.routes.js';
import astrologyRoutes from './routes/astrology.routes.js';

export function buildApp() {
  const app = express();

  app.use(cors({
    origin: config.FRONTEND_URL,
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  }));

  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use(visionRouter);
  app.use(authRouter);
  app.use(paymentRouter);
  app.use(compatibilityRouter);
  app.use('/api/astrology', astrologyRoutes);

  app.use((err, _req, res, _next) => {
    const isMulterError =
      err instanceof multer.MulterError ||
      (err && typeof err.code === 'string' && err.code.startsWith('LIMIT_'));

    if (isMulterError) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? `Файл слишком большой. Максимум ${config.MAX_IMAGE_MB} MB.`
          : 'Недопустимый файл.';

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
        user_message: 'Внутренняя ошибка сервера. Попробуйте позже.',
      },
    });
  });

  return app;
}
