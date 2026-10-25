// components/ProfileSubscription.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MockSubscription } from "@/lib/mockProfile";

export default function ProfileSubscription({
  subscription,
}: {
  subscription: MockSubscription;
}) {
  const [sub, setSub] = useState(subscription);

  function handleCancel() {
    // TODO (Приоритет 9): POST /api/subscription/cancel
    setSub({ ...sub, status: "cancelled", nextBillingDate: null });
  }

  function handleSubscribe() {
    // TODO: редирект на /checkout с planId=subscription
    window.location.href = "/checkout?plan=subscription";
  }

  if (sub.status !== "active") {
    return (
      <div className="rounded-2xl border border-content-border bg-surface p-6">
        <h3 className="font-semibold text-content-main">Подписка не активна</h3>
        <p className="mt-1 text-sm text-content-muted">
          590 ₽/мес — безлимитные сканы, чат без ограничений, ежедневный гороскоп,
          скидка на совместимость.
        </p>
        <Button className="mt-4" onClick={handleSubscribe}>
          Оформить подписку
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-content-border bg-surface p-6">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-content-main">Подписка активна</h3>
        <Badge className="bg-accent-soft text-primary">590 ₽/мес</Badge>
      </div>
      <p className="mt-1 text-sm text-content-muted">
        Следующее списание: {sub.nextBillingDate ?? "—"}
      </p>
      <Button variant="outline" className="mt-4" onClick={handleCancel}>
        Отменить подписку
      </Button>
    </div>
  );
}