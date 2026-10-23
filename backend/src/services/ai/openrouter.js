import { config } from '../../config/env.js';
import { extractJsonFromText } from '../../utils/json.js';

export class OpenRouterProvider {
  name = 'openrouter';

  async analyze(params) {
    const { imageBase64, mimeType, prompt } = params;
    const apiKey = config.AI_API_KEY;
    const model = config.AI_MODEL || 'google/gemini-flash-1.5';

    if (!apiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    const body = {
      model,
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
            {
              type: 'text',
              text: 'РџСЂРѕР°РЅР°Р»РёР·РёСЂСѓР№ РёР·РѕР±СЂР°Р¶РµРЅРёРµ Р»Р°РґРѕРЅРё Рё РІРµСЂРЅРё СЃС‚СЂРѕРіРѕ JSON.',
            },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.AI_TIMEOUT_MS);

    try {
      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`OpenRouter API ${resp.status}: ${errText.slice(0, 200)}`);
      }

      const json = await resp.json();
      const text = json?.choices?.[0]?.message?.content;

      if (!text) {
        throw new Error('OpenRouter returned empty response');
      }

      const parsed = extractJsonFromText(text);

      if (!parsed) {
        throw new Error('Failed to parse OpenRouter response');
      }

      return parsed;
    } catch (err) {
      clearTimeout(timer);

      if (err?.name === 'AbortError') {
        throw new Error(`OpenRouter timed out after ${config.AI_TIMEOUT_MS}ms`);
      }

      throw err;
    }
  }
}