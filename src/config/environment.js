import dotenv from 'dotenv';

dotenv.config();

const env = {
  // Server
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // MongoDB
  MONGO_URI: process.env.MONGO_URI || 'mongodb://admin:adminpassword@localhost:27017/dnd_game_service?authSource=admin',
  MONGO_DB_NAME: process.env.MONGO_DB_NAME || 'dnd_game_service',

  // Spring Boot Backend
  SPRINGBOOT_AUTH_URL: process.env.SPRINGBOOT_AUTH_URL || 'http://localhost:8080/api/auth/validate-token',
  SPRINGBOOT_URL: process.env.SPRINGBOOT_URL || 'http://localhost:8080',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // WebSocket
  WS_PING_INTERVAL: parseInt(process.env.WS_PING_INTERVAL || '30000'),
  WS_PING_TIMEOUT: parseInt(process.env.WS_PING_TIMEOUT || '5000'),

  // Game Sessions
  SESSION_TIMEOUT: parseInt(process.env.SESSION_TIMEOUT || '3600000'), // 1 hour
  MAX_PLAYERS_PER_SESSION: parseInt(process.env.MAX_PLAYERS_PER_SESSION || '10'),

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
};

export default env;
