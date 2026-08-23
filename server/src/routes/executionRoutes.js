const express = require('express');
const executionController = require('../controllers/executionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', executionController.listExecutions);
router.get('/:id', executionController.getExecution);
router.get('/:id/timeline', executionController.getTimeline);
router.post('/:id/pause', executionController.pauseExecution);
router.post('/:id/resume', executionController.resumeExecution);
router.post('/:id/cancel', executionController.cancelExecution);

module.exports = router;
