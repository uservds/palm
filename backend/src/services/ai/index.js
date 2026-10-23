import { MockProvider } from './mock.js';
import { GeminiProvider } from './gemini.js';
import { OpenRouterProvider } from './openrouter.js';
import { config } from '../../config/env.js';

let _primary = null;
let _fallback = null;

function createProvider(name) {
  switch (name) {
    case 'gemini':
      return new GeminiProvider();
    case 'openrouter':
      return new OpenRouterProvider();
    default:
      return new MockProvider();
  }
}

export function getProvider() {
  if (_primary) return _primary;

  const name = config.MOCK_VISION ? 'mock' : config.AI_PROVIDER;
  _primary = createProvider(name);

  return _primary;
}

export function getFallbackProvider() {
  if (_fallback) return _fallback;

  _fallback = createProvider(config.AI_FALLBACK_PROVIDER || 'mock');

  return _fallback;
}