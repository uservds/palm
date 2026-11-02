"use client";

import { useEffect, useState } from "react";
import FriendshipDropzones from "@/components/FriendshipDropzones";
import ScanSimulation from "@/components/ScanSimulation";
import TeaserReportFriendship from "@/components/TeaserReportFriendship";
import { analyzeFriendshipCompatibility, ApiError, type GroupCompatibilitySuccessResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";

type Stage = "idle" | "scanning" | "result" | "error";

export default function FriendshipCompatPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [participantCount, setParticipantCount] = useState(2);
  const [images, setImages] = useState<string[]>([]);
  const [report, setReport] = useState<GroupCompatibilitySuccessResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    if (animationDone && report && stage === "scanning") {
      setStage("result");
    }
  }, [animationDone, report, stage]);

  function handleAllFilesReady(files: File[], previewUrls: string[]) {
    setImages(previewUrls);
    setReport(null);
    setErrorMessage(null);
    setAnimationDone(false);
    setStage("scanning");

    analyzeFriendshipCompatibility(files)
      .then((data) => setReport(data))
      .catch((err) => {
        const message =
          err instanceof ApiError
            ? err.message
            : "Не удалось рассчитать совместимость. Попробуйте позже.";
        setTimeout(() => {
          setErrorMessage(message);
          setStage("error");
        }, 1500);
      });
  }

  function handleScanComplete() {
    setAnimationDone(true);
  }

  function handleRetry() {
    setStage("idle");
    setImages([]);
    setReport(null);
    setErrorMessage(null);
    setAnimationDone(false);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-10 text-center">
        <span className="inline-block rounded-full bg-[var(--color-neutral-badge)] px-3 py-1 text-sm font-medium text-[var(--color-neutral-badgeText)]">
          2–4 участника
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--color-content-main)]">
          Совместимость дружбы
        </h1>
        <p className="mt-2 text-[var(--color-content-muted)]">
          Загрузите фото ладоней всей компании — узнайте архетип группы и
          слабые места дружбы.
        </p>
        <p className="mt-1 text-sm text-[var(--color-content-muted)]">
          Можно пригласить от 2 до 4 человек — добавьте или уберите
          участника кнопками справа над загрузкой фото.
        </p>
      </div>

      {stage === "idle" && (
        <FriendshipDropzones
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

      {stage === "error" && (
        <div className="mx-auto max-w-md pb-20 text-center">
          <p className="text-content-main">{errorMessage}</p>
          <Button variant="outline" className="mt-4" onClick={handleRetry}>
            Попробовать снова
          </Button>
        </div>
      )}

      {stage === "result" && report && (
        <TeaserReportFriendship report={report} />
      )}
    </main>
  );
}