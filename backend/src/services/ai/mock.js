const MOCK_RESULT = {
  image_quality: {
    score: 82,
    issues: [],
    user_hint: null,
  },
  observations: {
    hand: 'right',
    hand_type: 'earth',
    lines: [
      { id: 'life', present: true, quality: 'deep', confidence: 74, notes: 'Линия прослеживается чётко.' },
      { id: 'head', present: true, quality: 'straight', confidence: 68, notes: 'Линия головы умеренно выражена.' },
      { id: 'heart', present: true, quality: 'curved', confidence: 71, notes: 'Линия сердца изогнута к области Юпитера.' },
      { id: 'fate', present: true, quality: 'shallow', confidence: 55, notes: 'Линия судьбы слабо выражена.' },
    ],
    mounts: [
      { id: 'venus', prominence: 'moderate', signs: [], confidence: 66, notes: 'Бугор Венеры умеренно выражен.' },
      { id: 'lunar', prominence: 'weak', signs: [], confidence: 58, notes: 'Бугор Луны слабо выражен.' },
      { id: 'jupiter', prominence: 'moderate', signs: [], confidence: 62, notes: 'Бугор Юпитера умеренно выражен.' },
    ],
    additional_markers: [],
  },
  report: {
    archetype: 'Исследователь глубин',
    metaphor: 'Твоя ладонь читается как карта внимательного наблюдателя, который предпочитает понимать суть, а не останавливаться на поверхности.',
    free_insights: [
      'Видимые линии можно интерпретировать как склонность к глубокому анализу ситуаций.',
      'Холм Венеры в традиционной хиромантии часто связывают с теплотой и эмоциональной открытостью.',
      'С анатомической точки зрения линии ладони — это естественные кожные сгибы, важные для подвижности кисти.',
    ],
    locked_blocks: [
      {
        title: 'Эмоциональные паттерны',
        teaser: 'Как вы восстанавливаетесь после конфликтов и что вас действительно наполняет.',
        block_type: 'relationships',
      },
      {
        title: 'Карьерный вектор',
        teaser: 'Где ваша энергия даёт максимальный эффект, а где стоит притормозить.',
        block_type: 'career',
      },
      {
        title: 'Теневые стороны',
        teaser: 'Мягкий разбор зон риска без страхов и диагнозов.',
        block_type: 'fears',
      },
    ],
    scientific_facts: [
      'Ладонные линии формируются ещё до рождения и в первую очередь связаны с биомеханикой кисти.',
      'Дерматоглифика изучает узоры кожи, но не использует их для медицинских диагнозов.',
    ],
    progress_percent: 25,
    disclaimer: 'Palmis AI носит развлекательный характер. Это не медицинская, юридическая или финансовая консультация и не предсказание будущего.',
    cta: 'Получить полный отчёт',
  },
};

export class MockProvider {
  name = 'mock';

  async analyze(_params) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return JSON.parse(JSON.stringify(MOCK_RESULT));
  }
}