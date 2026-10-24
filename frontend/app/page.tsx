"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import DropzoneHero from "@/components/DropzoneHero";
import ScanSimulation from "@/components/ScanSimulation";
import FreeReport from "@/components/FreeReport";
import { getRandomArchetype, type Archetype } from "@/lib/archetypes";

type Stage = "idle" | "scanning" | "result";

export default function Home() {
  const [stage, setStage] = useState<Stage>("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [archetype, setArchetype] = useState<Archetype | null>(null);

  function handleFileSelected(url: string) {
    setImageUrl(url);
    setStage("scanning");
  }

  function handleScanComplete() {
    setArchetype(getRandomArchetype());
    setStage("result");
  }

  return (
    <main>
      <Hero />

      {stage === "idle" && (
        <DropzoneHero onFileSelected={handleFileSelected} />
      )}

      {stage === "scanning" && (
        <div className="max-w-2xl mx-auto px-6 pb-20">
          <ScanSimulation
            participants={1}
            images={[imageUrl]}
            onComplete={handleScanComplete}
          />
        </div>
      )}

      {stage === "result" && archetype && (
        <FreeReport archetype={archetype} />
      )}
    </main>
  );
}