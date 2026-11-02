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

// ============================================================
// Group compatibility (friendship / business), 2–4 участника
// ============================================================

const SERVER_GROUP_ARCHETYPES = {
  friendship: [
    { title: 'Два Якоря', description: 'Стабильность и надёжность — то, что связывает эту компанию крепче всего.', min: 0, max: 60 },
    { title: 'Искры и Топливо', description: 'Один генерирует идеи, другие доводят их до результата — рабочий дружеский тандем.', min: 60, max: 75 },
    { title: 'Созвездие', description: 'Каждый яркий по-своему, но вместе вы складываетесь в узнаваемый рисунок.', min: 75, max: 85 },
    { title: 'Зеркала', description: 'Схожий взгляд на мир создаёт редкое чувство — быть понятым без слов.', min: 85, max: 101 },
  ],
  business: [
    { title: 'Фундамент и Фасад', description: 'Один выстраивает процессы и устойчивость, другой — репутацию и внешние связи.', min: 0, max: 60 },
    { title: 'Два Капитана', description: 'Оба склонны брать управление на себя — потребуется чёткое разграничение зон влияния.', min: 60, max: 75 },
    { title: 'Разведчик и Штаб', description: 'Один идёт в новые направления, другой просчитывает риски — эффективный тандем для роста.', min: 75, max: 85 },
    { title: 'Стратег и Исполнитель', description: 'Классическое разделение ролей: один видит картину на годы вперёд, другой превращает план в результат.', min: 85, max: 101 },
  ],
};

function pickGroupArchetypeServerSide(kind, score) {
  const list = SERVER_GROUP_ARCHETYPES[kind];
  const clamped = Math.max(0, Math.min(100, score));
  const match = list.find((a) => clamped >= a.min && clamped < a.max);
  return match || list[0];
}

/**
 * Группа 2–4 участников. Сканируем все ладони, считаем findings для каждой
 * уникальной пары (buildCompatibilityFindings — тот же KB, что в couple),
 * общий score — среднее по всем парам. Архетип — по среднему score.
 *
 * @param {Object} params
 * @param {'friendship'|'business'} params.kind
 * @param {{buffer: Buffer, mimeType: string}[]} params.participants
 */
