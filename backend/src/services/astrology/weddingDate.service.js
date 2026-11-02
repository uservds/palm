/**
 * weddingDate.service.js — подбор даты свадьбы.
 *
 * Правила фильтрации — ровно те, что зафиксированы в дорожная-карта.md
 * («Уточнение по разделу «Дата свадьбы»», 24.10.2026):
 *   1. Исключать ретроградную Венеру и Меркурий на дату-кандидат.
 *   2. Избегать Марса/Сатурна/Урана в угловых домах (1, 4, 7, 10) карты события.
 *   3. Учитывать фазу Луны.
 *
 * ОБЪЁМ V1 (сознательно): фильтры считаются по карте СОБЫТИЯ (время+место
 * свадьбы), не по синастрии (сравнению) натальных карт партнёров между собой.
 * Натальные карты партнёров уже сохраняются (natalChart.service.js) и готовы
 * для синастрии в будущем (Приоритет 11, "AI-сравнение с эталонами" по
 * смыслу близко), но сам алгоритм синастрии в ТЗ не описан — не угадываю его
 * здесь, чтобы не выдать себя за точную рекомендацию дорожной карты.
 *
 * Угловые дома (1,4,7,10) считаются Equal House от асцендента карты события
 * — см. комментарий в ephemeris.js про упрощение системы домов.
 */

import { prisma } from '../../lib/prisma.js';
import {
  computePlanetPosition,
  computeMoonPhase,
  computeAscendantAndHouses,
  houseForLongitude,
} from './ephemeris.js';
import { localTimeToUTCHour } from './geocode.js';
import { generateWeddingDateExplanation } from './horoscopeText.service.js';

const ANGULAR_HOUSES = [1, 4, 7, 10];
const MALEFICS_TO_AVOID_IN_ANGLES = ['MARS', 'SATURN', 'URANUS'];

// Сколько лучших кандидатов получают текстовое объяснение от Gemini —
// генерировать текст на каждый день периода (может быть 30-90+ дней) дорого
// и не нужно пользователю.
const TOP_N_WITH_EXPLANATION = 5;

/**
 * Считает карту события на полдень местного времени для одной даты-кандидата
 * и возвращает её оценку по правилам.
 */
async function evaluateCandidateDate(date, eventLat, eventLng, eventTimezone) {
  const hourUT = localTimeToUTCHour(date, '12:00', eventTimezone);

  const [venus, mercury, mars, saturn, uranus, moonPhase, { houses }] = await Promise.all([
    computePlanetPosition('VENUS', date, hourUT),
    computePlanetPosition('MERCURY', date, hourUT),
    computePlanetPosition('MARS', date, hourUT),
    computePlanetPosition('SATURN', date, hourUT),
    computePlanetPosition('URANUS', date, hourUT),
    computeMoonPhase(date, hourUT),
    computeAscendantAndHouses(date, hourUT, eventLat, eventLng),
  ]);

  const malefics = { MARS: mars, SATURN: saturn, URANUS: uranus };
  const angularConflicts = [];
  for (const planetKey of MALEFICS_TO_AVOID_IN_ANGLES) {
    const house = houseForLongitude(malefics[planetKey].longitude, houses);
    if (ANGULAR_HOUSES.includes(house)) {
      angularConflicts.push({ planet: planetKey, house });
    }
  }

  const venusRetrograde = venus.retrograde;
  const mercuryRetrograde = mercury.retrograde;

  // Жёсткий фильтр: ретроградная Венера/Меркурий — дата не проходит.
  const passedFilters = !venusRetrograde && !mercuryRetrograde;

  // Скор: старт от 100, штрафы за угловые конфликты, бонус за растущую Луну
  // (традиционная рекомендация для начинаний). Это эвристика для сортировки
  // кандидатов, прошедших жёсткий фильтр, — не заявлена в ТЗ как формула,
  // поэтому явно помечаю её как эвристику в explanation-промпте ниже.
  let score = 100 - angularConflicts.length * 20;
  if (moonPhase === 'waxing') score += 10;
  if (moonPhase === 'new_ish') score -= 10;
  score = Math.max(0, Math.min(100, score));

  return {
    candidateDate: date,
    score,
    passedFilters,
    venusRetrograde,
    mercuryRetrograde,
    moonPhase,
    angularConflicts,
  };
}

