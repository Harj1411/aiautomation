class BaseIntegration {
  constructor(providerName) {
    this.providerName = providerName;
  }

  async getOAuthUrl(redirectUri, state) {
    throw new Error(`getOAuthUrl not implemented for ${this.providerName}`);
  }

  async handleCallback(code, redirectUri) {
    throw new Error(`handleCallback not implemented for ${this.providerName}`);
  }

  async executeAction(action, params, tokens) {
    throw new Error(`executeAction not implemented for ${this.providerName}`);
  }

  async testConnection(tokens) {
    return { isConnected: !!tokens, provider: this.providerName };
  }
}

module.exports = BaseIntegration;
