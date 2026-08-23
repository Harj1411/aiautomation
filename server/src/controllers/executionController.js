const executionService = require('../services/executionService');

const listExecutions = async (req, res, next) => {
  try {
    const result = await executionService.listExecutions(req.user.id, req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getExecution = async (req, res, next) => {
  try {
    const execution = await executionService.getExecutionById(req.params.id);
    if (!execution) {
      return res.status(404).json({ success: false, message: 'Execution run not found' });
    }
    res.status(200).json({ success: true, execution });
  } catch (err) {
    next(err);
  }
};

const getTimeline = async (req, res, next) => {
  try {
    const logs = await executionService.getExecutionTimeline(req.params.id);
    res.status(200).json({ success: true, logs });
  } catch (err) {
    next(err);
  }
};

const pauseExecution = async (req, res, next) => {
  try {
    const result = await executionService.pauseExecution(req.params.id, req.user.id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const resumeExecution = async (req, res, next) => {
  try {
    const result = await executionService.resumeExecution(req.params.id, req.user.id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const cancelExecution = async (req, res, next) => {
  try {
    const result = await executionService.cancelExecution(req.params.id, req.user.id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listExecutions,
  getExecution,
  getTimeline,
  pauseExecution,
  resumeExecution,
  cancelExecution
};
