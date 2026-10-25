// components/ProfileArchive.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArchivedReport, getReportTypeLabel } from "@/lib/mockProfile";
import { Lock, ChevronRight } from "lucide-react";
import Link from "next/link";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ProfileArchive({ reports }: { reports: ArchivedReport[] }) {
  if (reports.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-content-border p-10 text-center">
        <p className="text-content-muted">
          Пока нет сохранённых разборов. Сделайте первый скан на главной странице.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {reports.map((report) => (
        <Link key={report.id} href={report.isPaid ? `/report/paid?id=${report.id}` : "/"}>
          <Card className="flex items-center justify-between gap-4 p-4 transition-shadow hover:shadow-md">
            <div className="flex items-center gap-4">
              <div
                className="h-12 w-12 shrink-0 rounded-xl"
                style={{ backgroundColor: report.thumbnailColor }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-content-main">{report.title}</p>
                  {!report.isPaid && (
                    <Lock className="h-3.5 w-3.5 text-content-muted" aria-label="Закрытый отчёт" />
                  )}
                </div>
                <p className="text-sm text-content-muted">
                  {getReportTypeLabel(report.type)} · Архетип «{report.archetype}»
                </p>
                <p className="text-xs text-content-muted">{formatDate(report.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {report.isPaid ? (
                <Badge className="bg-neutral-badge text-neutral-badgeText">Открыт</Badge>
              ) : (
                <Badge className="bg-accent-soft text-primary">Доступен частично</Badge>
              )}
              <ChevronRight className="h-4 w-4 text-content-muted" />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}