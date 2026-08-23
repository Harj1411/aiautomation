const { isMongo, inMemoryStore } = require('../config/db');
const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const Workflow = require('../models/Workflow');
const orchestrator = require('../agents/orchestrator');
const notificationService = require('./notificationService');

const listExecutions = async (userId, { status, workflowId, page = 1, limit = 10 }) => {
  if (isMongo()) {
    const userWfIds = await Workflow.find({ owner: userId }).distinct('_id');
    const query = { workflowId: { $in: userWfIds } };

    if (status) query.status = status;
    if (workflowId) query.workflowId = workflowId;

    const total = await Execution.countDocuments(query);
    const executions = await Execution.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .populate('workflowId', 'name description version');

    return { executions, total, page: parseInt(page, 10), pages: Math.ceil(total / limit) };
  } else {
    const userWfIds = new Set(
      inMemoryStore.workflows
        .filter((w) => String(w.owner) === String(userId))
        .map((w) => String(w._id))
    );

    let list = inMemoryStore.executions.filter((e) => userWfIds.has(String(e.workflowId)));
    if (status) list = list.filter((e) => e.status === status);
    if (workflowId) list = list.filter((e) => String(e.workflowId) === String(workflowId));

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(startIndex, startIndex + parseInt(limit, 10))
      .map((e) => {
        const wf = inMemoryStore.workflows.find((w) => String(w._id) === String(e.workflowId));
        return {
          ...e,
          workflowId: {
            _id: e.workflowId,
            name: wf?.name || 'Workflow',
            description: wf?.description || ''
          }
        };
      });

    return { executions: paginated, total, page: parseInt(page, 10), pages: Math.ceil(total / limit) };
  }
};

const getExecutionById = async (id) => {
  if (isMongo()) {
    return await Execution.findById(id).populate('workflowId', 'name owner description');
  } else {
    const e = inMemoryStore.executions.find((x) => String(x._id) === String(id));
    if (!e) return null;
    const wf = inMemoryStore.workflows.find((w) => String(w._id) === String(e.workflowId));
    return {
      ...e,
      workflowId: {
        _id: e.workflowId,
        name: wf?.name || 'Workflow',
        owner: wf?.owner
      }
    };
  }
};

const getExecutionTimeline = async (executionId) => {
  if (isMongo()) {
    return await ExecutionLog.find({ executionId }).sort({ createdAt: 1 });
  } else {
    return inMemoryStore.executionLogs
      .filter((log) => String(log.executionId) === String(executionId))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }
};

const triggerExecution = async (workflowId, userId, inputs = {}) => {
  let workflow = null;
  if (isMongo()) {
    workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
  } else {
    workflow = inMemoryStore.workflows.find(
      (w) => String(w._id) === String(workflowId) && String(w.owner) === String(userId)
    );
  }

  if (!workflow) {
    const error = new Error('Workflow not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }

  const snapshot = {
    name: workflow.name,
    nodes: workflow.nodes,
    edges: workflow.edges,
    version: workflow.version,
    triggerConfig: workflow.triggerConfig
  };

  let execution = null;
  if (isMongo()) {
    execution = new Execution({
      workflowId: workflow._id,
      workflowSnapshot: snapshot,
      status: 'RUNNING',
      inputs,
      startTime: new Date()
    });
    await execution.save();
  } else {
    execution = {
      _id: `exec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      workflowId: workflow._id,
      workflowSnapshot: snapshot,
      status: 'RUNNING',
      currentNode: '',
      startTime: new Date(),
      inputs,
      outputs: {},
      error: null,
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryStore.executions.push(execution);
  }

  // Execute asynchronously via the Orchestration Engine
  setImmediate(async () => {
    try {
      const startTime = Date.now();
      const result = await orchestrator.runWorkflowOrchestration({
        workflow,
        execution,
        userId,
        executionService: { getExecutionById },
        notificationService
      });

      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - startTime) / 1000);

      await updateExecutionStatus(execution._id, {
        status: result.status || 'COMPLETED',
        outputs: result.outputs || {},
        error: result.error ? { message: result.error } : null,
        endTime,
        duration
      });
    } catch (err) {
      console.error('[ExecutionService] Execution failed uncaught:', err);
      await updateExecutionStatus(execution._id, {
        status: 'FAILED',
        error: { message: err.message },
        endTime: new Date()
      });
    }
  });

  return execution;
};

const updateExecutionStatus = async (id, data) => {
  if (isMongo()) {
    await Execution.findByIdAndUpdate(id, data);
  } else {
    const item = inMemoryStore.executions.find((e) => String(e._id) === String(id));
    if (item) {
      Object.assign(item, data, { updatedAt: new Date() });
    }
  }
};

const pauseExecution = async (id, userId) => {
  const execution = await getExecutionById(id);
  if (!execution) throw new Error('Execution not found');

  await updateExecutionStatus(id, { status: 'PAUSED' });
  return { success: true, message: 'Execution paused' };
};

const resumeExecution = async (id, userId) => {
  const execution = await getExecutionById(id);
  if (!execution) throw new Error('Execution not found');

  await updateExecutionStatus(id, { status: 'RUNNING' });

  let workflow = null;
  if (isMongo()) {
    workflow = await Workflow.findById(execution.workflowId);
  } else {
    workflow = inMemoryStore.workflows.find((w) => String(w._id) === String(execution.workflowId?._id || execution.workflowId));
  }

  if (workflow) {
    setImmediate(async () => {
      await orchestrator.runWorkflowOrchestration({
        workflow,
        execution,
        userId,
        executionService: { getExecutionById },
        notificationService
      });
    });
  }

  return { success: true, message: 'Execution resumed' };
};

const cancelExecution = async (id, userId) => {
  const execution = await getExecutionById(id);
  if (!execution) throw new Error('Execution not found');

  await updateExecutionStatus(id, { status: 'CANCELLED', endTime: new Date() });
  return { success: true, message: 'Execution cancelled' };
};

module.exports = {
  listExecutions,
  getExecutionById,
  getExecutionTimeline,
  triggerExecution,
  pauseExecution,
  resumeExecution,
  cancelExecution,
  updateExecutionStatus
};
