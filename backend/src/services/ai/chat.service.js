import { GoogleGenerativeAI } from '@google/generative-ai';
import { classifyMessage, generateMockReply } from './chatMock.js';

const SYSTEM_PROMPT = `Ты — ИИ-хиромант сервиса PalmAI. Отвечай дружелюбно, по-русски, кратко и по делу.

Разрешено: отвечать на общие вопросы о хиромантии (линии, холмы, знаки на ладони), объяснять традиционные трактовки, тематически обсуждать карьеру, деньги и отношения в контексте того, что о них говорят линии ладони.

Запрещено:
- Ставить медицинские диагнозы или давать точные медицинские рекомендации.
- Давать конкретные финансовые/инвестиционные советы (какие активы покупать, куда вкладывать деньги).
- Называть точные даты или предсказывать конкретные события с претензией на точность.

Если пользователь спрашивает про свою конкретную ладонь, а не задаёт общий вопрос о хиромантии — вежливо направь его загрузить фото в сканер на сайте, в чате ты не видишь его руку.

Если вопрос не связан с хиромантией вообще — вежливо верни разговор к теме ладони.`;

const MODEL_NAME = process.env.GEMINI_CHAT_MODEL || 'gemini-2.0-flash';

let client = null;

function getClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return client;
}

/**
 * history: [{ role: 'user' | 'assistant', text: string }]
 */
export async function getChatReply(message, history = []) {
  const genAI = getClient();

  if (!genAI) {
    return { reply: generateMockReply(message, classifyMessage(message)), source: 'mock' };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: SYSTEM_PROMPT,
    });

    const chat = model.startChat({
      history: history.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }],
      })),
    });

    const result = await chat.sendMessage(message);
    const text = result.response.text();

    if (!text || !text.trim()) {
      throw new Error('Empty response from Gemini');
    }

    return { reply: text.trim(), source: 'gemini' };
  } catch (error) {
    console.error('chat.service: Gemini request failed, falling back to mock —', error?.message || error);
    return { reply: generateMockReply(message, classifyMessage(message)), source: 'mock' };
  }
}
