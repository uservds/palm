import { config } from '../../config/env.js';
import { extractJsonFromText } from '../../utils/json.js';

export class GeminiProvider {
  name = 'gemini';

  async analyze(params) {
    const { imageBase64, mimeType, prompt } = params;
    const apiKey = config.GEMINI_API_KEY;
    const model = config.GEMINI_MODEL || 'gemini-2.5-flash';

    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const body = {
      systemInstruction: {
        parts: [{ text: prompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBase64,
              },
            },
            {
              text: 'Проанализируй изображение ладони и верни строго JSON по указанной схеме. Без markdown, без комментариев.',
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
        maxOutputTokens: 4096,
      },
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.AI_TIMEOUT_MS);

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Gemini API ${resp.status}: ${errText.slice(0, 200)}`);
      }

      const json = await resp.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('Gemini returned empty response');
      }

      const parsed = extractJsonFromText(text);

      if (!parsed) {
        throw new Error('Failed to parse Gemini response as JSON');
      }

      return parsed;
    } catch (err) {
      clearTimeout(timer);

      if (err?.name === 'AbortError') {
        throw new Error(`Gemini timed out after ${config.AI_TIMEOUT_MS}ms`);
      }

      throw err;
    }
  }

  /**
   * Текстовый вызов без картинки — используется Compatibility
   * (compatibility.service.js), где промпт уже содержит все findings,
   * посчитанные детерминированно (compatibility-kb.js), и Gemini только
   * оформляет их в текст. Структура запроса — тот же generateContent,
   * но без inline_data и без отдельного systemInstruction: промпт из
   * buildCompatibilityPrompt() самодостаточен (роль + данные + требования
   * к формату в одном тексте).
   */
  async analyzeText(params) {
    const { prompt } = params;
    const apiKey = config.GEMINI_API_KEY;
    const model = config.GEMINI_MODEL || 'gemini-2.5-flash';

    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4,
        maxOutputTokens: 2048,
      },
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.AI_TIMEOUT_MS);

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Gemini API ${resp.status}: ${errText.slice(0, 200)}`);
      }

      const json = await resp.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('Gemini returned empty response');
      }

      const parsed = extractJsonFromText(text);

      if (!parsed) {
        throw new Error('Failed to parse Gemini response as JSON');
      }

      return parsed;
    } catch (err) {
      clearTimeout(timer);

      if (err?.name === 'AbortError') {
        throw new Error(`Gemini timed out after ${config.AI_TIMEOUT_MS}ms`);
      }

      throw err;
    }
  }

  /**
   * Свободный текстовый диалог — используется чатом (chat.service.js).
   * В отличие от analyze()/analyzeText(), здесь НЕТ responseMimeType:
   * 'application/json' — ответ должен быть обычным читаемым текстом,
   * а не JSON-схемой, плюс передаётся история сообщений как contents.
   */
  async chat(params) {
    const { message, history = [], systemPrompt } = params;
    const apiKey = config.GEMINI_API_KEY;
    const model = config.GEMINI_MODEL || 'gemini-2.5-flash';

    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const contents = [
      ...history.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const body = {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 1024,
      },
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.AI_TIMEOUT_MS);

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Gemini API ${resp.status}: ${errText.slice(0, 200)}`);
      }

      const json = await resp.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('Gemini returned empty response');
      }

      return text.trim();
    } catch (err) {
      clearTimeout(timer);

      if (err?.name === 'AbortError') {
        throw new Error(`Gemini timed out after ${config.AI_TIMEOUT_MS}ms`);
      }

      throw err;
    }
  }
}
