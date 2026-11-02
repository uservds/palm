/**
 * astrology.routes.js
 *
 * !! РўР Р•Р‘РЈР•Рў РџР РђР’РљР РџР•Р Р•Р” РРЎРџРћР›Р¬Р—РћР’РђРќРР•Рњ !!
 * РРјРїРѕСЂС‚ auth middleware РЅРёР¶Рµ вЂ” РїСЂРµРґРїРѕР»РѕР¶РµРЅРёРµ РїРѕ Р°РЅР°Р»РѕРіРёРё СЃ СѓР¶Рµ РѕРїРёСЃР°РЅРЅС‹Рј
 * РІ С‡С‚Рѕ-СЃРґРµР»Р°РЅРѕ.md С„Р°Р№Р»РѕРј `src/middleware/auth.middleware.js` (Р­С‚Р°Рї 11, Рї.7).
 * РџРѕРїСЂР°РІСЊ РїРѕРґ СЂРµР°Р»СЊРЅРѕРµ РёРјСЏ СЌРєСЃРїРѕСЂС‚РёСЂСѓРµРјРѕР№ С„СѓРЅРєС†РёРё, РµСЃР»Рё РѕС‚Р»РёС‡Р°РµС‚СЃСЏ.
 *
 * Р РµРіРёСЃС‚СЂР°С†РёСЏ СЂРѕСѓС‚Р° вЂ” РєР°Рє Рё РѕСЃС‚Р°Р»СЊРЅС‹Рµ (app.js):
 *   import astrologyRoutes from './routes/astrology.routes.js';
 *   app.use('/api/astrology', astrologyRoutes);
 */

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.middleware.js'; // в†ђ СЃРІРµСЂРёС‚СЊ РїСѓС‚СЊ/РёРјСЏ
import { weddingDateRequestSchema } from '../validation/astrology.schemas.js';
import { createNatalChart } from '../services/astrology/natalChart.service.js';
import { runWeddingDateSearch } from '../services/astrology/weddingDate.service.js';
import { getOrCreateTodayHoroscope } from '../services/astrology/horoscope.service.js';

const router = Router();

/**
 * POST /api/astrology/wedding-date
 * РџСЂРёРЅРёРјР°РµС‚ РґР°РЅРЅС‹Рµ РґРІСѓС… РїР°СЂС‚РЅС‘СЂРѕРІ + РіРѕСЂРѕРґ/РїРµСЂРёРѕРґ СЃРѕР±С‹С‚РёСЏ.
 * Р“РѕСЃС‚РµРІРѕР№ РґРѕСЃС‚СѓРї (userId РѕРїС†РёРѕРЅР°Р»РµРЅ) вЂ” СЃРј. РўР—: СЃС‚СЂР°РЅРёС†Р° "Р”Р°С‚Р° СЃРІР°РґСЊР±С‹" РЅРµ
 * Р·РЅР°С‡РёС‚СЃСЏ РІ С‚Р°СЂРёС„РЅРѕР№ СЃРµС‚РєРµ РєР°Рє РѕС‚РґРµР»СЊРЅРѕ РїР»Р°С‚РЅР°СЏ, РїРѕСЌС‚РѕРјСѓ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ РЅРµ
 * С‚СЂРµР±СѓСЋ Р°РІС‚РѕСЂРёР·Р°С†РёРё. Р•СЃР»Рё СЂРµС€РёС‚Рµ СЃРґРµР»Р°С‚СЊ РµС‘ РїСЂРµРјРёСѓРј-С„РёС‡РµР№ вЂ” РґРѕР±Р°РІСЊ
 * requireAuth РІ С†РµРїРѕС‡РєСѓ middleware РЅРёР¶Рµ.
 *
 * РћС‚РІРµС‡Р°РµС‚ СЃСЂР°Р·Сѓ 202 СЃ requestId Рё СЃС‚Р°С‚СѓСЃРѕРј "processing" вЂ” СЃР°Рј РїРµСЂРµР±РѕСЂ РґР°С‚
 * РјРѕР¶РµС‚ Р·Р°РЅСЏС‚СЊ Р·Р°РјРµС‚РЅРѕРµ РІСЂРµРјСЏ (РґРѕ 180 РґРЅРµР№ Г— 6 СЂР°СЃС‡С‘С‚РѕРІ), РЅРµ РґРµСЂР¶РёРј
 * HTTP-СЃРѕРµРґРёРЅРµРЅРёРµ РѕС‚РєСЂС‹С‚С‹Рј. РљР»РёРµРЅС‚ РѕРїСЂР°С€РёРІР°РµС‚ GET .../wedding-date/:id.
 */
