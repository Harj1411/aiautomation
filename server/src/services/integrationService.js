const crypto = require('crypto');
const env = require('../config/env');
const { isMongo, inMemoryStore } = require('../config/db');
const Integration = require('../models/Integration');

const gmailIntegration = require('../integrations/gmailIntegration');
const slackIntegration = require('../integrations/slackIntegration');
const discordIntegration = require('../integrations/discordIntegration');
const googleSheetsIntegration = require('../integrations/googleSheetsIntegration');

const registry = {
  gmail: gmailIntegration,
  slack: slackIntegration,
  discord: discordIntegration,
  'google-sheets': googleSheetsIntegration
};

const getEncryptionKey = () => {
  let keyHex = env.credentialEncryptionKey || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  if (keyHex.length < 64) {
    keyHex = keyHex.padEnd(64, '0');
  }
  return Buffer.from(keyHex.substring(0, 64), 'hex');
};

const encryptTokens = (tokensObj) => {
  const text = JSON.stringify(tokensObj);
  const iv = crypto.randomBytes(12);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

const decryptTokens = (encryptedDataStr) => {
  if (!encryptedDataStr) return null;
  try {
    const parts = encryptedDataStr.split(':');
    if (parts.length !== 3) return null;
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (err) {
    console.error('[IntegrationService] Failed to decrypt tokens:', err.message);
    return null;
  }
};

const getIntegrationsForUser = async (userId) => {
  let list = [];
  if (isMongo()) {
    list = await Integration.find({ owner: userId });
  } else {
    list = inMemoryStore.integrations.filter((item) => String(item.owner) === String(userId));
  }

  const providers = ['gmail', 'slack', 'google-sheets', 'discord', 'openrouter', 'gemini'];
  return providers.map((provider) => {
    const found = list.find((item) => item.provider === provider);
    return {
      provider,
      isConnected: found ? found.isConnected : false,
      expiresAt: found ? found.expiresAt : null,
      updatedAt: found ? found.updatedAt : null
    };
  });
};

const saveIntegrationTokens = async (userId, provider, tokens) => {
  const encrypted = encryptTokens(tokens);
  const expiresAt = tokens.expiresAt || new Date(Date.now() + 86400 * 30 * 1000);

  if (isMongo()) {
    let item = await Integration.findOne({ owner: userId, provider });
    if (!item) {
      item = new Integration({
        owner: userId,
        provider,
        isConnected: true,
        encryptedTokens: encrypted,
        expiresAt
      });
    } else {
      item.isConnected = true;
      item.encryptedTokens = encrypted;
      item.expiresAt = expiresAt;
    }
    await item.save();
    return item;
  } else {
    let item = inMemoryStore.integrations.find(
      (i) => String(i.owner) === String(userId) && i.provider === provider
    );
    if (!item) {
      item = {
        _id: `integ_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        owner: userId,
        provider,
        isConnected: true,
        encryptedTokens: encrypted,
        expiresAt,
        updatedAt: new Date()
      };
      inMemoryStore.integrations.push(item);
    } else {
      item.isConnected = true;
      item.encryptedTokens = encrypted;
      item.expiresAt = expiresAt;
      item.updatedAt = new Date();
    }
    return item;
  }
};

const disconnectIntegration = async (userId, provider) => {
  if (isMongo()) {
    await Integration.findOneAndUpdate(
      { owner: userId, provider },
      { isConnected: false, encryptedTokens: '' }
    );
  } else {
    const item = inMemoryStore.integrations.find(
      (i) => String(i.owner) === String(userId) && i.provider === provider
    );
    if (item) {
      item.isConnected = false;
      item.encryptedTokens = '';
    }
  }
  return { success: true, provider };
};

const getTokensForUserProvider = async (userId, provider) => {
  let item = null;
  if (isMongo()) {
    item = await Integration.findOne({ owner: userId, provider });
  } else {
    item = inMemoryStore.integrations.find(
      (i) => String(i.owner) === String(userId) && i.provider === provider
    );
  }
  if (!item || !item.isConnected || !item.encryptedTokens) {
    return null;
  }
  return decryptTokens(item.encryptedTokens);
};

const executeIntegrationAction = async (userId, provider, action, params) => {
  const adapter = registry[provider];
  if (!adapter) {
    throw new Error(`Unsupported integration provider: ${provider}`);
  }

  const tokens = await getTokensForUserProvider(userId, provider);
  if (!tokens) {
    const err = new Error(`Integration for provider '${provider}' is not connected`);
    err.code = 'INTEGRATION_NOT_CONNECTED';
    throw err;
  }

  return await adapter.executeAction(action, params, tokens);
};

module.exports = {
  encryptTokens,
  decryptTokens,
  getIntegrationsForUser,
  saveIntegrationTokens,
  disconnectIntegration,
  getTokensForUserProvider,
  executeIntegrationAction,
  registry
};
