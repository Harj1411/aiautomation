const BaseIntegration = require('./baseIntegration');

class GmailIntegration extends BaseIntegration {
  constructor() {
    super('gmail');
  }

  async getOAuthUrl(redirectUri, state) {
    const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly');
    const clientId = process.env.GMAIL_CLIENT_ID || 'mock_gmail_client_id';
    return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}&access_type=offline&prompt=consent`;
  }

  async handleCallback(code, redirectUri) {
    // In production, exchange code for tokens. Return token payload object.
    return {
      accessToken: `mock_gmail_access_token_${Date.now()}`,
      refreshToken: `mock_gmail_refresh_token_${Date.now()}`,
      expiresAt: new Date(Date.now() + 3600 * 1000)
    };
  }

  async executeAction(action, params, tokens) {
    if (!tokens || !tokens.accessToken) {
      const err = new Error('Gmail account not connected');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    if (action === 'send_email' || action === 'sendMail') {
      const { to, subject, body } = params || {};
      console.log(`[GmailIntegration] Sending email to ${to} with subject "${subject}"`);
      return {
        success: true,
        messageId: `msg_${Math.random().toString(36).substring(2, 9)}`,
        to: to || 'recipient@example.com',
        subject: subject || 'No subject',
        timestamp: new Date().toISOString()
      };
    } else if (action === 'read_mail' || action === 'readMail') {
      return {
        success: true,
        emails: [
          { id: '1', from: 'client@company.com', subject: 'Urgent Request', snippet: 'Please review order...' }
        ]
      };
    }

    return { success: true, actionExecuted: action, params };
  }

  async testConnection(tokens) {
    if (!tokens || !tokens.accessToken) {
      return { isConnected: false, provider: 'gmail', error: 'INTEGRATION_NOT_CONNECTED' };
    }
    return { isConnected: true, provider: 'gmail', status: 'valid' };
  }
}

module.exports = new GmailIntegration();
