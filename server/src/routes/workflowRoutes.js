const express = require('express');
const workflowController = require('../controllers/workflowController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/dashboard', workflowController.getDashboardStats);
router.get('/', workflowController.listWorkflows);
router.post('/', workflowController.createWorkflow);
router.post('/generate', workflowController.generateAIWorkflow);
router.get('/:id', workflowController.getWorkflow);
router.put('/:id', workflowController.updateWorkflow);
router.post('/:id/duplicate', workflowController.duplicateWorkflow);
router.post('/:id/execute', workflowController.triggerExecution);
router.delete('/:id', workflowController.deleteWorkflow);

module.exports = router;
