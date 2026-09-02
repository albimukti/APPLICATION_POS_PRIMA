const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/modules (Public metadata: used to render sidebar, navigation & module status)
router.get('/', (req, res) => {
  try {
    const modules = dataStore.getModules();
    const stats = dataStore.getModuleStats();
    res.json({
      success: true,
      stats,
      modules
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/modules/toggle (Admin only: Toggle active/inactive with safety backup & audit log)
router.post('/toggle', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const { moduleId, key, isActive, reason } = req.body;
    const targetKeyOrId = key || moduleId;

    if (targetKeyOrId === undefined || isActive === undefined) {
      return res.status(400).json({ success: false, message: 'Modul ID/Key dan status target wajib disertakan.' });
    }

    const result = dataStore.toggleModule(targetKeyOrId, Boolean(isActive), req.user, reason);

    res.json({
      success: true,
      message: `Modul '${result.module.name}' berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}.`,
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/modules/preset (Admin only: Apply business preset configurations)
router.post('/preset', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const { preset } = req.body; // 'retail', 'cafe', 'apotek', 'enterprise'
    if (!preset) {
      return res.status(400).json({ success: false, message: 'Nama preset wajib disertakan.' });
    }

    const result = dataStore.applyPreset(preset, req.user);

    res.json({
      success: true,
      message: `Preset konfigurasi '${preset.toUpperCase()}' berhasil diterapkan (${result.activeCount} modul aktif).`,
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/modules/history (Admin only: Audit log history of module changes)
router.get('/history', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const history = dataStore.getHistory();
    res.json({
      success: true,
      history
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/modules/snapshot/:snapshotId (Admin only: Download snapshot backup)
router.get('/snapshot/:snapshotId', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const { snapshotId } = req.params;
    const snapshot = dataStore.getSnapshot(snapshotId);

    if (!snapshot) {
      return res.status(404).json({ success: false, message: 'Snapshot data cadangan tidak ditemukan.' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${snapshotId}.json"`);
    res.json(snapshot);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
