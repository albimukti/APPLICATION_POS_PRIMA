const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { requireModuleActive } = require('../middleware/moduleGuard');

// GET /api/transactions
router.get('/', authenticateToken, requireModuleActive('transactions'), (req, res) => {
  try {
    const { status, customerId, shiftId } = req.query;
    
    // Customer can only see their own transactions
    let filterCustomer = customerId;
    if (req.user.role === 'customer') {
      const cust = dataStore.customers.find(c => c.userId === req.user.id || c.email === req.user.email);
      filterCustomer = cust ? cust.id : 'unknown';
    }

    const transactions = dataStore.getTransactions({ status, customerId: filterCustomer, shiftId });
    res.json({ success: true, count: transactions.length, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/transactions/:idOrInvoice
router.get('/:idOrInvoice', authenticateToken, requireModuleActive('transactions'), (req, res) => {
  const trx = dataStore.getTransactionById(req.params.idOrInvoice);
  if (!trx) return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
  res.json({ success: true, transaction: trx });
});

// POST /api/transactions (Checkout & create new transaction)
router.post('/', authenticateToken, requireRole(['admin', 'cashier', 'customer']), requireModuleActive('transactions'), (req, res) => {
  try {
    const { items, paymentMethod, totalAmount } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Keranjang belanja tidak boleh kosong' });
    }
    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: 'Metode pembayaran wajib dipilih' });
    }

    if (req.user.role === 'customer') {
      const ownCustomer = dataStore.customers.find(c => c.userId === req.user.id || c.email === req.user.email);
      if (!ownCustomer) return res.status(400).json({ success: false, message: 'Profil customer belum terhubung' });
      req.body.customerId = ownCustomer.id;
      req.body.customerName = ownCustomer.name;
    }
    const transaction = dataStore.createTransaction(req.body, req.user);
    res.status(201).json({
      success: true,
      message: 'Transaksi penjualan berhasil diproses',
      transaction
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/transactions/:id/process — cashier accepts a customer order
router.post('/:id/process', authenticateToken, requireRole(['admin', 'cashier']), requireModuleActive('transactions'), (req, res) => {
  try {
    const transaction = dataStore.processCustomerTransaction(req.params.id, req.user);
    res.json({ success: true, message: 'Pesanan customer berhasil diproses kasir', transaction });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/transactions/:id/void (Void/cancel transaction)
router.post('/:id/void', authenticateToken, requireRole(['admin', 'cashier']), requireModuleActive('transactions'), (req, res) => {
  try {
    const { reason } = req.body;
    const trx = dataStore.voidTransaction(req.params.id, reason || 'Dibatalkan oleh kasir/admin', req.user);
    res.json({ success: true, message: 'Transaksi berhasil dibatalkan (VOID)', transaction: trx });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
