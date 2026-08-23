const express = require('express');
const integrationController = require('../controllers/integrationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/oauth/:provider/callback', integrationController.handleCallback);
router.get('/oauth/error', (req, res) => {
  res.status(400).json({ success: false, message: 'OAuth Connection Failed', details: req.query });
});

router.use(protect);

router.get('/', integrationController.getIntegrations);
router.get('/status', integrationController.getStatus);
router.get('/oauth/:provider/start', integrationController.startOAuth);
router.post('/', integrationController.manualSetup);
router.delete('/:provider', integrationController.disconnect);

module.exports = router;
