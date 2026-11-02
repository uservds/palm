/**
 * natalChart.service.js — создание NatalChart в БД и заполнение её
 * рассчитанными позициями (positions JSON).
 *
 * ВАЖНО: импорт `prisma` ниже предполагает уже существующий
 * backend/src/lib/prisma.js (см. что-сделано.md, Этап 11, п.11 — там уже
 * настроен @prisma/adapter-pg). Путь импорта поправь под реальную структуру,
 * если она отличается.
 */

import { prisma } from '../../lib/prisma.js';
import { geocodePlace, localTimeToUTCHour } from './geocode.js';
import { computeAllPlanets, computeAscendantAndHouses, houseForLongitude } from './ephemeris.js';

/**
 * @typedef {Object} BirthInput
 * @property {string} birthDate — "YYYY-MM-DD"
 * @property {string|null} birthTime — "HH:mm" или null, если неизвестно
 * @property {string} birthPlace — человекочитаемое название места
 * @property {string|null} userId — владелец (для личной карты), иначе null (партнёр в заявке)
 */

/**
 * Создаёт NatalChart: геокодирует место, запускает расчёт, сохраняет
 * результат синхронно (расчёт занимает миллисекунды — отдельная очередь
 * не нужна на этом объёме).
 *
 * @param {BirthInput} input
 * @returns {Promise<import('@prisma/client').NatalChart>}
 */
export async function createNatalChart(input) {
  const { birthDate, birthTime, birthPlace, userId = null } = input;

  const geo = await geocodePlace(birthPlace);

  const chart = await prisma.natalChart.create({
    data: {
      birthDate: new Date(`${birthDate}T00:00:00.000Z`),
      birthTime: birthTime ?? null,
      timeKnown: Boolean(birthTime),
      birthPlace: geo.displayName,
      birthLat: geo.lat,
      birthLng: geo.lng,
      timezone: geo.timezone,
      userId,
    },
  });

  try {
    const positions = await calculatePositions(chart);
    return prisma.natalChart.update({
      where: { id: chart.id },
      data: { positions, calculatedAt: new Date(), calcError: null },
    });
  } catch (err) {
    await prisma.natalChart.update({
      where: { id: chart.id },
      data: { calcError: String(err?.message ?? err) },
    });
    throw err;
  }
}

/**
 * Запускает расчёт планет (+ асцендент/дома, если известно время рождения)
 * для уже созданной записи NatalChart.
 */
async function calculatePositions(chart) {
  const hourUT = localTimeToUTCHour(chart.birthDate, chart.birthTime, chart.timezone ?? 'UTC');
  const planets = await computeAllPlanets(chart.birthDate, hourUT);

  if (!chart.timeKnown || chart.birthLat == null || chart.birthLng == null) {
    // Без точного времени Asc/дома считать нельзя (классическое ограничение
    // хиромантии... то есть астрологии) — отдаём только позиции планет.
    return { planets, ascendant: null, mc: null, houses: null, housesAvailable: false };
  }

  const { ascendant, mc, houses } = await computeAscendantAndHouses(
    chart.birthDate,
    hourUT,
    chart.birthLat,
    chart.birthLng
  );

  const planetsWithHouses = Object.fromEntries(
    Object.entries(planets).map(([key, p]) => [
      key,
      { ...p, house: houseForLongitude(p.longitude, houses) },
    ])
  );

  return { planets: planetsWithHouses, ascendant, mc, houses, housesAvailable: true };
}

/** Пересчитать уже существующую карту (например, после правки данных рождения). */
export async function recalculateNatalChart(chartId) {
  const chart = await prisma.natalChart.findUniqueOrThrow({ where: { id: chartId } });
  const positions = await calculatePositions(chart);
  return prisma.natalChart.update({
    where: { id: chartId },
    data: { positions, calculatedAt: new Date(), calcError: null },
  });
}
