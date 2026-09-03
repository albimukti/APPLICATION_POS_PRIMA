const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/requireAdmin');
const { requireModuleActive } = require('../middleware/moduleGuard');

// GET /api/promos
router.get('/', authenticateToken, requireModuleActive('promos'), (req, res) => {
  res.json({ success: true, promos: dataStore.getPromos() });
});

// POST /api/promos/validate (Validate and calculate promo discount)
router.post('/validate', authenticateToken, requireModuleActive('promos'), (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Kode promo harus diisi' });

    const result = dataStore.validatePromoCode(code, parseFloat(orderAmount) || 0);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/promos (Admin only: create promo)
router.post('/', authenticateToken, requireAdmin, requireModuleActive('promos'), (req, res) => {
  try {
    const { code, name, discountValue } = req.body;
    if (!code || !name || discountValue === undefined) {
      return res.status(400).json({ success: false, message: 'Kode promo, nama promo, dan nilai diskon wajib diisi' });
    }
    const promo = dataStore.createPromo(req.body);
    res.status(201).json({ success: true, message: 'Kode promo berhasil dibuat', promo });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/promos/:id (Admin only: update promo)
router.put('/:id', authenticateToken, requireAdmin, requireModuleActive('promos'), (req, res) => {
  try {
    const updated = dataStore.updatePromo(req.params.id, req.body);
    res.json({ success: true, message: 'Promo berhasil diperbarui', promo: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/promos/:id (Admin only: delete promo)
router.delete('/:id', authenticateToken, requireAdmin, requireModuleActive('promos'), (req, res) => {
  try {
    dataStore.deletePromo(req.params.id);
    res.json({ success: true, message: 'Promo berhasil dihapus' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/promos/:id/toggle (Admin only)
router.put('/:id/toggle', authenticateToken, requireAdmin, requireModuleActive('promos'), (req, res) => {
  try {
    const promo = dataStore.togglePromo(req.params.id);
    res.json({ success: true, message: `Promo ${promo.code} ${promo.isActive ? 'diaktifkan' : 'dinonaktifkan'}`, promo });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

module.exports = router;
