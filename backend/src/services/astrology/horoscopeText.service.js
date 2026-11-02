/**
 * horoscopeText.service.js — превращает рассчитанные Swiss Ephemeris данные
 * в читаемый текст через Gemini напрямую (ТЗ: Gemini — основной провайдер
 * для астрологии, не через общую цепочку AI_PROVIDER/OpenRouter — см.
 * обсуждение в чате 01.11.2026: проект пойдёт в открытый GitHub-репозиторий,
 * прямой вызов Gemini предпочтительнее цепочки через OpenRouter именно для
 * этого блока).
 *
 * Расчёт (факты) и текст (литературная обёртка) разделены сознательно —
 * ровно так, как зафиксировано в ТЗ-полное.md: "Ephemeris считает точные
 * данные, Gemini превращает их в литературный текст отчёта".
 *
 * Переиспользую существующий backend/src/services/ai/gemini.js —
 * GeminiProvider.analyzeText(), тот же метод, которым уже пользуется
 * compatibility.service.js. Не создаю второй способ вызова Gemini.
 *
 * ФОЛБЭК — НЕ через MockProvider.analyzeText(): этот метод в mock.js
 * захардкожен под схему Compatibility (couple_archetype/overall_score/...)
 * и не параметризован промптом — для астрологии вернёт неправильный формат
 * молча. Поэтому при ошибке Gemini здесь используется локальная простая
 * заглушка (mockText ниже), а не общий MockProvider.
 */

import { GeminiProvider } from '../ai/gemini.js';

const gemini = new GeminiProvider();

function mockText(prompt) {
  const isWedding = prompt.includes('свадьбы');
  return isWedding
    ? '[MOCK] Эта дата выглядит благоприятной для начинаний — реальный текст появится, когда будет доступен Gemini.'
    : '[MOCK] Сегодняшний день располагает к спокойствию и новым идеям — реальный текст появится, когда будет доступен Gemini.';
}

async function generateText(prompt) {
  const jsonPrompt = `${prompt}

Верни СТРОГО JSON без markdown и без комментариев, в формате:
{"text": "готовый текст здесь"}`;

  try {
    const result = await gemini.analyzeText({ prompt: jsonPrompt });
    const text = result?.text;
    if (!text || typeof text !== 'string') {
      throw new Error(`Gemini: ответ не содержит поле "text", raw=${JSON.stringify(result).slice(0, 300)}`);
    }
    return text.trim();
  } catch (err) {
    console.error('horoscopeText.service: Gemini недоступен, фолбэк на локальный mock —', err.message);
    return mockText(prompt);
  }
}

const MOON_PHASE_RU = {
  waxing: 'растущая Луна',
  full_ish: 'Луна близка к полнолунию',
  waning: 'убывающая Луна',
  new_ish: 'Луна близка к новолунию',
};

export async function generateWeddingDateExplanation(candidate) {
  const conflicts = Array.isArray(candidate.angularConflicts) ? candidate.angularConflicts : [];
  const conflictsText = conflicts.length
    ? conflicts.map((c) => `${c.planet} в доме ${c.house}`).join(', ')
    : 'нет';

  const prompt = `Ты — astrology-копирайтер сервиса PalmAI. На основе ФАКТОВ ниже
(они уже рассчитаны астрономически, не придумывай и не меняй их) напиши
мягкое, доброжелательное объяснение на русском языке, 2-4 предложения, почему
эта дата подходит или не очень подходит для свадьбы. Без категоричных
предсказаний конкретных событий, без медицинских/финансовых советов, в тоне
"символическая трактовка", не "научный вывод".

Факты:
- Дата: ${candidate.candidateDate.toISOString().slice(0, 10)}
- Венера ретроградна: ${candidate.venusRetrograde ? 'да' : 'нет'}
- Меркурий ретрограден: ${candidate.mercuryRetrograde ? 'да' : 'нет'}
- Фаза Луны: ${MOON_PHASE_RU[candidate.moonPhase] ?? candidate.moonPhase}
- Конфликты в угловых домах (Марс/Сатурн/Уран): ${conflictsText}
- Итоговый скор (эвристика сервиса, не традиционный астрологический термин): ${candidate.score}/100`;

  return generateText(prompt);
}

export async function generateDailyHoroscopeText({ natalPositions, transitPositions, dateISO }) {
  const prompt = `Ты — astrology-копирайтер сервиса PalmAI. На основе ФАКТОВ ниже
(рассчитаны астрономически) напиши персональный ежедневный гороскоп на
русском языке, 4-6 предложений, тёплый и поддерживающий тон, без медицинских
диагнозов, без конкретных финансовых советов, без точных предсказаний
отдельных событий — это символическая трактовка, не научный прогноз.

Дата: ${dateISO}
Натальные позиции (упрощённо, градусы по знаку не переводим — ты сам знаешь
соответствие градусов знакам зодиака): ${JSON.stringify(natalPositions)}
Текущие транзитные позиции: ${JSON.stringify(transitPositions)}`;

  return generateText(prompt);
}
