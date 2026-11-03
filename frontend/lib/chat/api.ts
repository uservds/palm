import { classifyMessage } from './filter';
import { generateMockReply } from './mockReplies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface ChatApiResult {
  reply: string;
  source: 'gemini' | 'mock' | 'client-fallback';
}

export async function fetchChatReply(message: string): Promise<ChatApiResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Chat API responded with ${response.status}`);
    }

    const data = await response.json();
    return { reply: data.reply, source: data.source };
  } catch (error) {
    console.error('fetchChatReply: backend unavailable, using client-side mock —', error);
    return {
      reply: generateMockReply(message, classifyMessage(message)),
      source: 'client-fallback',
    };
  }
}
