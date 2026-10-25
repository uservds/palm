"use client";

import { CreditCard, Smartphone, Wallet, Building2 } from "lucide-react";

export type PaymentMethod = "card" | "sbp" | "yookassa" | "cloudpayments";

interface MethodOption {
  id: PaymentMethod;
  label: string;
  hint: string;
  icon: React.ElementType;
}

const methods: MethodOption[] = [
  { id: "card", label: "Банковская карта", hint: "Visa, MasterCard, МИР", icon: CreditCard },
  { id: "sbp", label: "СБП", hint: "Оплата по QR-коду через банк", icon: Smartphone },
  { id: "yookassa", label: "ЮKassa", hint: "Карта, кошелёк, рассрочка", icon: Wallet },
  { id: "cloudpayments", label: "CloudPayments", hint: "Карта, Apple Pay, Google Pay", icon: Building2 },
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
            onClick={() => onChange(m.id)}
            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
              active
                ? "border-primary bg-accent-soft"
                : "border-content-border hover:bg-neutral-badge"
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                active ? "bg-primary text-white" : "bg-neutral-badge text-content-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-content-main">{m.label}</p>
              <p className="text-xs text-content-muted">{m.hint}</p>
            </div>
            <div
              className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                active ? "border-primary bg-primary" : "border-content-border"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}