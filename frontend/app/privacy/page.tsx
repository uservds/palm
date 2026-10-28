import Link from "next/link";

const sections = [
  { id: "data", title: "1. Какие данные мы собираем" },
  { id: "use", title: "2. Как мы используем данные" },
  { id: "photos", title: "3. Фотографии рук и ИИ-анализ" },
  { id: "storage", title: "4. Хранение и защита данных" },
  { id: "third-parties", title: "5. Передача третьим лицам" },
  { id: "rights", title: "6. Ваши права" },
  { id: "refund", title: "7. Условия возврата средств" },
  { id: "contacts", title: "8. Контакты" },
  { id: "requisites", title: "9. Реквизиты" },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-content-main">
        Политика конфиденциальности и условия возврата
      </h1>
      <p className="mt-2 text-sm text-content-muted">Последнее обновление: 25 октября 2026</p>

      <nav className="mt-6 rounded-2xl border border-content-border bg-surface p-4">
        <p className="text-sm font-medium text-content-main">Содержание</p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-sm text-content-muted hover:text-primary">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 flex flex-col gap-8 text-sm leading-relaxed text-content-main">
        <section id="data">
          <h2 className="text-lg font-semibold">1. Какие данные мы собираем</h2>
          <p className="mt-2 text-content-muted">
            При использовании Палмис AI мы собираем: email и имя при регистрации; фотографии
            ладоней, загруженные для анализа; дату, время и место рождения — при использовании
            разделов «Дата свадьбы» и ежедневный гороскоп; данные об оплатах (без хранения
            номеров карт — это делает платёжный провайдер); техническую информацию
            (IP-адрес, тип устройства) для защиты от мошенничества.
          </p>
        </section>

        <section id="use">
          <h2 className="text-lg font-semibold">2. Как мы используем данные</h2>
          <p className="mt-2 text-content-muted">
            Данные используются для формирования персональных разборов, работы чата с
            ИИ-хиромантом, отправки отчётов на email, доставки ежедневного гороскопа
            (сайт, Telegram, MAX — по вашему выбору) и улучшения качества анализа.
            Мы не используем ваши данные для целей, не связанных с работой сервиса,
            без отдельного согласия.
          </p>
        </section>

        <section id="photos">
          <h2 className="text-lg font-semibold">3. Фотографии рук и ИИ-анализ</h2>
          <p className="mt-2 text-content-muted">
            Загруженные фотографии обрабатываются ИИ-моделями (Google Gemini и собственные
            алгоритмы распознавания) для формирования отчёта. Фотографии не используются для
            обучения сторонних моделей и не передаются третьим лицам, кроме технических
            подрядчиков, непосредственно участвующих в обработке (см. раздел 5).
          </p>
        </section>

        <section id="storage">
          <h2 className="text-lg font-semibold">4. Хранение и защита данных</h2>
          <p className="mt-2 text-content-muted">
            Данные хранятся на серверах с ограниченным доступом и шифрованием соединения
            (HTTPS). История переписки с чат-ботом сохраняется только для пользователей с
            активной подпиской; для остальных — удаляется по завершении сессии. Вы можете
            запросить полное удаление аккаунта и всех связанных данных через профиль или
            написав на почту поддержки.
          </p>
        </section>

        <section id="third-parties">
          <h2 className="text-lg font-semibold">5. Передача третьим лицам</h2>
          <p className="mt-2 text-content-muted">
            Для работы сервиса мы передаём минимально необходимые данные платёжным
            провайдерам (ЮKassa, CloudPayments) для обработки оплаты; email-провайдеру
            (Unisender) для отправки отчётов и писем; Telegram/MAX — только при подключении
            соответствующего канала уведомлений. Эти компании обрабатывают данные согласно
            собственным политикам конфиденциальности.
          </p>
        </section>

        <section id="rights">
          <h2 className="text-lg font-semibold">6. Ваши права</h2>
          <p className="mt-2 text-content-muted">
            Вы вправе запросить просмотр, исправление или удаление своих персональных данных,
            отозвать согласие на обработку, отписаться от рассылок в любой момент через
            профиль или ссылку в письме.
          </p>
        </section>

        <section id="refund">
          <h2 className="text-lg font-semibold">7. Условия возврата средств</h2>
          <p className="mt-2 text-content-muted">
            Возврат за разовые отчёты (индивидуальный разбор, совместимость) возможен в
            течение 14 дней с момента оплаты, если отчёт не был сформирован или содержит
            техническую ошибку, препятствующую его просмотру. Если отчёт успешно сформирован
            и открыт, возврат не производится, за исключением случаев, предусмотренных
            законом «О защите прав потребителей».
          </p>
          <p className="mt-2 text-content-muted">
            Возврат за подписку: при отмене доступ сохраняется до конца оплаченного периода,
            средства за текущий период не возвращаются. Повторное списание не производится
            после отмены.
          </p>
          <p className="mt-2 text-content-muted">
            Для оформления возврата напишите в поддержку с указанием email аккаунта и номера
            платежа — рассмотрение занимает до 10 рабочих дней.
          </p>
        </section>

        <section id="contacts">
          <h2 className="text-lg font-semibold">8. Контакты</h2>
          <p className="mt-2 text-content-muted">
            По вопросам конфиденциальности и возвратов: support@palmai.ru
          </p>
        </section>

        <section id="requisites">
          <h2 className="text-lg font-semibold">9. Реквизиты</h2>
          <p className="mt-2 text-content-muted">
            Самозанятый: Сорокин Вадим Вениаминович
          </p>
          <p className="mt-2 text-content-muted">
            ИНН: 000000000000
          </p>
          <p className="mt-2 text-content-muted">
            Телефон: +7 (000) 000-00-00
          </p>
          <p className="mt-2 text-content-muted">
            Email: support@palmai.ru
          </p>
        </section>
      </div>

      <div className="mt-10 border-t border-content-border pt-6">
        <Link href="/" className="text-sm text-primary hover:underline">
          ← Вернуться на главную
        </Link>
      </div>
    </main>
  );
}
