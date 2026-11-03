"use client";

import { ZodiacSign } from "@/lib/zodiacSigns";
import { Sun, Lock } from "lucide-react";

type Props = {
  sign: ZodiacSign;
};

export default function HoroscopeTeaser({ sign }: Props) {
  return (
    <div className="mt-6 rounded-2xl border border-[var(--color-content-border)] bg-[var(--color-surface)] p-6">
      <div className="flex items-center gap-2">
        <Sun className="h-5 w-5 text-[var(--color-brick-500)]" />
        <h2 className="text-lg font-semibold text-[var(--color-content-main)]">
          {sign.name} — сегодня
        </h2>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-content-muted)]">
        {sign.todayTeaser}
      </p>

      <div className="mt-5 flex items-center gap-2 rounded-xl bg-[var(--color-neutral-badge)] px-4 py-3">
        <Lock className="h-4 w-4 shrink-0 text-[var(--color-content-muted)]" />
        <p className="text-xs text-[var(--color-content-muted)]">
          Разбор на неделю вперёд и ежедневная рассылка доступны по подписке
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--color-primary)] p-5 text-center">
        <p className="text-sm text-[var(--color-content-muted)]">
          Подписка · 590 ₽/мес
        </p>
        <p className="mt-1 text-sm text-[var(--color-content-main)]">
          Ежедневный гороскоп на сайте, в Telegram или MAX (на выбор) и на
          почту
        </p>
        <button className="mt-4 w-full rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--color-primary-hover)]">
          Оформить подписку
        </button>
      </div>
    </div>
  );
}