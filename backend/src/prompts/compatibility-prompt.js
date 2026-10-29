/**
 * compatibility-prompt.js
 *
 * В отличие от vision-prompt.js (который просит модель САМА извлечь данные
 * из фото), этот промпт получает уже посчитанные findings из
 * compatibility-kb.js и просит Gemini только облечь их в литературный
 * текст — ровно так же, как связка Ephemeris+Gemini для натальных карт
 * (ТЗ-полное.md, п.2): точный расчёт отдельно, текст отдельно.
 */

export function buildCompatibilityPrompt({ findings, coupleArchetype, genderA, genderB }) {
  const pronounHintA = genderA === 'female' ? 'партнёр А — женщина' : 'партнёр А — мужчина';
  const pronounHintB = genderB === 'female' ? 'партнёр Б — женщина' : 'партнёр Б — мужчина';

  return `Ты — литературный редактор отчётов о совместимости по хиромантии.
Тебе даны ГОТОВЫЕ результаты сопоставления линий ладоней двух людей —
НЕ анализируй фото, их у тебя нет, все числовые выводы уже посчитаны.
Твоя задача — превратить структурированные findings в читаемый текст для
каждого раздела отчёта, на русском языке, без диагнозов и категоричных
предсказаний конкретных дат.

Контекст: ${pronounHintA}, ${pronounHintB}. Согласуй род прилагательных и
глаголов в тексте с полом каждого партнёра там, где это уместно, но пиши
преимущественно о паре в целом ("вы", "ваша пара"), а не раздельно о
каждом по отдельности.

Couple-архетип пары (уже выбран по score, не меняй и не оспаривай его):
"${coupleArchetype.name}" — энергии: ${coupleArchetype.energies.join(', ')}.

Готовые findings по разделам (verdict: aligned = совпадение,
complementary = взаимодополнение, friction = трение/зона роста):
${JSON.stringify(findings.section_inputs, null, 2)}

Общий score совместимости: ${findings.overall_score}/100.

Верни СТРОГО JSON по следующей схеме, без markdown и комментариев:

{
  "couple_archetype": { "name": string, "energies": [string, string] },
  "overall_score": number,
  "free_insights": [
    { "section_id": "emotional_resonance", "title": string, "text": string },
    { "section_id": "communication_style", "title": string, "text": string }
  ],
  "locked_blocks": [
    { "section_id": string, "title": string, "teaser": string }
  ],
  "disclaimer": string,
  "cta": string
}

Требования:
- free_insights — ровно 2 раздела (emotional_resonance, communication_style), текст 2-4 предложения каждый, тон тёплый и конкретный, без воды.
- locked_blocks — остальные 10 разделов из списка: life_pace, shared_goals, conflict_pattern, intimacy, financial_sync, growth_potential, vulnerability_zones, support_dynamic, long_term_outlook, ritual_recommendation. teaser — 1 интригующее предложение на раздел, НЕ раскрывающее суть вывода (это платный контент).
- Если verdict = "friction" — формулируй мягко, как зону роста, а не как приговор или диагноз. Никогда не используй слова "несовместимы" или аналоги.
- disclaimer — 1 предложение о том, что отчёт носит развлекательно-психологический характер.
- cta — короткая фраза, приглашающая открыть полный разбор, БЕЗ прямого упоминания цены (цена показывается отдельно в UI).`;
}