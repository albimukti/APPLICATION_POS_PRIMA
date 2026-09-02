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

// POST /api/employees (Admin only: Add new employee)
router.post('/', authenticateToken, requireRole(['admin']), requireModuleActive('employees'), (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Nama karyawan wajib diisi' });
    const emp = dataStore.createEmployee(req.body);
    res.status(201).json({ success: true, message: `Karyawan ${emp.name} berhasil ditambahkan`, employee: emp });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/employees/:id (Admin only: Update employee)
router.put('/:id', authenticateToken, requireRole(['admin']), requireModuleActive('employees'), (req, res) => {
  try {
    const emp = dataStore.updateEmployee(req.params.id, req.body);
    res.json({ success: true, message: `Data karyawan ${emp.name} berhasil diperbarui`, employee: emp });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/employees/:id (Admin only: Remove employee)
router.delete('/:id', authenticateToken, requireRole(['admin']), requireModuleActive('employees'), (req, res) => {
  try {
    const deleted = dataStore.deleteEmployee(req.params.id);
    res.json({ success: true, message: `Data karyawan ${deleted.name} berhasil dihapus`, employee: deleted });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
