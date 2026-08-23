const { isMongo, inMemoryStore } = require('../config/db');
const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const aiService = require('./aiService');

const listWorkflows = async (userId, { search, status, page = 1, limit = 10 }) => {
  if (isMongo()) {
    const query = { owner: userId };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Workflow.countDocuments(query);
    const workflows = await Workflow.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    return { workflows, total, page: parseInt(page, 10), pages: Math.ceil(total / limit) };
  } else {
    let list = inMemoryStore.workflows.filter((w) => String(w.owner) === String(userId));
    if (status) list = list.filter((w) => w.status === status);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (w) => w.name?.toLowerCase().includes(q) || w.description?.toLowerCase().includes(q)
      );
    }
    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + parseInt(limit, 10));
    return { workflows: paginated, total, page: parseInt(page, 10), pages: Math.ceil(total / limit) };
  }
};

const getWorkflowById = async (id, userId) => {
  if (isMongo()) {
    return await Workflow.findOne({ _id: id, owner: userId });
  } else {
    return inMemoryStore.workflows.find(
      (w) => String(w._id) === String(id) && String(w.owner) === String(userId)
    );
  }
};

const createWorkflow = async (userId, data) => {
  if (isMongo()) {
    const workflow = new Workflow({
      ...data,
      owner: userId
    });
    await workflow.save();
    return workflow;
  } else {
    const workflow = {
      _id: `wf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name || 'Untitled Workflow',
      description: data.description || '',
      owner: userId,
      status: data.status || 'draft',
      triggerConfig: data.triggerConfig || {},
      nodes: data.nodes || [],
      edges: data.edges || [],
      version: data.version || 1,
      tags: data.tags || ['Automated'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryStore.workflows.push(workflow);
    return workflow;
  }
};

const updateWorkflow = async (id, userId, updates) => {
  if (isMongo()) {
    const item = await Workflow.findOne({ _id: id, owner: userId });
    if (!item) return null;

    Object.assign(item, updates);
    if (updates.nodes || updates.edges) {
      item.version = (item.version || 1) + 1;
    }
    await item.save();
    return item;
  } else {
    const item = inMemoryStore.workflows.find(
      (w) => String(w._id) === String(id) && String(w.owner) === String(userId)
    );
    if (!item) return null;

    Object.assign(item, updates);
    if (updates.nodes || updates.edges) {
      item.version = (item.version || 1) + 1;
    }
    item.updatedAt = new Date();
    return item;
  }
};

const duplicateWorkflow = async (id, userId) => {
  const original = await getWorkflowById(id, userId);
  if (!original) throw new Error('Workflow not found');

  const copyData = {
    name: `${original.name} (Copy)`,
    description: original.description,
    status: 'draft',
    triggerConfig: original.triggerConfig,
    nodes: original.nodes,
    edges: original.edges,
    version: 1,
    tags: original.tags
  };

  return await createWorkflow(userId, copyData);
};

const deleteWorkflow = async (id, userId) => {
  if (isMongo()) {
    const res = await Workflow.deleteOne({ _id: id, owner: userId });
    return res.deletedCount > 0;
  } else {
    const index = inMemoryStore.workflows.findIndex(
      (w) => String(w._id) === String(id) && String(w.owner) === String(userId)
    );
    if (index !== -1) {
      inMemoryStore.workflows.splice(index, 1);
      return true;
    }
    return false;
  }
};

const generateAIWorkflow = async (userId, prompt) => {
  const graph = await aiService.generateWorkflowFromPrompt(prompt);
  const created = await createWorkflow(userId, {
    name: graph.name,
    description: graph.description,
    status: 'draft',
    nodes: graph.nodes,
    edges: graph.edges,
    tags: graph.tags || ['AI Generated']
  });
  return created;
};

const getDashboardStats = async (userId) => {
  let totalWorkflows = 0;
  let activeWorkflows = 0;
  let totalExecutions = 0;
  let completedExecutions = 0;
  let failedExecutions = 0;
  let recentExecutions = [];

  if (isMongo()) {
    totalWorkflows = await Workflow.countDocuments({ owner: userId });
    activeWorkflows = await Workflow.countDocuments({ owner: userId, status: 'active' });
    const userWfIds = await Workflow.find({ owner: userId }).distinct('_id');

    totalExecutions = await Execution.countDocuments({ workflowId: { $in: userWfIds } });
    completedExecutions = await Execution.countDocuments({
      workflowId: { $in: userWfIds },
      status: 'COMPLETED'
    });
    failedExecutions = await Execution.countDocuments({
      workflowId: { $in: userWfIds },
      status: 'FAILED'
    });

    recentExecutions = await Execution.find({ workflowId: { $in: userWfIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('workflowId', 'name');
  } else {
    const userWorkflows = inMemoryStore.workflows.filter((w) => String(w.owner) === String(userId));
    totalWorkflows = userWorkflows.length;
    activeWorkflows = userWorkflows.filter((w) => w.status === 'active').length;
    const userWfIds = new Set(userWorkflows.map((w) => String(w._id)));

    const userExecs = inMemoryStore.executions.filter((e) => userWfIds.has(String(e.workflowId)));
    totalExecutions = userExecs.length;
    completedExecutions = userExecs.filter((e) => e.status === 'COMPLETED').length;
    failedExecutions = userExecs.filter((e) => e.status === 'FAILED').length;

    recentExecutions = userExecs
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((e) => {
        const wf = userWorkflows.find((w) => String(w._id) === String(e.workflowId));
        return { ...e, workflowId: { _id: e.workflowId, name: wf?.name || 'Workflow' } };
      });
  }

  const successRate =
    totalExecutions > 0 ? Math.round((completedExecutions / totalExecutions) * 100) : 100;

  return {
    totalWorkflows,
    activeWorkflows,
    totalExecutions,
    completedExecutions,
    failedExecutions,
    successRate,
    recentExecutions
  };
};

module.exports = {
  listWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  duplicateWorkflow,
  deleteWorkflow,
  generateAIWorkflow,
  getDashboardStats
};
