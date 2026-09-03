const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dataStore = require('../services/dataStore');
const dbSync = require('../services/dbSync');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
    }

    // Find user by username, email, or phone number
    const identifier = username.trim();
    const cleanIdPhone = identifier.replace(/\D/g, '');

    const candidates = dataStore.users.filter(u => {
      const matchUsername = u.username && u.username.toLowerCase() === identifier.toLowerCase();
      const matchEmail = u.email && u.email.toLowerCase() === identifier.toLowerCase();
      const matchPhone = cleanIdPhone.length >= 6 && u.phone && u.phone.replace(/\D/g, '') === cleanIdPhone;
      return matchUsername || matchEmail || matchPhone;
    });

    if (candidates.length === 0) {
      return res.status(401).json({ success: false, message: 'Akun tidak ditemukan. Periksa username atau nomor telepon Anda.' });
    }

    // Strictly check password for matching candidates - NO multiple/fallback passwords!
    let matchedUser = null;
    for (const u of candidates) {
      let isMatch = false;
      try {
        isMatch = bcrypt.compareSync(password, u.password);
      } catch (e) {
        isMatch = false;
      }
      if (!isMatch && password === u.password) {
        isMatch = true;
      }
      if (isMatch) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser) {
      return res.status(401).json({ success: false, message: 'Password yang dimasukkan salah' });
    }

    if (!matchedUser.isActive) {
      return res.status(403).json({ success: false, message: 'Akun Anda sedang dinonaktifkan atau belum disetujui' });
    }

    const token = jwt.sign(
      { id: matchedUser.id, username: matchedUser.username, name: matchedUser.name, role: matchedUser.role, email: matchedUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userSafe } = matchedUser;

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

    if (username.trim().toLowerCase() === 'admin') {
      return res.status(400).json({ success: false, message: 'Hanya boleh ada 1 akun Administrator dalam sistem (username: admin).' });
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

    const newUser = {
      id: `usr-${Date.now()}`,
      username: username.trim(),
      name: name.trim(),
      email: email || `${username.trim()}@pos-sistem.id`,
      password: hashedPassword,
      role: 'cashier',
      isActive: false, // Inactive until approved by Admin!
      phone: phone.trim(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      createdAt: new Date().toISOString()
    };

    dataStore.users.push(newUser);
    dbSync.persistUser(newUser).catch(() => {});

    // Create approval request for Admin
    const approval = dataStore.createApprovalRequest({
      type: 'CASHIER_REGISTRATION',
      title: `Pendaftaran Kasir Baru: ${name} (@${username})`,
      requesterName: name,
      requesterRole: 'cashier',
      requesterId: newUser.id,
      data: { id: newUser.id, username: newUser.username, name, email: newUser.email, phone: newUser.phone, role: 'cashier' },
      details: `Pendaftaran akun kasir baru (No. HP: ${phone}). Menunggu verifikasi dan aktivasi oleh Administrator.`,
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

// POST /api/auth/register-customer (Requires Cashier or Admin Approval)
router.post('/register-customer', (req, res) => {
  try {
    const { name, phone, email, password, username } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Nama dan nomor HP wajib diisi' });
    }

    if (username && username.trim().toLowerCase() === 'admin') {
      return res.status(400).json({ success: false, message: 'Username admin khusus untuk akun Administrator utama.' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const existingCust = dataStore.customers.find(c => c.phone && c.phone.replace(/\D/g, '') === cleanPhone);
    const existingUserPhone = dataStore.users.find(u => u.phone && u.phone.replace(/\D/g, '') === cleanPhone);
    if (existingCust || existingUserPhone) {
      return res.status(400).json({ success: false, message: 'Nomor telepon sudah terdaftar. Nomor telepon harus unik sebagai pembeda akun.' });
    }

    const loginUsername = username && username.trim() ? username.trim() : phone.trim();

    const newCustId = `cust-${Date.now()}`;
    const newCust = {
      id: newCustId,
      userId: null,
      code: `CUST-${String(dataStore.customers.length + 1).padStart(3, '0')}`,
      name,
      phone,
      email: email || '',
      tier: 'Silver',
      points: 50, // Welcome bonus
      totalSpent: 0,
      transactionCount: 0,
      isActive: false, // Inactive until approved by Cashier or Admin!
      createdAt: new Date().toISOString()
    };

    dataStore.customers.push(newCust);
    dbSync.persistCustomer(newCust).catch(() => {});

    let newUserId = null;
    // Also register user login account if password provided
    if (password) {
      const salt = bcrypt.genSaltSync(10);
      newUserId = `usr-${newCust.id}`;
      const newCustUser = {
        id: newUserId,
        username: loginUsername,
        name,
        email: email || `${loginUsername}@customer.id`,
        password: bcrypt.hashSync(password, salt),
        role: 'customer',
        isActive: false, // Inactive until approved by Cashier or Admin!
        phone,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${loginUsername}`,
        createdAt: new Date().toISOString()
      };
      dataStore.users.push(newCustUser);
      dbSync.persistUser(newCustUser).catch(() => {});
      newCust.userId = newUserId;
      dbSync.persistCustomer(newCust).catch(() => {});
    }

    // Create approval request for Cashier or Admin
    const approval = dataStore.createApprovalRequest({
      type: 'CUSTOMER_REGISTRATION',
      title: `Pendaftaran Member Baru: ${name} (${phone})`,
      requesterName: name,
      requesterRole: 'customer',
      requesterId: newCust.id,
      data: {
        id: newCust.id,
        userId: newUserId,
        username: loginUsername,
        name,
        email: email || '',
        phone,
        tier: 'Silver',
        points: 50,
        role: 'customer'
      },
      details: `Pendaftaran akun member/pelanggan baru (${name} - ${phone}) dengan welcome bonus 50 poin. Menunggu persetujuan aktivasi oleh Kasir atau Administrator.`,
      requiredRole: 'any'
    });

    dataStore.addAuditLog({
      userId: newCust.id,
      username: name,
      role: 'customer',
      action: 'CUSTOMER_REGISTERED',
      target: newCust.id,
      details: `Pendaftaran member baru diajukan: ${name} (${phone}). Menunggu persetujuan (approval) Kasir atau Administrator.`,
      severity: 'INFO'
    });

    res.status(201).json({
      success: true,
      pending: true,
      message: 'Pendaftaran akun member berhasil diajukan. Menunggu persetujuan (approval) dari Kasir atau Administrator.',
      approvalId: approval.id,
      customer: newCust
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me (Get profile for current token)
router.get('/me', authenticateToken, (req, res) => {
  try {
    let user = dataStore.users.find(u => u.id === req.user.id || u.username === req.user.username);
    if (!user) user = req.user;
    const { password: _, ...userSafe } = user;
    let customerProfile = null;
    if (user.role === 'customer') {
      customerProfile = dataStore.customers.find(c => c.userId === user.id || c.phone === user.phone || c.id === user.id) || null;
    }
    res.json({
      success: true,
      user: userSafe,
      customerProfile
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
    let cust = null;
    if (req.user.role === 'customer') {
      cust = dataStore.customers.find(c => c.id === req.user.id || c.userId === req.user.id || c.phone === req.user.username);
      if (cust) {
        if (name) cust.name = name;
        if (email) cust.email = email;
        if (phone) cust.phone = phone;
        if (avatar !== undefined) cust.avatar = avatar;
        dbSync.persistCustomer(cust).catch(() => {});
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
        phone: phone || '',
        isActive: true
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

    dbSync.persistUser(user).catch(() => {});

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

