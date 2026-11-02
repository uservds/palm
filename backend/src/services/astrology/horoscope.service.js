/**
 * horoscope.service.js — ежедневный гороскоп для пользователя с сохранённой
 * натальной картой. Отдельный модуль от weddingDate, хотя оба используют
 * ephemeris.js и horoscopeText.service.js — держим логику "для кого и на
 * какой день считаем" отдельно от "как считаем планеты".
 */

import { prisma } from '../../lib/prisma.js';
import { computeAllPlanets } from './ephemeris.js';
import { generateDailyHoroscopeText } from './horoscopeText.service.js';

/**
 * Возвращает (создавая при необходимости) гороскоп пользователя на
 * сегодняшний день по UTC. Идемпотентно — повторный вызов в тот же день
 * вернёт уже сохранённую запись (@@unique([userId, date]) в схеме).
 */
export async function getOrCreateTodayHoroscope(userId) {
  const natalChart = await prisma.natalChart.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  if (!natalChart) {
    const err = new Error('horoscope: у пользователя нет сохранённой натальной карты');
    err.code = 'NO_NATAL_CHART';
    throw err;
  }
  if (!natalChart.positions) {
    const err = new Error('horoscope: натальная карта ещё не рассчитана');
    err.code = 'NATAL_CHART_NOT_CALCULATED';
    throw err;
  }

  const today = new Date();
  const todayUTCMidnight = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  const existing = await prisma.dailyHoroscope.findUnique({
    where: { userId_date: { userId, date: todayUTCMidnight } },
  });
  if (existing) return existing;

  const hourUT = today.getUTCHours() + today.getUTCMinutes() / 60;
  const transitPositions = await computeAllPlanets(today, hourUT);

  const content = await generateDailyHoroscopeText({
    natalPositions: natalChart.positions,
    transitPositions,
    dateISO: todayUTCMidnight.toISOString().slice(0, 10),
  });

  return prisma.dailyHoroscope.create({
    data: {
      userId,
      natalChartId: natalChart.id,
      date: todayUTCMidnight,
      content,
      transitData: transitPositions,
    },
  });
}
