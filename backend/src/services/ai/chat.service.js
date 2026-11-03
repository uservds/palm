import { getProvider, getFallbackProvider } from './index.js';
import { classifyMessage, generateMockReply } from './chatMock.js';

const SYSTEM_PROMPT = `Ты — ИИ-хиромант сервиса PalmAI. Отвечай дружелюбно, по-русски, кратко и по делу.

Разрешено: отвечать на общие вопросы о хиромантии (линии, холмы, знаки на ладони), объяснять традиционные трактовки, тематически обсуждать карьеру, деньги и отношения в контексте того, что о них говорят линии ладони.

Запрещено:
- Ставить медицинские диагнозы или давать точные медицинские рекомендации.
- Давать конкретные финансовые/инвестиционные советы (какие активы покупать, куда вкладывать деньги).
- Называть точные даты или предсказывать конкретные события с претензией на точность.

Если пользователь спрашивает про свою конкретную ладонь, а не задаёт общий вопрос о хиромантии — вежливо направь его загрузить фото в сканер на сайте, в чате ты не видишь его руку.

Если вопрос не связан с хиромантией вообще — вежливо верни разговор к теме ладони.`;

/**
 * history: [{ role: 'user' | 'assistant', text: string }]
 *
 * Та же cascade-логика, что у Vision/Compatibility: primary → fallback →
 * детерминированный mock (chatMock.js) как последний рубеж, если оба
 * провайдера недоступны (нет ключа, геоблокировка, таймаут, лимиты).
 */
export async function getChatReply(message, history = []) {
  const primary = getProvider();
  const fallback = getFallbackProvider();

  const providers = primary.name === fallback.name ? [primary] : [primary, fallback];

  for (const provider of providers) {
    if (typeof provider.chat !== 'function') continue;

    try {
      const reply = await provider.chat({ message, history, systemPrompt: SYSTEM_PROMPT });
      if (reply && reply.trim()) {
        return { reply: reply.trim(), source: provider.name };
      }
    } catch (error) {
      console.error(`chat.service: провайдер "${provider.name}" не ответил —`, error?.message || error);
    }
  }

  return { reply: generateMockReply(message, classifyMessage(message)), source: 'mock' };
}
