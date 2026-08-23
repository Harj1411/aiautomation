const { isMongo, inMemoryStore } = require('../config/db');
const Notification = require('../models/Notification');
const { emitNotification } = require('../config/socket');

const createNotification = async ({ owner, workflowId, executionId, type, title, message }) => {
  let notification = null;
  if (isMongo()) {
    notification = new Notification({
      owner,
      workflowId,
      executionId,
      type: type || 'info',
      title,
      message
    });
    await notification.save();
    notification = notification.toObject();
  } else {
    notification = {
      _id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      owner,
      workflowId,
      executionId,
      type: type || 'info',
      title,
      message,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryStore.notifications.push(notification);
  }

  // Real-time broadcast to connected client
  emitNotification(owner, notification);

  return notification;
};

const getNotificationsForUser = async (userId) => {
  if (isMongo()) {
    return await Notification.find({ owner: userId }).sort({ createdAt: -1 }).limit(20);
  } else {
    return inMemoryStore.notifications
      .filter((n) => String(n.owner) === String(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);
  }
};

const markAsRead = async (notificationId, userId) => {
  if (isMongo()) {
    await Notification.findOneAndUpdate({ _id: notificationId, owner: userId }, { isRead: true });
  } else {
    const item = inMemoryStore.notifications.find(
      (n) => String(n._id) === String(notificationId) && String(n.owner) === String(userId)
    );
    if (item) item.isRead = true;
  }
  return { success: true };
};

module.exports = {
  createNotification,
  getNotificationsForUser,
  markAsRead
};
