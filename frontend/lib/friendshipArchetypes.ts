export type FriendshipArchetype = {
  title: string;
  description: string;
  finding: string;
};

const FRIENDSHIP_ARCHETYPES: FriendshipArchetype[] = [
  {
    title: "Огонь и воздух",
    description: "Энергия одного питает идеи другого — классический союз действия и вдохновения.",
    finding: "Ваша дружба держится на взаимной поддержке в начинаниях",
  },
  {
    title: "Два якоря",
    description: "Стабильность и надёжность — то, что связывает эту компанию крепче всего.",
    finding: "Вы умеете быть опорой друг для друга в сложные периоды",
  },
  {
    title: "Зеркала",
    description: "Схожий взгляд на мир создаёт редкое чувство — быть понятым без слов.",
    finding: "Ваши линии показывают почти идентичный эмоциональный ритм",
  },
  {
    title: "Искры и топливо",
    description: "Один генерирует идеи, другие доводят их до результата — рабочий дружеский тандем.",
    finding: "В группе чётко распределены роли «генератор — реализатор»",
  },
  {
    title: "Созвездие",
    description: "Каждый яркий по-своему, но вместе вы складываетесь в узнаваемый рисунок.",
    finding: "У каждого в группе своя уникальная сильная линия",
  },
];

export function getRandomFriendshipArchetype(): FriendshipArchetype {
  const index = Math.floor(Math.random() * FRIENDSHIP_ARCHETYPES.length);
  return FRIENDSHIP_ARCHETYPES[index];
}