router.post('/wedding-date', async (req, res, next) => {
  try {
    const body = weddingDateRequestSchema.parse(req.body);

    const [partner1Chart, partner2Chart] = await Promise.all([
      createNatalChart({ ...body.partner1, userId: req.user?.id ?? null }),
      createNatalChart({ ...body.partner2, userId: null }), // РїР°СЂС‚РЅС‘СЂ 2 РЅРµ РѕР±СЏР·Р°РЅ Р±С‹С‚СЊ Р°РєРєР°СѓРЅС‚РѕРј
    ]);

    // Р“РµРѕРєРѕРґРёСЂСѓРµРј РіРѕСЂРѕРґ СЃРѕР±С‹С‚РёСЏ С‚РµРј Р¶Рµ РїСѓС‚С‘Рј, С‡С‚Рѕ Рё РјРµСЃС‚Р° СЂРѕР¶РґРµРЅРёСЏ, С‡С‚РѕР±С‹
    // РЅРµ РґСѓР±Р»РёСЂРѕРІР°С‚СЊ Р»РѕРіРёРєСѓ вЂ” РёСЃРїРѕР»СЊР·СѓРµРј createNatalChart С‚РѕР»СЊРєРѕ РґР»СЏ РєР°СЂС‚
    // РїР°СЂС‚РЅС‘СЂРѕРІ; РґР»СЏ РіРѕСЂРѕРґР° СЃРѕР±С‹С‚РёСЏ РіРµРѕРєРѕРґРёРЅРі Р±РµСЂС‘Рј РЅР°РїСЂСЏРјСѓСЋ.
    const { geocodePlace } = await import('../services/astrology/geocode.js');
    const eventGeo = await geocodePlace(body.eventCity);

    const request = await prisma.weddingDateRequest.create({
      data: {
        userId: req.user?.id ?? null,
        partner1ChartId: partner1Chart.id,
        partner2ChartId: partner2Chart.id,
        eventCity: eventGeo.displayName,
        eventLat: eventGeo.lat,
        eventLng: eventGeo.lng,
        eventTimezone: eventGeo.timezone,
        periodStart: new Date(`${body.periodStart}T00:00:00.000Z`),
        periodEnd: new Date(`${body.periodEnd}T00:00:00.000Z`),
      },
    });

    // Fire-and-forget: РІ РїСЂРѕРµРєС‚Рµ РїРѕРєР° РЅРµС‚ РѕС‡РµСЂРµРґРё Р·Р°РґР°С‡ (BullMQ Рё С‚.Рї.),
    // РїРѕСЌС‚РѕРјСѓ Р·Р°РїСѓСЃРєР°РµРј СЂР°СЃС‡С‘С‚ РІ С„РѕРЅРµ РІ СЂР°РјРєР°С… С‚РѕРіРѕ Р¶Рµ РїСЂРѕС†РµСЃСЃР°. РќР° Replit
    // free-tier СЌС‚Рѕ СЂРёСЃРєРѕРІР°РЅРЅРѕ РїСЂРё РґРѕР»РіРѕРј РїСЂРѕСЃС‚РѕРµ РјРµР¶РґСѓ Р·Р°РїСЂРѕСЃР°РјРё вЂ” РµСЃР»Рё
    // РїРѕСЃР»Рµ РїРµСЂРІС‹С… С‚РµСЃС‚РѕРІ РѕРєР°Р¶РµС‚СЃСЏ, С‡С‚Рѕ РїСЂРѕС†РµСЃСЃ "Р·Р°СЃС‹РїР°РµС‚" СЂР°РЅСЊС€Рµ, С‡РµРј
    // СЂР°СЃС‡С‘С‚ Р·Р°РІРµСЂС€Р°РµС‚СЃСЏ, СЌС‚Рѕ РїРµСЂРІС‹Р№ РєР°РЅРґРёРґР°С‚ РЅР° РїРµСЂРµРґРµР»РєСѓ РїРѕРґ РѕС‡РµСЂРµРґСЊ.
    runWeddingDateSearch(request.id).catch((err) => {
      console.error('astrology/wedding-date: С„РѕРЅРѕРІС‹Р№ СЂР°СЃС‡С‘С‚ СѓРїР°Р»', request.id, err);
    });

    res.status(202).json({ requestId: request.id, status: 'processing' });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/astrology/wedding-date/:id
 * РЎС‚Р°С‚СѓСЃ Р·Р°СЏРІРєРё + РєР°РЅРґРёРґР°С‚С‹ (РµСЃР»Рё СЂР°СЃС‡С‘С‚ Р·Р°РІРµСЂС€С‘РЅ).
 */
router.get('/wedding-date/:id', async (req, res, next) => {
  try {
    const request = await prisma.weddingDateRequest.findUnique({
      where: { id: req.params.id },
      include: {
        candidates: { orderBy: { rank: 'asc' } },
      },
    });
    if (!request) return res.status(404).json({ error: 'Р—Р°СЏРІРєР° РЅРµ РЅР°Р№РґРµРЅР°' });

    res.json({
      requestId: request.id,
      status: request.status,
      errorMsg: request.errorMsg,
      eventCity: request.eventCity,
      periodStart: request.periodStart,
      periodEnd: request.periodEnd,
      candidates: request.candidates,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/astrology/horoscope
 * Р•Р¶РµРґРЅРµРІРЅС‹Р№ РіРѕСЂРѕСЃРєРѕРї С‚РµРєСѓС‰РµРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ вЂ” С‚СЂРµР±СѓРµС‚ Р°РІС‚РѕСЂРёР·Р°С†РёРё Рё
 * СЃРѕС…СЂР°РЅС‘РЅРЅРѕР№ РЅР°С‚Р°Р»СЊРЅРѕР№ РєР°СЂС‚С‹ (СЃРѕР·РґР°С‘С‚СЃСЏ РѕС‚РґРµР»СЊРЅС‹Рј СЌРЅРґРїРѕРёРЅС‚РѕРј/РІ РїСЂРѕС„РёР»Рµ вЂ”
 * РІРЅРµ РѕР±СЉС‘РјР° СЌС‚РѕРіРѕ С„Р°Р№Р»Р°, СЃРј. README-astrology.md, СЂР°Р·РґРµР» "Р§С‚Рѕ РµС‰С‘ РЅСѓР¶РЅРѕ").
 */
router.get('/horoscope', requireAuth, async (req, res, next) => {
  try {
    const horoscope = await getOrCreateTodayHoroscope(req.user.id);
    res.json(horoscope);
  } catch (err) {
    if (err.code === 'NO_NATAL_CHART' || err.code === 'NATAL_CHART_NOT_CALCULATED') {
      return res.status(409).json({ error: err.message, code: err.code });
    }
    next(err);
  }
});

export default router;

