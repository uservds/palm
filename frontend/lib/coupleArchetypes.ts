export type CoupleArchetype = {
  name: string;
  percent: number;
  finding: string;
};

export const COUPLE_ARCHETYPES: CoupleArchetype[] = [
  {
    name: "Огонь и Вода",
    percent: 87,
    finding: "Вместе вы умеете держать баланс между действием и чувством — один зажигает, другой удерживает глубину",
  },
  {
    name: "Два Крыла Одной Птицы",
    percent: 92,
    finding: "Ваши линии судьбы движутся в унисон — редкое совпадение направления жизненных целей",
  },
  {
    name: "Зеркало и Якорь",
    percent: 79,
    finding: "Один из вас даёт стабильность, другой — рост. Вместе вы закрываете слепые зоны друг друга",
  },
  {
    name: "Союз Искателей",
    percent: 84,
    finding: "Сильная линия интуиции у обоих — вы умеете чувствовать настроение друг друга без слов",
  },
  {
    name: "Тихая Гавань",
    percent: 90,
    finding: "Линии сердца совпадают по глубине — редкий уровень эмоциональной надёжности друг для друга",
  },
];

export function getRandomCoupleArchetype(): CoupleArchetype {
  return COUPLE_ARCHETYPES[Math.floor(Math.random() * COUPLE_ARCHETYPES.length)];
}