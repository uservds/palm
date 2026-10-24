'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart } from 'lucide-react';
import type { CoupleArchetype } from '@/lib/coupleArchetypes';

interface TeaserReportCoupleProps {
  archetype: CoupleArchetype;
}

export default function TeaserReportCouple({ archetype }: TeaserReportCoupleProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="mx-auto w-full max-w-xl px-6 pb-20">
      <Card className="flex flex-col items-center gap-6 rounded-2xl border border-content-border bg-surface p-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft">
            <Heart className="h-9 w-9 text-brick-400" />
          </div>
          <div className="text-5xl font-bold text-primary">{archetype.percent}%</div>
          <p className="text-sm text-content-muted">совместимость</p>
        </div>

        <div>
          <p className="text-lg font-semibold text-content-main">{archetype.name}</p>
        </div>

        <div className="rounded-xl bg-neutral-badge px-4 py-3 text-sm text-content-main">
          ✓ {archetype.finding}
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
            <p className="text-sm text-content-muted">
              Узнайте полную картину совместимости — 12 разделов разбора пары
            </p>
            <Input
              type="email"
              placeholder="Ваш email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Получить полный разбор — 599 ₽
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-primary">Отчёт отправлен на {email}</p>
            <p className="text-xs text-content-muted">
              Полный разбор пары — 599 ₽, 12 разделов
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}