/**
 * Перебирает весь период [periodStart, periodEnd] и создаёт кандидатов
 * в БД для заявки requestId. Период может быть длинным (месяцы) — функция
 * синхронная по вызовам, для очень длинных периодов (>~120 дней) стоит
 * вынести в фоновую задачу/очередь, сейчас этого в проекте нет, поэтому
 * вызывающий код (route) должен сам решить, ограничивать ли период на входе
 * (валидатор astrology.schemas.js ограничивает 180 днями — см. там же).
 */
export async function runWeddingDateSearch(requestId) {
  const request = await prisma.weddingDateRequest.findUniqueOrThrow({
    where: { id: requestId },
  });

  await prisma.weddingDateRequest.update({
    where: { id: requestId },
    data: { status: 'processing' },
  });

  try {
    const days = enumerateDays(request.periodStart, request.periodEnd);
    const evaluations = [];
    for (const day of days) {
      // Последовательно, не Promise.all по всем дням разом — на период в
      // несколько месяцев это может быть 90+ дней × 5 вызовов calc_ut,
      // а WASM-инстанс у нас один (см. ephemeris.js) — не хотим его заспамить.
      evaluations.push(
        await evaluateCandidateDate(day, request.eventLat, request.eventLng, request.eventTimezone)
      );
    }

    const passed = evaluations.filter((e) => e.passedFilters).sort((a, b) => b.score - a.score);
    const ranked = passed.length ? passed : evaluations.sort((a, b) => b.score - a.score);
    // Если вообще ни одна дата не прошла жёсткий фильтр (ретро Венера/Меркурий
    // весь период) — показываем лучшие по скору с passedFilters=false, чтобы
    // пользователь не получил пустой результат, но видел предупреждение.

    await prisma.$transaction(
      ranked.map((e, idx) =>
        prisma.weddingDateCandidate.create({
          data: {
            requestId,
            candidateDate: e.candidateDate,
            score: e.score,
            rank: idx + 1,
            passedFilters: e.passedFilters,
            venusRetrograde: e.venusRetrograde,
            mercuryRetrograde: e.mercuryRetrograde,
            moonPhase: e.moonPhase,
            angularConflicts: e.angularConflicts,
          },
        })
      )
    );

    // Текст-объяснение от Gemini — только для топ-N, после того как кандидаты уже в БД
    const top = await prisma.weddingDateCandidate.findMany({
      where: { requestId },
      orderBy: { rank: 'asc' },
      take: TOP_N_WITH_EXPLANATION,
    });
    for (const candidate of top) {
      const explanation = await generateWeddingDateExplanation(candidate).catch((err) => {
        // Текст — это "вишенка", не блокируем весь расчёт, если Gemini недоступен
        // (как уже бывало — см. что-сделано.md, "Известное ограничение — OpenRouter 403")
        console.error('weddingDate: explanation generation failed', err);
        return null;
      });
      if (explanation) {
        await prisma.weddingDateCandidate.update({
          where: { id: candidate.id },
          data: { explanation },
        });
      }
    }

    await prisma.weddingDateRequest.update({
      where: { id: requestId },
      data: { status: 'completed', completedAt: new Date() },
    });
  } catch (err) {
    await prisma.weddingDateRequest.update({
      where: { id: requestId },
      data: { status: 'failed', errorMsg: String(err?.message ?? err) },
    });
    throw err;
  }
}

function enumerateDays(start, end) {
  const days = [];
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  while (cursor <= last) {
    days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}
