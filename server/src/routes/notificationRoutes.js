const express = require('express');
const notificationService = require('../services/notificationService');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const notifications = await notificationService.getNotificationsForUser(req.user.id);
    res.status(200).json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/read', async (req, res, next) => {
  try {
    const result = await notificationService.markAsRead(req.params.id, req.user.id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
