export type ChatTopicCategory =
  | 'diagnosis'
  | 'finance_advice'
  | 'date_prediction'
  | 'personal_palm'
  | 'general';

interface TopicRule {
  category: ChatTopicCategory;
  patterns: RegExp[];
}

/**
 * Mock-правила фильтра тем чата (ТЗ: без диагнозов, без конкретных
 * финансовых советов, без точных предсказаний дат; разрешено ТЕМАТИЧЕСКОЕ
 * обсуждение «что линия говорит о карьере/деньгах»).
 *
 * На этапе Приоритета 8 заменяется системным промптом для Gemini — здесь
 * только эвристика по ключевым словам, чтобы отработать поведение UI
 * до подключения реального ИИ (см. тот же подход в lib/archetypes.ts).
 */
const rules: TopicRule[] = [
  {
    category: 'diagnosis',
    patterns: [
      /диагноз/i,
      /\bбольн(а|ы|ой|а я)\b/i,
      /вылечит/i,
      /симптом/i,
      /\bрак\b/i,
      /заболевани/i,
      /у меня (болит|температура)/i,
    ],
  },
  {
    category: 'finance_advice',
    patterns: [
      /как(ие|ую|ой) (акци|валют|крипт)/i,
      /куда вложить/i,
      /в как(ую|ой) (криптовалют|актив)/i,
      /купить (акции|биткоин|крипту)/i,
      /инвестировать в\s+\S+/i,
    ],
  },
  {
    category: 'date_prediction',
    patterns: [
      /когда я (умру|женюсь|выйду замуж|разведусь|разбогатею)/i,
      /в каком году (я|мне)/i,
      /точн(ая|ую) дат/i,
      /назов(и|ите) (дату|число|год)/i,
    ],
  },
  {
    category: 'personal_palm',
    patterns: [
      /у меня на ладони/i,
      /посмотри (на )?мою руку/i,
      /по (моему )?фото/i,
      /что (значит|означает) у меня/i,
      /\bмоя линия\b/i,
    ],
  },
];

export function classifyMessage(text: string): ChatTopicCategory {
  for (const rule of rules) {
    if (rule.patterns.some((pattern) => pattern.test(text))) {
      return rule.category;
    }
  }
  return 'general';
}
