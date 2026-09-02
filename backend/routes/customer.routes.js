const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { requireModuleActive } = require('../middleware/moduleGuard');

// GET /api/customers
router.get('/', authenticateToken, requireModuleActive('customers'), (req, res) => {
  try {
    if (req.user.role === 'customer') {
      const cust = dataStore.customers.find(c => c.userId === req.user.id || c.email === req.user.email);
      return res.json({ success: true, customer: cust || null });
    }
    const customers = dataStore.getCustomers();
    res.json({ success: true, count: customers.length, customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/customers/:id
router.get('/:id', authenticateToken, requireModuleActive('customers'), (req, res) => {
  const customer = dataStore.getCustomerById(req.params.id);
  if (!customer) return res.status(404).json({ success: false, message: 'Data pelanggan tidak ditemukan' });
  res.json({ success: true, customer });
});

// POST /api/customers
router.post('/', authenticateToken, requireRole(['admin', 'cashier']), requireModuleActive('customers'), (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Nama pelanggan wajib diisi' });
    const customer = dataStore.createCustomer(req.body);
    res.status(201).json({ success: true, message: 'Pelanggan berhasil ditambahkan', customer });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/customers/:id
router.put('/:id', authenticateToken, requireRole(['admin', 'cashier']), requireModuleActive('customers'), (req, res) => {
  try {
    const customer = dataStore.updateCustomer(req.params.id, req.body);
    res.json({ success: true, message: 'Data pelanggan berhasil diperbarui', customer });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
