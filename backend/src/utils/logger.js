import { randomUUID } from 'crypto';

export function generateRequestId() {
  return randomUUID().slice(0, 8);
}

function safeLog(level, event, data) {
  const safe = { ...data };
  // Strip secrets
  delete safe.apiKey;
  delete safe.imageBase64;
  delete safe.buffer;
  delete safe.secret;
  delete safe.token;

  const line = JSON.stringify({ event, ...safe, ts: new Date().toISOString() });
  if (level === 'error') console.error(line);
  else console.info(line);
}

export function logVisionStart(requestId, imageSizeBytes, mimeType) {
  safeLog('info', 'vision_request_start', { requestId, imageSizeBytes, mimeType });
}

export function logVisionFinish(requestId, provider, model, durationMs, status, fallback) {
  safeLog('info', 'vision_request_finished', {
    requestId, provider, model, durationMs, status, fallback: !!fallback,
  });
}

export function logVisionError(requestId, errorCode, message) {
  safeLog('error', 'vision_request_error', { requestId, errorCode, message, status: 'error' });
}