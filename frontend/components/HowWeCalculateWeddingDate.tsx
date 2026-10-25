"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

export default function HowWeCalculateWeddingDate() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8 rounded-2xl border border-[var(--color-content-border)] bg-[var(--color-surface)] p-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 font-medium text-[var(--color-content-main)]">
          <Sparkles className="h-4 w-4 text-[var(--color-brick-500)]" />
          Как мы считаем дату
        </span>
        <ChevronDown
          className={`h-4 w-4 text-[var(--color-content-muted)] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="mt-4 space-y-2 text-sm text-[var(--color-content-muted)]">
          <p>
            Мы используем принципы электоральной астрологии — раздела,
            который ищет наиболее благоприятный момент для важного события.
            Расчёт строится не на одной дате рождения, а на трёх картах
            сразу: натальной карте каждого партнёра и отдельной карте самого
            дня свадьбы — для конкретного города и времени.
          </p>
          <p>
            Мы смотрим на положение Венеры (любовь и брак) и избегаем дат,
            когда она или Меркурий находятся в ретроградном движении, а
            также учитываем фазу Луны и расположение планет относительно
            места проведения церемонии.
          </p>
          <p>
            Это традиционный инструмент, а не гарантия — удачно выбранная
            дата поддерживает начинание, но не заменяет отношения между
            партнёрами.
          </p>
        </div>
      )}
    </div>
  );
}