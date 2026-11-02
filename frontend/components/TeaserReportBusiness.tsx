"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { GroupCompatibilitySuccessResponse } from "@/lib/api";

type Props = {
  report: GroupCompatibilitySuccessResponse;
};

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_DOMAINS = ["gmail.com", "mail.ru", "yandex.ru", "ya.ru"];
const ALLOWED_TLDS = ["ru", "com"];

function isEmailAllowed(email: string): boolean {
  if (!EMAIL_FORMAT.test(email)) return false;
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return false;
  if (ALLOWED_DOMAINS.includes(domain)) return true;
  const tld = domain.split(".").pop();
  return !!tld && ALLOWED_TLDS.includes(tld);
}

export default function TeaserReportBusiness({ report }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isEmailAllowed(email)) {
      setError("Проверьте почту — похоже, в адресе опечатка");
      return;
    }
    setError("");
    setSent(true);
  }

  const topFinding = report.free_insights[0];

  return (
    <div className="mt-8 rounded-2xl border border-[var(--color-content-border)] bg-[var(--color-surface)] p-6">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-[var(--color-neutral-badge)] px-3 py-1 text-xs font-medium text-[var(--color-neutral-badgeText)]">
          {report.participant_count} партнёра в разборе
        </span>
        <span className="text-2xl font-semibold text-[var(--color-content-main)]">
          {report.overall_score}%
        </span>
      </div>

      <h2 className="mt-4 text-lg font-semibold text-[var(--color-content-main)]">
        Модель партнёрства: «{report.group_archetype.title}»
      </h2>
      <p className="mt-1 text-sm text-[var(--color-content-muted)]">
        {report.group_archetype.description}
      </p>

      {topFinding && (
        <p className="mt-4 text-sm text-[var(--color-content-main)]">
          {topFinding.text}
        </p>
      )}

      {!sent ? (
        <>
          <p className="mt-5 text-sm text-[var(--color-content-muted)]">
            {report.cta ||
              "Это только верхний уровень анализа. Полный разбор покажет распределение ролей в команде и зоны риска, которые стоит закрыть до старта совместного дела."}
          </p>
          <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
            <Input
              type="email"
              required
              placeholder="Рабочий email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-[var(--color-primary)] px-5 py-2 font-medium text-white hover:bg-[var(--color-primary-hover)]"
            >
              Получить разбор
            </button>
          </form>
          {error && (
            <p className="mt-2 text-sm text-[var(--color-brick-600)]">
              {error}
            </p>
          )}
        </>
      ) : (
        <p className="mt-5 text-sm text-[var(--color-content-muted)]">
          Отчёт отправлен на {email}. Полный разбор партнёрства — 599 ₽,
          для подписчиков — со скидкой.
        </p>
      )}
    </div>
  );
}