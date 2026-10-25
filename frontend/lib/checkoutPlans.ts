export type PlanId = "individual" | "compatibility" | "subscription";

export interface CheckoutPlan {
  id: PlanId;
  title: string;
  price: number;
  period?: "mo";
  description: string;
}

export const checkoutPlans: Record<PlanId, CheckoutPlan> = {
  individual: {
    id: "individual",
    title: "Полный индивидуальный разбор",
    price: 399,
    description: "14 разделов, PDF-отчёт",
  },
  compatibility: {
    id: "compatibility",
    title: "Разбор совместимости пары",
    price: 599,
    description: "12 разделов, PDF-отчёт",
  },
  subscription: {
    id: "subscription",
    title: "Подписка Палмис AI",
    price: 590,
    period: "mo",
    description: "Безлимитные сканы, чат без ограничений, ежедневный гороскоп",
  },
};

export function getPlan(id: string | null): CheckoutPlan {
  if (id && id in checkoutPlans) {
    return checkoutPlans[id as PlanId];
  }
  return checkoutPlans.individual;
}