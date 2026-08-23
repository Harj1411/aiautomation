const validationAgent = {
  name: 'validation',
  async validateOutput(node, executionResult) {
    const config = node.data?.config || node.config || {};
    const requiredFields = config.requiredFields || [];

    if (executionResult.status === 'FAILED') {
      return {
        isValid: false,
        reason: executionResult.error || 'Execution status failed',
        missingFields: []
      };
    }

    const resultData = executionResult.result || {};
    const missing = [];

    requiredFields.forEach((field) => {
      if (resultData[field] === undefined || resultData[field] === null) {
        missing.push(field);
      }
    });

    if (missing.length > 0) {
      return {
        isValid: false,
        reason: `Missing required output fields: ${missing.join(', ')}`,
        missingFields: missing
      };
    }

    return {
      isValid: true,
      reason: 'Output structure and required fields verified',
      missingFields: []
    };
  }
};

module.exports = validationAgent;
