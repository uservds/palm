"use client";

import { useState } from "react";
import { Sparkles, Eye, Lock } from "lucide-react";
import type { VisionSuccessResponse } from "@/lib/api";

type FreeReportProps = {
  userName?: string;
  report: VisionSuccessResponse;
};

const FINDING_LABELS = ["Ваш ресурс в кризисе", "Тень"];

export default function FreeReport({ userName, report }: FreeReportProps) {
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) setUnlocked(true);
  }

  // First two free_insights are the labeled "resource / shadow" pair from
  // the ТЗ preamble spec; anything after that is shown as a plain extra line.
  const labeledFindings = report.free_insights?.slice(0, 2) ?? [];
  const extraFindings = report.free_insights?.slice(2) ?? [];

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
            «{report.archetype}»
          </h2>
          {report.metaphor && (
            <p className="text-sm text-content-muted mt-1">{report.metaphor}</p>
          )}
        </div>

        {/* Ключевые находки */}
        {labeledFindings.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-content-main flex items-center gap-2">
              🔮 Ключевые находки:
            </p>
            {labeledFindings.map((item, i) => {
              const [, ...rest] = item.split(":");
              const text = rest.length > 0 ? rest.join(":").trim() : item;
              return (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm text-content-main"
                >
                  <span
                    className={i === 0 ? "text-primary mt-0.5" : "text-brick-500 mt-0.5"}
                  >
                    {i === 0 ? "✓" : "✧"}
                  </span>
                  <span>
                    <span className="font-medium">{FINDING_LABELS[i]}:</span> {text}
                  </span>
                </div>
              );
            })}
            {extraFindings.map((item, i) => (
              <p key={i} className="text-sm text-content-muted pl-6">
                {item}
              </p>
            ))}
          </div>
        )}

        {/* Тизер полной картины */}
        {report.locked_blocks?.length > 0 && (
          <div className="bg-neutral-badge rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-content-main">
              🌌 Полная картина включает:
            </p>
            <ul className="space-y-2.5">
              {report.locked_blocks.map((block) => (
                <li key={block.title} className="flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 text-content-muted shrink-0 mt-0.5" />
                  <span className="text-sm">
                    <span className="font-medium text-content-main">{block.title}.</span>{" "}
                    <span className="text-content-muted">
                      {typeof block.teaser === "string" ? block.teaser : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Email-гейт / разблокировка */}
        {!unlocked ? (
          <form onSubmit={handleUnlock} className="space-y-3 pt-2">
            <p className="text-sm text-content-main font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              {report.cta || "Ваша ладонь готова раскрыть 14 секретов"}
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

        {report.disclaimer && (
          <p className="text-xs text-content-muted pt-2 border-t border-content-border">
            {report.disclaimer}
          </p>
        )}
      </div>
    </div>
  );
}