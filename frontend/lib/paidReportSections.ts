export type ReportSection = {
  id: string;
  title: string;
  icon: string; // имя иконки lucide-react
  preview: string;
};

export const PAID_REPORT_SECTIONS: ReportSection[] = [
  { id: "archetype", title: "Полный архетип личности", icon: "Sparkles", preview: "Расширенная трактовка вашего типа личности по сочетанию линий" },
  { id: "heart-line", title: "Линия сердца", icon: "Heart", preview: "Эмоциональность, привязанности, стиль в отношениях" },
  { id: "head-line", title: "Линия головы", icon: "Brain", preview: "Мышление, принятие решений, творческий потенциал" },
  { id: "life-line", title: "Линия жизни", icon: "Activity", preview: "Жизненная энергия, периоды подъёма и восстановления" },
  { id: "fate-line", title: "Линия судьбы", icon: "Compass", preview: "Профессиональный путь, ключевые повороты карьеры" },
  { id: "marriage-line", title: "Линия привязанностей", icon: "Users", preview: "Значимые союзы и их динамика" },
  { id: "money", title: "Финансовые паттерны", icon: "Wallet", preview: "Отношение к деньгам, сильные и слабые зоны" },
  { id: "talents", title: "Скрытые таланты", icon: "Star", preview: "Способности, которые пока не раскрыты полностью" },
  { id: "shadow", title: "Теневая зона", icon: "Moon", preview: "Мягко сформулированная зона роста" },
  { id: "cycles", title: "Эмоциональные циклы", icon: "RefreshCw", preview: "Повторяющиеся паттерны в настроении и энергии" },
  { id: "mounts", title: "Холмы ладони", icon: "Mountain", preview: "Темперамент и распределение жизненной энергии" },
  { id: "signs", title: "Знаки и отметины", icon: "Asterisk", preview: "Острова, кресты, звёзды — точечные акценты судьбы" },
  { id: "rituals", title: "Персональные ритуалы на 7 дней", icon: "CalendarCheck", preview: "Практические шаги на ближайшую неделю" },
  { id: "forecast", title: "Общий вектор развития", icon: "TrendingUp", preview: "На что стоит обратить внимание в ближайшее время" },
];