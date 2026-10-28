// backend/src/services/payment.service.js
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/env.js';

const YOOKASSA_SHOP_ID = config.YOOKASSA_SHOP_ID;
const YOOKASSA_SECRET_KEY = config.YOOKASSA_SECRET_KEY;
const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3/payments';

// Цены в копейках — держим в одном месте, источник истины ТЗ-полное.md
export const PRICES = {
  report: 39900,        // 399 ₽
  compatibility: 59900, // 599 ₽ — подтверждено финально
  subscription: 59000,  // 590 ₽/мес
};

function authHeader() {
  const token = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');
  return `Basic ${token}`;
}

/**
 * Создать платёж в ЮKassa и локальную запись Payment (status=pending).
 * type: 'report' | 'compatibility' | 'subscription'
 */
export async function createPayment({ userId, type, returnUrl, metadata = {} }) {
  const amount = PRICES[type];
  if (!amount) throw new Error(`Unknown payment type: ${type}`);

  const idempotenceKey = randomUUID();

  const res = await fetch(YOOKASSA_API_URL, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
      'Idempotence-Key': idempotenceKey,
    },
    body: JSON.stringify({
      amount: { value: (amount / 100).toFixed(2), currency: 'RUB' },
      confirmation: { type: 'redirect', return_url: returnUrl },
      capture: true,
      description: `PalmAI: ${type}`,
      metadata: { userId, type, ...metadata },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`YooKassa create payment failed: ${res.status} ${errBody}`);
  }

  const data = await res.json();

  const payment = await prisma.payment.create({
    data: {
      userId,
      amount,
      currency: 'RUB',
      provider: 'yookassa',
      providerPaymentId: data.id,
      status: 'pending',
      type,
      metadata,
    },
  });

  return {
    paymentId: payment.id,
    confirmationUrl: data.confirmation?.confirmation_url,
  };
}

/**
 * Обработать webhook от ЮKassa.
 * ВАЖНО: ЮKassa не подписывает webhook-запросы — рекомендуется ограничить
 * приём только с их диапазона IP (см. официальную документацию, список
 * может обновляться) на уровне nginx/Express middleware, а не только здесь.
 */
export async function handleYookassaWebhook(payload) {
  const { event, object } = payload;
  if (!object?.id) return;

  const payment = await prisma.payment.findUnique({
    where: { providerPaymentId: object.id },
  });
  if (!payment) return; // неизвестный платёж — игнорируем молча

  if (event === 'payment.succeeded') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'succeeded' },
    });
    // TODO: разблокировать отчёт / активировать подписку —
    // вызывается из вызывающего места (route), чтобы не плодить
    // здесь зависимости на report.service.js / subscription.service.js
    return { payment, newStatus: 'succeeded' };
  }

  if (event === 'payment.canceled') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'canceled' },
    });
    return { payment, newStatus: 'canceled' };
  }

  return { payment, newStatus: payment.status };
}

export async function getPaymentStatus(paymentId, userId) {
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId },
  });
  if (!payment) throw new Error('Payment not found');
  return payment;
}

/**
 * Возврат средств. ЮKassa поддерживает частичный и полный refund
 * через отдельный API /v3/refunds с id исходного платежа.
 */
export async function refundPayment(paymentId, userId) {
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId },
  });
  if (!payment) throw new Error('Payment not found');
  if (payment.status !== 'succeeded') {
    throw new Error('Можно вернуть только успешно завершённый платёж');
  }

  const idempotenceKey = randomUUID();
  const res = await fetch('https://api.yookassa.ru/v3/refunds', {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
      'Idempotence-Key': idempotenceKey,
    },
    body: JSON.stringify({
      payment_id: payment.providerPaymentId,
      amount: { value: (payment.amount / 100).toFixed(2), currency: 'RUB' },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`YooKassa refund failed: ${res.status} ${errBody}`);
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'refunded' },
  });

  return payment;
}
