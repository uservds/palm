"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type PersonBirthData = {
  name: string;
  birthDate: string; // yyyy-mm-dd
  birthTime: string; // HH:mm, желательно, но не обязательно
  birthPlace: string;
};

type Props = {
  label: string;
  onChange: (data: PersonBirthData | null) => void;
};

const TODAY = new Date().toISOString().split("T")[0];
const MIN_DATE = new Date(new Date().getFullYear() - 120, 0, 1)
  .toISOString()
  .split("T")[0];

export default function WeddingDateForm({ label, onChange }: Props) {
  const [data, setData] = useState<PersonBirthData>({
    name: "",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
  });

  useEffect(() => {
    const nameValid = data.name.trim().length >= 2;

    const dateValid =
      /^\d{4}-\d{2}-\d{2}$/.test(data.birthDate) &&
      !isNaN(Date.parse(data.birthDate)) &&
      data.birthDate >= MIN_DATE &&
      data.birthDate <= TODAY;

    const placeValid = data.birthPlace.trim().length >= 2;

    const isValid = nameValid && dateValid && placeValid;
    onChange(isValid ? data : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  function set<K extends keyof PersonBirthData>(key: K, value: PersonBirthData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Card className="border-[var(--color-content-border)]">
      <CardHeader>
        <CardTitle className="text-base text-[var(--color-content-main)]">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label htmlFor={`${label}-name`}>Имя</Label>
          <Input
            id={`${label}-name`}
            value={data.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Как вас зовут"
          />
        </div>
        <div>
          <Label htmlFor={`${label}-date`}>Дата рождения</Label>
          <Input
            id={`${label}-date`}
            type="date"
            min={MIN_DATE}
            max={TODAY}
            value={data.birthDate}
            onChange={(e) => set("birthDate", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${label}-time`}>
            Время рождения{" "}
            <span className="text-xs text-[var(--color-content-muted)]">
              (желательно)
            </span>
          </Label>
          <Input
            id={`${label}-time`}
            type="time"
            value={data.birthTime}
            onChange={(e) => set("birthTime", e.target.value)}
          />
          <p className="mt-1 text-xs text-[var(--color-content-muted)]">
            Без времени рождения расчёт строится приблизительно — точное
            время даёт более точную карту.
          </p>
        </div>
        <div>
          <Label htmlFor={`${label}-place`}>Место рождения</Label>
          <Input
            id={`${label}-place`}
            value={data.birthPlace}
            onChange={(e) => set("birthPlace", e.target.value)}
            placeholder="Город"
          />
        </div>
      </CardContent>
    </Card>
  );
}