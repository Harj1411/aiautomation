const integrationService = require('../services/integrationService');

const getIntegrations = async (req, res, next) => {
  try {
    const integrations = await integrationService.getIntegrationsForUser(req.user.id);
    res.status(200).json({ success: true, integrations });
  } catch (err) {
    next(err);
  }
};

const getStatus = async (req, res, next) => {
  try {
    const integrations = await integrationService.getIntegrationsForUser(req.user.id);
    res.status(200).json({ success: true, integrations, health: 'OK' });
  } catch (err) {
    next(err);
  }
};

const startOAuth = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const adapter = integrationService.registry[provider];
    if (!adapter) {
      return res.status(400).json({ success: false, message: `Unknown provider: ${provider}` });
    }
    const redirectUri = `${req.protocol}://${req.get('host')}/api/integrations/oauth/${provider}/callback`;
    const state = req.user.id;
    const url = await adapter.getOAuthUrl(redirectUri, state);
    res.status(200).json({ success: true, url });
  } catch (err) {
    next(err);
  }
};

const handleCallback = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const { code, state } = req.query;
    const userId = state || req.user?.id;

    const adapter = integrationService.registry[provider];
    if (!adapter) {
      return res.redirect('/integrations?error=invalid_provider');
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/api/integrations/oauth/${provider}/callback`;
    const tokens = await adapter.handleCallback(code, redirectUri);

    await integrationService.saveIntegrationTokens(userId, provider, tokens);

    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/integrations?connected=${provider}`);
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/integrations?error=${encodeURIComponent(err.message)}`);
  }
};

const manualSetup = async (req, res, next) => {
  try {
    const { provider, credentials } = req.body;
    const tokens = {
      accessToken: credentials?.apiKey || credentials?.accessToken || `manual_${Date.now()}`,
      refreshToken: credentials?.refreshToken || '',
      expiresAt: new Date(Date.now() + 86400 * 365 * 1000)
    };
    await integrationService.saveIntegrationTokens(req.user.id, provider, tokens);
    res.status(200).json({ success: true, message: `Integration ${provider} connected successfully` });
  } catch (err) {
    next(err);
  }
};

const disconnect = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const result = await integrationService.disconnectIntegration(req.user.id, provider);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getIntegrations,
  getStatus,
  startOAuth,
  handleCallback,
  manualSetup,
  disconnect
};
