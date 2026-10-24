cd F:\Projects\Palmis_AI\palm\frontend

@'
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Upload, User, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type Gender = 'male' | 'female';

interface SlotState {
  file: File | null;
  preview: string | null;
}

interface CoupleDropzonesProps {
  onBothReady: (fileA: File, fileB: File, genderB: Gender) => void;
}

export default function CoupleDropzones({ onBothReady }: CoupleDropzonesProps) {
  const [slotA, setSlotA] = useState<SlotState>({ file: null, preview: null });
  const [slotB, setSlotB] = useState<SlotState>({ file: null, preview: null });
  const [genderB, setGenderB] = useState<Gender>('female');

  const handleFile = (slot: 'A' | 'B', file: File) => {
    const preview = URL.createObjectURL(file);
    const setSlot = slot === 'A' ? setSlotA : setSlotB;
    setSlot({ file, preview });

    const nextA = slot === 'A' ? file : slotA.file;
    const nextB = slot === 'B' ? file : slotB.file;
    if (nextA && nextB) {
      onBothReady(nextA, nextB, genderB);
    }
  };

  const renderSlot = (
    slot: SlotState,
    label: string,
    onPick: (file: File) => void
  ) => (
    <Card
      className={cn(
        'relative flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-colors',
        slot.file
          ? 'border-primary bg-accent-soft'
          : 'border-content-border bg-surface hover:border-primary/50'
      )}
    >
      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 cursor-pointer opacity-0"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
        }}
      />
      {slot.preview ? (
        <>
          <img
            src={slot.preview}
            alt={label}
            className="h-24 w-24 rounded-full object-cover"
          />
          <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
            <Check className="h-4 w-4" /> Фото загружено
          </div>
        </>
      ) : (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-badge">
            <Upload className="h-6 w-6 text-content-muted" />
          </div>
          <p className="text-sm font-medium text-content-main">{label}</p>
          <p className="text-xs text-content-muted">Нажмите или перетащите фото</p>
        </>
      )}
    </Card>
  );

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-content-main">
            <User className="h-4 w-4" /> Участник 1
          </div>
          {renderSlot(slotA, 'Ладонь участника 1', (f) => handleFile('A', f))}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-content-main">
              <User className="h-4 w-4" /> Участник 2
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="genderB" className="text-xs text-content-muted">
                {genderB === 'female' ? 'Женщина' : 'Мужчина'}
              </Label>
              <Switch
                id="genderB"
                checked={genderB === 'male'}
                onCheckedChange={(checked) =>
                  setGenderB(checked ? 'male' : 'female')
                }
              />
            </div>
          </div>
          {renderSlot(slotB, 'Ладонь участника 2', (f) => handleFile('B', f))}
        </div>
      </div>
    </div>
  );
}
'@ | Out-File -FilePath "components\CoupleDropzones.tsx" -Encoding utf8

cd ..
git add frontend/components/CoupleDropzones.tsx
git commit -m "feat: CoupleDropzones component for совместимость-пар page"
git push