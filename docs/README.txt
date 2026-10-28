PalmAI — payment.routes.js / payment.service.js (исправленная версия, 27.10.2026)
Причина переделки: первая версия использовала authMiddleware/req.user.id/
{error: message} — не соответствует реальному коду проекта
(requireAuth, req.userId, {ok:false, error:{code, user_message}}).

Распаковать: Expand-Archive -Force поверх F:\Projects\Palmis_AI\palm

Файлы:
1. backend/src/services/payment.service.js — ЗАМЕНИТЬ (если уже залит старый вариант)
2. backend/src/routes/payment.routes.js — ЗАМЕНИТЬ (named export paymentRouter,
   полные пути /api/payment/... внутри, requireAuth, req.userId)
3. backend/src/config/env.payment.snippet.txt — дописать 2 строки в config/env.js
   (YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY)

ДАЛЬШЕ ВРУЧНУЮ:
- backend/.env: добавить YOOKASSA_SHOP_ID=... и YOOKASSA_SECRET_KEY=...
- backend/src/app.js:
    import { paymentRouter } from './routes/payment.routes.js';
    app.use(paymentRouter);   // ставить рядом с app.use(visionRouter)/app.use(authRouter),
                               // БЕЗ префикса — пути уже внутри роутера
- prisma/schema.prisma — модель Payment уже применена (migrate add_payments прошла)
- frontend/app/checkout/page.tsx — фикс searchParams уже применён вручную
