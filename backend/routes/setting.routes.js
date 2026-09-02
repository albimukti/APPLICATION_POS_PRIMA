const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { requireModuleActive } = require('../middleware/moduleGuard');
const { getStatus } = require('../config/db');

// GET /api/settings
router.get('/', authenticateToken, (req, res) => {
  const settings = dataStore.getSettings();
  const dbStatus = getStatus();
  res.json({
    success: true,
    settings,
    dbStatus
  });
});

// PUT /api/settings (Admin only)
router.put('/', authenticateToken, requireRole(['admin']), requireModuleActive('settings'), (req, res) => {
  try {
    const updated = dataStore.updateSettings(req.body);
    res.json({ success: true, message: 'Pengaturan sistem berhasil diperbarui', settings: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/settings/backup (Download full database state)
router.get('/backup/export', authenticateToken, requireRole(['admin']), requireModuleActive('settings'), (req, res) => {
  const fullBackup = {
    appName: 'POS PRIMA INDONESIA',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    data: {
      modules: dataStore.modules,
      products: dataStore.products,
      categories: dataStore.categories,
      customers: dataStore.customers,
      transactions: dataStore.transactions,
      shifts: dataStore.shifts,
      promos: dataStore.promos,
      employees: dataStore.employees,
      history: dataStore.history,
      settings: dataStore.settings
    }
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="pos-backup-${Date.now()}.json"`);
  res.json(fullBackup);
});

module.exports = router;
