import { verifyAccessToken } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      ok: false,
      error: { code: 'UNAUTHORIZED', user_message: 'Требуется вход в аккаунт.' },
    });
  }

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({
      ok: false,
      error: { code: 'UNAUTHORIZED', user_message: 'Сессия истекла, войдите снова.' },
    });
  }
}
