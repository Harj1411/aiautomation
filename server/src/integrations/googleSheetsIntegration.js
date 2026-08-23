const BaseIntegration = require('./baseIntegration');

class GoogleSheetsIntegration extends BaseIntegration {
  constructor() {
    super('google-sheets');
  }

  async getOAuthUrl(redirectUri, state) {
    const scope = encodeURIComponent('https://www.googleapis.com/auth/spreadsheets');
    const clientId = process.env.GOOGLE_CLIENT_ID || 'mock_google_client_id';
    return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}&access_type=offline&prompt=consent`;
  }

  async handleCallback(code, redirectUri) {
    return {
      accessToken: `mock_sheets_access_token_${Date.now()}`,
      refreshToken: `mock_sheets_refresh_token_${Date.now()}`,
      expiresAt: new Date(Date.now() + 3600 * 1000)
    };
  }

  async executeAction(action, params, tokens) {
    if (!tokens || !tokens.accessToken) {
      const err = new Error('Google Sheets connection not established');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    if (action === 'append_row' || action === 'appendRow' || action === 'write_data') {
      const { spreadsheetId, range, values } = params || {};
      console.log(`[GoogleSheetsIntegration] Appending values to spreadsheet ${spreadsheetId || 'default'}`);
      return {
        success: true,
        spreadsheetId: spreadsheetId || 'sheet_12345',
        updatedRange: range || 'Sheet1!A1:D1',
        updatedRows: 1,
        insertedValues: values || ['Sample Data']
      };
    } else if (action === 'read_range' || action === 'readRange') {
      return {
        success: true,
        values: [
          ['Name', 'Email', 'Status'],
          ['John Doe', 'john@example.com', 'Active']
        ]
      };
    }

    return { success: true, actionExecuted: action, params };
  }

  async testConnection(tokens) {
    if (!tokens || !tokens.accessToken) {
      return { isConnected: false, provider: 'google-sheets', error: 'INTEGRATION_NOT_CONNECTED' };
    }
    return { isConnected: true, provider: 'google-sheets', status: 'valid' };
  }
}

module.exports = new GoogleSheetsIntegration();
