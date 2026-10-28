import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  createPayment,
  handleYookassaWebhook,
  getPaymentStatus,
  refundPayment,
} from '../services/payment.service.js';

export const paymentRouter = Router();

// POST /api/payment/create
paymentRouter.post('/api/payment/create', requireAuth, async (req, res) => {
  try {
    const { type, metadata } = req.body;
    const returnUrl = `${req.app.get('frontendUrl') || process.env.FRONTEND_URL}/checkout/success`;

    const result = await createPayment({
      userId: req.userId,
      type,
      returnUrl,
      metadata,
    });

    res.json({ ok: true, ...result });
  } catch (err) {
    console.error('[Payment/create] Error:', err?.message || err);
    res.status(400).json({
      ok: false,
      error: { code: 'PAYMENT_CREATE_FAILED', user_message: 'Не удалось создать платёж. Попробуйте позже.' },
    });
  }
});

// POST /api/payment/webhook — без requireAuth, вызывается ЮKassa напрямую.
// На проде обязательно ограничить по IP-диапазону ЮKassa на уровне
// nginx/прокси перед Express, этот роут — вторая линия защиты.
paymentRouter.post('/api/payment/webhook', async (req, res) => {
  try {
    const result = await handleYookassaWebhook(req.body);

    if (result?.newStatus === 'succeeded') {
      // TODO: разблокировать отчёт / активировать подписку —
      // вызвать report.service.js или subscription.service.js
      // в зависимости от result.payment.type
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('[Payment/webhook] Error:', err?.message || err);
    // ЮKassa повторяет webhook при не-2xx ответе — отвечаем 200 даже
    // при внутренней ошибке, чтобы не получить дубли ретраев.
    res.status(200).json({ received: true });
  }
});

// GET /api/payment/status/:id
paymentRouter.get('/api/payment/status/:id', requireAuth, async (req, res) => {
  try {
    const payment = await getPaymentStatus(req.params.id, req.userId);
    res.json({ ok: true, payment });
  } catch (err) {
    res.status(404).json({
      ok: false,
      error: { code: 'PAYMENT_NOT_FOUND', user_message: 'Платёж не найден.' },
    });
  }
});

// POST /api/payment/refund
paymentRouter.post('/api/payment/refund', requireAuth, async (req, res) => {
  try {
    const { paymentId } = req.body;
    const payment = await refundPayment(paymentId, req.userId);
    res.json({ ok: true, payment });
  } catch (err) {
    console.error('[Payment/refund] Error:', err?.message || err);
    res.status(400).json({
      ok: false,
      error: { code: 'REFUND_FAILED', user_message: err.message || 'Не удалось выполнить возврат.' },
    });
  }
});
