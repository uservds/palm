const FORBIDDEN_PATTERNS = [
  /диагноз/i, /заболевание/i, /болезн[ьи]/i,
  /рак\b/i, /диабет/i, /инфаркт/i, /инсульт/i,
  /обязательно/i, /гарантированно/i, /точно знай/i,
  /ты заболеешь/i, /ты разведёшься/i,
  /ты потеряешь деньги/i, /ты станешь богатым/i,
  /тебя ждёт/i, /предсказание сбылось/i,
  /медицинская рекомендация/i,
  /you will get sick/i, /you will die/i,
  /guaranteed/i, /inevitably/i,
];

const DEFAULT_DISCLAIMER =
  'Palmis AI носит развлекательный характер. Это не медицинская, юридическая или финансовая консультация и не предсказание будущего.';

function containsForbidden(text) {
  return FORBIDDEN_PATTERNS.some(p => p.test(text));
}

function sanitizeText(text) {
  if (!containsForbidden(text)) return text;

  let s = text;
  s = s.replace(/у вас (?:может быть|есть|обнаружен)[^.]*?(?:диагноз|заболевание|болезнь)[^.]*\./gi, '');
  s = s.replace(/(?:вы|ты) (?:обязательно|гарантированно|точно)[^.]*\./gi, '');
  s = s.replace(/(?:вас|тебя) (?:ждёт|ожидает)[^.]*\./gi, '');
  s = s.replace(/вам (?:следует|нужно) (?:обратиться|идти) (?:к врачу|в больницу)[^.]*\./gi, '');

  if (containsForbidden(s)) return null;
  return s.trim() || null;
}

/**
 * Post-filter AI report (Vision — /api/vision shape: result.report.*).
 * Returns { result, needsFallback }.
 */
export function moderateReport(result) {
  const report = { ...result.report };
  let removed = 0;

  // free_insights
  const insights = [];
  for (const t of report.free_insights) {
    const s = sanitizeText(t);
    if (s) insights.push(s); else removed++;
  }
  if (insights.length === 0) return { result, needsFallback: true };
  report.free_insights = insights;

  // locked_blocks teasers
  const blocks = [];
  for (const b of report.locked_blocks) {
    const s = sanitizeText(b.teaser);
    if (s) blocks.push({ ...b, teaser: s }); else removed++;
  }
  if (blocks.length === 0) return { result, needsFallback: true };
  report.locked_blocks = blocks;

  // scientific_facts
  const facts = [];
  for (const f of report.scientific_facts) {
    const s = sanitizeText(f);
    if (s) facts.push(s); else removed++;
  }
  report.scientific_facts = facts;

  // disclaimer
  if (!report.disclaimer || report.disclaimer.length < 10) {
    report.disclaimer = DEFAULT_DISCLAIMER;
  }

  // progress_percent
  report.progress_percent = Math.max(0, Math.min(100, report.progress_percent || 25));

  if (removed > 3) return { result, needsFallback: true };

  return { result: { ...result, report }, needsFallback: false };
}

/**
 * Post-filter AI report for Compatibility (/api/compatibility/* shape —
 * FLAT, no .report wrapper; free_insights/locked_blocks are objects with
 * text/teaser fields, not plain strings). moderateReport() above cannot be
 * reused as-is: result.report is undefined on this shape and it would throw
 * on `for (const t of report.free_insights)`.
 *
 * Returns { result, needsFallback } — same contract as moderateReport().
 */
export function moderateCompatibilityReport(result) {
  const report = { ...result };
  let removed = 0;

  // free_insights — objects {section_id, title, text}
  const insights = [];
  for (const item of report.free_insights) {
    const s = sanitizeText(item.text);
    if (s) insights.push({ ...item, text: s });
    else removed++;
  }
  if (insights.length === 0) return { result, needsFallback: true };
  report.free_insights = insights;

  // locked_blocks — objects {section_id, title, teaser}
  const blocks = [];
  for (const b of report.locked_blocks) {
    const s = sanitizeText(b.teaser);
    if (s) blocks.push({ ...b, teaser: s });
    else removed++;
  }
  // compatibilityReportSchema requires .min(8) — if cleaning drops below
  // that, a valid object can't be assembled anyway, so fall back early
  if (blocks.length < 8) return { result, needsFallback: true };
  report.locked_blocks = blocks;

  // disclaimer
  if (!report.disclaimer || report.disclaimer.length < 10) {
    report.disclaimer = DEFAULT_DISCLAIMER;
  }

  // overall_score — clamp defensively, same spirit as progress_percent above
  report.overall_score = Math.max(0, Math.min(100, report.overall_score ?? 50));

  if (removed > 3) return { result, needsFallback: true };

  return { result: report, needsFallback: false };
}

export function getDefaultDisclaimer() {
  return DEFAULT_DISCLAIMER;
}