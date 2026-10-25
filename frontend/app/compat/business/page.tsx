"use client";

import { useState } from "react";
import BusinessDropzones from "@/components/BusinessDropzones";
import ScanSimulation from "@/components/ScanSimulation";
import TeaserReportBusiness from "@/components/TeaserReportBusiness";
import { getRandomBusinessArchetype, BusinessArchetype } from "@/lib/businessArchetypes";

type Stage = "idle" | "scanning" | "result";

export default function BusinessCompatPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [participantCount, setParticipantCount] = useState(2);
  const [images, setImages] = useState<string[]>([]);
  const [archetype, setArchetype] = useState<BusinessArchetype | null>(null);
  const [percent, setPercent] = useState(0);

  function handleAllFilesReady(previewUrls: string[]) {
    setImages(previewUrls);
    setStage("scanning");
  }

  function handleScanComplete() {
    setArchetype(getRandomBusinessArchetype());
    setPercent(Math.floor(60 + Math.random() * 35)); // мок: 60–95%
    setStage("result");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-10 text-center">
        <span className="inline-block rounded-full bg-[var(--color-neutral-badge)] px-3 py-1 text-sm font-medium text-[var(--color-neutral-badgeText)]">
          2–4 партнёра
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--color-content-main)]">
          Совместимость деловых партнёров
        </h1>
        <p className="mt-2 text-[var(--color-content-muted)]">
          Загрузите фото ладоней всех участников — узнайте модель
          партнёрства и риски до начала совместного дела.
        </p>
        <p className="mt-1 text-sm text-[var(--color-content-muted)]">
          Можно добавить от 2 до 4 партнёров — кнопки справа над загрузкой
          фото.
        </p>
      </div>

      {stage === "idle" && (
        <BusinessDropzones
          participantCount={participantCount}
          onParticipantCountChange={setParticipantCount}
          onAllFilesReady={handleAllFilesReady}
        />
      )}

      {stage === "scanning" && (
        <ScanSimulation
          participants={participantCount as 1 | 2 | 3 | 4}
          images={images}
          onComplete={handleScanComplete}
        />
      )}

      {stage === "result" && archetype && (
        <TeaserReportBusiness
          archetype={archetype}
          compatibilityPercent={percent}
          participantCount={participantCount}
        />
      )}
    </main>
  );
}