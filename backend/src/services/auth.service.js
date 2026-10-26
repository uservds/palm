import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { config } from '../config/env.js';

export class AuthError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}

function parseDurationDays(str) {
  const match = /^(\d+)d$/.exec(str || '');
  return match ? parseInt(match[1], 10) : 30;
}

function refreshExpiryDate() {
  const days = parseDurationDays(config.JWT_REFRESH_EXPIRES_IN);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: refreshExpiryDate(),
    },
  });

  return { accessToken, refreshToken };
}

export async function register({ email, password, name }) {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw new AuthError('EMAIL_TAKEN', 'Пользователь с таким email уже зарегистрирован.', 409);
  }

  const passwordHash = await bcrypt.hash(password, config.BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { email: normalizedEmail, name, passwordHash },
  });

  const tokens = await issueTokens(user);
  return { user: publicUser(user), ...tokens };
}

export async function login({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user || !user.passwordHash) {
    throw new AuthError('INVALID_CREDENTIALS', 'Неверный email или пароль.', 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AuthError('INVALID_CREDENTIALS', 'Неверный email или пароль.', 401);
  }

  const tokens = await issueTokens(user);
  return { user: publicUser(user), ...tokens };
}

export async function refresh({ refreshToken }) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AuthError('INVALID_REFRESH_TOKEN', 'Сессия истекла, войдите снова.', 401);
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new AuthError('INVALID_REFRESH_TOKEN', 'Сессия истекла, войдите снова.', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new AuthError('INVALID_REFRESH_TOKEN', 'Сессия истекла, войдите снова.', 401);
  }

  await prisma.refreshToken.update({
    where: { token: refreshToken },
    data: { revokedAt: new Date() },
  });

  const tokens = await issueTokens(user);
  return { user: publicUser(user), ...tokens };
}

export async function logout({ refreshToken }) {
  if (!refreshToken) return;
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? publicUser(user) : null;
}
