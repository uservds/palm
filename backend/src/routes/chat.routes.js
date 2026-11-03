import { Router } from 'express';
import { getChatReply } from '../services/ai/chat.service.js';

const router = Router();

router.post('/', async (req, res) => {
  const { message, history } = req.body || {};

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'message обязателен' });
  }

  try {
    const { reply, source } = await getChatReply(message.trim(), Array.isArray(history) ? history : []);
    return res.json({ reply, source });
  } catch (error) {
    console.error('POST /api/chat failed', error);
    return res.status(500).json({ error: 'Не удалось получить ответ от чата' });
  }
});

export default router;
