"use client";

import { useState } from "react";
import PaidReportPaywall from "@/components/PaidReportPaywall";
import PaidReportContent from "@/components/PaidReportContent";

type Stage = "paywall" | "processing" | "unlocked";

export default function PaidReportPage() {
  const [stage, setStage] = useState<Stage>("paywall");

  function handlePay() {
    setStage("processing");
    // TODO: заменить на реальный вызов /api/payment/create при интеграции (Приоритет 2)
    setTimeout(() => setStage("unlocked"), 1200);
  }

  if (stage === "unlocked") {
    return <PaidReportContent />;
  }

  return <PaidReportPaywall onPay={handlePay} loading={stage === "processing"} />;
}