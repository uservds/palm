import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPlan } from "@/lib/checkoutPlans";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { plan?: string };
}) {
  const plan = getPlan(searchParams.plan ?? null);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
        <CheckCircle2 className="h-7 w-7 text-primary" />
      </div>
      <h1 className="mt-4 text-xl font-semibold text-content-main">Оплата прошла успешно</h1>
      <p className="mt-2 max-w-sm text-sm text-content-muted">
        {plan.title} — {plan.price} ₽{plan.period ? "/мес" : ""}. Чек отправлен на вашу почту.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/profile">
          <Button>Перейти в профиль</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">На главную</Button>
        </Link>
      </div>
    </main>
  );
}