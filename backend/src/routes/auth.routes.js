import { Router } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

function handleAuthError(err, res) {
  if (err instanceof authService.AuthError) {
    return res.status(err.status).json({
      ok: false,
      error: { code: err.code, user_message: err.message },
    });
  }

  console.error('[Auth] Unexpected error:', err?.message || err);
  return res.status(500).json({
    ok: false,
    error: { code: 'INTERNAL_ERROR', user_message: 'Внутренняя ошибка сервера.' },
  });
}

authRouter.post('/api/auth/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: { code: 'VALIDATION_ERROR', user_message: 'Проверьте email, имя и пароль (минимум 6 символов).' },
    });
  }

  try {
    const result = await authService.register(parsed.data);
    return res.status(201).json({ ok: true, ...result });
  } catch (err) {
    return handleAuthError(err, res);
  }
});

authRouter.post('/api/auth/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: { code: 'VALIDATION_ERROR', user_message: 'Введите email и пароль.' },
    });
  }

  try {
    const result = await authService.login(parsed.data);
    return res.json({ ok: true, ...result });
  } catch (err) {
    return handleAuthError(err, res);
  }
});

authRouter.post('/api/auth/refresh', async (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: { code: 'VALIDATION_ERROR', user_message: 'Отсутствует refresh-токен.' },
    });
  }

  try {
    const result = await authService.refresh(parsed.data);
    return res.json({ ok: true, ...result });
  } catch (err) {
    return handleAuthError(err, res);
  }
});

authRouter.post('/api/auth/logout', async (req, res) => {
  try {
    await authService.logout(req.body || {});
    return res.json({ ok: true });
  } catch (err) {
    return handleAuthError(err, res);
  }
});

authRouter.get('/api/auth/me', requireAuth, async (req, res) => {
  const user = await authService.getUserById(req.userId);
  if (!user) {
    return res.status(404).json({
      ok: false,
      error: { code: 'NOT_FOUND', user_message: 'Пользователь не найден.' },
    });
  }
  return res.json({ ok: true, user });
});

authRouter.post('/api/auth/google', (_req, res) => {
  return res.status(501).json({
    ok: false,
    error: { code: 'NOT_IMPLEMENTED', user_message: 'Вход через Google пока недоступен.' },
  });
});
