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
    const newMethod = {
      id: `pay-${Date.now()}`,
      code: code.toUpperCase(),
      name,
      category: category || 'CASH',
      feePercentage: parseFloat(feePercentage) || 0,
      feeFixed: parseFloat(feeFixed) || 0,
      icon: 'CreditCard',
      isActive: true,
      instructions: instructions || ''
    };
    dataStore.paymentMethods.push(newMethod);
    res.status(201).json({ success: true, method: newMethod });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/payments/methods/:id/toggle (Admin only)
router.put('/methods/:id/toggle', authenticateToken, requireRole(['admin']), requireModuleActive('payments'), (req, res) => {
  const method = dataStore.paymentMethods.find(m => m.id === req.params.id);
  if (!method) return res.status(404).json({ success: false, message: 'Metode pembayaran tidak ditemukan' });
  method.isActive = !method.isActive;
  res.json({ success: true, message: `Status metode ${method.name} diubah`, method });
});

module.exports = router;
