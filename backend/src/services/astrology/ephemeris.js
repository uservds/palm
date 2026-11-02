/**
 * ephemeris.js — единственная точка входа к расчётам эфемерид.
 *
 * ВАЖНО (лицензия, прочитать перед продакшеном):
 * Swiss Ephemeris распространяется по двойной лицензии Astrodienst AG —
 * GPL (проект должен быть open source) ИЛИ платная коммерческая лицензия.
 * Для закрытого платного сервиса (как PalmAI) по-хорошему нужна коммерческая
 * лицензия — https://www.astro.com/swisseph/. Это не блокирует разработку,
 * но нужно решить до запуска в продакшен.
 *
 * Если решите уйти на движок без этого ограничения — меняется только этот
 * файл (функции computePlanetPosition/isRetrograde/computeMoonPhase),
 * остальной код (natalChart.js, weddingDate.service.js, horoscope.service.js)
 * ничего не знает о конкретном движке.
 *
 * ДВИЖОК: swisseph-wasm (npm) — компиляция настоящего Swiss Ephemeris в WASM,
 * без нативной сборки — важно для Replit, где сейчас (конец окт. 2026)
 * ограничены токены и пересобирать нативные биндинги рискованно (похожая
 * история уже была с Prisma 7 / driver adapter).
 *
 * Точность: по умолчанию используется режим Moshier (SEFLG_MOSEPH) —
 * аналитические формулы без файлов эфемерид (.se1), точность ~1 угл. секунды
 * для 1900–2100 гг., этого достаточно и для натальных карт, и для подбора
 * даты свадьбы. Файлы .se1 (SEFLG_SWIEPH, выше точность) можно подключить
 * позже — см. ENGINE_FLAG ниже.
 *
 * НЕ ПРОВЕРЕНО НА ЖИВОЙ УСТАНОВКЕ: пакет протестирован по документации
 * (README, 6k загрузок/нед, 106 тестов в самом пакете), но не npm install —
 * сеть в моей среде недоступна. Перед использованием в проде —
 * прогнать смоук-тест (ниже, __smokeTest) и свериться со своей версией пакета.
 */

import SwissEph from 'swisseph-wasm';

// Moshier — без файлов эфемерид. Если позже добавите .se1-файлы и зададите
// SE_EPHE_PATH, смените на swe.SEFLG_SWIEPH для максимальной точности.
const ENGINE_FLAG_NAME = 'SEFLG_MOSEPH';

export const PLANETS = {
  SUN: 'SE_SUN',
  MOON: 'SE_MOON',
  MERCURY: 'SE_MERCURY',
  VENUS: 'SE_VENUS',
  MARS: 'SE_MARS',
  JUPITER: 'SE_JUPITER',
  SATURN: 'SE_SATURN',
  URANUS: 'SE_URANUS',
  NEPTUNE: 'SE_NEPTUNE',
  PLUTO: 'SE_PLUTO',
};

let instance = null;
let initPromise = null;

/** Ленивая инициализация единственного инстанса SwissEph на процесс. */
async function getInstance() {
  if (instance) return instance;
  if (!initPromise) {
    initPromise = (async () => {
      const swe = new SwissEph();
      await swe.initSwissEph();
      instance = swe;
      return swe;
    })();
  }
  return initPromise;
}

/**
 * Julian Day (UT) для даты/времени.
 * @param {Date} date — дата в UTC (год/месяц/день берутся из UTC-компонентов)
 * @param {number} hourUT — часы (с дробной частью) в UTC, 0..24
 */
async function toJulianDay(date, hourUT) {
  const swe = await getInstance();
  return swe.julday(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    hourUT
  );
}

/**
 * Приводит результат calc_ut к единому виду вне зависимости от того,
 * вернула ли конкретная версия пакета массив или объект
 * (в README пакета показан массив [longitude, latitude, distance, speedLon, ...],
 * но публичный API WASM-обёрток такого рода нередко меняется между минорными
 * версиями — поэтому нормализуем защитно).
 */
function normalizeCalcResult(raw) {
  if (Array.isArray(raw)) {
    const [longitude, latitude, distance, speedLongitude, speedLatitude, speedDistance] = raw;
    return { longitude, latitude, distance, speedLongitude, speedLatitude, speedDistance };
  }
  if (raw && typeof raw === 'object') {
    return {
      longitude: raw.longitude ?? raw[0],
      latitude: raw.latitude ?? raw[1],
      distance: raw.distance ?? raw[2],
      speedLongitude: raw.speedLongitude ?? raw.longitudeSpeed ?? raw[3],
      speedLatitude: raw.speedLatitude ?? raw[4],
      speedDistance: raw.speedDistance ?? raw[5],
    };
  }
  throw new Error(`ephemeris: неожиданный формат ответа calc_ut: ${JSON.stringify(raw)}`);
}

/**
 * Позиция планеты (геоцентрическая, тропическая эклиптическая долгота + скорость).
 * @param {string} planetKey — ключ из PLANETS
 * @param {Date} date
 * @param {number} hourUT
 * @returns {Promise<{longitude:number, speedLongitude:number, retrograde:boolean}>}
 */
export async function computePlanetPosition(planetKey, date, hourUT) {
  const swe = await getInstance();
  const jd = await toJulianDay(date, hourUT);

  const planetConst = swe[PLANETS[planetKey]];
  const flag = swe[ENGINE_FLAG_NAME] | (swe.SEFLG_SPEED ?? 0);

  if (planetConst === undefined) {
    throw new Error(`ephemeris: неизвестная планета "${planetKey}" — проверь константы SwissEph`);
  }

  const raw = swe.calc_ut(jd, planetConst, flag);
  const result = normalizeCalcResult(raw);

  return {
    longitude: ((result.longitude % 360) + 360) % 360,
    speedLongitude: result.speedLongitude,
    retrograde: (result.speedLongitude ?? 0) < 0,
  };
}

