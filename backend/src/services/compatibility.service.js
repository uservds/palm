import { extractPalmObservations } from './analysis.handler.js'; // см. REFACTOR-analysis-handler.md
import { buildCompatibilityFindings } from './knowledge/compatibility-kb.js';
import { buildCompatibilityPrompt } from '../prompts/compatibility-prompt.js';
import { compatibilityReportSchema } from '../validation/compatibility-report-schema.js';
import { getProvider, getFallbackProvider } from './ai/index.js';
import { MockProvider } from './ai/mock.js';
import { moderateCompatibilityReport, getDefaultDisclaimer } from './safety/moderation.js'; // см. PATCH-moderation.md
import { config } from '../config/env.js';
import {
  generateRequestId,
  logVisionFinish,
  logVisionError,
} from '../utils/logger.js';

/**
 * Полный разбор совместимости двух ладоней.
 *
 * @param {Object} params
 * @param {Buffer} params.bufferA
 * @param {string} params.mimeTypeA
 * @param {'male'|'female'} params.genderA
 * @param {Buffer} params.bufferB
 * @param {string} params.mimeTypeB
 * @param {'male'|'female'} params.genderB
 * @returns {Promise<Object>}
 */
export async function analyzeCoupleCompatibility(params) {
  const { bufferA, mimeTypeA, genderA, bufferB, mimeTypeB, genderB } = params;
  const requestId = generateRequestId();
  const startTime = Date.now();

  // ------------------------------------------------------------
  // 1. Обе ладони параллельно — переиспользуем Vision-пайплайн
  // ------------------------------------------------------------
  const [resA, resB] = await Promise.all([
    extractPalmObservations(bufferA, mimeTypeA, 'couple:a'),
    extractPalmObservations(bufferB, mimeTypeB, 'couple:b'),
  ]);

  if (!resA.ok) {
    return { ok: false, error: { ...resA.error, details: { ...resA.error.details, hand: 'a' } } };
  }
  if (!resB.ok) {
    return { ok: false, error: { ...resB.error, details: { ...resB.error.details, hand: 'b' } } };
  }

  const obsA = resA.data.observations;
  const obsB = resB.data.observations;
  // ВАЖНО: image_quality лежит на ВЕРХНЕМ уровне ответа (сосед observations
  // и report в palmAnalysisResultSchema), а не внутри observations — баг
  // найден и исправлен после получения report-schema.js (изначально тут
  // ошибочно было obsA.image_quality, что всегда давало undefined).
  const imageQualityA = resA.data.image_quality;
  const imageQualityB = resB.data.image_quality;
  const isFallback = resA.isFallback || resB.isFallback;

  // ------------------------------------------------------------
  // 2. Детерминированная сверка по базе знаний (не AI)
  // ------------------------------------------------------------
  const findings = buildCompatibilityFindings(obsA, obsB);

  // couple-архетип выбирается по score на бэкенде тем же способом,
  // что и на фронте (frontend/lib/compatibilityArchetypes.ts) —
  // ВАЖНО: держать два списка архетипов и диапазонов синхронизированными,
  // либо (лучше) вынести единый источник правды и импортировать на фронт
  // через shared-пакет/генерацию типов, если структура монорепо это позволяет.
  const coupleArchetype = pickCoupleArchetypeServerSide(findings.overall_score);

  // ------------------------------------------------------------
  // 3. Gemini оформляет текст на основе готовых findings
  // ------------------------------------------------------------
  const prompt = buildCompatibilityPrompt({ findings, coupleArchetype, genderA, genderB });

  const primaryProvider = getProvider();
  const fallbackProvider = getFallbackProvider();
  let activeProvider = primaryProvider;
  let providerIsFallback = false;
  let result = null;

  try {
    result = await activeProvider.analyzeText({ prompt }); // см. заметку ниже про ai/index.js
  } catch (err) {
    logVisionError(requestId, 'COMPAT_AI_CALL_FAILED', err instanceof Error ? err.message : 'Unknown AI error');
    try {
      activeProvider = fallbackProvider;
      providerIsFallback = true;
      result = await activeProvider.analyzeText({ prompt });
    } catch (fbErr) {
      logVisionError(requestId, 'COMPAT_FALLBACK_FAILED', fbErr instanceof Error ? fbErr.message : 'Unknown fallback error');
      return {
        ok: false,
        error: { code: 'AI_UNAVAILABLE', user_message: 'Сервис анализа совместимости временно недоступен. Попробуйте позже.' },
      };
    }
  }

  let validated = compatibilityReportSchema.safeParse(result);

  if (!validated.success) {
    logVisionError(requestId, 'COMPAT_VALIDATION_FAILED', JSON.stringify(validated.error.issues).slice(0, 300));
    try {
      activeProvider = new MockProvider();
      providerIsFallback = true;
      result = buildMockCompatibilityResult(findings, coupleArchetype);
      validated = compatibilityReportSchema.safeParse(result);
      if (!validated.success) throw new Error('Mock compatibility fallback invalid');
    } catch (finalErr) {
      logVisionError(requestId, 'COMPAT_FINAL_FALLBACK_FAILED', finalErr instanceof Error ? finalErr.message : 'Final fallback failed');
      return {
        ok: false,
        error: { code: 'AI_INVALID_RESPONSE', user_message: 'Не удалось сформировать отчёт о совместимости. Попробуйте позже.' },
      };
    }
  }

  result = validated.data;

  // ------------------------------------------------------------
  // 3.5. Сервер — источник истины для couple_archetype и overall_score.
  // Они посчитаны детерминированно на шаге 2 (compatibility-kb.js) ДО
  // вызова AI. Промпт просит провайдера вернуть их без изменений, но это
  // просьба в тексте, а не гарантия — провайдер (включая MockProvider в
  // режиме MOCK_VISION=true, что и вскрыл ручной тест) может вернуть
  // другие значения. Перезаписываем безусловно, чтобы архетип и score
  // никогда не расходились с реальными findings, независимо от того, что
  // ответил AI-слой.
  // ------------------------------------------------------------
  result.couple_archetype = coupleArchetype;
  result.overall_score = findings.overall_score;

  // ------------------------------------------------------------
  // 4. Модерация — отдельная функция под плоскую форму compatibility-отчёта
  //    (см. PATCH-moderation.md: moderateReport() написан под Vision и
  //    падает на этой форме)
  // ------------------------------------------------------------
  const moderated = moderateCompatibilityReport(result);
  if (moderated.needsFallback) {
    logVisionError(requestId, 'COMPAT_MODERATION_FALLBACK', 'unsafe content removed, falling back to KB-only result');
    result = buildMockCompatibilityResult(findings, coupleArchetype);
    providerIsFallback = true;
  } else {
    result = moderated.result;
  }

  const durationMs = Date.now() - startTime;
  logVisionFinish(requestId, activeProvider.name, config.AI_MODEL, durationMs, 'ok', isFallback || providerIsFallback);

  return {
    ok: true,
    couple_archetype: result.couple_archetype,
    overall_score: result.overall_score,
    free_insights: result.free_insights,
    locked_blocks: result.locked_blocks,
    disclaimer: result.disclaimer || getDefaultDisclaimer(),
    cta: result.cta,
    image_quality: {
      a: imageQualityA || null,
      b: imageQualityB || null,
    },
    is_fallback: isFallback || providerIsFallback,
    meta: {
      provider: activeProvider.name,
      model: config.AI_MODEL,
      processing_time_ms: durationMs,
    },
  };
}

