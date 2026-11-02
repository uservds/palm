'use client';

import { useEffect, useState } from 'react';
import CoupleDropzones from '@/components/CoupleDropzones';
import ScanSimulation from '@/components/ScanSimulation';
import TeaserReportCouple from '@/components/TeaserReportCouple';
import {
  analyzeCoupleCompatibility,
  ApiError,
  type CompatibilitySuccessResponse,
} from '@/lib/api';
import { Button } from '@/components/ui/button';

type Stage = 'idle' | 'scanning' | 'result' | 'error';
type Gender = 'male' | 'female';

export default function CompatibilityCouplePage() {
  const [stage, setStage] = useState<Stage>('idle');
  const [imageUrls, setImageUrls] = useState<(string | null)[]>([null, null]);
  const [report, setReport] = useState<CompatibilitySuccessResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [animationDone, setAnimationDone] = useState(false);

  // Переходим к result только когда закончились ОБА: анимация (~6 сек,
  // ScanSimulation) и реальный ответ бэкенда. Порядок наступления не важен —
  // тот же принцип, что в DropzoneHero/FreeReport для одиночного Vision-скана.
  useEffect(() => {
    if (animationDone && report && stage === 'scanning') {
      setStage('result');
    }
  }, [animationDone, report, stage]);

  function handleBothReady(fileA: File, fileB: File, genderB: Gender) {
    const urlA = URL.createObjectURL(fileA);
    const urlB = URL.createObjectURL(fileB);
    setImageUrls([urlA, urlB]);
    setReport(null);
    setErrorMessage(null);
    setAnimationDone(false);
    setStage('scanning');

    analyzeCoupleCompatibility(fileA, fileB, genderB)
      .then((data) => setReport(data))
      .catch((err) => {
        const message =
          err instanceof ApiError
            ? err.message
            : 'Не удалось рассчитать совместимость. Попробуйте позже.';
        // Задержка ~1.5 сек вместо мгновенного показа ошибки — не дожидаемся
        // полной анимации (~6 сек), но и не обрываем её мгновенно, чтобы не
        // создавать ощущение «фото даже не посмотрели».
        setTimeout(() => {
          setErrorMessage(message);
          setStage('error');
        }, 1500);
      });
  }

  function handleScanComplete() {
    setAnimationDone(true);
  }

  function handleRetry() {
    setStage('idle');
    setImageUrls([null, null]);
    setReport(null);
    setErrorMessage(null);
    setAnimationDone(false);
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

      {stage === 'error' && (
        <div className="mx-auto max-w-md px-6 pb-20 text-center">
          <p className="text-content-main">{errorMessage}</p>
          <Button variant="outline" className="mt-4" onClick={handleRetry}>
            Попробовать снова
          </Button>
        </div>
      )}

      {stage === 'result' && report && (
        <TeaserReportCouple report={report} />
      )}
    </main>
  );
}