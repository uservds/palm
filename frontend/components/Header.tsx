import Link from "next/link";

const navItems = [
  { href: "/возможности/совместимость-пар", label: "Совместимость пар" },
  { href: "/возможности/дата-свадьбы", label: "Дата свадьбы" },
  { href: "/возможности/совместимость-дружбы", label: "Дружба" },
  { href: "/возможности/деловые-партнёры", label: "Партнёры" },
  { href: "/тарифы", label: "Тарифы" },
  { href: "/как-это-работает", label: "Как это работает" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-content-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-content-main">
          Palm<span className="text-primary">AI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
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
            href="/тарифы"
            className="bg-primary hover:bg-primary-hover text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Начать разбор
          </Link>
        </div>
      </div>
    </header>
  );
}