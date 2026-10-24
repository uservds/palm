"use client";

import { useState } from "react";
import { Sparkles, Eye, EyeOff, Lock } from "lucide-react";
import type { Archetype } from "@/lib/archetypes";

type FreeReportProps = {
  userName?: string;
  archetype: Archetype;
};

const FULL_SECTIONS = [
  "Эмоциональные циклы",
  "Паттерны в партнёрстве",
  "Финансовые «слепые зоны»",
  "Персональные ритуалы на 7 дней",
];

export default function FreeReport({ userName, archetype }: FreeReportProps) {
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) setUnlocked(true);
  }

  return (
    <div className="max-w-xl mx-auto px-6 pb-20">
      <div className="bg-surface border border-content-border rounded-2xl p-6 md:p-8 space-y-6">
        {/* Заголовок с именем и архетипом */}
        <div>
          <p className="text-accent text-xs font-semibold tracking-wide uppercase mb-1">
            💫 Ваш личный код ладони
          </p>
          <h2 className="text-xl font-bold text-content-main">
            {userName ? `${userName}, ваша` : "Ваша"} ладонь показывает архетип
            «{archetype.name}»
          </h2>
          <p className="text-sm text-content-muted mt-1">
            Основные энергии: {archetype.energies[0]} + {archetype.energies[1]}
          </p>
        </div>

        {/* Ключевые находки */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-content-main flex items-center gap-2">
            🔮 Ключевые находки:
          </p>
          <div className="flex items-start gap-2 text-sm text-content-main">
            <span className="text-primary mt-0.5">✓</span>
            <span>Ваш ресурс в кризисе: {archetype.finding}</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-content-main">
            <span className="text-brick-500 mt-0.5">✧</span>
            <span>Тень: {archetype.shadow}</span>
          </div>
        </div>

        {/* Тизер полной картины */}
        <div className="bg-neutral-badge rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-content-main">
            🌌 Полная картина включает:
          </p>
          <ul className="space-y-1.5">
            {FULL_SECTIONS.map((section) => (
              <li
                key={section}
                className="text-sm text-content-muted flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5 text-content-muted shrink-0" />
                {section}
              </li>
            ))}
          </ul>
        </div>

        {/* Email-гейт / разблокировка */}
        {!unlocked ? (
          <form onSubmit={handleUnlock} className="space-y-3 pt-2">
            <p className="text-sm text-content-main font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Ваша ладонь готова раскрыть 14 секретов
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                placeholder="Ваш email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border border-content-border rounded-lg px-4 py-2.5 text-sm text-content-main placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap"
              >
                Получить полный разбор
              </button>
            </div>
          </form>
        ) : (
          <div className="pt-2 border-t border-content-border text-center space-y-2">
            <p className="text-sm text-content-main font-medium flex items-center justify-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              Отчёт отправлен на {email}
            </p>
            <p className="text-xs text-content-muted">
              Полный разбор (14 разделов) — 399 ₽
            </p>
          </div>
        )}
      </div>
    </div>
  );
}