'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Lock } from 'lucide-react';
import type { CompatibilitySuccessResponse } from '@/lib/api';

interface TeaserReportCoupleProps {
  report: CompatibilitySuccessResponse;
}

export default function TeaserReportCouple({ report }: TeaserReportCoupleProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    // TODO: подключить реальную отправку, когда появится
    // POST /api/report/send-email (дорожная-карта.md, Приоритет 6) —
    // пока это только локальный UI-стейт, письмо никуда не уходит.
  };

  const topFinding = report.free_insights[0];

  return (
    <div className="mx-auto w-full max-w-xl px-6 pb-20">
      <Card className="flex flex-col items-center gap-6 rounded-2xl border border-content-border bg-surface p-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft">
            <Heart className="h-9 w-9 text-brick-400" />
          </div>
          <div className="text-5xl font-bold text-primary">{report.overall_score}%</div>
          <p className="text-sm text-content-muted">совместимость</p>
        </div>

        <div>
          <p className="text-lg font-semibold text-content-main">
            {report.couple_archetype.name}
          </p>
          <p className="mt-1 text-sm text-content-muted">
            {report.couple_archetype.energies.join(' + ')}
          </p>
        </div>

        {topFinding && (
          <div className="rounded-xl bg-neutral-badge px-4 py-3 text-sm text-content-main">
            {topFinding.text}
          </div>
        )}

        {report.locked_blocks.length > 0 && (
          <div className="flex w-full flex-col gap-2 text-left">
            {report.locked_blocks.slice(0, 3).map((block) => (
              <div
                key={block.section_id}
                className="flex items-center gap-2 rounded-lg border border-content-border px-3 py-2 text-sm text-content-muted"
              >
                <Lock className="h-3.5 w-3.5 shrink-0" />
                <span>
                  <span className="font-medium text-content-main">{block.title}.</span>{' '}
                  {block.teaser}
                </span>
              </div>
            ))}
          </div>
        )}

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
            <p className="text-sm text-content-muted">
              {report.cta || 'Узнайте полную картину совместимости — 12 разделов разбора пары'}
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