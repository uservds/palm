import CheckoutForm from "@/components/CheckoutForm";
import { getPlan } from "@/lib/checkoutPlans";

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: { plan?: string };
}) {
  const plan = getPlan(searchParams.plan ?? null);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center px-4 py-10">
      <h1 className="mb-6 text-xl font-semibold text-content-main">Оплата</h1>
      <CheckoutForm plan={plan} />
    </main>
  );
}