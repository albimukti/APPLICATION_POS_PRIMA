const { v4: uuidv4 } = require('uuid');
const initialData = require('../database/initialData');
const dbSync = require('./dbSync');

// Data Store (100% Synchronized with PostgreSQL POS_PRIMA database)
class DataStore {
  constructor() {
    this.modules = JSON.parse(JSON.stringify(initialData.initialModules));
    this.categories = JSON.parse(JSON.stringify(initialData.initialCategories));
    this.products = JSON.parse(JSON.stringify(initialData.initialProducts));
    this.users = JSON.parse(JSON.stringify(initialData.initialUsers));
    this.customers = JSON.parse(JSON.stringify(initialData.initialCustomers));
    this.promos = JSON.parse(JSON.stringify(initialData.initialPromos));
    this.paymentMethods = JSON.parse(JSON.stringify(initialData.initialPaymentMethods));
    this.shifts = JSON.parse(JSON.stringify(initialData.initialShifts));
    this.transactions = JSON.parse(JSON.stringify(initialData.initialTransactions));
    this.loyaltyRewards = JSON.parse(JSON.stringify(initialData.initialLoyaltyRewards));
    this.employees = JSON.parse(JSON.stringify(initialData.initialEmployees));
    this.notifications = JSON.parse(JSON.stringify(initialData.initialNotifications));
    this.history = JSON.parse(JSON.stringify(initialData.initialHistory));
    this.settings = JSON.parse(JSON.stringify(initialData.initialSettings));
    this.inventoryLogs = [];
    this.snapshots = {};
    this.auditLogs = [
      {
        id: 'audit-001',
        userId: 'usr-admin',
        username: 'Administrator',
        role: 'admin',
        action: 'SYSTEM_INIT',
        target: 'POS_PRIMA',
        details: 'Sistem POS PRIMA diinisialisasi baru dan bersih siap pakai',
        severity: 'INFO',
        ip: '127.0.0.1',
        timestamp: new Date().toISOString()
      }
    ];

    // ================= APPROVAL SYSTEM =================
    this.approvals = [];
  }

  // Synchronize with PostgreSQL on startup or DB connection
  async initializeFromDb() {
    try {
      await dbSync.autoSeedDatabase(initialData);
      const loaded = await dbSync.loadAllData();
      if (loaded) {
        if (loaded.users && loaded.users.length) this.users = loaded.users;
        if (loaded.customers !== undefined) this.customers = loaded.customers;
        if (loaded.categories !== undefined) this.categories = loaded.categories;
        if (loaded.products !== undefined) this.products = loaded.products;
        if (loaded.modules && loaded.modules.length) this.modules = loaded.modules;
        if (loaded.history !== undefined) this.history = loaded.history;
        if (loaded.paymentMethods && loaded.paymentMethods.length) this.paymentMethods = loaded.paymentMethods;
        if (loaded.promos !== undefined) this.promos = loaded.promos;
        if (loaded.loyaltyRewards !== undefined) this.loyaltyRewards = loaded.loyaltyRewards;
        if (loaded.employees !== undefined) this.employees = loaded.employees;
        if (loaded.shifts !== undefined) this.shifts = loaded.shifts;
        if (loaded.transactions !== undefined) this.transactions = loaded.transactions;
        if (loaded.notifications !== undefined) this.notifications = loaded.notifications;
        if (loaded.storeSettings) this.settings = { store: loaded.storeSettings };
        if (loaded.inventoryLogs !== undefined) this.inventoryLogs = loaded.inventoryLogs;
        if (loaded.auditLogs !== undefined) this.auditLogs = loaded.auditLogs;
        if (loaded.approvals !== undefined) this.approvals = loaded.approvals;
        console.log(`[DataStore] 100% Sinkronisasi PostgreSQL "${this.products.length} Produk, ${this.users.length} Akun, ${this.customers.length} Member, ${this.modules.length} Modul" siap digunakan.`);
      }
    } catch (err) {
      console.warn('[DataStore] Database sync error:', err.message);
    }
  }

  // ================= AUDIT LOG =================
  getAuditLogs() {
    return this.auditLogs;
  }

  addAuditLog({ userId, username, role, action, target, details, severity, ip }) {
    const log = {
      id: `audit-${uuidv4()}`,
      userId: userId || 'unknown',
      username: username || 'Sistem',
      role: role || 'system',
      action: action || 'UNKNOWN',
      target: target || '-',
      details: details || '',
      severity: severity || 'INFO', // INFO | WARNING | CRITICAL
      ip: ip || 'unknown',
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log); // newest first in memory
    // Keep max 2000 logs in memory
    if (this.auditLogs.length > 2000) {
      this.auditLogs = this.auditLogs.slice(0, 2000);
    }
    dbSync.persistAuditLog(log).catch(() => {});
    return log;
  }

