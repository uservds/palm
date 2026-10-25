"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { PersonBirthData } from "@/components/WeddingDateForm";

type Props = {
  person1: PersonBirthData;
  person2: PersonBirthData;
  city: string;
};

const MOCK_DATES = ["14 июня 2027", "22 сентября 2027", "9 мая 2028"];

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

export default function TeaserReportWedding({ person1, person2, city }: Props) {
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
    <div className="mt-8 rounded-2xl border border-[var(--color-brick-200)] bg-[var(--color-brick-50)] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-content-main)]">
            {person1.name} и {person2.name}, лучшая дата уже почти найдена
          </h2>
          <p className="mt-1 text-sm text-[var(--color-content-muted)]">
            Для свадьбы в городе {city}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--color-brick-500)] px-3 py-1 text-sm font-medium text-white">
          599 ₽
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {MOCK_DATES.map((date, i) => (
          <li
            key={date}
            className="flex items-center justify-between rounded-lg bg-[var(--color-surface)] px-4 py-2"
          >
            <span className="text-[var(--color-content-main)]">{date}</span>
            {i === 0 ? (
              <span className="rounded-full bg-[var(--color-brick-500)] px-2 py-0.5 text-xs font-medium text-white">
                лучшая
              </span>
            ) : (
              <span className="text-xs text-[var(--color-content-muted)] blur-[3px] select-none">
                совместимость ●●%
              </span>
            )}
          </li>
        ))}
      </ul>

      {!sent ? (
        <>
          <p className="mt-5 text-sm text-[var(--color-content-muted)]">
            Даты найдены — но без расшифровки это просто цифры. Узнайте,
            что говорят звёзды о каждой из них, и получите полный разбор
            на почту.
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
              Узнать почему
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
          Отчёт отправлен на {email}. Полный разбор дат — 599 ₽, для
          подписчиков — со скидкой.
        </p>
      )}
    </div>
  );
}