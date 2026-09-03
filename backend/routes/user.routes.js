const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const dataStore = require('../services/dataStore');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { requireModuleActive } = require('../middleware/moduleGuard');

// GET /api/users (Admin only)
router.get('/', authenticateToken, requireRole(['admin']), requireModuleActive('users'), (req, res) => {
  const users = dataStore.getUsers().filter(user => ['admin', 'cashier'].includes(user.role));
  res.json({ success: true, users });
});

// POST /api/users (Admin only)
router.post('/', authenticateToken, requireRole(['admin']), requireModuleActive('users'), (req, res) => {
  try {
    const { username, name, email, password, role, phone } = req.body;
    if (!username || !name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, nama, email, dan password wajib diisi' });
    }

    if (role === 'admin' || username.trim().toLowerCase() === 'admin') {
      return res.status(400).json({ success: false, message: 'Hanya boleh ada 1 akun Administrator dalam sistem (username: admin dengan password P@ssw0rd).' });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Nomor telepon wajib diisi sebagai pembeda unik akun' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const phoneExists = dataStore.users.some(u => u.phone && u.phone.replace(/\D/g, '') === cleanPhone);
    if (phoneExists) {
      return res.status(400).json({ success: false, message: 'Nomor telepon sudah terdaftar pada akun lain. Nomor telepon harus unik sebagai pembeda.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = dataStore.createUser({
      username: username.trim(),
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      role: 'cashier',
      phone: phone.trim()
    });

    res.status(201).json({ success: true, message: 'User kasir berhasil dibuat', user });
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
