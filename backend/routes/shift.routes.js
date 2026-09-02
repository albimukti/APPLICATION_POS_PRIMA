const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { requireModuleActive } = require('../middleware/moduleGuard');

// GET /api/shifts/active
router.get('/active', authenticateToken, requireModuleActive('shifts'), (req, res) => {
  const activeShift = dataStore.getActiveShift(req.user);
  res.json({ success: true, activeShift });
});

// GET /api/shifts
router.get('/', authenticateToken, requireRole(['admin', 'cashier']), requireModuleActive('shifts'), (req, res) => {
  res.json({ success: true, shifts: dataStore.getAllShifts() });
});

// POST /api/shifts/open
router.post('/open', authenticateToken, requireRole(['admin', 'cashier']), requireModuleActive('shifts'), (req, res) => {
  try {
    const { startingCash, notes } = req.body;
    const shift = dataStore.openShift(startingCash, notes, req.user);
    res.status(201).json({ success: true, message: 'Shift kasir berhasil dibuka', shift });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/shifts/:id/close
router.post('/:id/close', authenticateToken, requireRole(['admin', 'cashier']), requireModuleActive('shifts'), (req, res) => {
  try {
    const { actualCash, notes } = req.body;
    const shift = dataStore.closeShift(req.params.id, actualCash, notes, req.user);
    res.json({ success: true, message: 'Shift kasir berhasil ditutup', shift });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
