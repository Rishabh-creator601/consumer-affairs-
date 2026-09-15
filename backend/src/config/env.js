require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/lm-verify',
  JWT_SECRET: process.env.JWT_SECRET || 'supersecretjwtkey',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '15m',
  REFRESH_EXPIRY: process.env.REFRESH_EXPIRY || '7d',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  OCR_SERVICE_URL: process.env.OCR_SERVICE_URL || 'http://localhost:8001',
  UPLOAD_MAX_SIZE: process.env.UPLOAD_MAX_SIZE || '20MB',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
