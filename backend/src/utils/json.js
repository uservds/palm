/**
 * Extract JSON object from text that may contain markdown fences or noise.
 */
export function extractJsonFromText(text) {
  if (!text || typeof text !== 'string') return null;

  let cleaned = text.trim();

  // Remove markdown code fences
  const fenceMatch = cleaned.match(/`{3}(?:json)?\s*([\s\S]*?)`{3}/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // Find first { and last }
  const first = cleaned.indexOf('{');
  const last  = cleaned.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) return null;

  const jsonStr = cleaned.substring(first, last + 1);

  try {
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

/**
 * Safe JSON parse — returns { ok, data } or { ok, error }.
 */
export function safeJsonParse(text) {
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Parse error' };
  }
}