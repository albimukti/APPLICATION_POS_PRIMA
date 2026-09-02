const jwt = require('jsonwebtoken');
const dataStore = require('../services/dataStore');

const JWT_SECRET = process.env.JWT_SECRET || 'pos_super_secret_jwt_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Check if demo user header is provided
    const demoRole = req.headers['x-demo-role'];
    if (demoRole) {
      const demoUser = dataStore.users.find(u => u.role === demoRole) || dataStore.users[0];
      req.user = demoUser;
      return next();
    }
    return res.status(401).json({ success: false, message: 'Akses ditolak: Token autentikasi tidak ditemukan' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token tidak valid atau telah kadaluarsa' });
    }
    req.user = user;
    next();
  });
}

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Autentikasi diperlukan' });
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Hak akses tidak mencukupi. Peran yang diizinkan: ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole,
  JWT_SECRET
};
