import { getProvider, getFallbackProvider } from './ai/index.js';
import { MockProvider } from './ai/mock.js';
import { buildVisionPrompt } from '../prompts/vision-prompt.js';
import { moderateReport, getDefaultDisclaimer } from './safety/moderation.js';
import { palmAnalysisResultSchema } from '../validation/report-schema.js';
import { config } from '../config/env.js';
import {
  generateRequestId,
  logVisionStart,
  logVisionFinish,
  logVisionError,
} from '../utils/logger.js';

const BAD_IMAGE_THRESHOLD = 45;

/**
 * Shared analysis logic for /api/scan and /api/vision.
 * Image buffer is kept only in memory and never written to disk.
 *
 * @param {Buffer} buffer
 * @param {string} mimeType
 * @returns {Promise<Object>}
 */
export async function analyzePalm(buffer, mimeType) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  const imageBase64 = buffer.toString('base64');

  logVisionStart(requestId, buffer.length, mimeType);

  const prompt = buildVisionPrompt();

  const primaryProvider = getProvider();
  const fallbackProvider = getFallbackProvider();

  let activeProvider = primaryProvider;
  let isFallback = false;
  let result = null;

  // ------------------------------------------------------------
  // 1. Call primary AI provider
  // ------------------------------------------------------------
  try {
    result = await activeProvider.analyze({
      imageBase64,
      mimeType,
      prompt,
      knowledgeBase: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown AI error';
    logVisionError(requestId, 'AI_CALL_FAILED', message);

    // ----------------------------------------------------------
    // 2. Try fallback provider
    // ----------------------------------------------------------
    try {
      activeProvider = fallbackProvider;
      isFallback = true;

      result = await activeProvider.analyze({
        imageBase64,
        mimeType,
        prompt,
        knowledgeBase: null,
      });
    } catch (fbErr) {
      const fbMessage = fbErr instanceof Error ? fbErr.message : 'Unknown fallback error';
      logVisionError(requestId, 'FALLBACK_FAILED', fbMessage);

      return {
        ok: false,
        error: {
          code: 'AI_UNAVAILABLE',
          user_message: 'РЎРµСЂРІРёСЃ Р°РЅР°Р»РёР·Р° РІСЂРµРјРµРЅРЅРѕ РЅРµРґРѕСЃС‚СѓРїРµРЅ. РџРѕРїСЂРѕР±СѓР№С‚Рµ РїРѕР·Р¶Рµ.',
        },
      };
    }
  }

  // ------------------------------------------------------------
  // 3. Validate AI response with Zod
  // ------------------------------------------------------------
  let validated = palmAnalysisResultSchema.safeParse(result);

  if (!validated.success) {
    logVisionError(
      requestId,
      'VALIDATION_FAILED',
      JSON.stringify(validated.error.issues).slice(0, 300)
    );

    // ----------------------------------------------------------
    // 4. Retry once with stricter JSON instruction
    // ----------------------------------------------------------
    try {
      const strictPrompt =
        prompt +
        '\n\nР’РђР–РќРћ: Р’РµСЂРЅРё РўРћР›Р¬РљРћ РІР°Р»РёРґРЅС‹Р№ JSON. Р‘РµР· markdown, Р±РµР· РєРѕРјРјРµРЅС‚Р°СЂРёРµРІ, Р±РµР· С‚РµРєСЃС‚Р° РґРѕ/РїРѕСЃР»Рµ.';

      result = await activeProvider.analyze({
        imageBase64,
        mimeType,
        prompt: strictPrompt,
        knowledgeBase: null,
      });

      validated = palmAnalysisResultSchema.safeParse(result);

      if (!validated.success) {
        throw new Error('Retry also failed validation');
      }
    } catch {
      // --------------------------------------------------------
      // 5. If retry fails, fallback to mock
      // --------------------------------------------------------
      try {
        activeProvider = new MockProvider();
        isFallback = true;

        result = await activeProvider.analyze({
          imageBase64,
          mimeType,
          prompt,
          knowledgeBase: null,
        });

        validated = palmAnalysisResultSchema.safeParse(result);

        if (!validated.success) {
          throw new Error('Mock fallback invalid');
        }
      } catch (finalErr) {
        const finalMessage = finalErr instanceof Error ? finalErr.message : 'Final fallback failed';
        logVisionError(requestId, 'FINAL_FALLBACK_FAILED', finalMessage);

        return {
          ok: false,
          error: {
            code: 'AI_INVALID_RESPONSE',
            user_message: 'РќРµ СѓРґР°Р»РѕСЃСЊ РїРѕР»СѓС‡РёС‚СЊ РєРѕСЂСЂРµРєС‚РЅС‹Р№ РѕС‚РІРµС‚ AI. РџРѕРїСЂРѕР±СѓР№С‚Рµ РїРѕР·Р¶Рµ.',
          },
        };
      }
    }
  }

  result = validated.data;

  // ------------------------------------------------------------
  // 6. Image quality gate
  // ------------------------------------------------------------
  const quality = result.image_quality;

  if (!quality || typeof quality.score !== 'number' || quality.score < BAD_IMAGE_THRESHOLD) {
    logVisionFinish(
      requestId,
      activeProvider.name,
      config.AI_MODEL,
      Date.now() - startTime,
      'bad_quality',
      isFallback
    );

    return {
      ok: false,
      error: {
        code: 'BAD_IMAGE_QUALITY',
        user_message:
          quality?.user_hint ||
          'РќРµ РїРѕР»СѓС‡РёР»РѕСЃСЊ СЂР°Р·РѕР±СЂР°С‚СЊ Р»Р°РґРѕРЅСЊ. РЎРґРµР»Р°Р№С‚Рµ С„РѕС‚Рѕ Р±Р»РёР¶Рµ, РїСЂРё С…РѕСЂРѕС€РµРј СЃРІРµС‚Рµ Рё Р±РµР· СЃРёР»СЊРЅС‹С… С‚РµРЅРµР№.',
        details: {
          image_quality: quality || {
            score: 0,
            issues: ['unknown'],
            user_hint: null,
          },
        },
      },
    };
  }

  const criticalIssues = ['blur', 'occlusion'];

  if (
    Array.isArray(quality.issues) &&
    quality.issues.some((issue) => criticalIssues.includes(issue)) &&
    quality.score < 60
  ) {
    logVisionFinish(
      requestId,
      activeProvider.name,
      config.AI_MODEL,
      Date.now() - startTime,
      'bad_quality',
      isFallback
    );

    return {
      ok: false,
      error: {
        code: 'BAD_IMAGE_QUALITY',
        user_message:
          quality.user_hint ||
          'РќРµ РїРѕР»СѓС‡РёР»РѕСЃСЊ СЂР°Р·РѕР±СЂР°С‚СЊ Р»Р°РґРѕРЅСЊ. РЎРґРµР»Р°Р№С‚Рµ С„РѕС‚Рѕ Р±Р»РёР¶Рµ, РїСЂРё С…РѕСЂРѕС€РµРј СЃРІРµС‚Рµ Рё Р±РµР· СЃРёР»СЊРЅС‹С… С‚РµРЅРµР№.',
        details: {
          image_quality: quality,
        },
      },
    };
  }

  // ------------------------------------------------------------
  // 7. Moderation / safety filter
  // ------------------------------------------------------------
  const moderated = moderateReport(result);

  if (moderated.needsFallback) {
    try {
      activeProvider = new MockProvider();
      isFallback = true;

      result = await activeProvider.analyze({
        imageBase64,
        mimeType,
        prompt,
        knowledgeBase: null,
      });

      const mockValidated = palmAnalysisResultSchema.safeParse(result);

      if (!mockValidated.success) {
        throw new Error('Moderation fallback mock invalid');
      }

      result = mockValidated.data;
    } catch (modErr) {
      const modMessage = modErr instanceof Error ? modErr.message : 'Moderation fallback failed';
      logVisionError(requestId, 'MODERATION_FALLBACK_FAILED', modMessage);

      return {
        ok: false,
        error: {
          code: 'AI_INVALID_RESPONSE',
          user_message: 'РќРµ СѓРґР°Р»РѕСЃСЊ СЃС„РѕСЂРјРёСЂРѕРІР°С‚СЊ Р±РµР·РѕРїР°СЃРЅС‹Р№ РѕС‚С‡С‘С‚. РџРѕРїСЂРѕР±СѓР№С‚Рµ РїРѕР·Р¶Рµ.',
        },
      };
    }
  } else {
    result = moderated.result;
  }

  // ------------------------------------------------------------
  // 8. Build final frontend-compatible response
  // ------------------------------------------------------------
  const durationMs = Date.now() - startTime;

  logVisionFinish(
    requestId,
    activeProvider.name,
    config.AI_MODEL,
    durationMs,
    'ok',
    isFallback
  );

  const lines = Array.isArray(result.observations?.lines) ? result.observations.lines : [];

  const avgConfidence =
    lines.length > 0
      ? Math.round(
          lines.reduce((sum, line) => sum + (Number(line.confidence) || 0), 0) / lines.length
        )
      : 0;

  return {
    ok: true,
    archetype: result.report.archetype,
    metaphor: result.report.metaphor,

    // backward compatibility
    insights: result.report.free_insights,
    locked_block_titles: result.report.locked_blocks.map((block) => block.title),

    // new architecture
    free_insights: result.report.free_insights,
    locked_blocks: result.report.locked_blocks,
    scientific_facts: result.report.scientific_facts,
    progress_percent: result.report.progress_percent,
    disclaimer: result.report.disclaimer || getDefaultDisclaimer(),
    cta: result.report.cta,

    image_quality: result.image_quality,
    is_fallback: isFallback,

    meta: {
      provider: activeProvider.name,
      model: config.AI_MODEL,
      processing_time_ms: durationMs,
      hand: result.observations.hand,
      confidence: avgConfidence,
    },
  };
}