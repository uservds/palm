"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type WeddingPreferencesData = {
  city: string;
  period: "3m" | "6m" | "1y" | "any";
};

type Props = {
  onChange: (data: WeddingPreferencesData | null) => void;
};

const PERIOD_OPTIONS: { value: WeddingPreferencesData["period"]; label: string }[] = [
  { value: "3m", label: "В ближайшие 3 месяца" },
  { value: "6m", label: "В ближайшие 6 месяцев" },
  { value: "1y", label: "В течение года" },
  { value: "any", label: "Дата не принципиальна" },
];

// Только буквы (рус/лат), пробелы и дефисы — никаких цифр и спецсимволов.
// Минимум 2 буквы, допускаем составные названия ("Ростов-на-Дону", "Санкт-Петербург").
const CITY_FORMAT = /^[А-ЯЁа-яёA-Za-z]+([\s-][А-ЯЁа-яёA-Za-z]+)*$/;

const CITY_SUGGESTIONS = [
  "Москва",
  "Санкт-Петербург",
  "Новосибирск",
  "Екатеринбург",
  "Казань",
  "Нижний Новгород",
  "Челябинск",
  "Самара",
  "Омск",
  "Ростов-на-Дону",
  "Уфа",
  "Красноярск",
  "Воронеж",
  "Краснодар",
  "Сочи",
];

function isCityValid(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length >= 2 && CITY_FORMAT.test(trimmed);
}

export default function WeddingPreferences({ onChange }: Props) {
  const [city, setCity] = useState("");
  const [period, setPeriod] = useState<WeddingPreferencesData["period"]>("6m");
  const [touched, setTouched] = useState(false);

  const cityValid = isCityValid(city);

  useEffect(() => {
    onChange(cityValid ? { city: city.trim(), period } : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, period]);

  return (
    <Card className="border-[var(--color-content-border)] md:col-span-2">
      <CardHeader>
        <CardTitle className="text-base text-[var(--color-content-main)]">
          Где и когда
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="wedding-city">Город проведения свадьбы</Label>
          <Input
            id="wedding-city"
            list="city-suggestions"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Например, Москва"
            aria-invalid={touched && city.length > 0 && !cityValid}
          />
          <datalist id="city-suggestions">
            {CITY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>

          {touched && city.length > 0 && !cityValid ? (
            <p className="mt-1 text-xs text-[var(--color-brick-600)]">
              Введите название города только буквами, без цифр и символов
            </p>
          ) : (
            <p className="mt-1 text-xs text-[var(--color-content-muted)]">
              Расчёт карты события строится на конкретное место — не только
              дату.
            </p>
          )}
        </div>

        <div>
          <Label>Желаемый период</Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPeriod(opt.value)}
                className={`rounded-lg border px-3 py-2 text-sm transition
                  ${
                    period === opt.value
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      : "border-[var(--color-content-border)] bg-[var(--color-surface)] text-[var(--color-content-main)] hover:border-[var(--color-primary)]"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}