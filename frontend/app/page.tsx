"use client";

import { useRef, useState } from "react";
import Hero from "@/components/Hero";
import DropzoneHero from "@/components/DropzoneHero";
import ScanSimulation from "@/components/ScanSimulation";
import FreeReport from "@/components/FreeReport";
import { analyzePalmImage, ApiError, type VisionSuccessResponse } from "@/lib/api";

type Stage = "idle" | "scanning" | "result" | "error";

const MIN_ERROR_DELAY_MS = 1500;

export default function Home() {
  const [stage, setStage] = useState<Stage>("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [report, setReport] = useState<VisionSuccessResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pendingFileRef = useRef<File | null>(null);
  const apiResultRef = useRef<VisionSuccessResponse | null>(null);
  const apiErrorRef = useRef<string | null>(null);
  const animationDoneRef = useRef(false);
  const apiDoneRef = useRef(false);
  const scanStartRef = useRef(0);

  function tryFinishSuccess() {
    if (!animationDoneRef.current || !apiDoneRef.current) return;
    if (apiErrorRef.current) return; // errors are handled separately, faster
    if (apiResultRef.current) {
      setReport(apiResultRef.current);
      setStage("result");
    }
  }

  function startScan(file: File, previewUrl: string) {
    pendingFileRef.current = file;
    apiResultRef.current = null;
    apiErrorRef.current = null;
    animationDoneRef.current = false;
    apiDoneRef.current = false;
    scanStartRef.current = Date.now();

    setImageUrl(previewUrl);
    setReport(null);
    setErrorMessage(null);
    setStage("scanning");

    analyzePalmImage(file)
      .then((result) => {
        apiResultRef.current = result;
      })
      .catch((err) => {
        apiErrorRef.current =
          err instanceof ApiError
            ? err.message
            : "Не удалось обработать фото. Попробуйте позже.";
      })
      .finally(() => {
        apiDoneRef.current = true;

        if (apiErrorRef.current) {
          // Don't make the person sit through the full scan animation for
          // an error — show it quickly, but not so abruptly that it feels
          // like nothing happened at all.
          const elapsed = Date.now() - scanStartRef.current;
          const remaining = Math.max(0, MIN_ERROR_DELAY_MS - elapsed);
          setTimeout(() => {
            setErrorMessage(apiErrorRef.current);
            setStage("error");
          }, remaining);
        } else {
          tryFinishSuccess();
        }
      });
  }

  function handleFileSelected(file: File, previewUrl: string) {
    startScan(file, previewUrl);
  }

  function handleScanAnimationComplete() {
    animationDoneRef.current = true;
    tryFinishSuccess();
  }

  function handleRetry() {
    if (pendingFileRef.current && imageUrl) {
      startScan(pendingFileRef.current, imageUrl);
    } else {
      setStage("idle");
    }
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
            onComplete={handleScanAnimationComplete}
          />
        </div>
      )}

      {stage === "error" && (
        <div className="max-w-md mx-auto px-6 pb-20 text-center space-y-4">
          <p className="text-content-main font-medium">{errorMessage}</p>
          <button
            onClick={handleRetry}
            className="bg-primary hover:bg-primary-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      )}

      {stage === "result" && report && <FreeReport report={report} />}
    </main>
  );
}