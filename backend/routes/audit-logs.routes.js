const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/audit-logs — Admin only, monitor all cashier activity
router.get('/', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const { userId, action, severity, dateFrom, dateTo, limit } = req.query;

    let logs = dataStore.getAuditLogs();

    // Filter by user
    if (userId) {
      logs = logs.filter(l => l.userId === userId || l.username === userId);
    }

    // Filter by action type
    if (action) {
      logs = logs.filter(l => l.action.toLowerCase().includes(action.toLowerCase()));
    }

    // Filter by severity
    if (severity) {
      logs = logs.filter(l => l.severity === severity);
    }

    // Filter by date range
    if (dateFrom) {
      const from = new Date(dateFrom);
      logs = logs.filter(l => new Date(l.timestamp) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      logs = logs.filter(l => new Date(l.timestamp) <= to);
    }

    // Sort newest first
    logs = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit (default 200)
    const maxLimit = parseInt(limit, 10) || 200;
    logs = logs.slice(0, maxLimit);

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/audit-logs — Write a log entry (from backend middleware, any authenticated user)
router.post('/', authenticateToken, (req, res) => {
  try {
    const { action, target, details, severity } = req.body;
    const log = dataStore.addAuditLog({
      userId: req.user.id,
      username: req.user.username || req.user.name,
      role: req.user.role,
      action,
      target,
      details,
      severity: severity || 'INFO',
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    });
    res.status(201).json({ success: true, log });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/audit-logs — Clear old logs (admin only, keep last 30 days)
router.delete('/', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const count = dataStore.clearOldAuditLogs(30);
    res.json({ success: true, message: `${count} log lama berhasil dibersihkan (retensi 30 hari)` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
