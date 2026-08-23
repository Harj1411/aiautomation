const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const sanitizedClientUrl = rawClientUrl.trim().replace(/["']/g, '').replace(/\/$/, '');

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: sanitizedClientUrl,
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://harjitharjit1411_db_user:ymr4qaXkjsZkFulr@cluster0.t92wyg0.mongodb.net/agentflow_ai?retryWrites=true&w=majority&appName=Cluster0',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_jwt_key_agentflow_ai_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  credentialEncryptionKey: process.env.CREDENTIAL_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  redisHost: process.env.REDIS_HOST || '127.0.0.1',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};
