import { ReactNode } from "react";
import { Check } from "lucide-react";

type Props = {
  title: string;
  price: string;
  priceNote?: string;
  description: string;
  features: string[];
  ctaLabel: string;
  highlighted?: boolean;
  badge?: string;
  extraNote?: string;
  footerSlot?: ReactNode;
};

export default function PricingCard({
  title,
  price,
  priceNote,
  description,
  features,
  ctaLabel,
  highlighted = false,
  badge,
  extraNote,
  footerSlot,
}: Props) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 ${
        highlighted
          ? "border-[var(--color-primary)] bg-[var(--color-surface)] shadow-lg shadow-[var(--color-primary)]/10 md:scale-105"
          : "border-[var(--color-content-border)] bg-[var(--color-surface)]"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-medium text-white">
          {badge}
        </span>
      )}

      <h3 className="text-lg font-semibold text-[var(--color-content-main)]">
        {title}
      </h3>
      <p className="mt-1 text-sm text-[var(--color-content-muted)]">
        {description}
      </p>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-semibold text-[var(--color-content-main)]">
          {price}
        </span>
        {priceNote && (
          <span className="text-sm text-[var(--color-content-muted)]">
            {priceNote}
          </span>
        )}
      </div>

      {extraNote && (
        <p className="mt-2 text-xs font-medium text-[var(--color-accent)]">
          {extraNote}
        </p>
      )}

      <ul className="mt-5 flex-1 space-y-2.5">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2 text-sm text-[var(--color-content-main)]"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        className={`mt-6 w-full rounded-xl px-5 py-3 text-sm font-medium transition ${
          highlighted
            ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
            : "border border-[var(--color-content-border)] text-[var(--color-content-main)] hover:border-[var(--color-primary)]"
        }`}
      >
        {ctaLabel}
      </button>

      {footerSlot}
    </div>
  );
}