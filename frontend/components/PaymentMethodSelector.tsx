"use client";

import { Wallet, Building2 } from "lucide-react";

export type PaymentMethod = "yookassa" | "cloudpayments";

interface MethodOption {
  id: PaymentMethod;
  label: string;
  hint: string;
  icon: React.ElementType;
  disabled?: boolean;
  badge?: string;
}

const methods: MethodOption[] = [
  {
    id: "yookassa",
    label: "ЮKassa",
    hint: "Карта, СБП, кошелёк — способ оплаты выбирается на следующем шаге",
    icon: Wallet,
  },
  {
    id: "cloudpayments",
    label: "CloudPayments",
    hint: "Карта, Apple Pay, Google Pay",
    icon: Building2,
    disabled: true,
    badge: "Скоро",
  },
];

export default function PaymentMethodSelector({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (m: PaymentMethod) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {methods.map((m) => {
        const Icon = m.icon;
        const active = value === m.id;
        return (
          <button
            key={m.id}
            type="button"
            disabled={m.disabled}
            onClick={() => !m.disabled && onChange(m.id)}
            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
              m.disabled
                ? "cursor-not-allowed border-content-border opacity-50"
                : active
                  ? "border-primary bg-accent-soft"
                  : "border-content-border hover:bg-neutral-badge"
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                active && !m.disabled ? "bg-primary text-white" : "bg-neutral-badge text-content-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-content-main">{m.label}</p>
                {m.badge && (
                  <span className="rounded-full bg-neutral-badge px-2 py-0.5 text-[10px] font-medium text-neutral-badgeText">
                    {m.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-content-muted">{m.hint}</p>
            </div>
            {!m.disabled && (
              <div
                className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                  active ? "border-primary bg-primary" : "border-content-border"
                }`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