/** Позиции всех 10 планет разом — для натальной карты и для транзитов. */
export async function computeAllPlanets(date, hourUT) {
  const entries = await Promise.all(
    Object.keys(PLANETS).map(async (key) => [key, await computePlanetPosition(key, date, hourUT)])
  );
  return Object.fromEntries(entries);
}

/**
 * Фаза Луны по углу между Солнцем и Луной (элонгация).
 * Простая 4-фазная модель — этого достаточно для правил подбора даты
 * свадьбы (ТЗ упоминает только "учитывать фазу Луны", без детализации).
 */
export async function computeMoonPhase(date, hourUT) {
  const [sun, moon] = await Promise.all([
    computePlanetPosition('SUN', date, hourUT),
    computePlanetPosition('MOON', date, hourUT),
  ]);
  let elongation = moon.longitude - sun.longitude;
  elongation = ((elongation % 360) + 360) % 360;

  if (elongation < 90) return 'waxing'; // растущая
  if (elongation < 180) return 'full_ish'; // близко к полнолунию (растущая сторона)
  if (elongation < 270) return 'waning'; // убывающая
  return 'new_ish'; // близко к новолунию (убывающая сторона)
}

/**
 * Асцендент (Ascendant) и куспиды домов системой "Равные дома" (Equal House)
 * от асцендента — считаем формулами сферической астрономии напрямую, не
 * полагаясь на то, есть ли в конкретной сборке swisseph-wasm функция домов
 * (в README пакета house-функции упомянуты в общем списке возможностей,
 * но не показаны в примерах — поэтому не завязываемся на неё).
 *
 * Equal House — осознанное упрощение для MVP: 12 домов по 30° от асцендента,
 * без Плацидус/Коха. Для целей проекта (найти, что НЕ в углу/доме 1/4/7/10)
 * этого достаточно; при необходимости более точной системы — заменить только
 * эту функцию.
 *
 * @param {Date} date
 * @param {number} hourUT
 * @param {number} lat — широта места, градусы
 * @param {number} lng — долгота места, градусы (восток +)
 */
export async function computeAscendantAndHouses(date, hourUT, lat, lng) {
  const jd = await toJulianDay(date, hourUT);

  // Гринвичское звёздное время (GST) в часах, по стандартной формуле IAU.
  const T = (jd - 2451545.0) / 36525.0;
  let gst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000.0;
  gst = ((gst % 360) + 360) % 360;

  // Местное звёздное время (LST) в градусах = GST + долгота места
  const lst = ((gst + lng) % 360 + 360) % 360;
  const ramc = lst; // Right Ascension of MC, в градусах

  // Средний наклон эклиптики (упрощённо, достаточно для Asc/MC)
  const obliquity = 23.4392911 - 0.0130042 * T;

  const ramcRad = (ramc * Math.PI) / 180;
  const oblRad = (obliquity * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;

  // Асцендент — стандартная формула
  const ascRad = Math.atan2(
    Math.cos(ramcRad),
    -(Math.sin(ramcRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad))
  );
  let ascendant = (ascRad * 180) / Math.PI;
  ascendant = ((ascendant % 360) + 360) % 360;
  // atan2 даёт точку, лежащую в одном из двух противоположных домов —
  // приводим к восходящей (той, что над горизонтом на востоке)
  if (ascendant < 180) ascendant += 180;
  else ascendant -= 180;

  // Medium Coeli (MC) — проекция RAMC на эклиптику
  const mcRad = Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(oblRad));
  let mc = (mcRad * 180) / Math.PI;
  mc = ((mc % 360) + 360) % 360;

  // Equal House: дом N начинается в Asc + (N-1)*30°
  const houses = Array.from({ length: 12 }, (_, i) => ((ascendant + i * 30) % 360 + 360) % 360);

  return { ascendant, mc, houses };
}

/** Номер дома (1..12) для заданной эклиптической долготы, по массиву куспидов Equal House. */
export function houseForLongitude(longitude, houses) {
  const lon = ((longitude % 360) + 360) % 360;
  for (let i = 0; i < 12; i++) {
    const start = houses[i];
    const end = houses[(i + 1) % 12];
    const inRange = start < end ? lon >= start && lon < end : lon >= start || lon < end;
    if (inRange) return i + 1;
  }
  return 1; // не должно случиться, защитный фолбэк
}

export async function closeEphemeris() {
  if (instance) {
    instance.close();
    instance = null;
    initPromise = null;
  }
}

/**
 * Быстрый смоук-тест для ручной проверки после `npm install swisseph-wasm`:
 *   node -e "import('./backend/src/services/astrology/ephemeris.js').then(m => m.__smokeTest())"
 */
export async function __smokeTest() {
  const now = new Date();
  const hourUT = now.getUTCHours() + now.getUTCMinutes() / 60;
  const sun = await computePlanetPosition('SUN', now, hourUT);
  const phase = await computeMoonPhase(now, hourUT);
  // Москва как пример координат
  const asc = await computeAscendantAndHouses(now, hourUT, 55.7558, 37.6173);
  console.log('Sun longitude:', sun.longitude.toFixed(2), '° retrograde:', sun.retrograde);
  console.log('Moon phase:', phase);
  console.log('Ascendant:', asc.ascendant.toFixed(2), '° MC:', asc.mc.toFixed(2), '°');
  await closeEphemeris();
}
