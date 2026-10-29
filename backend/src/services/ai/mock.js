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
      'Ваш ресурс в кризисе: линия жизни читается глубокой и непрерывной — в трудные моменты вы уходите не к людям, а в тишину, и именно там быстрее находите опору.',
      'Тень: изгиб линии сердца к холму Юпитера — знак эмоциональной щедрости, но в этом и ловушка: вы легко отдаёте больше, чем получаете, и не всегда замечаете момент, когда пора остановиться.',
      'Бугор Венеры выражен умеренно — вы цените тепло и близость, но держите контроль над тем, кого подпускаете по-настоящему.',
    ],
    locked_blocks: [
      {
        title: 'Эмоциональные паттерны',
        teaser: 'Как вы на самом деле восстанавливаетесь после конфликтов — и что из этого вы скрываете даже от себя.',
        block_type: 'relationships',
      },
      {
        title: 'Карьерный вектор',
        teaser: 'Где ваша энергия даёт максимальную отдачу — и в какой момент стоит притормозить, пока не поздно.',
        block_type: 'career',
      },
      {
        title: 'Теневые стороны',
        teaser: 'Честный, но бережный разбор того, что вы обычно не признаёте вслух.',
        block_type: 'fears',
      },
    ],
    scientific_facts: [
      'Ладонные линии формируются ещё до рождения и в первую очередь связаны с биомеханикой кисти.',
      'Дерматоглифика изучает узоры кожи, но не использует их для медицинских диагнозов.',
    ],
    progress_percent: 25,
    disclaimer: 'Palmis AI носит развлекательный характер. Это не медицинская, юридическая или финансовая консультация и не предсказание будущего.',
    cta: 'Ваша ладонь готова раскрыть 14 секретов',
  },
};

// Заглушка под compatibilityReportSchema — используется ТОЛЬКО если
// MockProvider оказался в роли analyzeText-провайдера (например, как
// AI_FALLBACK_PROVIDER по умолчанию) в цепочке Compatibility ДО того, как
// дело дойдёт до buildMockCompatibilityResult() внутри compatibility.service.js
// (тот строит осмысленный fallback из реальных KB-findings, а не хардкода,
// и используется как последний рубеж). Эта заглушка — просто чтобы цепочка
// провайдеров не падала с TypeError на отсутствующем методе раньше времени.
const MOCK_COMPATIBILITY_RESULT = {
  couple_archetype: { name: 'Параллельные Пути', energies: ['Независимость', 'Уважение'] },
  overall_score: 55,
  free_insights: [
    { section_id: 'emotional_resonance', title: 'Эмоциональный резонанс', text: 'Заглушка mock-провайдера для совместимости.' },
    { section_id: 'communication_style', title: 'Стиль общения', text: 'Заглушка mock-провайдера для совместимости.' },
  ],
  locked_blocks: [
    { section_id: 'life_pace', title: 'Темп жизни и энергия', teaser: 'Заглушка.' },
    { section_id: 'shared_goals', title: 'Общие цели и амбиции', teaser: 'Заглушка.' },
    { section_id: 'conflict_pattern', title: 'Паттерн конфликтов', teaser: 'Заглушка.' },
    { section_id: 'intimacy', title: 'Телесная и чувственная близость', teaser: 'Заглушка.' },
    { section_id: 'financial_sync', title: 'Финансовая синхронность', teaser: 'Заглушка.' },
    { section_id: 'growth_potential', title: 'Потенциал совместного роста', teaser: 'Заглушка.' },
    { section_id: 'vulnerability_zones', title: 'Зоны уязвимости пары', teaser: 'Заглушка.' },
    { section_id: 'support_dynamic', title: 'Кто кого поддерживает в кризис', teaser: 'Заглушка.' },
  ],
  disclaimer: 'Palmis AI носит развлекательный характер.',
  cta: 'Откройте полный разбор',
};

export class MockProvider {
  name = 'mock';

  async analyze(_params) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return JSON.parse(JSON.stringify(MOCK_RESULT));
  }

  async analyzeText(_params) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return JSON.parse(JSON.stringify(MOCK_COMPATIBILITY_RESULT));
  }
}