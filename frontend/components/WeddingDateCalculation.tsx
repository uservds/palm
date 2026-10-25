"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const STEPS = [
  "Строим натальную карту партнёра 1…",
  "Строим натальную карту партнёра 2…",
  "Сверяем совместимость планет…",
  "Отбираем благоприятные даты…",
];

type Props = {
  onComplete: () => void;
  stepDurationMs?: number;
};

export default function WeddingDateCalculation({
  onComplete,
  stepDurationMs = 900,
}: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= STEPS.length - 1) {
          clearInterval(interval);
          if (!completedRef.current) {
            completedRef.current = true;
            setTimeout(onComplete, stepDurationMs);
          }
          return prev;
        }
        return prev + 1;
      });
    }, stepDurationMs);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-[var(--color-content-border)] bg-[var(--color-surface)] px-6 py-16">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brick-50)]"
      >
        <Sparkles className="h-7 w-7 text-[var(--color-brick-500)]" />
      </motion.div>

      <div className="text-center">
        <p className="font-medium text-[var(--color-content-main)]">
          {STEPS[stepIndex]}
        </p>
        <div className="mt-4 h-1.5 w-56 overflow-hidden rounded-full bg-[var(--color-neutral-badge)]">
          <motion.div
            className="h-full bg-[var(--color-brick-400)]"
            animate={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    </div>
  );
}