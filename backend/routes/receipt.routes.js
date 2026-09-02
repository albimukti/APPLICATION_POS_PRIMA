const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const { authenticateToken } = require('../middleware/auth');
const { requireModuleActive } = require('../middleware/moduleGuard');

// GET /api/receipts/template
router.get('/template', authenticateToken, requireModuleActive('receipts'), (req, res) => {
  const settings = dataStore.getSettings();
  res.json({
    success: true,
    template: {
      storeName: settings.store.name,
      tagline: settings.store.tagline,
      address: settings.store.address,
      phone: settings.store.phone,
      header: settings.store.receiptHeader,
      footer: settings.store.receiptFooter,
      taxPercentage: settings.store.taxPercentage,
      currency: settings.store.currencySymbol,
      paperWidth: '80mm',
      showBarcode: true,
      showQRIS: true
    }
  });
});

// GET /api/receipts/:invoiceNumber
router.get('/:invoiceNumber', authenticateToken, requireModuleActive('receipts'), (req, res) => {
  const trx = dataStore.getTransactionById(req.params.invoiceNumber);
  if (!trx) return res.status(404).json({ success: false, message: 'Faktur struk tidak ditemukan' });

  const settings = dataStore.getSettings();
  res.json({
    success: true,
    receipt: {
      store: settings.store,
      transaction: trx
    }
  });
});

module.exports = router;
