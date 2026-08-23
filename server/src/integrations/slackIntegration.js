const BaseIntegration = require('./baseIntegration');

class SlackIntegration extends BaseIntegration {
  constructor() {
    super('slack');
  }

  async getOAuthUrl(redirectUri, state) {
    const clientId = process.env.SLACK_CLIENT_ID || 'mock_slack_client_id';
    const scope = encodeURIComponent('chat:write,channels:read');
    return `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  }

  async handleCallback(code, redirectUri) {
    return {
      accessToken: `xoxb-mock_slack_token_${Date.now()}`,
      botUserId: 'U12345678',
      expiresAt: new Date(Date.now() + 86400 * 30 * 1000)
    };
  }

  async executeAction(action, params, tokens) {
    if (!tokens || !tokens.accessToken) {
      const err = new Error('Slack connection missing or expired');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    if (action === 'post_message' || action === 'postMessage' || action === 'send_notification') {
      const { channel, message, text } = params || {};
      const content = message || text || 'Automated notification from Agentflow_AI';
      const targetChannel = channel || '#general';
      console.log(`[SlackIntegration] Posting to ${targetChannel}: "${content}"`);
      return {
        success: true,
        channel: targetChannel,
        messageTs: `${Date.now() / 1000}`,
        text: content
      };
    }

    return { success: true, actionExecuted: action, params };
  }

  async testConnection(tokens) {
    if (!tokens || !tokens.accessToken) {
      return { isConnected: false, provider: 'slack', error: 'INTEGRATION_NOT_CONNECTED' };
    }
    return { isConnected: true, provider: 'slack', status: 'valid' };
  }
}

module.exports = new SlackIntegration();
