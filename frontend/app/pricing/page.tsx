import PricingCard from "@/components/PricingCard";
import { Sparkles, MessageCircle, Sun, Percent } from "lucide-react";

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-semibold text-[var(--color-content-main)]">
          Тарифы
        </h1>
        <p className="mt-2 text-[var(--color-content-muted)]">
          Начните бесплатно — платите только за то, что действительно
          хотите узнать.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 md:items-stretch">
        <PricingCard
          title="Бесплатно"
          price="0 ₽"
          description="Первое знакомство с вашей ладонью"
          features={[
            "Скан одной руки",
            "4 основные линии",
            "2 открытых раздела разбора",
            "Архетип личности по фото",
          ]}
          ctaLabel="Сканировать бесплатно"
          extraNote="Вы увидите начало своей истории — продолжение откроется в полном разборе"
        />

        <PricingCard
          title="Разбор"
          price="399 ₽"
          priceNote="разово"
          description="Полный индивидуальный разбор"
          features={[
            "14 разделов разбора",
            "Все линии и знаки ладони",
            "PDF-отчёт на почту",
            "Доступ в личном кабинете навсегда",
          ]}
          ctaLabel="Получить полный разбор"
          highlighted
          badge="Популярный выбор"
          extraNote="Разовая оплата · без подписки"
        />

        <PricingCard
          title="Совместимость"
          price="599 ₽"
          priceNote="разово"
          description="Разбор пары, дружбы или партнёрства"
          features={[
            "12 разделов разбора",
            "До 4 участников в одном отчёте",
            "PDF-отчёт для всех",
            "Доступно для пар, друзей и бизнес-партнёров",
          ]}
          ctaLabel="Проверить совместимость"
        />
      </div>

      {/* Подписка — отдельный блок, не конкурирует визуально с карточками выше */}
      <div className="mt-12 rounded-2xl border border-[var(--color-content-border)] bg-[var(--color-background)] p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-block rounded-full bg-[var(--color-neutral-badge)] px-3 py-1 text-xs font-medium text-[var(--color-neutral-badgeText)]">
              Для постоянных пользователей
            </span>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--color-content-main)]">
              Подписка — 590 ₽/мес
            </h2>
            <p className="mt-2 max-w-md text-sm text-[var(--color-content-muted)]">
              Если хотите возвращаться к разбору регулярно — выгоднее
              разовых оплат уже со второго обращения.
            </p>
          </div>
          <button className="shrink-0 rounded-xl border border-[var(--color-primary)] px-6 py-3 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white">
            Оформить подписку
          </button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-accent)]" />
            <div>
              <p className="text-sm font-medium text-[var(--color-content-main)]">
                Безлимитные сканы
              </p>
              <p className="mt-1 text-xs text-[var(--color-content-muted)]">
                Пересканируйте руку в любой момент без ограничений
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-accent)]" />
            <div>
              <p className="text-sm font-medium text-[var(--color-content-main)]">
                Чат без ограничений
              </p>
              <p className="mt-1 text-xs text-[var(--color-content-muted)]">
                История сохраняется — ИИ-хиромант помнит контекст
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Sun className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-accent)]" />
            <div>
              <p className="text-sm font-medium text-[var(--color-content-main)]">
                Ежедневный гороскоп
              </p>
              <p className="mt-1 text-xs text-[var(--color-content-muted)]">
                На сайте, в Telegram или в MAX (на выбор) и на почту
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Percent className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-accent)]" />
            <div>
              <p className="text-sm font-medium text-[var(--color-content-main)]">
                Скидка на совместимость
              </p>
              <p className="mt-1 text-xs text-[var(--color-content-muted)]">
                Со скидкой на пары, дружбу и дату свадьбы
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}