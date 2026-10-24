export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="inline-block bg-neutral-badge text-neutral-badgeText text-xs font-medium px-3 py-1 rounded-full mb-6">
          ИИ-хиромантия нового поколения
        </span>

        <h1 className="text-4xl md:text-5xl font-bold text-content-main max-w-3xl mx-auto leading-tight">
          Узнайте, что ваша ладонь говорит о вас —
          <span className="text-primary"> за 60 секунд</span>
        </h1>

        <p className="text-content-muted text-lg max-w-xl mx-auto mt-6">
          Загрузите фото ладони — ИИ проанализирует линии и за минуту
          покажет первые находки о вашем характере и судьбе.
        </p>

        <div className="flex items-center justify-center gap-4 mt-8">
          <button className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Начать бесплатный разбор
          </button>
          <button className="text-content-main border border-content-border hover:border-content-muted px-6 py-3 rounded-lg font-medium transition-colors">
            Как это работает
          </button>
        </div>
      </div>
    </section>
  );
}