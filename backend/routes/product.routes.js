const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { requireModuleActive } = require('../middleware/moduleGuard');

// GET /api/products
router.get('/', authenticateToken, requireModuleActive('products'), (req, res) => {
  try {
    const { categoryId, search, isActive } = req.query;
    const products = dataStore.getProducts({ categoryId, search, isActive });
    const categories = dataStore.categories;
    res.json({ success: true, count: products.length, categories, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/categories
router.get('/categories', authenticateToken, requireModuleActive('products'), (req, res) => {
  res.json({ success: true, categories: dataStore.categories });
});

// POST /api/products/categories (Admin & Cashier can add categories)
router.post('/categories', authenticateToken, requireRole(['admin', 'cashier']), requireModuleActive('products'), (req, res) => {
  try {
    const { name, icon, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi' });
    }
    const category = dataStore.createCategory(req.body);
    res.status(201).json({ success: true, message: `Kategori "${category.name}" berhasil ditambahkan`, category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/products/categories/:id (Admin only)
router.put('/categories/:id', authenticateToken, requireRole(['admin']), requireModuleActive('products'), (req, res) => {
  try {
    const category = dataStore.updateCategory(req.params.id, req.body);
    res.json({ success: true, message: `Kategori "${category.name}" berhasil diperbarui`, category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/categories/:id (Admin only)
router.delete('/categories/:id', authenticateToken, requireRole(['admin']), requireModuleActive('products'), (req, res) => {
  try {
    const category = dataStore.deleteCategory(req.params.id);
    res.json({ success: true, message: `Kategori "${category.name}" berhasil dihapus`, category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', authenticateToken, requireModuleActive('products'), (req, res) => {
  const product = dataStore.getProductById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
  res.json({ success: true, product });
});

// POST /api/products (Admin only)
router.post('/', authenticateToken, requireRole(['admin']), requireModuleActive('products'), (req, res) => {
  try {
    const { name, categoryId, categoryName, price } = req.body;
    if (!name || (!categoryId && !categoryName) || price === undefined) {
      return res.status(400).json({ success: false, message: 'Nama, kategori, dan harga produk wajib diisi' });
    }
    const product = dataStore.createProduct(req.body);
    res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan', product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/products/:id (Admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), requireModuleActive('products'), (req, res) => {
  try {
    const product = dataStore.updateProduct(req.params.id, req.body);
    res.json({ success: true, message: 'Produk berhasil diperbarui', product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/:id (Admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), requireModuleActive('products'), (req, res) => {
  try {
    const product = dataStore.deleteProduct(req.params.id);
    res.json({ success: true, message: 'Produk berhasil dihapus', product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
