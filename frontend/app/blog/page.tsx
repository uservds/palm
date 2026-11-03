import { BookOpen } from "lucide-react";

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-neutral-badge)]">
        <BookOpen className="h-6 w-6 text-[var(--color-content-muted)]" />
      </div>
      <h1 className="mt-6 text-2xl font-semibold text-[var(--color-content-main)]">
        База знаний скоро откроется
      </h1>
      <p className="mt-2 text-[var(--color-content-muted)]">
        Мы готовим подробные материалы о хиромантии, совместимости и
        астрологии — заходите позже.
      </p>
    </main>
  );
}