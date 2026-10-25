"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import PaymentMethodSelector, { PaymentMethod } from "@/components/PaymentMethodSelector";
import { CheckoutPlan } from "@/lib/checkoutPlans";
import { ShieldCheck } from "lucide-react";

export default function CheckoutForm({ plan }: { plan: CheckoutPlan }) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setError(null);
    setLoading(true);
    try {
      // TODO (Приоритет 5): POST /api/payment/create { planId: plan.id, method }
      // затем редирект на confirmation_url, который вернёт провайдер
      await new Promise((resolve, reject) =>
        setTimeout(() => {
          // имитация: 90% успеха, чтобы можно было проверить оба состояния
          Math.random() < 0.9 ? resolve(true) : reject(new Error("payment_failed"));
        }, 1200)
      );
      router.push(`/checkout/success?plan=${plan.id}`);
    } catch {
      setError("Не удалось обработать платёж. Попробуйте другой способ оплаты.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid w-full max-w-3xl gap-6 md:grid-cols-[1.1fr_1fr]">
      <div className="rounded-2xl border border-content-border bg-surface p-6">
        <h2 className="text-sm font-medium text-content-main">Способ оплаты</h2>
        <div className="mt-3">
          <PaymentMethodSelector value={method} onChange={setMethod} />
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <Button onClick={handlePay} disabled={loading} className="mt-5 w-full">
          {loading ? "Обрабатываем…" : `Оплатить ${plan.price} ₽${plan.period ? "/мес" : ""}`}
        </Button>

        <p className="mt-3 flex items-center gap-1.5 text-xs text-content-muted">
          <ShieldCheck className="h-3.5 w-3.5" />
          Платёж защищён. Нажимая «Оплатить», вы соглашаетесь с{" "}
          <a href="/privacy" className="underline hover:text-content-main">
            условиями и политикой возврата
          </a>
          .
        </p>
      </div>

      <div className="h-fit rounded-2xl border border-content-border bg-surface p-6">
        <h2 className="text-sm font-medium text-content-main">Ваш заказ</h2>
        <div className="mt-3 flex items-start justify-between gap-3 border-b border-content-border pb-4">
          <div>
            <p className="font-medium text-content-main">{plan.title}</p>
            <p className="text-sm text-content-muted">{plan.description}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-content-muted">Итого</span>
          <span className="text-lg font-semibold text-content-main">
            {plan.price} ₽{plan.period ? " / мес" : ""}
          </span>
        </div>
        {plan.period && (
          <p className="mt-2 text-xs text-content-muted">
            Списание повторяется ежемесячно. Отменить можно в любой момент в разделе «Подписка»
            профиля.
          </p>
        )}
      </div>
    </div>
  );
}