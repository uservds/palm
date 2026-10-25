"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { FriendshipArchetype } from "@/lib/friendshipArchetypes";

type Props = {
  archetype: FriendshipArchetype;
  compatibilityPercent: number;
  participantCount: number;
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

export default function TeaserReportFriendship({
  archetype,
  compatibilityPercent,
  participantCount,
}: Props) {
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

  return (
    <div className="mt-8 rounded-2xl border border-[var(--color-accent-soft)] bg-[var(--color-accent-soft)] p-6">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-[var(--color-neutral-badge)] px-3 py-1 text-xs font-medium text-[var(--color-neutral-badgeText)]">
          {participantCount} участника в группе
        </span>
        <span className="text-2xl font-semibold text-[var(--color-content-main)]">
          {compatibilityPercent}%
        </span>
      </div>

      <h2 className="mt-4 text-lg font-semibold text-[var(--color-content-main)]">
        Архетип вашей компании: «{archetype.title}»
      </h2>
      <p className="mt-1 text-sm text-[var(--color-content-muted)]">
        {archetype.description}
      </p>

      <p className="mt-4 flex items-start gap-2 text-sm text-[var(--color-content-main)]">
        <span>✓</span>
        <span>{archetype.finding}</span>
      </p>

      {!sent ? (
        <>
          <p className="mt-5 text-sm text-[var(--color-content-muted)]">
            Это только часть картины. Полный разбор покажет, как каждый из
            вас влияет на динамику группы — и где точки будущих
            разногласий.
          </p>
          <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
            <Input
              type="email"
              required
              placeholder="Ваш email"
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
          Отчёт отправлен на {email}. Полный разбор группы — 599 ₽, для
          подписчиков — со скидкой.
        </p>
      )}
    </div>
  );
}