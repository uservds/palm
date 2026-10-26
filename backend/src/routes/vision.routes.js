import { Router } from 'express';
import multer from 'multer';
import { analyzePalm } from '../services/analysis.handler.js';
import { config } from '../config/env.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.MAX_IMAGE_MB * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    cb(null, config.ALLOWED_MIME_TYPES.includes(file.mimetype));
  },
});

export const visionRouter = Router();

visionRouter.post('/api/vision', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        error: {
          code: 'INVALID_FILE',
          user_message: `Загрузите фото ладони в формате JPG, PNG или WebP размером до ${config.MAX_IMAGE_MB} MB.`,
        },
      });
    }

    if (!config.ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({
        ok: false,
        error: {
          code: 'INVALID_FILE',
          user_message: 'Недопустимый формат. Разрешены: ' + config.ALLOWED_MIME_TYPES.join(', '),
        },
      });
    }

    const result = await analyzePalm(req.file.buffer, req.file.mimetype);
    const status = result.ok ? 200 : 400;

    return res.status(status).json(result);
  } catch (err) {
    console.error('[Vision] Error:', err?.message || err);

    return res.status(500).json({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        user_message: 'Внутренняя ошибка сервера.',
      },
    });
  }
});
