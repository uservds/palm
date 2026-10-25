type Props = {
  number: number;
  title: string;
  description: string;
};

export default function HowItWorksStep({ number, title, description }: Props) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg font-semibold text-white">
        {number}
      </div>
      <h3 className="mt-4 text-base font-semibold text-[var(--color-content-main)]">
        {title}
      </h3>
      <p className="mt-2 max-w-xs text-sm text-[var(--color-content-muted)]">
        {description}
      </p>
    </div>
  );
}