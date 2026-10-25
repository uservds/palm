import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-content-border mt-20">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between gap-8">
        <div>
          <div className="text-lg font-bold text-content-main mb-2">
            Palm<span className="text-primary">AI</span>
          </div>
          <p className="text-sm text-content-muted max-w-xs">
            ИИ-анализ линий ладони: личный разбор, совместимость пар,
            дата свадьбы, дружба и бизнес-партнёрство.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="text-content-main font-medium mb-1">Продукт</span>
          <Link href="/pricing" className="text-content-muted hover:text-content-main transition-colors">
            Тарифы
          </Link>
          <Link href="/how-it-works" className="text-content-muted hover:text-content-main transition-colors">
            Как это работает
          </Link>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="text-content-main font-medium mb-1">Информация</span>
          <Link href="/privacy" className="text-content-muted hover:text-content-main transition-colors">
            Конфиденциальность и возврат
          </Link>
        </div>
      </div>

      <div className="border-t border-content-border py-4 text-center text-xs text-content-muted">
        © 2026 PalmAI. Россия.
      </div>
    </footer>
  );
}