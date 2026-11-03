"use client";

import { useState } from "react";
import ZodiacPicker from "@/components/ZodiacPicker";
import HoroscopeTeaser from "@/components/HoroscopeTeaser";
import { ZODIAC_SIGNS } from "@/lib/zodiacSigns";

export default function HoroscopePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedSign = ZODIAC_SIGNS.find((s) => s.id === selectedId) ?? null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <div className="mb-8 text-center">
        <span className="inline-block rounded-full bg-[var(--color-brick-50)] px-3 py-1 text-sm font-medium text-[var(--color-brick-600)]">
          Астрология
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--color-content-main)]">
          Гороскоп на сегодня
        </h1>
        <p className="mt-2 text-[var(--color-content-muted)]">
          Выберите знак зодиака, чтобы узнать, что говорят звёзды сегодня
        </p>
      </div>

      <ZodiacPicker selectedId={selectedId} onSelect={setSelectedId} />

      {selectedSign && <HoroscopeTeaser sign={selectedSign} />}
    </main>
  );
}