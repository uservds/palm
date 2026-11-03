"use client";

import { ZODIAC_SIGNS } from "@/lib/zodiacSigns";

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function ZodiacPicker({ selectedId, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {ZODIAC_SIGNS.map((sign) => (
        <button
          key={sign.id}
          type="button"
          onClick={() => onSelect(sign.id)}
          className={`rounded-xl border px-3 py-3 text-center transition ${
            selectedId === sign.id
              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
              : "border-[var(--color-content-border)] bg-[var(--color-surface)] text-[var(--color-content-main)] hover:border-[var(--color-primary)]"
          }`}
        >
          <span className="block text-sm font-medium">{sign.name}</span>
          <span
            className={`mt-0.5 block text-xs ${
              selectedId === sign.id
                ? "text-white/80"
                : "text-[var(--color-content-muted)]"
            }`}
          >
            {sign.dateRange}
          </span>
        </button>
      ))}
    </div>
  );
}