import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN,
  });
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user.id }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
}