  clearOldAuditLogs(retentionDays = 30) {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 3600 * 1000);
    const before = this.auditLogs.length;
    this.auditLogs = this.auditLogs.filter(l => new Date(l.timestamp) >= cutoff);
    dbSync.clearOldAuditLogsInDb(cutoff).catch(() => {});
    return before - this.auditLogs.length;
  }

  // ================= APPROVAL METHODS =================
  syncPendingCustomerApprovals() {
    if (!this.customers || !Array.isArray(this.customers)) return;
    this.customers.forEach(cust => {
      const exists = this.approvals.some(a =>
        a.type === 'CUSTOMER_REGISTRATION' &&
        (a.data?.id === cust.id || a.data?.phone === cust.phone || a.requesterId === cust.id)
      );
      if (!exists) {
        const associatedUser = this.users.find(u => u.username === cust.phone || u.phone === cust.phone || u.id === `usr-${cust.id}`);
        const loginUsername = associatedUser ? associatedUser.username : cust.phone;
        const newApproval = {
          id: `appr-cust-${cust.id}`,
          type: 'CUSTOMER_REGISTRATION',
          title: `Pendaftaran Member Baru: ${cust.name} (${cust.phone})`,
          requesterName: cust.name,
          requesterRole: 'customer',
          requesterId: cust.id,
          data: {
            id: cust.id,
            userId: associatedUser ? associatedUser.id : null,
            username: loginUsername,
            name: cust.name,
            email: cust.email || '',
            phone: cust.phone,
            tier: cust.tier || 'Silver',
            points: cust.points || 50,
            role: 'customer'
          },
          status: 'PENDING',
          requiredRole: 'any',
          category: 'Member & Loyalitas',
          details: `Pendaftaran akun member/pelanggan baru (${cust.name} - ${cust.phone}). Menunggu verifikasi persetujuan oleh Kasir atau Administrator.`,
          createdAt: cust.createdAt || new Date().toISOString(),
          reviewedBy: null,
          reviewedAt: null,
          reviewNotes: ''
        };
        this.approvals.unshift(newApproval);
      }
    });
  }

  getApprovals(user) {
    if (!user) return [];
    // Ensure all registered customers have approval items
    this.syncPendingCustomerApprovals();

    if (user.role === 'admin') {
      // Admin has full visibility over all approvals
      return this.approvals;
    }
    if (user.role === 'cashier') {
      // Cashier can view and process customer registrations and member verifications
      return this.approvals.filter(a => a.requiredRole === 'any' || a.requesterId === user.id || a.type === 'CUSTOMER_REGISTRATION');
    }
    // Customer can only view their own requests
    return this.approvals.filter(a => a.requesterId === user.id);
  }

  createApprovalRequest({ type, title, requesterName, requesterRole, requesterId, data, details, requiredRole }) {
    const newApproval = {
      id: `appr-${Date.now()}`,
      type: type || 'GENERAL',
      title: title || 'Permohonan Baru',
      requesterName: requesterName || 'Pengguna',
      requesterRole: requesterRole || 'cashier',
      requesterId: requesterId || 'unknown',
      data: data || {},
      status: 'PENDING',
      requiredRole: requiredRole || (type === 'CASHIER_REGISTRATION' || type === 'TRANSACTION_VOID' ? 'admin' : 'any'),
      category: type === 'CASHIER_REGISTRATION' ? 'Pendaftaran Kasir' : type === 'CUSTOMER_REGISTRATION' ? 'Member & Loyalitas' : 'Otorisasi Khusus',
      details: details || '',
      createdAt: new Date().toISOString(),
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: ''
    };

    this.approvals.unshift(newApproval);
    dbSync.persistApproval(newApproval).catch(() => {});

    this.addAuditLog({
      userId: requesterId,
      username: requesterName,
      role: requesterRole,
      action: 'APPROVAL_REQUESTED',
      target: newApproval.id,
      details: `Mengajukan permohonan approval [${newApproval.type}]: ${newApproval.title}`,
      severity: 'INFO'
    });

    this.addNotification({
      title: `Permohonan Approval Baru: ${newApproval.title}`,
      message: `${requesterName} mengajukan permohonan persetujuan.`,
      type: 'SYSTEM',
      targetRole: newApproval.requiredRole === 'admin' ? 'admin' : 'ALL'
    });

    return newApproval;
  }

  approveRequest(id, user, notes = '') {
    const item = this.approvals.find(a => a.id === id);
    if (!item) throw new Error('Permohonan approval tidak ditemukan');
    if (item.status !== 'PENDING') throw new Error(`Permohonan ini sudah berstatus ${item.status}`);

    // RBAC Check: Only admin can approve cashier registration or transaction VOID
    if (item.requiredRole === 'admin' && user.role !== 'admin') {
      throw new Error('Akses Ditolak: Hanya Administrator yang berhak menyetujui permohonan ini.');
    }

    item.status = 'APPROVED';
    item.reviewedBy = `${user.name} (${user.role.toUpperCase()})`;
    item.reviewedAt = new Date().toISOString();
    item.reviewNotes = notes || 'Disetujui';

    // Execute associated action based on type
    if (item.type === 'CASHIER_REGISTRATION' && item.data) {
      // Find or create user and set active
      let targetUser = this.users.find(u => u.username === item.data.username);
      if (targetUser) {
        targetUser.isActive = true;
      } else {
        targetUser = {
          id: `usr-${Date.now()}`,
          username: item.data.username,
          name: item.data.name,
          email: item.data.email || `${item.data.username}@pos-sistem.id`,
          password: item.data.password || '$2a$10$abcdefg1234567',
          role: 'cashier',
          isActive: true,
          phone: item.data.phone || '',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.data.username}`,
          createdAt: new Date().toISOString()
        };
        this.users.push(targetUser);
      }
      dbSync.persistUser(targetUser).catch(() => {});
    } else if (item.type === 'CUSTOMER_REGISTRATION' && item.data) {
      // Ensure customer exists and activate in customers array
      let existingCust = this.customers.find(c => (item.data.id && c.id === item.data.id) || (item.data.phone && c.phone === item.data.phone) || c.name === item.data.name);
      if (!existingCust) {
        existingCust = {
          id: item.data.id || `cust-${Date.now()}`,
          name: item.data.name,
          phone: item.data.phone,
          email: item.data.email || '',
          tier: item.data.tier || 'Silver',
          points: item.data.points || 50,
          totalSpent: 0,
          transactionCount: 0,
          isActive: true,
          createdAt: new Date().toISOString()
        };
        this.customers.push(existingCust);
      } else {
        existingCust.isActive = true;
      }
      dbSync.persistCustomer(existingCust).catch(() => {});

      // Activate user login account if exists
      const username = item.data.username || item.data.phone;
      let targetUser = this.users.find(u => u.username === username || u.phone === item.data.phone || (item.data.userId && u.id === item.data.userId));
      if (targetUser) {
        targetUser.isActive = true;
        dbSync.persistUser(targetUser).catch(() => {});
      }
    } else if (item.type === 'CUSTOMER_DELETE' && item.data?.customerId) {
      this.deleteCustomer(item.data.customerId);
    }

    dbSync.persistApproval(item).catch(() => {});

    this.addAuditLog({
      userId: user.id,
      username: user.name,
      role: user.role,
      action: 'APPROVAL_GRANTED',
      target: item.id,
      details: `${user.name} (${user.role.toUpperCase()}) MENYETUJUI permohonan [${item.type}] "${item.title}". Catatan: ${notes || '-'}`,
      severity: 'INFO'
    });

    this.addNotification({
      title: `Approval Disetujui: ${item.title}`,
      message: `Permohonan telah disetujui oleh ${user.name}.`,
      type: 'SYSTEM',
      targetUserId: item.data?.userId || item.requesterId
    });

    return item;
  }

  rejectRequest(id, user, reason = '') {
    const item = this.approvals.find(a => a.id === id);
    if (!item) throw new Error('Permohonan approval tidak ditemukan');
    if (item.status !== 'PENDING') throw new Error(`Permohonan ini sudah berstatus ${item.status}`);

    if (item.requiredRole === 'admin' && user.role !== 'admin') {
      throw new Error('Akses Ditolak: Hanya Administrator yang berhak menolak permohonan ini.');
    }

    item.status = 'REJECTED';
    item.reviewedBy = `${user.name} (${user.role.toUpperCase()})`;
    item.reviewedAt = new Date().toISOString();
    item.reviewNotes = reason || 'Permohonan ditolak oleh reviewer';
    dbSync.persistApproval(item).catch(() => {});

    if (item.type === 'CASHIER_REGISTRATION' && item.data) {
      let targetUser = this.users.find(u => u.username === item.data.username);
      if (targetUser && !targetUser.isActive) {
        targetUser.isActive = false;
      }
    } else if (item.type === 'CUSTOMER_REGISTRATION' && item.data) {
      let existingCust = this.customers.find(c => (item.data.id && c.id === item.data.id) || (item.data.phone && c.phone === item.data.phone));
      if (existingCust && !existingCust.isActive) {
        existingCust.isActive = false;
      }
      const username = item.data.username || item.data.phone;
      let targetUser = this.users.find(u => u.username === username || (item.data.userId && u.id === item.data.userId));
      if (targetUser && !targetUser.isActive) {
        targetUser.isActive = false;
      }
    }

    this.addAuditLog({
      userId: user.id,
      username: user.name,
      role: user.role,
      action: 'APPROVAL_REJECTED',
      target: item.id,
      details: `${user.name} (${user.role.toUpperCase()}) MENOLAK permohonan [${item.type}] "${item.title}". Alasan: ${reason || '-'}`,
      severity: 'WARNING'
    });

    this.addNotification({
      title: `Approval Ditolak: ${item.title}`,
      message: `Permohonan ditolak oleh ${user.name}. Alasan: ${reason || '-'}`,
      type: 'SYSTEM',
      targetUserId: item.data?.userId || item.requesterId
    });

    return item;
  }

  // ================= MODULE MANAGEMENT (#16) =================
  getModules() {
    return this.modules;
  }

  getModuleByKey(key) {
    return this.modules.find(m => m.key === key || m.id === parseInt(key, 10));
  }

  getModuleStats() {
    const total = this.modules.length;
    const active = this.modules.filter(m => m.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }

  toggleModule(idOrKey, targetStatus, performedBy = 'Admin', reason = '') {
    const mod = this.modules.find(m => m.id === parseInt(idOrKey, 10) || m.key === idOrKey);
    if (!mod) {
      throw new Error(`Modul dengan ID/Key '${idOrKey}' tidak ditemukan.`);
    }

    if (mod.isCore && targetStatus === false) {
      throw new Error(`Modul '${mod.name}' adalah modul sistem inti (Core Module) dan tidak dapat dinonaktifkan.`);
    }

    // Check dependency constraints when disabling
    if (targetStatus === false) {
      const dependentModules = this.modules.filter(m => m.isActive && m.dependencies && m.dependencies.includes(mod.key));
      if (dependentModules.length > 0) {
        const depNames = dependentModules.map(m => m.name).join(', ');
        throw new Error(`Tidak dapat menonaktifkan '${mod.name}' karena masih dibutuhkan oleh modul aktif: ${depNames}`);
      }
    }

    // Check prerequisite when enabling
    if (targetStatus === true && mod.dependencies && mod.dependencies.length > 0) {
      const missingDependencies = mod.dependencies.filter(depKey => {
        const requiredMod = this.modules.find(m => m.key === depKey);
        return !requiredMod || !requiredMod.isActive;
      });

      if (missingDependencies.length > 0) {
        const missingNames = missingDependencies.map(depKey => {
          const m = this.modules.find(item => item.key === depKey);
          return m ? m.name : depKey;
        }).join(', ');
        throw new Error(`Harap aktifkan modul prasyarat terlebih dahulu: ${missingNames}`);
      }
    }

    const previousState = mod.isActive;
    mod.isActive = targetStatus;

    // Create backup snapshot when deactivating
    let snapshotId = null;
    let snapshotData = null;
    if (targetStatus === false) {
      snapshotId = `snap-${mod.key}-${Date.now()}`;
      snapshotData = this.createModuleSnapshot(mod.key);
      this.snapshots[snapshotId] = {
        id: snapshotId,
        moduleKey: mod.key,
        moduleName: mod.name,
        timestamp: new Date().toISOString(),
        data: snapshotData
      };
    }

    // Record audit history
    const historyItem = {
      id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      moduleId: mod.id,
      moduleKey: mod.key,
      moduleName: mod.name,
      action: targetStatus ? 'ACTIVATE' : 'DEACTIVATE',
      performedBy: typeof performedBy === 'string' ? performedBy : performedBy.name || 'Admin',
      performedByRole: typeof performedBy === 'object' && performedBy.role ? performedBy.role : 'admin',
      details: targetStatus 
        ? `Mengaktifkan modul ${mod.name}. Akses & hak permissions diperbarui.`
        : `Menonaktifkan modul ${mod.name}. Cadangan snapshot data dibuat (ID: ${snapshotId}).`,
      snapshotId: snapshotId,
      reason: reason || (targetStatus ? 'Diaktifkan oleh Administrator' : 'Dinonaktifkan oleh Administrator'),
      createdAt: new Date().toISOString()
    };
    this.history.unshift(historyItem);
    dbSync.persistModule(mod).catch(() => {});
    dbSync.persistModuleHistory(historyItem).catch(() => {});

    // Create system notification
    this.addNotification({
      title: `Status Modul Berubah: ${mod.name}`,
      message: `${historyItem.performedBy} telah ${targetStatus ? 'mengaktifkan' : 'menonaktifkan'} modul ${mod.name}.`,
      type: 'MODULE',
      targetRole: 'admin'
    });

    return {
      module: mod,
      historyItem,
      snapshotId
    };
  }

  createModuleSnapshot(moduleKey) {
    switch (moduleKey) {
      case 'products':
        return { products: this.products, categories: this.categories };
      case 'customers':
        return { customers: this.customers };
      case 'promos':
        return { promos: this.promos };
      case 'loyalty':
        return { loyaltyRewards: this.loyaltyRewards, customerPoints: this.customers.map(c => ({ id: c.id, name: c.name, points: c.points, tier: c.tier })) };
      case 'shifts':
        return { shifts: this.shifts };
      case 'employees':
        return { employees: this.employees };
      case 'payments':
        return { paymentMethods: this.paymentMethods };
      case 'inventory':
        return { inventoryLogs: this.inventoryLogs };
      case 'transactions':
        return { transactions: this.transactions };
      default:
        return { timestamp: new Date().toISOString(), note: 'General module state snapshot' };
    }
  }

  applyPreset(presetName, performedBy = 'Admin') {
    // Presets definition
    // Toko Retail (14 modul aktif): 1-3, 4-8, 10-13, 16 | nonaktif: 9 (Shift), 14 (Karyawan)
    // Restoran/Cafe (15 modul aktif): 1-13, 15, 16 | nonaktif: 14 (Karyawan)
    // Apotek (12 modul aktif): 1-3, 4, 5, 7, 8, 10, 12, 13, 15, 16 | nonaktif: 6 (Promo), 9 (Shift), 11 (Loyalty), 14 (Karyawan)
    // Full Enterprise: All 16 Active

    let activeKeys = [];
    if (presetName === 'retail') {
      // 14 Modul
      activeKeys = ['transactions', 'inventory', 'products', 'customers', 'payments', 'promos', 'reports', 'users', 'receipts', 'loyalty', 'settings', 'auth', 'notifications', 'module_management'];
    } else if (presetName === 'cafe') {
      // 15 Modul
      activeKeys = ['transactions', 'inventory', 'products', 'customers', 'payments', 'promos', 'reports', 'users', 'shifts', 'receipts', 'loyalty', 'settings', 'auth', 'notifications', 'module_management'];
    } else if (presetName === 'apotek') {
      // 12 Modul
      activeKeys = ['transactions', 'inventory', 'products', 'customers', 'payments', 'reports', 'users', 'receipts', 'settings', 'auth', 'notifications', 'module_management'];
    } else if (presetName === 'enterprise') {
      // All 16
      activeKeys = this.modules.map(m => m.key);
    } else {
      throw new Error(`Preset '${presetName}' tidak valid.`);
    }

    this.modules.forEach(m => {
      m.isActive = activeKeys.includes(m.key);
    });

    const historyItem = {
      id: `hist-preset-${Date.now()}`,
      moduleId: 16,
      moduleKey: 'module_management',
      moduleName: 'Manajemen Modul',
      action: 'PRESET_APPLIED',
      performedBy: typeof performedBy === 'string' ? performedBy : performedBy.name || 'Admin',
      performedByRole: 'admin',
      details: `Menerapkan konfigurasi preset bisnis: ${presetName.toUpperCase()} (${activeKeys.length} modul aktif).`,
      snapshotData: { preset: presetName, activeCount: activeKeys.length },
      createdAt: new Date().toISOString()
    };
    this.history.unshift(historyItem);

    return {
      preset: presetName,
      activeCount: activeKeys.length,
      modules: this.modules
    };
  }

  getHistory() {
    return this.history;
  }

  getSnapshot(snapshotId) {
    return this.snapshots[snapshotId] || null;
  }

  // ================= CATEGORIES & PRODUCTS (#3) =================
  createCategory(data) {
    if (!data.name || !data.name.trim()) throw new Error('Nama kategori wajib diisi');
    const name = data.name.trim();
    const slug = data.slug && data.slug.trim() 
      ? data.slug.trim().toLowerCase().replace(/[^a-z0-9]/g, '-') 
      : name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const existing = this.categories.find(c => c.name.toLowerCase() === name.toLowerCase() || c.slug === slug);
    if (existing) throw new Error(`Kategori "${name}" sudah ada`);

    const newCat = {
      id: data.id || `cat-${Date.now()}`,
      name,
      slug,
      icon: data.icon || 'Tag',
      color: data.color || '#10b981'
    };
    this.categories.push(newCat);
    dbSync.persistCategory(newCat).catch(() => {});
    return newCat;
  }

  updateCategory(id, data) {
    const cat = this.categories.find(c => c.id === id);
    if (!cat) throw new Error('Kategori tidak ditemukan');
    if (data.name && data.name.trim()) {
      cat.name = data.name.trim();
      cat.slug = cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }
    if (data.icon) cat.icon = data.icon;
    if (data.color) cat.color = data.color;
    dbSync.persistCategory(cat).catch(() => {});
    return cat;
  }

  deleteCategory(id) {
    const idx = this.categories.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Kategori tidak ditemukan');
    const prodsInCat = this.products.filter(p => p.categoryId === id);
    if (prodsInCat.length > 0) {
      throw new Error(`Kategori tidak dapat dihapus karena masih digunakan oleh ${prodsInCat.length} produk`);
    }
    const deleted = this.categories.splice(idx, 1)[0];
    dbSync.deleteCategoryFromDb(id).catch(() => {});
    return deleted;
  }

  getProducts(filters = {}) {
    let list = [...this.products];
    if (filters.categoryId) {
      list = list.filter(p => p.categoryId === filters.categoryId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.barcode && p.barcode.includes(q)));
    }
    if (filters.isActive !== undefined) {
      list = list.filter(p => p.isActive === (filters.isActive === 'true' || filters.isActive === true));
    }
    return list;
  }

  getProductById(id) {
    return this.products.find(p => p.id === id);
  }

  resolveCategory(categoryId, categoryName) {
    let name = (categoryName || '').trim();
    let id = categoryId;

    if (!name && id) {
      const found = this.categories.find(c => c.id === id);
      if (found) name = found.name;
    }

    if (name) {
      let cat = this.categories.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (!cat) {
        cat = this.createCategory({ name, color: '#10b981' });
      }
      return { id: cat.id, name: cat.name };
    }

    let defCat = this.categories[0];
    if (!defCat) {
      defCat = this.createCategory({ name: 'Makanan & Snack', color: '#10b981' });
    }
    return { id: defCat.id, name: defCat.name };
  }

  createProduct(data) {
    const cat = this.resolveCategory(data.categoryId, data.categoryName);
    const newProduct = {
      id: `prod-${Date.now()}`,
      sku: data.sku || `PRD-${String(this.products.length + 1).padStart(3, '0')}`,
      barcode: data.barcode || `${Date.now()}`,
      name: data.name,
      categoryId: cat.id,
      categoryName: cat.name,
      description: data.description || '',
      price: parseFloat(data.price) || 0,
      costPrice: parseFloat(data.costPrice) || 0,
      stock: parseInt(data.stock, 10) || 0,
      minStockAlert: parseInt(data.minStockAlert, 10) || 5,
      unit: data.unit || 'pcs',
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60',
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString()
    };
    this.products.unshift(newProduct);
    dbSync.persistProduct(newProduct).catch(() => {});

    // Add inventory log
    this.addInventoryLog({
      productId: newProduct.id,
      productName: newProduct.name,
      type: 'IN',
      quantity: newProduct.stock,
      stockBefore: 0,
      stockAfter: newProduct.stock,
      reason: 'Penambahan produk baru ke katalog'
    });

    return newProduct;
  }

  updateProduct(id, data) {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Produk tidak ditemukan');

    const prev = this.products[idx];
    let catUpdate = {};
    if (data.categoryId || data.categoryName) {
      const resolved = this.resolveCategory(data.categoryId, data.categoryName);
      catUpdate = { categoryId: resolved.id, categoryName: resolved.name };
    }

    const stockDiff = data.stock !== undefined ? parseInt(data.stock, 10) - prev.stock : 0;

    this.products[idx] = {
      ...prev,
      ...data,
      ...catUpdate,
      price: data.price !== undefined ? parseFloat(data.price) : prev.price,
      costPrice: data.costPrice !== undefined ? parseFloat(data.costPrice) : prev.costPrice,
      stock: data.stock !== undefined ? parseInt(data.stock, 10) : prev.stock,
      minStockAlert: data.minStockAlert !== undefined ? parseInt(data.minStockAlert, 10) : prev.minStockAlert,
      updatedAt: new Date().toISOString()
    };
    dbSync.persistProduct(this.products[idx]).catch(() => {});

    if (stockDiff !== 0) {
      this.addInventoryLog({
        productId: id,
        productName: this.products[idx].name,
        type: 'ADJUSTMENT',
        quantity: stockDiff,
        stockBefore: prev.stock,
        stockAfter: this.products[idx].stock,
        reason: 'Pembaruan stok via Edit Produk'
      });
    }

    return this.products[idx];
  }

  deleteProduct(id) {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Produk tidak ditemukan');
    const removed = this.products.splice(idx, 1)[0];
    dbSync.deleteProductFromDb(id).catch(() => {});
    return removed;
  }

  // ================= INVENTORY (#2) =================
  getInventory() {
    return this.products.map(p => ({
      id: p.id,
      sku: p.sku,
      barcode: p.barcode,
      name: p.name,
      categoryName: p.categoryName,
      stock: p.stock,
      minStockAlert: p.minStockAlert,
      unit: p.unit,
      costPrice: p.costPrice,
      price: p.price,
      isLowStock: p.stock <= p.minStockAlert,
      assetValue: p.stock * p.costPrice
    }));
  }

  adjustStock(productId, adjustmentQty, type, reason = '', user = 'Admin') {
    const prod = this.products.find(p => p.id === productId);
    if (!prod) throw new Error('Produk tidak ditemukan');

    const before = prod.stock;
    const qty = parseInt(adjustmentQty, 10);
    const after = type === 'OUT' || (type === 'ADJUSTMENT' && qty < 0) ? before - Math.abs(qty) : before + Math.abs(qty);

    if (after < 0) {
      throw new Error('Stok tidak mencukupi untuk pengurangan ini.');
    }

    prod.stock = after;
    dbSync.persistProduct(prod).catch(() => {});
    const log = this.addInventoryLog({
      productId: prod.id,
      productName: prod.name,
      type: type,
      quantity: qty,
      stockBefore: before,
      stockAfter: after,
      reason: reason || `Penyesuaian stok (${type})`,
      createdBy: user
    });

    if (prod.stock <= prod.minStockAlert) {
      this.addNotification({
        title: `Peringatan Stok Rendah: ${prod.name}`,
        message: `Stok sisa ${prod.stock} ${prod.unit} (Batas minimum: ${prod.minStockAlert})`,
        type: 'STOCK_ALERT',
        targetRole: 'admin'
      });
    }

    return { product: prod, log };
  }

  addInventoryLog(logData) {
    const log = {
      id: `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId: logData.productId,
      productName: logData.productName,
      type: logData.type,
      quantity: logData.quantity,
      stockBefore: logData.stockBefore,
      stockAfter: logData.stockAfter,
      reason: logData.reason || '',
      createdBy: logData.createdBy || 'System',
      createdAt: new Date().toISOString()
    };
    this.inventoryLogs.unshift(log);
    dbSync.persistInventoryLog(log).catch(() => {});
    return log;
  }

  getInventoryLogs() {
    return this.inventoryLogs;
  }

  // ================= TRANSACTIONS (#1) =================
  getTransactions(filters = {}) {
    let list = [...this.transactions];
    if (filters.status) {
      list = list.filter(t => t.status === filters.status);
    }
    if (filters.customerId) {
      list = list.filter(t => t.customerId === filters.customerId);
    }
    if (filters.shiftId) {
      list = list.filter(t => t.shiftId === filters.shiftId);
    }
    return list;
  }

  getTransactionById(idOrInvoice) {
    return this.transactions.find(t => t.id === idOrInvoice || t.invoiceNumber === idOrInvoice);
  }

  createTransaction(data, user) {
    if (user.role === 'customer') {
      return this.createCustomerOrder(data, user);
    }

    const invoiceNum = `INV/${new Date().toISOString().slice(0,10).replace(/-/g,'')}/${String(this.transactions.length + 1).padStart(4, '0')}`;
    
    // Validate stock and prepare items
    const items = data.items.map((item, idx) => {
      const prod = this.products.find(p => p.id === item.productId || p.id === item.id);
      if (prod) {
        if (prod.stock < item.quantity) {
          throw new Error(`Stok produk '${prod.name}' tidak mencukupi (sisa ${prod.stock}).`);
        }
        prod.stock -= item.quantity;
        dbSync.persistProduct(prod).catch(() => {});
        this.addInventoryLog({
          productId: prod.id,
          productName: prod.name,
          type: 'SALE',
          quantity: -item.quantity,
          stockBefore: prod.stock + item.quantity,
          stockAfter: prod.stock,
          reason: `Penjualan ${invoiceNum}`,
          createdBy: user.name
        });
      }
      return {
        id: `item-${Date.now()}-${idx}`,
        productId: item.productId || item.id,
        sku: item.sku || (prod ? prod.sku : ''),
        productName: item.name || (prod ? prod.name : 'Produk'),
        categoryName: item.categoryName || (prod ? prod.categoryName : ''),
        price: parseFloat(item.price),
        costPrice: prod ? prod.costPrice : 0,
        quantity: parseInt(item.quantity, 10),
        subtotal: parseFloat(item.price) * parseInt(item.quantity, 10),
        discount: parseFloat(item.discount || 0),
        total: (parseFloat(item.price) * parseInt(item.quantity, 10)) - parseFloat(item.discount || 0),
        notes: item.notes || ''
      };
    });

    // Calculate customer points & loyalty
    let pointsEarned = 0;
    if (data.customerId) {
      const cust = this.customers.find(c => c.id === data.customerId);
      if (cust) {
        // 1 point per 10k
        pointsEarned = Math.floor((data.totalAmount || 0) / 10000);
        cust.points = (cust.points || 0) - (parseInt(data.pointsUsed, 10) || 0) + pointsEarned;
        cust.totalSpent = (cust.totalSpent || 0) + (data.totalAmount || 0);
        cust.transactionCount = (cust.transactionCount || 0) + 1;

        // Upgrade tier if applicable
        if (cust.totalSpent > 5000000) cust.tier = 'Platinum';
        else if (cust.totalSpent > 2000000) cust.tier = 'Gold';
        else if (cust.totalSpent > 500000) cust.tier = 'Silver';
        dbSync.persistCustomer(cust).catch(() => {});
      }
    }

    // Update active shift stats if exists
    const activeShift = this.shifts.find(s => s.status === 'OPEN' && (s.cashierId === user.id || s.cashierName === user.name));
    if (activeShift) {
      activeShift.totalSales += parseFloat(data.totalAmount || 0);
      activeShift.transactionCount += 1;
      if (data.paymentMethod === 'CASH') {
        activeShift.cashSales += parseFloat(data.totalAmount || 0);
        activeShift.expectedCash += parseFloat(data.totalAmount || 0);
      } else {
        activeShift.nonCashSales += parseFloat(data.totalAmount || 0);
      }
      dbSync.persistShift(activeShift).catch(() => {});
    }

    const newTransaction = {
      id: `trx-${Date.now()}`,
      invoiceNumber: invoiceNum,
      shiftId: activeShift ? activeShift.id : null,
      cashierId: user.id,
      cashierName: user.name,
      customerId: data.customerId || null,
      customerName: data.customerName || (data.customerId ? this.customers.find(c => c.id === data.customerId)?.name : 'Pelanggan Umum (Guest)'),
      subtotal: parseFloat(data.subtotal || 0),
      taxPercentage: parseFloat(data.taxPercentage || 11),
      taxAmount: parseFloat(data.taxAmount || 0),
      discountAmount: parseFloat(data.discountAmount || 0),
      promoCode: data.promoCode || null,
      pointsUsed: parseInt(data.pointsUsed, 10) || 0,
      pointsDiscount: parseFloat(data.pointsDiscount || 0),
      pointsEarned: pointsEarned,
      totalAmount: parseFloat(data.totalAmount || 0),
      paymentMethod: data.paymentMethod || 'CASH',
      paymentStatus: 'PAID',
      amountPaid: parseFloat(data.amountPaid || data.totalAmount),
      changeAmount: parseFloat(data.changeAmount || 0),
      itemsCount: items.length,
      status: 'COMPLETED',
      notes: data.notes || '',
      items: items,
      createdAt: new Date().toISOString()
    };

    this.transactions.unshift(newTransaction);
    dbSync.persistTransaction(newTransaction).catch(() => {});

    this.addNotification({
      title: `Transaksi Berhasil: ${newTransaction.invoiceNumber}`,
      message: `Pembayaran ${newTransaction.paymentMethod} senilai Rp ${newTransaction.totalAmount.toLocaleString('id-ID')} diterima.`,
      type: 'TRANSACTION',
      targetRole: 'admin'
    });

    this.addAuditLog({
      userId: user.id,
      username: user.name,
      role: user.role,
      action: 'TRANSACTION_CREATED',
      target: newTransaction.invoiceNumber,
      details: `Transaksi ${newTransaction.invoiceNumber} senilai Rp ${newTransaction.totalAmount.toLocaleString('id-ID')} (${items.length} item, Metode: ${newTransaction.paymentMethod})`,
      severity: 'INFO'
    });

    return newTransaction;
  }

  createCustomerOrder(data, user) {
    const customer = this.customers.find(c => c.id === data.customerId);
    if (!customer) throw new Error('Customer tidak ditemukan');
    const invoiceNum = `ORD/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/${String(this.transactions.length + 1).padStart(4, '0')}`;
    const items = data.items.map((item, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      productId: item.productId || item.id,
      sku: item.sku || '',
      productName: item.name || 'Produk',
      categoryName: item.categoryName || '',
      price: parseFloat(item.price),
      costPrice: 0,
      quantity: parseInt(item.quantity, 10),
      subtotal: parseFloat(item.price) * parseInt(item.quantity, 10),
      discount: parseFloat(item.discount || 0),
      total: (parseFloat(item.price) * parseInt(item.quantity, 10)) - parseFloat(item.discount || 0),
      notes: item.notes || ''
    }));
    const order = {
      id: `trx-${Date.now()}`,
      invoiceNumber: invoiceNum,
      shiftId: null,
      cashierId: null,
      cashierName: 'Menunggu diproses kasir',
      customerId: customer.id,
      customerName: customer.name,
      subtotal: parseFloat(data.subtotal || 0),
      taxPercentage: parseFloat(data.taxPercentage || 11),
      taxAmount: parseFloat(data.taxAmount || 0),
      discountAmount: parseFloat(data.discountAmount || 0),
      promoCode: data.promoCode || null,
      pointsUsed: parseInt(data.pointsUsed, 10) || 0,
      pointsDiscount: parseFloat(data.pointsDiscount || 0),
      pointsEarned: 0,
      totalAmount: parseFloat(data.totalAmount || 0),
      paymentMethod: data.paymentMethod || 'CASH',
      paymentStatus: 'PAID',
      amountPaid: parseFloat(data.amountPaid || data.totalAmount),
      changeAmount: parseFloat(data.changeAmount || 0),
      itemsCount: items.length,
      status: 'PENDING',
      notes: 'Pesanan online customer, menunggu diproses kasir',
      items,
      createdAt: new Date().toISOString(),
      createdByCustomerId: user.id
    };
    this.transactions.unshift(order);
    dbSync.persistTransaction(order).catch(() => {});
    this.addNotification({
      title: `Pesanan Customer Baru: ${order.invoiceNumber}`,
      message: `${customer.name} membuat pesanan senilai Rp ${order.totalAmount.toLocaleString('id-ID')}.`,
      type: 'TRANSACTION',
      targetRole: 'cashier'
    });
    this.addNotification({
      title: `Pesanan Berhasil: ${order.invoiceNumber}`,
      message: 'Pesanan diterima dan sedang menunggu diproses kasir.',
      type: 'TRANSACTION',
      targetUserId: user.id
    });
    return order;
  }

  processCustomerTransaction(id, user) {
    const trx = this.transactions.find(t => t.id === id || t.invoiceNumber === id);
    if (!trx) throw new Error('Transaksi tidak ditemukan');
    if (trx.status !== 'PENDING') throw new Error('Pesanan ini sudah diproses');
    trx.items.forEach(item => {
      const product = this.products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) throw new Error(`Stok produk '${item.productName}' tidak mencukupi`);
    });
    trx.items.forEach(item => {
      const product = this.products.find(p => p.id === item.productId);
      product.stock -= item.quantity;
      dbSync.persistProduct(product).catch(() => {});
      this.addInventoryLog({ productId: product.id, productName: product.name, type: 'SALE', quantity: -item.quantity, stockBefore: product.stock + item.quantity, stockAfter: product.stock, reason: `Pesanan ${trx.invoiceNumber}`, createdBy: user.name });
    });
    const customer = this.customers.find(c => c.id === trx.customerId);
    if (customer) {
      trx.pointsEarned = Math.floor(trx.totalAmount / 10000);
      customer.points = (customer.points || 0) - trx.pointsUsed + trx.pointsEarned;
      customer.totalSpent = (customer.totalSpent || 0) + trx.totalAmount;
      customer.transactionCount = (customer.transactionCount || 0) + 1;
      dbSync.persistCustomer(customer).catch(() => {});
    }
    const activeShift = this.shifts.find(s => s.status === 'OPEN' && (s.cashierId === user.id || user.role === 'admin'));
    if (activeShift) {
      activeShift.totalSales += trx.totalAmount;
      activeShift.transactionCount += 1;
      activeShift[trx.paymentMethod === 'CASH' ? 'cashSales' : 'nonCashSales'] += trx.totalAmount;
      if (trx.paymentMethod === 'CASH') activeShift.expectedCash += trx.totalAmount;
      trx.shiftId = activeShift.id;
      dbSync.persistShift(activeShift).catch(() => {});
    }
    trx.cashierId = user.id;
    trx.cashierName = user.name;
    trx.status = 'COMPLETED';
    trx.notes = 'Pesanan customer diproses kasir';
    dbSync.persistTransaction(trx).catch(() => {});
    this.addNotification({ title: `Pesanan Diproses: ${trx.invoiceNumber}`, message: `${user.name} telah memproses pesanan customer.`, type: 'SUCCESS', targetUserId: trx.createdByCustomerId });
    return trx;
  }

  voidTransaction(id, reason, user) {
    const trx = this.transactions.find(t => t.id === id || t.invoiceNumber === id);
    if (!trx) throw new Error('Transaksi tidak ditemukan');
    if (trx.status === 'VOID') throw new Error('Transaksi sudah dibatalkan sebelumnya');

    trx.status = 'VOID';
    trx.paymentStatus = 'VOID';
    trx.notes = (trx.notes ? trx.notes + ' | ' : '') + `VOID: ${reason} (by ${user.name})`;

    // Restore stock
    trx.items.forEach(item => {
      const prod = this.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock += item.quantity;
        dbSync.persistProduct(prod).catch(() => {});
        this.addInventoryLog({
          productId: prod.id,
          productName: prod.name,
          type: 'RETURN',
          quantity: item.quantity,
          stockBefore: prod.stock - item.quantity,
          stockAfter: prod.stock,
          reason: `Pembatalan (VOID) ${trx.invoiceNumber}: ${reason}`,
          createdBy: user.name
        });
      }
    });
    dbSync.persistTransaction(trx).catch(() => {});

    this.addAuditLog({
      userId: user.id,
      username: user.name,
      role: user.role,
      action: 'TRANSACTION_VOID',
      target: trx.invoiceNumber,
      details: `VOID transaksi senilai Rp ${trx.totalAmount.toLocaleString('id-ID')}. Alasan: ${reason}`,
      severity: 'WARNING'
    });

    return trx;
  }

  // ================= SHIFTS (#9) =================
  getActiveShift(user) {
    return this.shifts.find(s => s.status === 'OPEN' && (s.cashierId === user.id || user.role === 'admin')) || null;
  }

  getAllShifts() {
    return this.shifts;
  }

  openShift(startingCash, notes, user) {
    const existing = this.shifts.find(s => s.status === 'OPEN' && s.cashierId === user.id);
    if (existing) {
      throw new Error(`Anda sudah memiliki shift terbuka (${existing.shiftNumber}). Harap tutup shift sebelumnya.`);
    }

    const shiftNum = `SHF-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(this.shifts.length + 1).padStart(2, '0')}`;
    const startCash = parseFloat(startingCash) || 0;

    const newShift = {
      id: `shf-${Date.now()}`,
      shiftNumber: shiftNum,
      cashierId: user.id,
      cashierName: user.name,
      startTime: new Date().toISOString(),
      endTime: null,
      startingCash: startCash,
      expectedCash: startCash,
      actualCash: 0,
      difference: 0,
      totalSales: 0,
      transactionCount: 0,
      cashSales: 0,
      nonCashSales: 0,
      status: 'OPEN',
      notes: notes || 'Shift baru dibuka'
    };

    this.shifts.unshift(newShift);
    dbSync.persistShift(newShift).catch(() => {});

    this.addNotification({
      title: `Shift Kasir Dibuka (${shiftNum})`,
      message: `${user.name} memulai shift dengan modal kas awal Rp ${startCash.toLocaleString('id-ID')}`,
      type: 'SHIFT',
      targetUserId: user.id
    });

    this.addAuditLog({
      userId: user.id,
      username: user.name,
      role: user.role,
      action: 'SHIFT_OPEN',
      target: shiftNum,
      details: `Membuka shift kasir baru dengan modal awal Rp ${startCash.toLocaleString('id-ID')}`,
      severity: 'INFO'
    });

    return newShift;
  }

  closeShift(shiftId, actualCash, notes, user) {
    const shift = this.shifts.find(s => s.id === shiftId);
    if (!shift) throw new Error('Shift tidak ditemukan');
    if (shift.status === 'CLOSED') throw new Error('Shift sudah ditutup sebelumnya');

    const actual = parseFloat(actualCash) || 0;
    shift.actualCash = actual;
    shift.difference = actual - shift.expectedCash;
    shift.endTime = new Date().toISOString();
    shift.status = 'CLOSED';
    shift.notes = (shift.notes ? shift.notes + ' | ' : '') + (notes || 'Shift ditutup kasir');
    dbSync.persistShift(shift).catch(() => {});

    this.addNotification({
      title: `Shift Kasir Ditutup (${shift.shiftNumber})`,
      message: `${user.name} menutup shift. Total Penjualan: Rp ${shift.totalSales.toLocaleString('id-ID')}, Selisih Kas: Rp ${shift.difference.toLocaleString('id-ID')}`,
      type: 'SHIFT',
      targetRole: 'admin'
    });

    this.addAuditLog({
      userId: user.id,
      username: user.name,
      role: user.role,
      action: 'SHIFT_CLOSE',
      target: shift.shiftNumber,
      details: `Menutup shift kasir. Total Penjualan: Rp ${shift.totalSales.toLocaleString('id-ID')}, Kas Akhir: Rp ${actual.toLocaleString('id-ID')}, Selisih: Rp ${shift.difference.toLocaleString('id-ID')}`,
      severity: Math.abs(shift.difference) > 0 ? 'WARNING' : 'INFO'
    });

    return shift;
  }

  // ================= CUSTOMERS (#4) & LOYALTY (#11) =================
  getCustomers() {
    return this.customers;
  }

  getCustomerById(id) {
    return this.customers.find(c => c.id === id);
  }

  createCustomer(data) {
    const newCust = {
      id: `cust-${Date.now()}`,
      userId: data.userId || null,
      code: `MBR-${String(this.customers.length + 1).padStart(3, '0')}`,
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      tier: 'Bronze',
      points: parseInt(data.points, 10) || 0,
      totalSpent: 0,
      transactionCount: 0,
      createdAt: new Date().toISOString()
    };
    this.customers.push(newCust);
    dbSync.persistCustomer(newCust).catch(() => {});
    return newCust;
  }

  updateCustomer(id, data) {
    const idx = this.customers.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Customer tidak ditemukan');
    this.customers[idx] = { ...this.customers[idx], ...data };
    dbSync.persistCustomer(this.customers[idx]).catch(() => {});
    return this.customers[idx];
  }

  deleteCustomer(id) {
    const idx = this.customers.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Customer tidak ditemukan');
    const removed = this.customers.splice(idx, 1)[0];
    dbSync.deleteCustomerFromDb(id).catch(() => {});
    return removed;
  }

  getLoyaltyRewards() {
    return this.loyaltyRewards;
  }

  redeemReward(customerId, rewardId) {
    const cust = this.customers.find(c => c.id === customerId);
    const reward = this.loyaltyRewards.find(r => r.id === rewardId);
    if (!cust) throw new Error('Member tidak ditemukan');
    if (!reward) throw new Error('Reward tidak ditemukan');
    if (cust.points < reward.pointsCost) throw new Error(`Poin member tidak cukup (${cust.points} / ${reward.pointsCost})`);

    cust.points -= reward.pointsCost;
    dbSync.persistCustomer(cust).catch(() => {});
    return {
      success: true,
      message: `Berhasil menukarkan ${reward.pointsCost} poin dengan '${reward.title}'`,
      remainingPoints: cust.points,
      voucherCode: `RWD-${Date.now().toString().slice(-6)}`
    };
  }

  // ================= PROMOS (#6) =================
  getPromos() {
    return this.promos;
  }

  validatePromoCode(code, orderAmount = 0) {
    const promo = this.promos.find(p => p.code.toUpperCase() === code.toUpperCase() && p.isActive);
    if (!promo) {
      return { valid: false, message: 'Kode promo tidak ditemukan atau tidak aktif' };
    }
    if (orderAmount < promo.minOrderAmount) {
      return { valid: false, message: `Minimal belanja untuk promo ini adalah Rp ${promo.minOrderAmount.toLocaleString('id-ID')}` };
    }
    if (promo.usedCount >= promo.quota) {
      return { valid: false, message: 'Kuota penggunaan promo ini sudah habis' };
    }

    let discount = 0;
    if (promo.discountType === 'PERCENTAGE') {
      discount = (orderAmount * promo.discountValue) / 100;
      if (promo.maxDiscountAmount > 0 && discount > promo.maxDiscountAmount) {
        discount = promo.maxDiscountAmount;
      }
    } else {
      discount = promo.discountValue;
    }

    return {
      valid: true,
      promo,
      discountCalculated: discount,
      message: `Promo ${promo.name} berhasil diterapkan!`
    };
  }

  createPromo(data) {
    const newPromo = {
      id: `prm-${Date.now()}`,
      code: data.code.toUpperCase(),
      name: data.name,
      discountType: data.discountType || 'PERCENTAGE',
      discountValue: parseFloat(data.discountValue) || 0,
      minOrderAmount: parseFloat(data.minOrderAmount) || 0,
      maxDiscountAmount: parseFloat(data.maxDiscountAmount) || 0,
      quota: parseInt(data.quota, 10) || 100,
      usedCount: 0,
      validFrom: data.validFrom || new Date().toISOString(),
      validUntil: data.validUntil || '2026-12-31T23:59:59.000Z',
      isActive: true
    };
    this.promos.push(newPromo);
    dbSync.persistPromo(newPromo).catch(() => {});
    return newPromo;
  }

  togglePromo(id) {
    const promo = this.promos.find(p => p.id === id);
    if (!promo) throw new Error('Promo tidak ditemukan');
    promo.isActive = !promo.isActive;
    dbSync.persistPromo(promo).catch(() => {});
    return promo;
  }

  updatePromo(id, data) {
    const idx = this.promos.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Promo tidak ditemukan');
    const promo = this.promos[idx];
    if (data.code) promo.code = data.code.toUpperCase();
    if (data.name !== undefined) promo.name = data.name;
    if (data.discountType) promo.discountType = data.discountType;
    if (data.discountValue !== undefined) promo.discountValue = parseFloat(data.discountValue) || 0;
    if (data.minOrderAmount !== undefined) promo.minOrderAmount = parseFloat(data.minOrderAmount) || 0;
    if (data.maxDiscountAmount !== undefined) promo.maxDiscountAmount = parseFloat(data.maxDiscountAmount) || 0;
    if (data.quota !== undefined) promo.quota = parseInt(data.quota, 10) || promo.quota;
    if (data.validFrom) promo.validFrom = data.validFrom;
    if (data.validUntil) promo.validUntil = data.validUntil;
    if (data.isActive !== undefined) promo.isActive = data.isActive;
    this.promos[idx] = promo;
    dbSync.persistPromo(promo).catch(() => {});
    return promo;
  }

  deletePromo(id) {
    const idx = this.promos.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Promo tidak ditemukan');
    const [removed] = this.promos.splice(idx, 1);
    dbSync.deletePromo(removed.id).catch(() => {});
    return removed;
  }

  // ================= USERS (#8) & AUTH (#13) =================
  getUsers() {
    return this.users.map(({ password, ...rest }) => rest);
  }

  getUserById(id) {
    return this.users.find(u => u.id === id);
  }

  getUserByUsername(username) {
    return this.users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase());
  }

  createUser(data) {
    if (data.role === 'admin' || data.username.toLowerCase() === 'admin') {
      throw new Error('Hanya boleh ada 1 akun Administrator dalam sistem (username: admin dengan password P@ssw0rd)');
    }

    if (!data.phone || !data.phone.trim()) {
      throw new Error('Nomor telepon wajib diisi sebagai pembeda akun');
    }

    const cleanPhone = data.phone.replace(/\D/g, '');
    const phoneExists = this.users.some(u => u.phone && u.phone.replace(/\D/g, '') === cleanPhone);
    if (phoneExists) {
      throw new Error('Nomor telepon sudah digunakan oleh akun lain. Nomor telepon harus unik sebagai pembeda akun');
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      username: data.username.trim(),
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password, // hashed before passed
      role: data.role || 'cashier',
      phone: data.phone.trim(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    dbSync.persistUser(newUser).catch(() => {});
    const { password, ...safeUser } = newUser;
    return safeUser;
  }

  toggleUserStatus(id, currentUserId) {
    const user = this.users.find(u => u.id === id);
    if (!user) throw new Error('User tidak ditemukan');
    if (user.role === 'admin' && user.id === currentUserId) {
      throw new Error('Tidak dapat menonaktifkan akun admin yang sedang login');
    }
    user.isActive = !user.isActive;
    dbSync.persistUser(user).catch(() => {});
    return user;
  }

  // ================= PAYMENTS (#5) =================
  togglePaymentMethod(id) {
    const method = this.paymentMethods.find(m => m.id === id);
    if (!method) throw new Error('Metode pembayaran tidak ditemukan');
    method.isActive = !method.isActive;
    dbSync.persistPaymentMethod(method).catch(() => {});
    return method;
  }

  createPaymentMethod(data) {
    const newMethod = {
      id: `pay-${Date.now()}`,
      code: data.code.toUpperCase(),
      name: data.name,
      category: data.category || 'CASH',
      feePercentage: parseFloat(data.feePercentage) || 0,
      feeFixed: parseFloat(data.feeFixed) || 0,
      icon: data.icon || 'CreditCard',
      isActive: true,
      instructions: data.instructions || ''
    };
    this.paymentMethods.push(newMethod);
    dbSync.persistPaymentMethod(newMethod).catch(() => {});
    return newMethod;
  }

  // ================= EMPLOYEES (#14) =================
  getEmployees() {
    if (!this.employees || this.employees.length === 0) {
      this.employees = JSON.parse(JSON.stringify(initialData.initialEmployees));
    }
    return this.employees;
  }

  getEmployeeById(id) {
    return this.employees.find(e => e.id === id);
  }

  clockInEmployee(id) {
    const emp = this.employees.find(e => e.id === id);
    if (!emp) throw new Error('Karyawan tidak ditemukan');
    const now = new Date();
    emp.todayAttendance = 'HADIR';
    emp.clockInTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    dbSync.persistEmployee(emp).catch(() => {});
    return emp;
  }

  clockOutEmployee(id) {
    const emp = this.employees.find(e => e.id === id);
    if (!emp) throw new Error('Karyawan tidak ditemukan');
    const now = new Date();
    emp.clockOutTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    dbSync.persistEmployee(emp).catch(() => {});
    return emp;
  }

  createEmployee(data) {
    const newEmp = {
      id: `emp-${Date.now()}`,
      employeeCode: data.employeeCode || `EMP-${String(this.employees.length + 1).padStart(3, '0')}`,
      name: data.name,
      position: data.position || 'Staff Operasional',
      department: data.department || 'Operasional',
      phone: data.phone || '',
      email: data.email || '',
      basicSalary: parseFloat(data.basicSalary) || 3500000,
      allowance: parseFloat(data.allowance) || 500000,
      commissionRate: parseFloat(data.commissionRate) || 1.5,
      todayAttendance: data.todayAttendance || 'BELUM_ABSEN',
      clockInTime: null,
      clockOutTime: null,
      avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      joinDate: data.joinDate || new Date().toISOString().slice(0, 10),
      bankAccount: data.bankAccount || '',
      status: 'ACTIVE'
    };
    this.employees.push(newEmp);
    dbSync.persistEmployee(newEmp).catch(() => {});
    return newEmp;
  }

  updateEmployee(id, data) {
    const idx = this.employees.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Karyawan tidak ditemukan');
    this.employees[idx] = { ...this.employees[idx], ...data };
    dbSync.persistEmployee(this.employees[idx]).catch(() => {});
    return this.employees[idx];
  }

  deleteEmployee(id) {
    const idx = this.employees.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Karyawan tidak ditemukan');
    const deleted = this.employees.splice(idx, 1)[0];
    dbSync.deleteEmployeeFromDb(id).catch(() => {});
    return deleted;
  }

  // ================= NOTIFICATIONS (#15) =================
  getNotifications(user) {
    const role = user?.role || 'ALL';
    return this.notifications
      .filter(n => n.targetUserId === user?.id || (!n.targetUserId && (n.targetRole === 'ALL' || n.targetRole === role || role === 'admin')))
      .map(n => ({ ...n, isRead: n.readBy?.includes(user?.id) || false }));
  }

  addNotification(data) {
    const notif = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: data.title,
      message: data.message,
      type: data.type || 'TRANSACTION',
      targetRole: data.targetRole || 'ALL',
      targetUserId: data.targetUserId || null,
      readBy: [],
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(notif);
    dbSync.persistNotification(notif).catch(() => {});
    return notif;
  }

  markNotificationRead(id, userId) {
    const n = this.notifications.find(item => item.id === id);
    if (n && userId) {
      n.readBy = n.readBy || [];
      if (!n.readBy.includes(userId)) n.readBy.push(userId);
      dbSync.markNotificationReadInDb(id).catch(() => {});
    }
    return n;
  }

  // ================= SETTINGS (#12) & RECEIPT (#10) =================
  getSettings() {
    return this.settings;
  }

  updateSettings(data) {
    this.settings = { ...this.settings, ...data };
    dbSync.persistSettings(this.settings).catch(() => {});
    return this.settings;
  }

  // ================= REPORTS & ANALYTICS (#7) =================
  getReportSummary() {
    const completedTrx = this.transactions.filter(t => t.status === 'COMPLETED');
    const totalRevenue = completedTrx.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
    const totalTransactions = completedTrx.length;
    const totalProductsSold = completedTrx.reduce((sum, t) => sum + (t.itemsCount || 0), 0);
    
    // Total gross profit calculation
    let totalCost = 0;
    completedTrx.forEach(t => {
      if (t.items) {
        t.items.forEach(i => {
          totalCost += (i.costPrice || 0) * (i.quantity || 1);
        });
      }
    });
    const grossProfit = totalRevenue - totalCost;

    // Top selling products
    const productSalesMap = {};
    completedTrx.forEach(t => {
      if (t.items) {
        t.items.forEach(i => {
          if (!productSalesMap[i.productName]) {
            productSalesMap[i.productName] = { name: i.productName, qty: 0, revenue: 0 };
          }
          productSalesMap[i.productName].qty += i.quantity;
          productSalesMap[i.productName].revenue += i.total;
        });
      }
    });
    const topProducts = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

    // Payment methods breakdown
    const paymentBreakdown = {};
    completedTrx.forEach(t => {
      const pm = t.paymentMethod || 'OTHER';
      paymentBreakdown[pm] = (paymentBreakdown[pm] || 0) + t.totalAmount;
    });

    return {
      totalRevenue,
      totalTransactions,
      totalProductsSold,
      grossProfit,
      topProducts,
      paymentBreakdown,
      recentTransactions: completedTrx.slice(0, 10),
      moduleStats: this.getModuleStats()
    };
  }
}

const dataStore = new DataStore();
module.exports = dataStore;
