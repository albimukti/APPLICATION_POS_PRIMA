const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { requireModuleActive } = require('../middleware/moduleGuard');

// GET /api/reports/summary
router.get('/summary', authenticateToken, requireRole(['admin', 'cashier']), requireModuleActive('reports'), (req, res) => {
  try {
    const summary = dataStore.getReportSummary();
    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/reports/cashier-performance
router.get('/cashiers', authenticateToken, requireRole(['admin']), requireModuleActive('reports'), (req, res) => {
  try {
    const cashiers = dataStore.users.filter(u => u.role === 'cashier' || u.role === 'admin');
    const performance = cashiers.map(c => {
      const cashierTrx = dataStore.transactions.filter(t => t.cashierId === c.id || t.cashierName === c.name);
      const totalSales = cashierTrx.reduce((sum, t) => sum + (t.status === 'COMPLETED' ? t.totalAmount : 0), 0);
      return {
        id: c.id,
        name: c.name,
        role: c.role,
        avatar: c.avatar,
        transactionCount: cashierTrx.length,
        totalSales
      };
    });

    res.json({ success: true, performance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
