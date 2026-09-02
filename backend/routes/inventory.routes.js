const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { requireModuleActive } = require('../middleware/moduleGuard');

// GET /api/inventory (Stock list & low stock indicators)
router.get('/', authenticateToken, requireModuleActive('inventory'), (req, res) => {
  try {
    const inventory = dataStore.getInventory();
    const lowStockItems = inventory.filter(i => i.isLowStock);
    const totalAssetValue = inventory.reduce((sum, i) => sum + i.assetValue, 0);

    res.json({
      success: true,
      totalItems: inventory.length,
      lowStockCount: lowStockItems.length,
      totalAssetValue,
      inventory
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/inventory/logs
router.get('/logs', authenticateToken, requireModuleActive('inventory'), (req, res) => {
  try {
    const logs = dataStore.getInventoryLogs();
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/inventory/adjust (Admin only: Stock In/Out Adjustment)
router.post('/adjust', authenticateToken, requireRole(['admin']), requireModuleActive('inventory'), (req, res) => {
  try {
    const { productId, quantity, type, reason } = req.body;
    if (!productId || quantity === undefined || !type) {
      return res.status(400).json({ success: false, message: 'ID produk, jumlah, dan tipe penyesuaian (IN/OUT/ADJUSTMENT) wajib diisi' });
    }

    const result = dataStore.adjustStock(productId, quantity, type, reason, req.user.name);
    res.json({
      success: true,
      message: `Stok produk '${result.product.name}' berhasil disesuaikan.`,
      product: result.product,
      log: result.log
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
