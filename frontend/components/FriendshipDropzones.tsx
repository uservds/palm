"use client";

import { useState } from "react";
import { Upload, X, UserPlus } from "lucide-react";

export type FriendshipSlot = {
  id: string;
  file: File | null;
  previewUrl: string | null;
};

type Props = {
  participantCount: number;
  onParticipantCountChange: (count: number) => void;
  onAllFilesReady: (files: File[], previewUrls: string[]) => void;
};

const MIN_PARTICIPANTS = 2;
const MAX_PARTICIPANTS = 4;

function createSlots(count: number): FriendshipSlot[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `slot-${i}`,
    file: null,
    previewUrl: null,
  }));
}

export default function FriendshipDropzones({
  participantCount,
  onParticipantCountChange,
  onAllFilesReady,
}: Props) {
  const [slots, setSlots] = useState<FriendshipSlot[]>(createSlots(participantCount));

  function syncSlots(count: number) {
    setSlots((prev) => {
      const next = createSlots(count).map((slot, i) => prev[i] ?? slot);
      return next;
    });
    onParticipantCountChange(count);
  }

  function handleFile(index: number, file: File) {
    const previewUrl = URL.createObjectURL(file);
    setSlots((prev) => {
      const next = prev.map((slot, i) =>
        i === index ? { ...slot, file, previewUrl } : slot
      );
      const allFilled = next.every((s) => s.file !== null && s.previewUrl !== null);
      if (allFilled) {
        onAllFilesReady(
          next.map((s) => s.file!) as File[],
          next.map((s) => s.previewUrl!) as string[]
        );
      }
      return next;
    });
  }

  function handleRemove(index: number) {
    setSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, file: null, previewUrl: null } : slot))
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--color-content-main)]">
          Участников: {participantCount}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => syncSlots(Math.max(MIN_PARTICIPANTS, participantCount - 1))}
            disabled={participantCount <= MIN_PARTICIPANTS}
            className="flex h-8 items-center gap-1 rounded-lg border border-[var(--color-content-border)] px-3 text-sm text-[var(--color-content-main)] disabled:opacity-30"
          >
            − Убрать
          </button>
          <button
            type="button"
            onClick={() => syncSlots(Math.min(MAX_PARTICIPANTS, participantCount + 1))}
            disabled={participantCount >= MAX_PARTICIPANTS}
            className="flex h-8 items-center gap-1 rounded-lg border border-[var(--color-content-border)] px-3 text-sm text-[var(--color-content-main)] disabled:opacity-30"
          >
            <UserPlus className="h-4 w-4" />
            Добавить
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {slots.map((slot, i) => (
          <label
            key={slot.id}
            className="relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--color-content-border)] bg-[var(--color-surface)] p-3 text-center transition hover:border-[var(--color-primary)]"
          >
            {slot.previewUrl ? (
              <>
                <img
                  src={slot.previewUrl}
                  alt={`Участник ${i + 1}`}
                  className="h-full w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove(i);
                  }}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-content-main)]/70 text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <>
                <Upload className="h-6 w-6 text-[var(--color-content-muted)]" />
                <span className="text-xs text-[var(--color-content-muted)]">
                  Участник {i + 1}
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(i, file);
              }}
            />
          </label>
        ))}
      </div>
    </div>
  );
}