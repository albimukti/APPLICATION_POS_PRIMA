function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Akses ditolak: hanya admin yang dapat melakukan tindakan ini' });
}

module.exports = { requireAdmin };