export async function analyzeGroupCompatibility({ kind, participants }) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  if (!['friendship', 'business'].includes(kind)) {
    return { ok: false, error: { code: 'INVALID_INPUT', user_message: 'Некорректный тип разбора.' } };
  }
  if (participants.length < 2 || participants.length > 4) {
    return { ok: false, error: { code: 'INVALID_INPUT', user_message: 'Нужно от 2 до 4 участников.' } };
  }

  // 1. Сканируем все ладони параллельно
  const results = await Promise.all(
    participants.map((p, i) => extractPalmObservations(p.buffer, p.mimeType, `${kind}:${i}`))
  );

  for (let i = 0; i < results.length; i++) {
    if (!results[i].ok) {
      return { ok: false, error: { ...results[i].error, details: { ...results[i].error.details, participant: i } } };
    }
  }

  const observations = results.map((r) => r.data.observations);
  const imageQualities = results.map((r) => r.data.image_quality || null);
  const isFallback = results.some((r) => r.isFallback);

  // 2. Все уникальные пары → findings → усредняем overall_score
  const pairFindings = [];
  for (let i = 0; i < observations.length; i++) {
    for (let j = i + 1; j < observations.length; j++) {
      pairFindings.push(buildCompatibilityFindings(observations[i], observations[j]));
    }
  }
  const overallScore = Math.round(
    pairFindings.reduce((sum, f) => sum + f.overall_score, 0) / pairFindings.length
  );

  const groupArchetype = pickGroupArchetypeServerSide(kind, overallScore);

  // 3. Текст через Gemini — берём лучшую пару (макс. score) как основу находок,
  //    остальное — детерминированный fallback-билдер ниже.
  const primaryProvider = getProvider();
  const fallbackProvider = getFallbackProvider();
  let activeProvider = primaryProvider;
  let providerIsFallback = false;
  let result = null;

  const bestPair = pairFindings.reduce((a, b) => (a.overall_score >= b.overall_score ? a : b));
  const prompt = buildCompatibilityPrompt({
    findings: bestPair,
    coupleArchetype: groupArchetype,
    genderA: 'female',
    genderB: 'female',
  });

  try {
    result = await activeProvider.analyzeText({ prompt });
  } catch (err) {
    logVisionError(requestId, 'GROUP_AI_CALL_FAILED', err instanceof Error ? err.message : 'Unknown AI error');
    try {
      activeProvider = fallbackProvider;
      providerIsFallback = true;
      result = await activeProvider.analyzeText({ prompt });
    } catch (fbErr) {
      logVisionError(requestId, 'GROUP_FALLBACK_FAILED', fbErr instanceof Error ? fbErr.message : 'Unknown fallback error');
      return {
        ok: false,
        error: { code: 'AI_UNAVAILABLE', user_message: 'Сервис анализа временно недоступен. Попробуйте позже.' },
      };
    }
  }

  let validated = compatibilityReportSchema.safeParse(result);

  if (!validated.success) {
    logVisionError(requestId, 'GROUP_VALIDATION_FAILED', JSON.stringify(validated.error.issues).slice(0, 300));
    try {
      activeProvider = new MockProvider();
      providerIsFallback = true;
      result = buildMockGroupResult(kind, groupArchetype);
      validated = compatibilityReportSchema.safeParse(result);
      if (!validated.success) throw new Error('Mock group fallback invalid');
    } catch (finalErr) {
      logVisionError(requestId, 'GROUP_FINAL_FALLBACK_FAILED', finalErr instanceof Error ? finalErr.message : 'Final fallback failed');
      return {
        ok: false,
        error: { code: 'AI_INVALID_RESPONSE', user_message: 'Не удалось сформировать отчёт. Попробуйте позже.' },
      };
    }
  }

  result = validated.data;
  result.couple_archetype = { name: groupArchetype.title, energies: [] };
  result.overall_score = overallScore;

  const moderated = moderateCompatibilityReport(result);
  if (moderated.needsFallback) {
    logVisionError(requestId, 'GROUP_MODERATION_FALLBACK', 'unsafe content removed, falling back to KB-only result');
    result = buildMockGroupResult(kind, groupArchetype);
    providerIsFallback = true;
  } else {
    result = moderated.result;
  }

  const durationMs = Date.now() - startTime;
  logVisionFinish(requestId, activeProvider.name, config.AI_MODEL, durationMs, 'ok', isFallback || providerIsFallback);

  return {
    ok: true,
    group_archetype: { title: groupArchetype.title, description: groupArchetype.description },
    overall_score: overallScore,
    participant_count: participants.length,
    free_insights: result.free_insights,
    locked_blocks: result.locked_blocks,
    disclaimer: result.disclaimer || getDefaultDisclaimer(),
    cta: result.cta,
    image_quality: imageQualities,
    is_fallback: isFallback || providerIsFallback,
    meta: {
      provider: activeProvider.name,
      model: config.AI_MODEL,
      processing_time_ms: durationMs,
    },
  };
}

function buildMockGroupResult(kind, groupArchetype) {
  const isBusiness = kind === 'business';
  return {
    couple_archetype: { name: groupArchetype.title, energies: [] },
    overall_score: 70,
    free_insights: [
      {
        section_id: 'group_dynamic',
        title: isBusiness ? 'Распределение ролей' : 'Групповая динамика',
        text: groupArchetype.description,
      },
    ],
    locked_blocks: isBusiness
      ? [
          { section_id: 'role_distribution', title: 'Распределение ролей в команде', teaser: 'Кто на самом деле ведёт, а кто исполняет.' },
          { section_id: 'risk_zones', title: 'Зоны риска партнёрства', teaser: 'Что стоит закрыть до старта совместного дела.' },
          { section_id: 'decision_style', title: 'Стиль принятия решений', teaser: 'Как вы реально договариваетесь в спорных ситуациях.' },
        ]
      : [
          { section_id: 'group_roles', title: 'Роли в компании', teaser: 'Кто генератор идей, а кто держит группу вместе.' },
          { section_id: 'friction_points', title: 'Точки будущих разногласий', teaser: 'Где чаще всего рождаются конфликты в такой группе.' },
          { section_id: 'loyalty_pattern', title: 'Паттерн лояльности', teaser: 'На чём держится доверие в этой компании.' },
        ],
    disclaimer: getDefaultDisclaimer(),
    cta: isBusiness ? 'Откройте полный разбор партнёрства' : 'Откройте полный разбор компании',
  };
}