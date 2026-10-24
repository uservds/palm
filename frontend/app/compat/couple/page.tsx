'use client';

import { useState } from 'react';
import CoupleDropzones from '@/components/CoupleDropzones';
import ScanSimulation from '@/components/ScanSimulation';
import TeaserReportCouple from '@/components/TeaserReportCouple';
import { getRandomCoupleArchetype, type CoupleArchetype } from '@/lib/coupleArchetypes';

type Stage = 'idle' | 'scanning' | 'result';
type Gender = 'male' | 'female';

export default function CompatibilityCouplePage() {
  const [stage, setStage] = useState<Stage>('idle');
  const [imageUrls, setImageUrls] = useState<(string | null)[]>([null, null]);
  const [archetype, setArchetype] = useState<CoupleArchetype | null>(null);

  function handleBothReady(fileA: File, fileB: File, _genderB: Gender) {
    const urlA = URL.createObjectURL(fileA);
    const urlB = URL.createObjectURL(fileB);
    setImageUrls([urlA, urlB]);
    setStage('scanning');
  }

  function handleScanComplete() {
    setArchetype(getRandomCoupleArchetype());
    setStage('result');
  }

  return (
    <main>
      <div className="mx-auto max-w-2xl px-6 pb-8 pt-16 text-center">
        <h1 className="text-3xl font-bold text-content-main">
          Совместимость пары
        </h1>
        <p className="mt-3 text-content-muted">
          Загрузите фото ладоней обоих партнёров — узнаете процент совместимости и ключевую находку бесплатно
        </p>
      </div>

      {stage === 'idle' && (
        <CoupleDropzones onBothReady={handleBothReady} />
      )}

      {stage === 'scanning' && (
        <div className="mx-auto max-w-2xl px-6 pb-20">
          <ScanSimulation
            participants={2}
            images={imageUrls}
            onComplete={handleScanComplete}
          />
        </div>
      )}

      {stage === 'result' && archetype && (
        <TeaserReportCouple archetype={archetype} />
      )}
    </main>
  );
}