"use client";

import { useState } from "react";
import * as Icons from "lucide-react";
import { PAID_REPORT_SECTIONS } from "@/lib/paidReportSections";

// Мок-текст раздела: в реальной интеграции придёт из /api/report/:id (Приоритет 2)
function mockSectionText(title: string): string {
  return `Это предварительный текст раздела «${title}». После подключения backend здесь будет персонализированный анализ на основе ваших линий и знаков ладони, сгенерированный ИИ на основе базы знаний хиромантии.`;
}

export default function PaidReportContent() {
  const [openId, setOpenId] = useState<string | null>(PAID_REPORT_SECTIONS[0].id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="mb-8 text-center">
        <span className="inline-block rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-sm font-medium text-[var(--color-content-main)]">
          Оплачено · полный доступ
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--color-content-main)]">
          Ваш полный разбор
        </h1>
        <p className="mt-2 text-[var(--color-content-muted)]">
          14 разделов — откройте любой, чтобы прочитать
        </p>
      </div>

      <button className="mb-6 w-full rounded-xl border border-[var(--color-content-border)] px-5 py-3 text-sm font-medium text-[var(--color-content-main)] transition hover:border-[var(--color-primary)]">
        Скачать PDF-версию
      </button>

      <div className="space-y-2">
        {PAID_REPORT_SECTIONS.map((section) => {
          const Icon = (Icons as any)[section.icon] ?? Icons.Circle;
          const isOpen = openId === section.id;
          return (
            <div
              key={section.id}
              className="rounded-xl border border-[var(--color-content-border)] bg-[var(--color-surface)]"
            >
              <button
                onClick={() => setOpenId(isOpen ? null : section.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-[var(--color-primary)]" />
                  <span className="text-sm font-medium text-[var(--color-content-main)]">
                    {section.title}
                  </span>
                </span>
                <Icons.ChevronDown
                  className={`h-4 w-4 text-[var(--color-content-muted)] transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <p className="px-4 pb-4 text-sm leading-relaxed text-[var(--color-content-muted)]">
                  {mockSectionText(section.title)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}