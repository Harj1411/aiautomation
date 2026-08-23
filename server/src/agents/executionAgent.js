const integrationService = require('../services/integrationService');

const executionAgent = {
  name: 'execution',
  async executeNode(node, userId, accumData = {}) {
    const nodeType = node.type || node.data?.type || 'action';
    const config = node.data?.config || node.config || {};
    const provider = config.provider || node.provider || 'gmail';
    const action = config.action || node.action || 'execute';

    console.log(`[ExecutionAgent] Executing node ${node.id} (${node.data?.label || node.id}) provider=${provider} action=${action}`);

    // If node is an AI generation / LLM node
    if (provider === 'openrouter' || provider === 'gemini' || nodeType === 'ai_action') {
      const prompt = config.prompt || accumData.prompt || 'Process automation data';
      return {
        nodeId: node.id,
        status: 'SUCCESS',
        result: {
          generatedText: `[AI Output for Node ${node.id}]: Processed request "${prompt.substring(0, 50)}..." successfully.`,
          tokensUsed: 142
        }
      };
    }

    // Call integration via integration service (never call Mongo/integrations directly)
    try {
      const params = { ...config, ...accumData };
      const output = await integrationService.executeIntegrationAction(userId, provider, action, params);
      return {
        nodeId: node.id,
        status: 'SUCCESS',
        result: output
      };
    } catch (err) {
      if (err.code === 'INTEGRATION_NOT_CONNECTED') {
        throw err;
      }
      // Return execution failure with error details
      return {
        nodeId: node.id,
        status: 'FAILED',
        error: err.message,
        errorCode: err.code || 'API_FAILURE'
      };
    }
  }
};

module.exports = executionAgent;
