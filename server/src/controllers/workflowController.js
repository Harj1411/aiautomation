const workflowService = require('../services/workflowService');
const executionService = require('../services/executionService');

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await workflowService.getDashboardStats(req.user.id);
    res.status(200).json({ success: true, ...stats });
  } catch (err) {
    next(err);
  }
};

const listWorkflows = async (req, res, next) => {
  try {
    const result = await workflowService.listWorkflows(req.user.id, req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getWorkflow = async (req, res, next) => {
  try {
    const workflow = await workflowService.getWorkflowById(req.params.id, req.user.id);
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    res.status(200).json({ success: true, workflow });
  } catch (err) {
    next(err);
  }
};

const createWorkflow = async (req, res, next) => {
  try {
    const workflow = await workflowService.createWorkflow(req.user.id, req.body);
    res.status(201).json({ success: true, workflow });
  } catch (err) {
    next(err);
  }
};

const updateWorkflow = async (req, res, next) => {
  try {
    const workflow = await workflowService.updateWorkflow(req.params.id, req.user.id, req.body);
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    res.status(200).json({ success: true, workflow });
  } catch (err) {
    next(err);
  }
};

const duplicateWorkflow = async (req, res, next) => {
  try {
    const workflow = await workflowService.duplicateWorkflow(req.params.id, req.user.id);
    res.status(201).json({ success: true, workflow });
  } catch (err) {
    next(err);
  }
};

const deleteWorkflow = async (req, res, next) => {
  try {
    const deleted = await workflowService.deleteWorkflow(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    res.status(200).json({ success: true, message: 'Workflow deleted' });
  } catch (err) {
    next(err);
  }
};

const generateAIWorkflow = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const workflow = await workflowService.generateAIWorkflow(req.user.id, prompt);
    res.status(201).json({ success: true, workflow });
  } catch (err) {
    next(err);
  }
};

const triggerExecution = async (req, res, next) => {
  try {
    const execution = await executionService.triggerExecution(req.params.id, req.user.id, req.body.inputs || {});
    res.status(200).json({ success: true, execution });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  listWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  duplicateWorkflow,
  deleteWorkflow,
  generateAIWorkflow,
  triggerExecution
};
