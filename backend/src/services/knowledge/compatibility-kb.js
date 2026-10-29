/**
 * compatibility-kb.js (v2 — под реальную palmAnalysisResultSchema)
 *
 * Правки после получения report-schema.js:
 * - поля называются `id`, не `name`
 * - `quality` (у линий) и `prominence` (у бугров) — СВОБОДНЫЙ ТЕКСТ (z.string()),
 *   не фиксированный enum. Поэтому verdict строится на `confidence` (число,
 *   надёжно сравнимо) и `present` (boolean). quality/notes прокидываются как
 *   текстовый контекст в финальный промпт для Gemini, но НЕ участвуют в
 *   ветвлении логики — нельзя надёжно сравнивать "deep" со "shallow" без
 *   фиксированного словаря, а его в схеме нет.
 */

export const COMPATIBILITY_SECTIONS = [
  { id: 'emotional_resonance', title: 'Эмоциональный резонанс', tier: 'free' },
  { id: 'communication_style', title: 'Стиль общения', tier: 'free' },
  { id: 'life_pace', title: 'Темп жизни и энергия', tier: 'locked' },
  { id: 'shared_goals', title: 'Общие цели и амбиции', tier: 'locked' },
  { id: 'conflict_pattern', title: 'Паттерн конфликтов', tier: 'locked' },
  { id: 'intimacy', title: 'Телесная и чувственная близость', tier: 'locked' },
  { id: 'financial_sync', title: 'Финансовая синхронность', tier: 'locked' },
  { id: 'growth_potential', title: 'Потенциал совместного роста', tier: 'locked' },
  { id: 'vulnerability_zones', title: 'Зоны уязвимости пары', tier: 'locked' },
  { id: 'support_dynamic', title: 'Кто кого поддерживает в кризис', tier: 'locked' },
  { id: 'long_term_outlook', title: 'Долгосрочная перспектива', tier: 'locked' },
  { id: 'ritual_recommendation', title: 'Ритуал на укрепление пары (7 дней)', tier: 'locked' },
];

function getLine(observations, lineId) {
  return (observations?.lines || []).find((l) => l.id === lineId) || null;
}

function getMount(observations, mountId) {
  return (observations?.mounts || []).find((m) => m.id === mountId) || null;
}

/**
 * Базовое сопоставление ПО ЛИНИИ: единая логика на confidence + present,
 * переиспользуется для всех линий вместо отдельной функции на каждую.
 */
function matchByConfidence(itemA, itemB, { missingDetail = 'insufficient_data' } = {}) {
  if (!itemA || !itemB || itemA.present === false || itemB.present === false) {
    return {
      verdict: 'complementary',
      strength: 50,
      detail: missingDetail,
      context: { a: itemA?.notes || null, b: itemB?.notes || null },
    };
  }

  const confA = itemA.confidence ?? 50;
  const confB = itemB.confidence ?? 50;
  const diff = Math.abs(confA - confB);
  const avg = Math.round((confA + confB) / 2);

  let verdict;
  if (diff < 15) verdict = 'aligned';
  else if (diff < 35) verdict = 'complementary';
  else verdict = 'friction';

  // strength: высокий средний confidence + низкий diff = выше итоговая сила совпадения
  const strength = Math.max(0, Math.min(100, Math.round(avg - diff * 0.5)));

  return {
    verdict,
    strength,
    detail: `confidence_diff_${diff}`,
    context: {
      a: itemA.notes || null,
      b: itemB.notes || null,
      qualityA: itemA.quality ?? itemA.prominence ?? null,
      qualityB: itemB.quality ?? itemB.prominence ?? null,
    },
  };
}

function matchHeartLines(obsA, obsB) {
  return matchByConfidence(getLine(obsA, 'heart'), getLine(obsB, 'heart'));
}

function matchHeadLines(obsA, obsB) {
  return matchByConfidence(getLine(obsA, 'head'), getLine(obsB, 'head'));
}

function matchLifeLines(obsA, obsB) {
  return matchByConfidence(getLine(obsA, 'life'), getLine(obsB, 'life'));
}

function matchFateLines(obsA, obsB) {
  return matchByConfidence(getLine(obsA, 'fate'), getLine(obsB, 'fate'), {
    missingDetail: 'one_or_both_undefined_path',
  });
}

function matchVenusMounts(obsA, obsB) {
  return matchByConfidence(getMount(obsA, 'venus'), getMount(obsB, 'venus'));
}

// ------------------------------------------------------------------
export function buildCompatibilityFindings(obsA, obsB) {
  const heart = matchHeartLines(obsA, obsB);
  const head = matchHeadLines(obsA, obsB);
  const life = matchLifeLines(obsA, obsB);
  const fate = matchFateLines(obsA, obsB);
  const venus = matchVenusMounts(obsA, obsB);

  const overallScore = Math.round(
    (heart.strength + head.strength + life.strength + fate.strength + venus.strength) / 5
  );

  return {
    overall_score: overallScore,
    raw: { heart, head, life, fate, venus },
    section_inputs: {
      emotional_resonance: heart,
      communication_style: head,
      life_pace: life,
      shared_goals: fate,
      conflict_pattern: deriveConflictPattern(heart, head),
      intimacy: venus,
      financial_sync: deriveFinancialSync(head, fate),
      growth_potential: deriveGrowth(fate, life),
      vulnerability_zones: deriveVulnerability(heart, life),
      support_dynamic: deriveSupport(heart, venus),
      long_term_outlook: deriveLongTerm(overallScore),
      ritual_recommendation: null,
    },
  };
}

function deriveConflictPattern(heart, head) {
  if (heart.verdict === 'friction' || head.verdict === 'friction') {
    return { verdict: 'friction', strength: 40, detail: 'emotion_or_logic_clash' };
  }
  return { verdict: 'complementary', strength: 65, detail: 'manageable_differences' };
}

function deriveFinancialSync(head, fate) {
  const avg = Math.round((head.strength + fate.strength) / 2);
  return { verdict: avg >= 65 ? 'aligned' : 'complementary', strength: avg, detail: 'derived_head_fate' };
}

function deriveGrowth(fate, life) {
  const avg = Math.round((fate.strength + life.strength) / 2);
  return { verdict: avg >= 65 ? 'aligned' : 'complementary', strength: avg, detail: 'derived_fate_life' };
}

function deriveVulnerability(heart, life) {
  const min = Math.min(heart.strength, life.strength);
  return { verdict: min < 45 ? 'friction' : 'complementary', strength: min, detail: 'weakest_link' };
}

function deriveSupport(heart, venus) {
  const avg = Math.round((heart.strength + venus.strength) / 2);
  return { verdict: avg >= 65 ? 'aligned' : 'complementary', strength: avg, detail: 'derived_heart_venus' };
}

function deriveLongTerm(overallScore) {
  if (overallScore >= 70) return { verdict: 'aligned', strength: overallScore, detail: 'strong_overall' };
  if (overallScore >= 50) return { verdict: 'complementary', strength: overallScore, detail: 'workable_overall' };
  return { verdict: 'friction', strength: overallScore, detail: 'needs_conscious_work' };
}