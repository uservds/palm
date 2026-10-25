import Link from "next/link";
import { ChevronDown } from "lucide-react";

const capabilityItems = [
  { href: "/compat/couple", label: "Совместимость пар" },
  { href: "/wedding-date", label: "Дата свадьбы" },
  { href: "/compat/friendship", label: "Дружба" },
  { href: "/compat/business", label: "Деловые партнёры" }, // было /возможности/деловые-партнёры
];

const navItems = [
  { href: "/pricing", label: "Тарифы" },
  { href: "/how-it-works", label: "Как это работает" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-content-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-content-main">
          Palm<span className="text-primary">AI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <div className="group relative">
            <button className="flex items-center gap-1 text-sm text-content-muted hover:text-content-main transition-colors">
              Возможности
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
              <div className="flex min-w-[220px] flex-col gap-1 rounded-xl border border-content-border bg-surface p-2 shadow-lg">
                {capabilityItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-lg px-3 py-2 text-sm text-content-muted transition-colors hover:bg-neutral-badge hover:text-content-main"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-content-muted hover:text-content-main transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-content-muted hover:text-content-main transition-colors"
          >
            Войти
          </Link>
          <Link
            href="/pricing"
            className="bg-primary hover:bg-primary-hover text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Начать разбор
          </Link>
        </div>
      </div>
    </header>
  );
}