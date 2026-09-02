const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const dataStore = require('../services/dataStore');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { requireModuleActive } = require('../middleware/moduleGuard');

// GET /api/users (Admin only)
router.get('/', authenticateToken, requireRole(['admin']), requireModuleActive('users'), (req, res) => {
  res.json({ success: true, users: dataStore.getUsers() });
});

// POST /api/users (Admin only)
router.post('/', authenticateToken, requireRole(['admin']), requireModuleActive('users'), (req, res) => {
  try {
    const { username, name, email, password, role, phone } = req.body;
    if (!username || !name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, nama, email, dan password wajib diisi' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = dataStore.createUser({
      username,
      name,
      email,
      password: hashedPassword,
      role: role || 'cashier',
      phone: phone || ''
    });

    res.status(201).json({ success: true, message: 'User berhasil dibuat', user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/users/:id/toggle-status
router.put('/:id/toggle-status', authenticateToken, requireRole(['admin']), requireModuleActive('users'), (req, res) => {
  const user = dataStore.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
  if (user.role === 'admin' && user.id === req.user.id) {
    return res.status(400).json({ success: false, message: 'Tidak dapat menonaktifkan akun admin yang sedang login' });
  }
  user.isActive = !user.isActive;
  res.json({ success: true, message: `Status user ${user.name} diperbarui`, user: { ...user, password: '' } });
});

module.exports = router;
