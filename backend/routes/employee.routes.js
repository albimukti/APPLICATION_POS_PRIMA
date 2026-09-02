const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { requireModuleActive } = require('../middleware/moduleGuard');

// GET /api/employees (Admin only)
router.get('/', authenticateToken, requireRole(['admin']), requireModuleActive('employees'), (req, res) => {
  res.json({ success: true, employees: dataStore.getEmployees() });
});

// POST /api/employees/:id/clock-in
router.post('/:id/clock-in', authenticateToken, requireRole(['admin']), requireModuleActive('employees'), (req, res) => {
  try {
    const emp = dataStore.clockInEmployee(req.params.id);
    res.json({ success: true, message: `Absensi masuk ${emp.name} tercatat`, employee: emp });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/employees/:id/clock-out
router.post('/:id/clock-out', authenticateToken, requireRole(['admin']), requireModuleActive('employees'), (req, res) => {
  try {
    const emp = dataStore.clockOutEmployee(req.params.id);
    res.json({ success: true, message: `Absensi pulang ${emp.name} tercatat`, employee: emp });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
