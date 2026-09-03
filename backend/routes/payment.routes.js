const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { requireModuleActive } = require('../middleware/moduleGuard');

// GET /api/payments/methods
router.get('/methods', authenticateToken, requireModuleActive('payments'), (req, res) => {
  res.json({
    success: true,
    methods: dataStore.paymentMethods
  });
});

// POST /api/payments/methods (Admin only: update/add payment method)
router.post('/methods', authenticateToken, requireRole(['admin']), requireModuleActive('payments'), (req, res) => {
  try {
    const { code, name, category, feePercentage, feeFixed, instructions } = req.body;
    const newMethod = dataStore.createPaymentMethod({ code, name, category, feePercentage, feeFixed, instructions });
    res.status(201).json({ success: true, method: newMethod });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/payments/methods/:id/toggle (Admin only)
router.put('/methods/:id/toggle', authenticateToken, requireRole(['admin']), requireModuleActive('payments'), (req, res) => {
  try {
    const method = dataStore.togglePaymentMethod(req.params.id);
    res.json({ success: true, message: `Status metode ${method.name} diubah`, method });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

module.exports = router;
