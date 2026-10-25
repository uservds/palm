"use client";

import { useState } from "react";
import FriendshipDropzones from "@/components/FriendshipDropzones";
import ScanSimulation from "@/components/ScanSimulation";
import TeaserReportFriendship from "@/components/TeaserReportFriendship";
import { getRandomFriendshipArchetype, FriendshipArchetype } from "@/lib/friendshipArchetypes";

type Stage = "idle" | "scanning" | "result";

export default function FriendshipCompatPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [participantCount, setParticipantCount] = useState(2);
  const [archetype, setArchetype] = useState<FriendshipArchetype | null>(null);
  const [percent, setPercent] = useState(0);

  function handleAllFilesReady() {
    setStage("scanning");
  }

  function handleScanComplete() {
    setArchetype(getRandomFriendshipArchetype());
    setPercent(Math.floor(60 + Math.random() * 35)); // мок: 60–95%
    setStage("result");
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
           Можно пригласить от 2 до 4 человек — добавьте или уберите участника
           кнопками справа над загрузкой фото.
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
          onComplete={handleScanComplete}
        />
      )}

      {stage === "result" && archetype && (
        <TeaserReportFriendship
          archetype={archetype}
          compatibilityPercent={percent}
          participantCount={participantCount}
        />
      )}
    </main>
  );
}