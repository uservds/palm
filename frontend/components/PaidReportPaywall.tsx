"use client";

import { Lock } from "lucide-react";
import { PAID_REPORT_SECTIONS } from "@/lib/paidReportSections";

type Props = {
  onPay: () => void;
  loading: boolean;
};

export default function PaidReportPaywall({ onPay, loading }: Props) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center">
        <span className="inline-block rounded-full bg-[var(--color-neutral-badge)] px-3 py-1 text-sm font-medium text-[var(--color-neutral-badgeText)]">
          14 разделов разбора
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--color-content-main)]">
          Ваш полный разбор готов
        </h1>
        <p className="mt-2 text-[var(--color-content-muted)]">
          Откройте все 14 разделов и получите PDF-версию на почту
        </p>
      </div>

      <div className="mt-8 space-y-2">
        {PAID_REPORT_SECTIONS.map((section) => (
          <div
            key={section.id}
            className="flex items-center justify-between rounded-xl border border-[var(--color-content-border)] bg-[var(--color-surface)] px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-[var(--color-content-main)]">
                {section.title}
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-content-muted)] blur-[2.5px] select-none">
                {section.preview}
              </p>
            </div>
            <Lock className="h-4 w-4 shrink-0 text-[var(--color-content-muted)]" />
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-[var(--color-primary)] bg-[var(--color-surface)] p-6 text-center">
        <p className="text-sm text-[var(--color-content-muted)]">
          Разовая оплата · без подписки
        </p>
        <p className="mt-1 text-3xl font-semibold text-[var(--color-content-main)]">
          399 ₽
        </p>
        <button
          onClick={onPay}
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-[var(--color-primary)] px-6 py-3 font-medium text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
        >
          {loading ? "Обрабатываем оплату…" : "Открыть полный разбор"}
        </button>
      </div>
    </div>
  );
}