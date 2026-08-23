const recoveryAgent = {
  name: 'recovery',
  async handleFailure(error, context = {}) {
    const errorMessage = typeof error === 'string' ? error : error?.message || 'Unknown error';
    const errorCode = error?.code || context.errorCode || 'UNKNOWN';

    let category = 'TRANSIENT';
    let decision = 'retry_with_backoff';
    let backoffMs = 1000;

    if (errorCode === 'INTEGRATION_NOT_CONNECTED' || errorMessage.includes('not connected') || errorCode === 'AUTH_EXPIRED') {
      category = 'AUTH_EXPIRED';
      decision = 'escalate';
    } else if (errorCode === 'MISSING_FIELDS' || errorMessage.includes('Missing required output fields')) {
      category = 'MISSING_FIELDS';
      decision = 'escalate';
    } else if (errorMessage.toLowerCase().includes('rate limit') || errorCode === 429) {
      category = 'RATE_LIMIT';
      decision = 'retry_with_backoff';
      backoffMs = 5000;
    } else if (errorMessage.toLowerCase().includes('api failure') || errorCode === 'API_FAILURE') {
      category = 'API_FAILURE';
      decision = context.retryCount >= 3 ? 'escalate' : 'retry_with_backoff';
      backoffMs = 2000 * Math.pow(2, context.retryCount || 0);
    } else if (context.retryCount >= 3) {
      category = 'TRANSIENT';
      decision = 'escalate';
    }

    return {
      category,
      decision,
      backoffMs,
      retryCount: (context.retryCount || 0) + (decision === 'retry_with_backoff' ? 1 : 0),
      reason: `Classified failure as ${category}. Decision: ${decision}`
    };
  }
};

module.exports = recoveryAgent;
