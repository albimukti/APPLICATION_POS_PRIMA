const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dataStore = require('../services/dataStore');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
    }

    const user = dataStore.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Kredensial login tidak cocok' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Password yang dimasukkan salah' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Akun Anda sedang dinonaktifkan' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userSafe } = user;

    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: userSafe
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/switch-role (Quick switch for evaluation/demo)
router.post('/switch-role', (req, res) => {
  try {
    const { role } = req.body;
    const user = dataStore.users.find(u => u.role === role) || dataStore.users[0];

    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userSafe } = user;

    res.json({
      success: true,
      message: `Beralih ke mode ${role.toUpperCase()}`,
      token,
      user: userSafe
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/register-cashier (Requires Admin Approval)
router.post('/register-cashier', (req, res) => {
  try {
    const { username, name, email, password, phone } = req.body;
    if (!username || !password || !name) {
      return res.status(400).json({ success: false, message: 'Nama, username, dan password wajib diisi' });
    }

    const existing = dataStore.getUserByUsername(username);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username sudah digunakan oleh akun lain' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = {
      id: `usr-${Date.now()}`,
      username,
      name,
      email: email || `${username}@pos-sistem.id`,
      password: hashedPassword,
      role: 'cashier',
      isActive: false, // Inactive until approved by Admin!
      phone: phone || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      createdAt: new Date().toISOString()
    };

    dataStore.users.push(newUser);

    // Create approval request for Admin
    const approval = dataStore.createApprovalRequest({
      type: 'CASHIER_REGISTRATION',
      title: `Pendaftaran Kasir Baru: ${name} (@${username})`,
      requesterName: name,
      requesterRole: 'cashier',
      requesterId: newUser.id,
      data: { id: newUser.id, username, name, email: newUser.email, phone: newUser.phone, role: 'cashier' },
      details: `Pendaftaran akun kasir baru. Menunggu verifikasi dan aktivasi oleh Administrator.`,
      requiredRole: 'admin'
    });

    res.status(201).json({
      success: true,
      pending: true,
      message: 'Permohonan akun kasir berhasil dikirim. Menunggu persetujuan (approval) dari Administrator.',
      approvalId: approval.id
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/register-customer (Can be registered & approved by Cashier or Admin)
router.post('/register-customer', (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Nama dan nomor HP wajib diisi' });
    }

    const existingCust = dataStore.customers.find(c => c.phone === phone);
    if (existingCust) {
      return res.status(400).json({ success: false, message: 'Nomor telepon sudah terdaftar sebagai member' });
    }

    const newCust = {
      id: `cust-${Date.now()}`,
      name,
      phone,
      email: email || '',
      tier: 'Silver',
      points: 50, // Welcome bonus
      totalSpent: 0,
      transactionCount: 0,
      createdAt: new Date().toISOString()
    };

    dataStore.customers.push(newCust);

    // Also register user login account if password provided
    if (password) {
      const salt = bcrypt.genSaltSync(10);
      const username = phone;
      dataStore.users.push({
        id: `usr-${newCust.id}`,
        username,
        name,
        email: email || `${phone}@customer.id`,
        password: bcrypt.hashSync(password, salt),
        role: 'customer',
        isActive: true, // Customer is directly active
        phone,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        createdAt: new Date().toISOString()
      });
    }

    dataStore.addAuditLog({
      userId: req.user ? req.user.id : 'self-register',
      username: req.user ? req.user.name : name,
      role: req.user ? req.user.role : 'customer',
      action: 'CUSTOMER_REGISTERED',
      target: newCust.id,
      details: `Pendaftaran member baru: ${name} (${phone}) dengan bonus 50 poin.`,
      severity: 'INFO'
    });

    res.status(201).json({
      success: true,
      message: 'Akun member berhasil didaftarkan dan langsung aktif.',
      customer: newCust
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auth/profile (Update self profile & avatar photo)
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { name, avatar, email, phone, password } = req.body;
    let user = dataStore.users.find(u => u.id === req.user.id || u.username === req.user.username);
    
    // If not found in users, check if customer
    if (!user && req.user.role === 'customer') {
      const cust = dataStore.customers.find(c => c.id === req.user.id || c.phone === req.user.username);
      if (cust) {
        if (name) cust.name = name;
        if (email) cust.email = email;
        if (phone) cust.phone = phone;
        if (avatar !== undefined) cust.avatar = avatar;
      }
    }

    if (!user) {
      // Create or ensure user object
      user = {
        id: req.user.id,
        username: req.user.username,
        name: name || req.user.name,
        email: email || req.user.email,
        role: req.user.role,
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user.username}`,
        phone: phone || ''
      };
      dataStore.users.push(user);
    } else {
      if (name) user.name = name;
      if (avatar !== undefined) user.avatar = avatar;
      if (email) user.email = email;
      if (phone !== undefined) user.phone = phone;

      if (password && password.trim().length >= 6) {
        const salt = bcrypt.genSaltSync(10);
        user.password = bcrypt.hashSync(password, salt);
      }
    }

    dataStore.addAuditLog({
      userId: user.id,
      username: user.name,
      role: user.role,
      action: 'PROFILE_UPDATED',
      target: user.username,
      details: `${user.name} memperbarui foto profil dan data akun`,
      severity: 'INFO'
    });

    const { password: _, ...userSafe } = user;
    res.json({
      success: true,
      message: 'Foto profil dan data akun berhasil disimpan',
      user: userSafe
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

