import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { analyzeCoupleCompatibility, analyzeGroupCompatibility } from '../services/compatibility.service.js';
import { config } from '../config/env.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.MAX_IMAGE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, config.ALLOWED_MIME_TYPES.includes(file.mimetype));
  },
});

const uploadGroup = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.MAX_IMAGE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, config.ALLOWED_MIME_TYPES.includes(file.mimetype));
  },
});

export const compatibilityRouter = Router();

const genderSchema = z.enum(['male', 'female']);

// ВАЖНО (уточнено по реальному compat/couple/page.tsx): UI собирает пол
// ТОЛЬКО для второго партнёра — handleBothReady(fileA, fileB, genderB),
// gender у партнёра А нигде не запрашивается. gender_a здесь поэтому
// ОПЦИОНАЛЕН с дефолтом — нужен только для согласования рода в тексте
// Gemini (buildCompatibilityPrompt), на логику KB-сверки не влияет.
// Если по продукту первый партнёр всегда одного пола (например, это
// обычно сам пользователь) — замените дефолт на реальное значение или
// подтяните его из профиля залогиненного пользователя, когда появится.
compatibilityRouter.post(
  '/api/compatibility/couple',
  upload.fields([
    { name: 'image_a', maxCount: 1 },
    { name: 'image_b', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const fileA = req.files?.image_a?.[0];
      const fileB = req.files?.image_b?.[0];

      if (!fileA || !fileB) {
        return res.status(400).json({
          ok: false,
          error: {
            code: 'INVALID_FILE',
            user_message: `Загрузите фото обеих ладоней в формате JPG, PNG или WebP размером до ${config.MAX_IMAGE_MB} MB.`,
          },
        });
      }

      for (const file of [fileA, fileB]) {
        if (!config.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return res.status(400).json({
            ok: false,
            error: {
              code: 'INVALID_FILE',
              user_message: 'Недопустимый формат. Разрешены: ' + config.ALLOWED_MIME_TYPES.join(', '),
            },
          });
        }
      }

      const genderParse = z
        .object({
          gender_a: genderSchema.default('female'), // TODO: продуктовое решение — см. комментарий выше
          gender_b: genderSchema,
        })
        .safeParse({ gender_a: req.body?.gender_a, gender_b: req.body?.gender_b });

      if (!genderParse.success) {
        return res.status(400).json({
          ok: false,
          error: { code: 'INVALID_INPUT', user_message: 'Укажите пол второго партнёра.' },
        });
      }

      const result = await analyzeCoupleCompatibility({
        bufferA: fileA.buffer,
        mimeTypeA: fileA.mimetype,
        genderA: genderParse.data.gender_a,
        bufferB: fileB.buffer,
        mimeTypeB: fileB.mimetype,
        genderB: genderParse.data.gender_b,
      });

      const status = result.ok ? 200 : 400;
      return res.status(status).json(result);
    } catch (err) {
      console.error('[Compatibility] Error:', err?.message || err);
      return res.status(500).json({
        ok: false,
        error: { code: 'INTERNAL_ERROR', user_message: 'Внутренняя ошибка сервера.' },
      });
    }
  }
);

async function handleGroupCompatibility(kind, req, res) {
  try {
    const files = req.files;
    if (!files || files.length < 2 || files.length > 4) {
      return res.status(400).json({
        ok: false,
        error: {
          code: 'INVALID_FILE',
          user_message: `Загрузите от 2 до 4 фото ладоней в формате JPG, PNG или WebP размером до ${config.MAX_IMAGE_MB} MB.`,
        },
      });
    }

    for (const file of files) {
      if (!config.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return res.status(400).json({
          ok: false,
          error: {
            code: 'INVALID_FILE',
            user_message: 'Недопустимый формат. Разрешены: ' + config.ALLOWED_MIME_TYPES.join(', '),
          },
        });
      }
    }

    const participants = files.map((f) => ({ buffer: f.buffer, mimeType: f.mimetype }));
    const result = await analyzeGroupCompatibility({ kind, participants });

    const status = result.ok ? 200 : 400;
    return res.status(status).json(result);
  } catch (err) {
    console.error(`[Compatibility:${kind}] Error:`, err?.message || err);
    return res.status(500).json({
      ok: false,
      error: { code: 'INTERNAL_ERROR', user_message: 'Внутренняя ошибка сервера.' },
    });
  }
}

compatibilityRouter.post(
  '/api/compatibility/friendship',
  uploadGroup.array('images', 4),
  (req, res) => handleGroupCompatibility('friendship', req, res)
);

compatibilityRouter.post(
  '/api/compatibility/business',
  uploadGroup.array('images', 4),
  (req, res) => handleGroupCompatibility('business', req, res)
);