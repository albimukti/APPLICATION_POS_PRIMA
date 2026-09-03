const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const { authenticateToken } = require('../middleware/auth');
const { requireModuleActive } = require('../middleware/moduleGuard');

// GET /api/notifications
router.get('/', authenticateToken, requireModuleActive('notifications'), (req, res) => {
  const notifications = dataStore.getNotifications(req.user);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  res.json({ success: true, unreadCount, notifications });
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticateToken, requireModuleActive('notifications'), (req, res) => {
  const notif = dataStore.markNotificationRead(req.params.id, req.user.id);
  res.json({ success: true, notification: notif });
});

module.exports = router;
