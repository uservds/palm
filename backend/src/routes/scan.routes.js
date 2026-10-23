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

export const scanRouter = Router();

scanRouter.post('/api/scan', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        error: {
          code: 'INVALID_FILE',
          user_message: `Р—Р°РіСЂСѓР·РёС‚Рµ С„РѕС‚Рѕ Р»Р°РґРѕРЅРё РІ С„РѕСЂРјР°С‚Рµ JPG, PNG РёР»Рё WebP СЂР°Р·РјРµСЂРѕРј РґРѕ ${config.MAX_IMAGE_MB} MB.`,
        },
      });
    }

    if (!config.ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({
        ok: false,
        error: {
          code: 'INVALID_FILE',
          user_message: 'РќРµРґРѕРїСѓСЃС‚РёРјС‹Р№ С„РѕСЂРјР°С‚ С„Р°Р№Р»Р°. Р Р°Р·СЂРµС€РµРЅС‹: ' + config.ALLOWED_MIME_TYPES.join(', '),
        },
      });
    }

    const result = await analyzePalm(req.file.buffer, req.file.mimetype);

    if (result.ok) {
      return res.json({
        ok: true,
        archetype: result.archetype,
        metaphor: result.metaphor,
        insights: result.insights,
        free_insights: result.free_insights,
        locked_blocks: result.locked_blocks,
        locked_block_titles: result.locked_block_titles,
        scientific_facts: result.scientific_facts,
        progress_percent: result.progress_percent,
        disclaimer: result.disclaimer,
        cta: result.cta,
        image_quality: result.image_quality,
        is_fallback: result.is_fallback,
        meta: result.meta,
      });
    }

    return res.status(400).json(result);
  } catch (err) {
    console.error('[Scan] Error:', err?.message || err);

    return res.status(500).json({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        user_message: 'Р’РЅСѓС‚СЂРµРЅРЅСЏСЏ РѕС€РёР±РєР° СЃРµСЂРІРµСЂР°.',
      },
    });
  }
});