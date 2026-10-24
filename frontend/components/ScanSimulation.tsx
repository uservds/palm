"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type ScanSimulationProps = {
  participants?: 1 | 2 | 3 | 4;
  images?: (string | null)[];
  onComplete?: () => void;
};

const STEPS = [
  "Определяем контур ладони…",
  "Анализируем линии…",
  "Сверяем с базой архетипов…",
  "Формируем находки…",
];

const STEP_DURATION = 1600;

export default function ScanSimulation({
  participants = 1,
  images = [],
  onComplete,
}: ScanSimulationProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
    setStepIndex(0);

    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, STEP_DURATION);

    const finishTimeout = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
    }, STEP_DURATION * STEPS.length);

    return () => {
      clearInterval(interval);
      clearTimeout(finishTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const slots = Array.from({ length: participants });

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className={`grid gap-4 ${
          participants === 1
            ? "grid-cols-1"
            : participants === 2
            ? "grid-cols-2"
            : "grid-cols-2 md:grid-cols-4"
        }`}
      >
        {slots.map((_, i) => (
          <div
            key={i}
            className="relative w-40 h-40 rounded-xl overflow-hidden bg-neutral-badge border border-content-border"
          >
            {images[i] ? (
              <img
                src={images[i]!}
                alt={`Ладонь ${i + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-content-muted text-sm">
                Фото {i + 1}
              </div>
            )}

            <motion.div
              className="absolute left-0 right-0 h-1 bg-accent shadow-[0_0_12px_2px_rgba(6,182,212,0.6)]"
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-0 border-2 border-accent/40 rounded-xl pointer-events-none" />
          </div>
        ))}
      </div>

      <div className="w-full max-w-xs text-center min-h-[1.75rem]">
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-base font-medium text-content-main"
          >
            {STEPS[stepIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex gap-1.5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === stepIndex ? "w-6 bg-accent" : "w-1.5 bg-content-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}