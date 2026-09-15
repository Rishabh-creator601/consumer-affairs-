require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

const DEV_JWT_SECRET = 'dev-only-access-secret-do-not-use-in-production';
const DEV_REFRESH_SECRET = 'dev-only-refresh-secret-do-not-use-in-production';

const JWT_SECRET = process.env.JWT_SECRET || DEV_JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || DEV_REFRESH_SECRET;

// Refuse to boot in production with the fallback development secrets.
if (isProd && (JWT_SECRET === DEV_JWT_SECRET || JWT_REFRESH_SECRET === DEV_REFRESH_SECRET)) {
  throw new Error(
    'JWT_SECRET and JWT_REFRESH_SECRET must be set to strong unique values when NODE_ENV=production.'
  );
}

if (isProd && JWT_SECRET === JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must not be identical.');
}

const parseOrigins = (raw) =>
  (raw || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/lm-verify',
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '15m',
  REFRESH_EXPIRY: process.env.REFRESH_EXPIRY || '7d',
  REFRESH_EXPIRY_MS: Number(process.env.REFRESH_EXPIRY_MS || 7 * 24 * 60 * 60 * 1000),
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  OCR_SERVICE_URL: process.env.OCR_SERVICE_URL || 'http://localhost:8001',
  UPLOAD_MAX_SIZE: process.env.UPLOAD_MAX_SIZE || '20MB',
  BCRYPT_ROUNDS: Number(process.env.BCRYPT_ROUNDS || 12),
  CORS_ORIGINS: parseOrigins(process.env.CLIENT_URL),
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true' || isProd,
  MAX_LOGIN_ATTEMPTS: Number(process.env.MAX_LOGIN_ATTEMPTS || 5),
  LOCK_WINDOW_MS: Number(process.env.LOCK_WINDOW_MS || 15 * 60 * 1000),
  NODE_ENV,
  isProd
};
