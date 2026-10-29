import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { config } from './config/env.js';
import { visionRouter } from './routes/vision.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { paymentRouter } from './routes/payment.routes.js';
import { compatibilityRouter } from './routes/compatibility.routes.js';

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

  app.use((err, _req, res, _next) => {
    const isMulterError =
      err instanceof multer.MulterError ||
      (err && typeof err.code === 'string' && err.code.startsWith('LIMIT_'));

    if (isMulterError) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? `\u0424\u0430\u0439\u043b \u0441\u043b\u0438\u0448\u043a\u043e\u043c \u0431\u043e\u043b\u044c\u0448\u043e\u0439. \u041c\u0430\u043a\u0441\u0438\u043c\u0443\u043c ${config.MAX_IMAGE_MB} MB.`
          : '\u041d\u0435\u0434\u043e\u043f\u0443\u0441\u0442\u0438\u043c\u044b\u0439 \u0444\u0430\u0439\u043b.';

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
        user_message: '\u0412\u043d\u0443\u0442\u0440\u0435\u043d\u043d\u044f\u044f \u043e\u0448\u0438\u0431\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u043f\u043e\u0437\u0436\u0435.',
      },
    });
  });

  return app;
}