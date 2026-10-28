import { API_URL, ApiError } from "./api";
import { getStoredTokens } from "./auth";
import { PlanId } from "./checkoutPlans";

// Соответствие id тарифа на фронте ↔ type платежа на backend (payment.service.js PRICES)
const PLAN_TO_PAYMENT_TYPE: Record<PlanId, "report" | "compatibility" | "subscription"> = {
  individual: "report",
  compatibility: "compatibility",
  subscription: "subscription",
};

type CreatePaymentResponse = {
  ok: true;
  paymentId: string;
  confirmationUrl: string;
};

type CreatePaymentErrorResponse = {
  ok: false;
  error: { code: string; user_message: string };
};

/**
 * Создаёт платёж на backend и возвращает confirmationUrl для редиректа
 * на страницу оплаты провайдера (ЮKassa).
 */
export async function createPayment(
  planId: PlanId,
  metadata?: Record<string, unknown>
): Promise<CreatePaymentResponse> {
  const tokens = getStoredTokens();
  if (!tokens) {
    throw new ApiError("UNAUTHORIZED", "Войдите в аккаунт, чтобы оплатить заказ.");
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/payment/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.accessToken}`,
      },
      body: JSON.stringify({
        type: PLAN_TO_PAYMENT_TYPE[planId],
        metadata,
      }),
    });
  } catch {
    throw new ApiError(
      "NETWORK_ERROR",
      "Не удалось связаться с сервером. Проверьте подключение и попробуйте снова."
    );
  }

  let data: CreatePaymentResponse | CreatePaymentErrorResponse;
  try {
    data = await response.json();
  } catch {
    throw new ApiError("INVALID_RESPONSE", "Сервер вернул некорректный ответ.");
  }

  if (!data.ok) {
    throw new ApiError(
      data.error?.code || "UNKNOWN_ERROR",
      data.error?.user_message || "Не удалось создать платёж. Попробуйте позже."
    );
  }

  return data;
}
