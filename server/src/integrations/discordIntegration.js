const BaseIntegration = require('./baseIntegration');

class DiscordIntegration extends BaseIntegration {
  constructor() {
    super('discord');
  }

  async getOAuthUrl(redirectUri, state) {
    const clientId = process.env.DISCORD_CLIENT_ID || 'mock_discord_client_id';
    return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=bot%20messages.read&state=${state}`;
  }

  async handleCallback(code, redirectUri) {
    return {
      accessToken: `mock_discord_token_${Date.now()}`,
      guildId: '123456789',
      expiresAt: new Date(Date.now() + 86400 * 7 * 1000)
    };
  }

  async executeAction(action, params, tokens) {
    if (!tokens || !tokens.accessToken) {
      const err = new Error('Discord bot credential not configured');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    if (action === 'post_bot_message' || action === 'postMessage' || action === 'send_notification') {
      const { channelId, content } = params || {};
      console.log(`[DiscordIntegration] Sending Bot message to ${channelId || 'default'}: "${content}"`);
      return {
        success: true,
        channelId: channelId || 'default-channel',
        messageId: `disc_${Date.now()}`,
        content: content || 'Agentflow_AI notification'
      };
    }

    return { success: true, actionExecuted: action, params };
  }

  async testConnection(tokens) {
    if (!tokens || !tokens.accessToken) {
      return { isConnected: false, provider: 'discord', error: 'INTEGRATION_NOT_CONNECTED' };
    }
    return { isConnected: true, provider: 'discord', status: 'valid' };
  }
}

module.exports = new DiscordIntegration();
