const { isMongo, inMemoryStore } = require('../config/db');
const ExecutionLog = require('../models/ExecutionLog');
const { emitAgentEvent } = require('../config/socket');

const monitoringAgent = {
  name: 'monitoring',
  async logEvent({ executionId, workflowId, nodeId, agent, level, message, metadata }) {
    const payload = {
      executionId: String(executionId),
      workflowId: String(workflowId),
      nodeId: nodeId || '',
      agent: agent || 'monitoring',
      level: level || 'info',
      message,
      metadata: metadata || {},
      timestamp: new Date().toISOString()
    };

    // Emit Socket.IO event for real-time live timeline streaming
    emitAgentEvent(executionId, payload);

    // Save to Database / In-Memory Store
    try {
      if (isMongo()) {
        await ExecutionLog.create({
          executionId,
          workflowId,
          nodeId: nodeId || '',
          agent: agent || 'monitoring',
          level: level || 'info',
          message,
          metadata: metadata || {}
        });
      } else {
        inMemoryStore.executionLogs.push({
          _id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          ...payload,
          createdAt: new Date()
        });
      }
    } catch (err) {
      console.error('[MonitoringAgent] Failed to persist log:', err.message);
    }

    return payload;
  }
};

module.exports = monitoringAgent;
