const dataStore = require('../services/dataStore');

function requireModuleActive(moduleKey) {
  return (req, res, next) => {
    // Admin always has bypass or management access
    if (req.user && req.user.role === 'admin') {
      return next();
    }

    const mod = dataStore.getModuleByKey(moduleKey);
    if (!mod || !mod.isActive) {
      return res.status(403).json({
        success: false,
        moduleKey,
        isModuleDisabled: true,
        message: `Modul '${mod ? mod.name : moduleKey}' saat ini dinonaktifkan oleh Administrator Sistem.`
      });
    }
    next();
  };
}

module.exports = {
  requireModuleActive
};