// ------------------------------------------------------------------
// Выбор couple-архетипа на сервере (зеркалит frontend/lib/compatibilityArchetypes.ts)
// ------------------------------------------------------------------
const SERVER_COUPLE_ARCHETYPES = [
  { name: 'Два Полюса', energies: ['Напряжение', 'Притяжение'], min: 0, max: 35 },
  { name: 'Огонь и Якорь', energies: ['Импульс', 'Стабильность'], min: 35, max: 50 },
  { name: 'Параллельные Пути', energies: ['Независимость', 'Уважение'], min: 50, max: 60 },
  { name: 'Общий Ритм', energies: ['Гармония', 'Поддержка'], min: 60, max: 70 },
  { name: 'Тихая Гавань', energies: ['Забота', 'Безопасность'], min: 70, max: 78 },
  { name: 'Искра и Пламя', energies: ['Страсть', 'Рост'], min: 78, max: 85 },
  { name: 'Зеркальные Души', energies: ['Синхронность', 'Доверие'], min: 85, max: 101 },
];

function pickCoupleArchetypeServerSide(score) {
  const clamped = Math.max(0, Math.min(100, score));
  const match = SERVER_COUPLE_ARCHETYPES.find((a) => clamped >= a.min && clamped < a.max);
  return match ? { name: match.name, energies: match.energies } : SERVER_COUPLE_ARCHETYPES[0];
}

// ------------------------------------------------------------------
// Резервный mock-результат (используется, если и Gemini, и fallback-провайдер
// не смогли вернуть валидный JSON) — строится ИЗ findings, не захардкожен,
// поэтому остаётся осмысленным даже в degraded-режиме
// ------------------------------------------------------------------
function buildMockCompatibilityResult(findings, coupleArchetype) {
  const si = findings.section_inputs;
  return {
    couple_archetype: coupleArchetype,
    overall_score: findings.overall_score,
    free_insights: [
      { section_id: 'emotional_resonance', title: 'Эмоциональный резонанс', text: `Ваши эмоциональные линии показывают ${si.emotional_resonance.verdict === 'aligned' ? 'сильное совпадение' : 'взаимодополняющий узор'}.` },
      { section_id: 'communication_style', title: 'Стиль общения', text: `В стиле мышления у вас ${si.communication_style.verdict === 'aligned' ? 'много общего' : 'заметны различия, которые можно превратить в силу пары'}.` },
    ],
    locked_blocks: [
      { section_id: 'life_pace', title: 'Темп жизни и энергия', teaser: 'Узнайте, кто в паре задаёт ритм.' },
      { section_id: 'shared_goals', title: 'Общие цели и амбиции', teaser: 'Куда на самом деле движется ваша пара.' },
      { section_id: 'conflict_pattern', title: 'Паттерн конфликтов', teaser: 'Как вы на самом деле ссоритесь — и миритесь.' },
      { section_id: 'intimacy', title: 'Телесная и чувственная близость', teaser: 'Что говорят бугры Венеры о вашей близости.' },
      { section_id: 'financial_sync', title: 'Финансовая синхронность', teaser: 'Совпадают ли ваши отношения с деньгами.' },
      { section_id: 'growth_potential', title: 'Потенциал совместного роста', teaser: 'Куда может вырасти эта пара через год.' },
      { section_id: 'vulnerability_zones', title: 'Зоны уязвимости пары', teaser: 'Самое слабое звено — и как его укрепить.' },
      { section_id: 'support_dynamic', title: 'Кто кого поддерживает в кризис', teaser: 'Истинная динамика поддержки в трудные моменты.' },
      { section_id: 'long_term_outlook', title: 'Долгосрочная перспектива', teaser: 'Что ждёт вашу пару через годы.' },
      { section_id: 'ritual_recommendation', title: 'Ритуал на укрепление пары (7 дней)', teaser: 'Персональный 7-дневный ритуал для вас двоих.' },
    ],
    disclaimer: getDefaultDisclaimer(),
    cta: 'Откройте полный разбор вашей пары',
  };
}