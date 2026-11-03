"use client";

import { useState } from "react";
import WeddingDateForm, { PersonBirthData } from "@/components/WeddingDateForm";
import WeddingPreferences, {
  WeddingPreferencesData,
} from "@/components/WeddingPreferences";
import WeddingDateCalculation from "@/components/WeddingDateCalculation";
import TeaserReportWedding from "@/components/TeaserReportWedding";
import HowWeCalculateWeddingDate from "@/components/HowWeCalculateWeddingDate";

type Stage = "form" | "calculating" | "result";

export default function WeddingDatePage() {
  const [stage, setStage] = useState<Stage>("form");
  const [person1, setPerson1] = useState<PersonBirthData | null>(null);
  const [person2, setPerson2] = useState<PersonBirthData | null>(null);
  const [preferences, setPreferences] = useState<WeddingPreferencesData | null>(
    null
  );

  const canSubmit = person1 && person2 && preferences;

  function handleSubmit() {
    if (!canSubmit) return;
    setStage("calculating");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-10 text-center">
        <span className="inline-block rounded-full bg-[var(--color-brick-50)] px-3 py-1 text-sm font-medium text-[var(--color-brick-600)]">
          Астрологический расчёт
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--color-content-main)]">
          Подходящая дата свадьбы
        </h1>
        <p className="mt-2 text-[var(--color-content-muted)]">
          Укажите данные рождения двух партнёров — мы рассчитаем
          благоприятные даты на основе натальных карт.
        </p>
      </div>

      {stage === "form" && (
        <div className="grid gap-6 md:grid-cols-2">
          <WeddingDateForm label="Партнёр 1" onChange={setPerson1} />
          <WeddingDateForm label="Партнёр 2" onChange={setPerson2} />
          <WeddingPreferences onChange={setPreferences} />
          <div className="md:col-span-2">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full rounded-xl bg-[var(--color-primary)] px-6 py-3 font-medium text-white transition
                hover:bg-[var(--color-primary-hover)]
                disabled:cursor-not-allowed disabled:opacity-40"
            >
              Рассчитать дату
            </button>
          </div>
          <div className="md:col-span-2">
            <HowWeCalculateWeddingDate />
          </div>
        </div>
      )}

      {stage === "calculating" && (
        <WeddingDateCalculation onComplete={() => setStage("result")} />
      )}

      {stage === "result" && person1 && person2 && preferences && (
        <TeaserReportWedding
          person1={person1}
          person2={person2}
          city={preferences.city}
        />
      )}
    </main>
  );
}