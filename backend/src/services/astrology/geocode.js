/**
 * geocode.js — город → {lat, lng, timezone}.
 *
 * Nominatim (OpenStreetMap) — бесплатно, без ключа, но с жёстким требованием
 * по их Usage Policy: не больше 1 запроса/сек и обязательный осмысленный
 * User-Agent с контактом. Для MVP (не массовый geo-сервис, а разовые запросы
 * при вводе формы) этого достаточно; если объём вырастет — рассмотреть
 * платный geocoding (Yandex Geocoder лучше знает российские города) или свой
 * кеш городов РФ.
 *
 * geo-tz — офлайн JS-библиотека, определяет IANA-таймзону по lat/lng без
 * сетевых запросов и ключей (встроенные данные timezone-boundary-builder).
 *
 * npm install geo-tz
 * (Nominatim — обычный fetch, доп. пакет не нужен)
 */

import { find as findTimezones } from 'geo-tz';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
// Обязательно по Usage Policy Nominatim — подставь реальный контакт/домен
const USER_AGENT = 'PalmAI/1.0 (astrology-geocode; contact: support@palmai.example)';

const cache = new Map(); // простой in-memory кеш на процесс, без TTL — города не переезжают

/**
 * @param {string} place — "Москва", "Санкт-Петербург, Россия" и т.п.
 * @returns {Promise<{lat:number, lng:number, timezone:string, displayName:string}>}
 */
export async function geocodePlace(place) {
  const key = place.trim().toLowerCase();
  if (cache.has(key)) return cache.get(key);

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set('q', place);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '1');
  url.searchParams.set('accept-language', 'ru');

  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) {
    throw new Error(`geocode: Nominatim вернул ${res.status} для "${place}"`);
  }
  const data = await res.json();
  if (!data.length) {
    const err = new Error(`geocode: место "${place}" не найдено`);
    err.code = 'PLACE_NOT_FOUND';
    throw err;
  }

  const { lat, lon, display_name: displayName } = data[0];
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  const timezones = findTimezones(latitude, longitude);
  const timezone = timezones[0] ?? 'Europe/Moscow'; // фолбэк — не должен срабатывать для реальных координат

  const result = { lat: latitude, lng: longitude, timezone, displayName };
  cache.set(key, result);
  return result;
}

/**
 * Переводит локальное время (в таймзоне места) в дробный час UTC для
 * заданной календарной даты — нужен ephemeris.js, который всегда считает
 * в UT. Использует Intl для получения смещения на КОНКРЕТНУЮ дату (с учётом
 * перехода на летнее время в истории, если оно было в этом часовом поясе).
 *
 * @param {Date} dateUTCMidnight — дата (компоненты года/месяца/дня берутся как есть)
 * @param {string} localTimeHHmm — "14:30" или null (тогда берём полдень)
 * @param {string} timezone — IANA, например "Europe/Moscow"
 * @returns {number} час в UTC, дробный, 0..24 (может выйти за пределы суток — это ок для julday)
 */
export function localTimeToUTCHour(dateUTCMidnight, localTimeHHmm, timezone) {
  const [h, m] = (localTimeHHmm ?? '12:00').split(':').map(Number);

  // Смещение таймзоны на эту дату определяем через форматирование одной и
  // той же "сырой" даты в UTC и в целевой таймзоне и сравнения разницы часов.
  const probe = new Date(Date.UTC(
    dateUTCMidnight.getUTCFullYear(),
    dateUTCMidnight.getUTCMonth(),
    dateUTCMidnight.getUTCDate(),
    h, m
  ));

  const tzString = probe.toLocaleString('en-US', { timeZone: timezone });
  const utcString = probe.toLocaleString('en-US', { timeZone: 'UTC' });
  const offsetMs = new Date(tzString).getTime() - new Date(utcString).getTime();
  const offsetHours = offsetMs / (1000 * 60 * 60);

  return h + m / 60 - offsetHours;
}
