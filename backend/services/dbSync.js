const { getPool } = require('../config/db');

// Safe query helper
async function query(sql, params = []) {
  const pool = getPool();
  if (!pool) return { rows: [], rowCount: 0 };
  try {
    return await pool.query(sql, params);
  } catch (err) {
    console.error('[DBSync Query Error]:', err.message, 'SQL:', sql.slice(0, 100));
    return { rows: [], rowCount: 0 };
  }
}

// ─────────────────────────────────────────────────────────────
// 1. DDL Schema Verification & Migrations
// ─────────────────────────────────────────────────────────────
async function verifySchema() {
  await query(`
    ALTER TABLE employees ADD COLUMN IF NOT EXISTS avatar VARCHAR(255);
    ALTER TABLE employees ADD COLUMN IF NOT EXISTS allowance NUMERIC(12, 2) DEFAULT 0;
    ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_account VARCHAR(100);
    ALTER TABLE employees ADD COLUMN IF NOT EXISTS join_date VARCHAR(50);
    ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
    ALTER TABLE customers ADD COLUMN IF NOT EXISTS avatar VARCHAR(255);

    CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50),
        username VARCHAR(150),
        role VARCHAR(50),
        action VARCHAR(100) NOT NULL,
        target VARCHAR(150),
        details TEXT,
        severity VARCHAR(20) DEFAULT 'INFO',
        ip VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS approvals (
        id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        requester_name VARCHAR(150) NOT NULL,
        requester_role VARCHAR(50) NOT NULL,
        requester_id VARCHAR(50),
        data JSONB,
        status VARCHAR(50) DEFAULT 'PENDING',
        required_role VARCHAR(50) DEFAULT 'any',
        category VARCHAR(100),
        details TEXT,
        reviewed_by VARCHAR(150),
        reviewed_at TIMESTAMP,
        review_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// ─────────────────────────────────────────────────────────────
// 2. Auto-Seed Initial Data into PostgreSQL if Empty
// ─────────────────────────────────────────────────────────────
async function autoSeedDatabase(initialData) {
  const pool = getPool();
  if (!pool) return;

  await verifySchema();

  // Users: Ensure Admin, Kasir, and Customer exist
  for (const u of initialData.initialUsers) {
    await query(`
      INSERT INTO users (id, username, name, email, password, role, phone, avatar, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        phone = EXCLUDED.phone,
        avatar = EXCLUDED.avatar,
        is_active = EXCLUDED.is_active
    `, [u.id, u.username, u.name, u.email, u.password, u.role, u.phone || '', u.avatar || '', u.isActive !== false]);
  }

  // Check if database was cleansed for clean-slate testing
  const cleanFlag = await query("SELECT value FROM system_settings WHERE key = 'database_cleansed'");
  const isCleansed = cleanFlag.rows.length > 0;

  if (!isCleansed) {
    // Customers: Ensure initial customers exist
    for (const c of initialData.initialCustomers) {
      await query(`
        INSERT INTO customers (id, user_id, code, name, email, phone, address, tier, points, total_spent, transaction_count, is_active, avatar)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          points = EXCLUDED.points,
          tier = EXCLUDED.tier,
          total_spent = EXCLUDED.total_spent,
          transaction_count = EXCLUDED.transaction_count,
          is_active = EXCLUDED.is_active
      `, [c.id, c.userId, c.code, c.name, c.email || '', c.phone || '', c.address || '', c.tier || 'Silver', c.points || 0, c.totalSpent || 0, c.transactionCount || 0, c.isActive !== false, c.avatar || '']);
    }

    // Categories
    const catRes = await query('SELECT COUNT(*) FROM categories');
    if (parseInt(catRes.rows[0]?.count || '0', 10) === 0) {
      for (const cat of initialData.initialCategories) {
        await query(`
          INSERT INTO categories (id, name, slug, icon, color)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO NOTHING
        `, [cat.id, cat.name, cat.slug, cat.icon, cat.color]);
      }
    }

    // Products
    const prodRes = await query('SELECT COUNT(*) FROM products');
    if (parseInt(prodRes.rows[0]?.count || '0', 10) === 0) {
      for (const p of initialData.initialProducts) {
        await query(`
          INSERT INTO products (id, sku, barcode, name, category_id, category_name, description, price, cost_price, stock, min_stock_alert, unit, image_url, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (id) DO NOTHING
        `, [p.id, p.sku, p.barcode, p.name, p.categoryId, p.categoryName, p.description || '', p.price, p.costPrice || 0, p.stock, p.minStockAlert || 5, p.unit || 'pcs', p.imageUrl || '', p.isActive !== false]);
      }
    }
  }

  // Modules
  for (const m of initialData.initialModules) {
    await query(`
      INSERT INTO modules (id, key, name, description, icon, category, is_active, is_core, dependencies)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        icon = EXCLUDED.icon,
        category = EXCLUDED.category,
        is_core = EXCLUDED.is_core,
        dependencies = EXCLUDED.dependencies
    `, [m.id, m.key, m.name, m.description, m.icon, m.category, m.isActive, m.isCore, JSON.stringify(m.dependencies)]);
  }

  // Payment Methods
  const pmRes = await query('SELECT COUNT(*) FROM payment_methods');
  if (parseInt(pmRes.rows[0]?.count || '0', 10) === 0) {
    for (const pm of initialData.initialPaymentMethods) {
      await query(`
        INSERT INTO payment_methods (id, code, name, category, fee_percentage, fee_fixed, icon, is_active, instructions)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING
      `, [pm.id, pm.code, pm.name, pm.category, pm.feePercentage, pm.feeFixed, pm.icon, pm.isActive, pm.instructions]);
    }
  }

  if (!isCleansed) {
    // Promo Codes
    const prRes = await query('SELECT COUNT(*) FROM promo_codes');
    if (parseInt(prRes.rows[0]?.count || '0', 10) === 0) {
      for (const pr of initialData.initialPromos) {
        await query(`
          INSERT INTO promo_codes (id, code, name, discount_type, discount_value, min_order_amount, max_discount_amount, quota, used_count, valid_from, valid_until, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO NOTHING
        `, [pr.id, pr.code, pr.name, pr.discountType, pr.discountValue, pr.minOrderAmount, pr.maxDiscountAmount, pr.quota, pr.usedCount, pr.validFrom, pr.validUntil, pr.isActive]);
      }
    }

    // Loyalty Rewards
    const rewRes = await query('SELECT COUNT(*) FROM loyalty_rewards');
    if (parseInt(rewRes.rows[0]?.count || '0', 10) === 0) {
      for (const rew of initialData.initialLoyaltyRewards) {
        await query(`
          INSERT INTO loyalty_rewards (id, title, description, points_cost, reward_type, reward_value, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO NOTHING
        `, [rew.id, rew.title, rew.description, rew.pointsCost, rew.rewardType, rew.rewardValue, rew.isActive]);
      }
    }

    // Employees
    const empRes = await query('SELECT COUNT(*) FROM employees');
    if (parseInt(empRes.rows[0]?.count || '0', 10) === 0) {
      for (const emp of initialData.initialEmployees) {
        await query(`
          INSERT INTO employees (id, employee_code, name, position, department, phone, email, basic_salary, commission_rate, today_attendance, clock_in_time, clock_out_time, status, avatar, allowance, bank_account, join_date)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          ON CONFLICT (id) DO NOTHING
        `, [emp.id, emp.employeeCode, emp.name, emp.position, emp.department, emp.phone, emp.email, emp.basicSalary, emp.commissionRate, emp.todayAttendance, emp.clockInTime, emp.clockOutTime, emp.status, emp.avatar, emp.allowance || 0, emp.bankAccount || '', emp.joinDate || '']);
      }
    }
  }

  // System Settings
  await query(`
    INSERT INTO system_settings (key, value, description)
    VALUES ($1, $2, $3)
    ON CONFLICT (key) DO NOTHING
  `, ['store_settings', JSON.stringify(initialData.initialSettings.store), 'Pengaturan Utama Toko POS PRIMA']);

  console.log('[DBSync] PostgreSQL database tables auto-seeded and verified successfully.');
}

// ─────────────────────────────────────────────────────────────
// 3. Load All Data from PostgreSQL into Memory State
// ─────────────────────────────────────────────────────────────
async function loadAllData() {
  const pool = getPool();
  if (!pool) return null;

  try {
    const [
      usersRes,
      customersRes,
      categoriesRes,
      productsRes,
      modulesRes,
      historyRes,
      paymentRes,
      promosRes,
      loyaltyRes,
      employeesRes,
      shiftsRes,
      transactionsRes,
      itemsRes,
      notifRes,
      settingsRes,
      logsRes,
      auditRes,
      apprRes
    ] = await Promise.all([
      query('SELECT * FROM users ORDER BY created_at ASC'),
      query('SELECT * FROM customers ORDER BY created_at ASC'),
      query('SELECT * FROM categories ORDER BY id ASC'),
      query('SELECT * FROM products ORDER BY created_at ASC'),
      query('SELECT * FROM modules ORDER BY id ASC'),
      query('SELECT * FROM module_history ORDER BY created_at DESC LIMIT 50'),
      query('SELECT * FROM payment_methods ORDER BY id ASC'),
      query('SELECT * FROM promo_codes ORDER BY created_at ASC'),
      query('SELECT * FROM loyalty_rewards ORDER BY id ASC'),
      query('SELECT * FROM employees ORDER BY id ASC'),
      query('SELECT * FROM shifts ORDER BY start_time DESC'),
      query('SELECT * FROM transactions ORDER BY created_at DESC'),
      query('SELECT * FROM transaction_items ORDER BY id ASC'),
      query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100'),
      query('SELECT * FROM system_settings'),
      query('SELECT * FROM inventory_logs ORDER BY created_at DESC LIMIT 500'),
      query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 2000'),
      query('SELECT * FROM approvals ORDER BY created_at DESC')
    ]);

    // Map users
    const users = usersRes.rows.map(r => ({
      id: r.id,
      username: r.username,
      name: r.name,
      email: r.email,
      password: r.password,
      role: r.role,
      phone: r.phone || '',
      avatar: r.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.username}`,
      isActive: r.is_active,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
    }));

    // Map customers
    const customers = customersRes.rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      code: r.code,
      name: r.name,
      email: r.email || '',
      phone: r.phone || '',
      address: r.address || '',
      tier: r.tier || 'Silver',
      points: parseInt(r.points || 0, 10),
      totalSpent: parseFloat(r.total_spent || 0),
      transactionCount: parseInt(r.transaction_count || 0, 10),
      isActive: r.is_active !== false,
      avatar: r.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.phone || r.name}`,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
    }));

    // Map categories
    const categories = categoriesRes.rows.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      icon: r.icon,
      color: r.color
    }));

    // Map products
    const products = productsRes.rows.map(r => ({
      id: r.id,
      sku: r.sku,
      barcode: r.barcode || '',
      name: r.name,
      categoryId: r.category_id,
      categoryName: r.category_name,
      description: r.description || '',
      price: parseFloat(r.price || 0),
      costPrice: parseFloat(r.cost_price || 0),
      stock: parseInt(r.stock || 0, 10),
      minStockAlert: parseInt(r.min_stock_alert || 5, 10),
      unit: r.unit || 'pcs',
      imageUrl: r.image_url || '',
      isActive: r.is_active,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
    }));

    // Map modules
    const modules = modulesRes.rows.map(r => ({
      id: r.id,
      key: r.key,
      name: r.name,
      description: r.description,
      icon: r.icon,
      category: r.category,
      isActive: r.is_active,
      isCore: r.is_core,
      dependencies: Array.isArray(r.dependencies) ? r.dependencies : typeof r.dependencies === 'string' ? JSON.parse(r.dependencies || '[]') : [],
      permissions: {
        admin: 'full',
        cashier: ['transactions', 'shifts', 'products', 'inventory', 'customers', 'payments', 'promos', 'loyalty', 'reports', 'approvals'].includes(r.key) ? 'full' : 'none',
        customer: ['transactions', 'products', 'promos', 'loyalty'].includes(r.key) ? 'read' : 'none'
      }
    }));

    // Map module history
    const history = historyRes.rows.map(r => ({
      id: r.id,
      moduleId: r.module_id,
      moduleKey: r.module_key,
      moduleName: r.module_name,
      action: r.action,
      performedBy: r.performed_by,
      performedByRole: r.performed_by_role,
      details: r.details,
      snapshotData: r.snapshot_data,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
    }));

    // Map payment methods
    const paymentMethods = paymentRes.rows.map(r => ({
      id: r.id,
      code: r.code,
      name: r.name,
      category: r.category,
      feePercentage: parseFloat(r.fee_percentage || 0),
      feeFixed: parseFloat(r.fee_fixed || 0),
      icon: r.icon,
      isActive: r.is_active,
      instructions: r.instructions || ''
    }));

    // Map promos
    const promos = promosRes.rows.map(r => ({
      id: r.id,
      code: r.code,
      name: r.name,
      discountType: r.discount_type,
      discountValue: parseFloat(r.discount_value || 0),
      minOrderAmount: parseFloat(r.min_order_amount || 0),
      maxDiscountAmount: parseFloat(r.max_discount_amount || 0),
      quota: parseInt(r.quota || 0, 10),
      usedCount: parseInt(r.used_count || 0, 10),
      validFrom: r.valid_from,
      validUntil: r.valid_until,
      isActive: r.is_active
    }));

    // Map loyalty rewards
    const loyaltyRewards = loyaltyRes.rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      pointsCost: parseInt(r.points_cost || 0, 10),
      rewardType: r.reward_type,
      rewardValue: parseFloat(r.reward_value || 0),
      isActive: r.is_active
    }));

    // Map employees
    const employees = employeesRes.rows.map(r => ({
      id: r.id,
      employeeCode: r.employee_code,
      name: r.name,
      position: r.position,
      department: r.department,
      phone: r.phone || '',
      email: r.email || '',
      basicSalary: parseFloat(r.basic_salary || 0),
      allowance: parseFloat(r.allowance || 0),
      commissionRate: parseFloat(r.commission_rate || 0),
      todayAttendance: r.today_attendance || 'HADIR',
      clockInTime: r.clock_in_time,
      clockOutTime: r.clock_out_time,
      avatar: r.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.name}`,
      bankAccount: r.bank_account || '',
      joinDate: r.join_date || '',
      status: r.status || 'ACTIVE'
    }));

    // Map shifts
    const shifts = shiftsRes.rows.map(r => ({
      id: r.id,
      shiftNumber: r.shift_number,
      cashierId: r.cashier_id,
      cashierName: r.cashier_name,
      startTime: r.start_time ? new Date(r.start_time).toISOString() : new Date().toISOString(),
      endTime: r.end_time ? new Date(r.end_time).toISOString() : null,
      startingCash: parseFloat(r.starting_cash || 0),
      expectedCash: parseFloat(r.expected_cash || 0),
      actualCash: parseFloat(r.actual_cash || 0),
      difference: parseFloat(r.difference || 0),
      totalSales: parseFloat(r.total_sales || 0),
      transactionCount: parseInt(r.transaction_count || 0, 10),
      cashSales: parseFloat(r.cash_sales || 0),
      nonCashSales: parseFloat(r.non_cash_sales || 0),
      status: r.status || 'OPEN',
      notes: r.notes || ''
    }));

    // Map transaction items by transaction ID
    const itemsByTrx = {};
    itemsRes.rows.forEach(item => {
      if (!itemsByTrx[item.transaction_id]) itemsByTrx[item.transaction_id] = [];
      itemsByTrx[item.transaction_id].push({
        id: item.id,
        productId: item.product_id,
        sku: item.sku,
        productName: item.product_name,
        categoryName: item.category_name,
        price: parseFloat(item.price || 0),
        costPrice: parseFloat(item.cost_price || 0),
        quantity: parseInt(item.quantity || 1, 10),
        subtotal: parseFloat(item.subtotal || 0),
        discount: parseFloat(item.discount || 0),
        total: parseFloat(item.total || 0),
        notes: item.notes || ''
      });
    });

    // Map transactions
    const transactions = transactionsRes.rows.map(r => ({
      id: r.id,
      invoiceNumber: r.invoice_number,
      shiftId: r.shift_id,
      cashierId: r.cashier_id,
      cashierName: r.cashier_name,
      customerId: r.customer_id,
      customerName: r.customer_name,
      subtotal: parseFloat(r.subtotal || 0),
      taxPercentage: parseFloat(r.tax_percentage || 11),
      taxAmount: parseFloat(r.tax_amount || 0),
      discountAmount: parseFloat(r.discount_amount || 0),
      promoCode: r.promo_code,
      pointsUsed: parseInt(r.points_used || 0, 10),
      pointsDiscount: parseFloat(r.points_discount || 0),
      pointsEarned: parseInt(r.points_earned || 0, 10),
      totalAmount: parseFloat(r.total_amount || 0),
      paymentMethod: r.payment_method,
      paymentStatus: r.payment_status || 'PAID',
      amountPaid: parseFloat(r.amount_paid || 0),
      changeAmount: parseFloat(r.change_amount || 0),
      itemsCount: parseInt(r.items_count || 0, 10),
      status: r.status || 'COMPLETED',
      notes: r.notes || '',
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      items: itemsByTrx[r.id] || []
    }));

    // Map notifications
    const notifications = notifRes.rows.map(r => ({
      id: r.id,
      title: r.title,
      message: r.message,
      type: r.type,
      targetRole: r.target_role || 'ALL',
      isRead: !!r.is_read,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
    }));

    // Map settings
    let storeSettings = null;
    const sRow = settingsRes.rows.find(r => r.key === 'store_settings');
    if (sRow) {
      storeSettings = typeof sRow.value === 'string' ? JSON.parse(sRow.value) : sRow.value;
    }

    // Map inventory logs
    const inventoryLogs = logsRes.rows.map(r => ({
      id: r.id,
      productId: r.product_id,
      productName: r.product_name,
      type: r.type,
      quantity: parseInt(r.quantity || 0, 10),
      stockBefore: parseInt(r.stock_before || 0, 10),
      stockAfter: parseInt(r.stock_after || 0, 10),
      reason: r.reason || '',
      createdBy: r.created_by || '',
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
    }));

    // Map audit logs
    const auditLogs = auditRes.rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      username: r.username,
      role: r.role,
      action: r.action,
      target: r.target,
      details: r.details,
      severity: r.severity || 'INFO',
      ip: r.ip || '127.0.0.1',
      timestamp: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
    }));

    // Map approvals
    const approvals = apprRes.rows.map(r => ({
      id: r.id,
      type: r.type,
      title: r.title,
      requesterName: r.requester_name,
      requesterRole: r.requester_role,
      requesterId: r.requester_id,
      data: typeof r.data === 'string' ? JSON.parse(r.data || '{}') : r.data || {},
      status: r.status || 'PENDING',
      requiredRole: r.required_role || 'any',
      category: r.category || '',
      details: r.details || '',
      reviewedBy: r.reviewed_by,
      reviewedAt: r.reviewed_at ? new Date(r.reviewed_at).toISOString() : null,
      reviewNotes: r.review_notes || '',
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
    }));

    return {
      users,
      customers,
      categories,
      products,
      modules,
      history,
      paymentMethods,
      promos,
      loyaltyRewards,
      employees,
      shifts,
      transactions,
      notifications,
      storeSettings,
      inventoryLogs,
      auditLogs,
      approvals
    };
  } catch (err) {
    console.error('[DBSync Load Error]:', err.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// 4. Persistence Helpers (CRUD -> PostgreSQL)
// ─────────────────────────────────────────────────────────────

async function persistUser(user) {
  return query(`
    INSERT INTO users (id, username, name, email, password, role, phone, avatar, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      password = EXCLUDED.password,
      role = EXCLUDED.role,
      phone = EXCLUDED.phone,
      avatar = EXCLUDED.avatar,
      is_active = EXCLUDED.is_active,
      updated_at = CURRENT_TIMESTAMP
  `, [user.id, user.username, user.name, user.email, user.password, user.role, user.phone || '', user.avatar || '', user.isActive !== false]);
}

async function persistCustomer(customer) {
  return query(`
    INSERT INTO customers (id, user_id, code, name, email, phone, address, tier, points, total_spent, transaction_count, is_active, avatar)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      address = EXCLUDED.address,
      tier = EXCLUDED.tier,
      points = EXCLUDED.points,
      total_spent = EXCLUDED.total_spent,
      transaction_count = EXCLUDED.transaction_count,
      is_active = EXCLUDED.is_active,
      avatar = EXCLUDED.avatar
  `, [customer.id, customer.userId || null, customer.code || `CUST-${customer.id.slice(-4)}`, customer.name, customer.email || '', customer.phone || '', customer.address || '', customer.tier || 'Silver', customer.points || 0, customer.totalSpent || 0, customer.transactionCount || 0, customer.isActive !== false, customer.avatar || '']);
}

async function deleteCustomerFromDb(id) {
  return query('DELETE FROM customers WHERE id = $1', [id]);
}

async function persistProduct(product) {
  return query(`
    INSERT INTO products (id, sku, barcode, name, category_id, category_name, description, price, cost_price, stock, min_stock_alert, unit, image_url, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    ON CONFLICT (id) DO UPDATE SET
      sku = EXCLUDED.sku,
      barcode = EXCLUDED.barcode,
      name = EXCLUDED.name,
      category_id = EXCLUDED.category_id,
      category_name = EXCLUDED.category_name,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      cost_price = EXCLUDED.cost_price,
      stock = EXCLUDED.stock,
      min_stock_alert = EXCLUDED.min_stock_alert,
      unit = EXCLUDED.unit,
      image_url = EXCLUDED.image_url,
      is_active = EXCLUDED.is_active,
      updated_at = CURRENT_TIMESTAMP
  `, [product.id, product.sku, product.barcode || '', product.name, product.categoryId, product.categoryName, product.description || '', product.price, product.costPrice || 0, product.stock, product.minStockAlert || 5, product.unit || 'pcs', product.imageUrl || '', product.isActive !== false]);
}

async function deleteProductFromDb(id) {
  return query('DELETE FROM products WHERE id = $1', [id]);
}

async function persistTransaction(trx) {
  await query(`
    INSERT INTO transactions (id, invoice_number, shift_id, cashier_id, cashier_name, customer_id, customer_name, subtotal, tax_percentage, tax_amount, discount_amount, promo_code, points_used, points_discount, points_earned, total_amount, payment_method, payment_status, amount_paid, change_amount, items_count, status, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
    ON CONFLICT (id) DO UPDATE SET
      payment_status = EXCLUDED.payment_status,
      status = EXCLUDED.status,
      notes = EXCLUDED.notes
  `, [
    trx.id, trx.invoiceNumber, trx.shiftId || null, trx.cashierId || null, trx.cashierName || 'Kasir',
    trx.customerId || null, trx.customerName || '', trx.subtotal || 0, trx.taxPercentage || 11, trx.taxAmount || 0,
    trx.discountAmount || 0, trx.promoCode || null, trx.pointsUsed || 0, trx.pointsDiscount || 0, trx.pointsEarned || 0,
    trx.totalAmount || 0, trx.paymentMethod || 'CASH', trx.paymentStatus || 'PAID', trx.amountPaid || 0,
    trx.changeAmount || 0, trx.itemsCount || 0, trx.status || 'COMPLETED', trx.notes || ''
  ]);

  if (Array.isArray(trx.items)) {
    for (const item of trx.items) {
      await query(`
        INSERT INTO transaction_items (id, transaction_id, product_id, sku, product_name, category_name, price, cost_price, quantity, subtotal, discount, total, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO NOTHING
      `, [
        item.id || `${trx.id}-${Math.random().toString(36).slice(2, 7)}`,
        trx.id, item.productId || null, item.sku || '', item.productName || item.name || '',
        item.categoryName || '', item.price || 0, item.costPrice || 0, item.quantity || 1,
        item.subtotal || (item.price * item.quantity), item.discount || 0, item.total || (item.price * item.quantity),
        item.notes || ''
      ]);
    }
  }
}

async function persistShift(shift) {
  return query(`
    INSERT INTO shifts (id, shift_number, cashier_id, cashier_name, start_time, end_time, starting_cash, expected_cash, actual_cash, difference, total_sales, transaction_count, cash_sales, non_cash_sales, status, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    ON CONFLICT (id) DO UPDATE SET
      end_time = EXCLUDED.end_time,
      expected_cash = EXCLUDED.expected_cash,
      actual_cash = EXCLUDED.actual_cash,
      difference = EXCLUDED.difference,
      total_sales = EXCLUDED.total_sales,
      transaction_count = EXCLUDED.transaction_count,
      cash_sales = EXCLUDED.cash_sales,
      non_cash_sales = EXCLUDED.non_cash_sales,
      status = EXCLUDED.status,
      notes = EXCLUDED.notes
  `, [
    shift.id, shift.shiftNumber, shift.cashierId || null, shift.cashierName || 'Kasir',
    shift.startTime || new Date(), shift.endTime || null, shift.startingCash || 0,
    shift.expectedCash || 0, shift.actualCash || 0, shift.difference || 0,
    shift.totalSales || 0, shift.transactionCount || 0, shift.cashSales || 0,
    shift.nonCashSales || 0, shift.status || 'OPEN', shift.notes || ''
  ]);
}

async function persistPromo(promo) {
  return query(`
    INSERT INTO promo_codes (id, code, name, discount_type, discount_value, min_order_amount, max_discount_amount, quota, used_count, valid_from, valid_until, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (id) DO UPDATE SET
      code = EXCLUDED.code,
      name = EXCLUDED.name,
      discount_type = EXCLUDED.discount_type,
      discount_value = EXCLUDED.discount_value,
      quota = EXCLUDED.quota,
      used_count = EXCLUDED.used_count,
      is_active = EXCLUDED.is_active
  `, [
    promo.id, promo.code, promo.name, promo.discountType, promo.discountValue,
    promo.minOrderAmount || 0, promo.maxDiscountAmount || 0, promo.quota || 100,
    promo.usedCount || 0, promo.validFrom, promo.validUntil, promo.isActive !== false
  ]);
}

async function persistPaymentMethod(pm) {
  return query(`
    INSERT INTO payment_methods (id, code, name, category, fee_percentage, fee_fixed, icon, is_active, instructions)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      is_active = EXCLUDED.is_active,
      fee_percentage = EXCLUDED.fee_percentage,
      instructions = EXCLUDED.instructions
  `, [pm.id, pm.code, pm.name, pm.category, pm.feePercentage || 0, pm.feeFixed || 0, pm.icon || '', pm.isActive !== false, pm.instructions || '']);
}

async function persistEmployee(emp) {
  return query(`
    INSERT INTO employees (id, employee_code, name, position, department, phone, email, basic_salary, allowance, commission_rate, today_attendance, clock_in_time, clock_out_time, status, avatar, bank_account, join_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    ON CONFLICT (id) DO UPDATE SET
      employee_code = EXCLUDED.employee_code,
      name = EXCLUDED.name,
      position = EXCLUDED.position,
      department = EXCLUDED.department,
      phone = EXCLUDED.phone,
      email = EXCLUDED.email,
      basic_salary = EXCLUDED.basic_salary,
      allowance = EXCLUDED.allowance,
      commission_rate = EXCLUDED.commission_rate,
      today_attendance = EXCLUDED.today_attendance,
      clock_in_time = EXCLUDED.clock_in_time,
      clock_out_time = EXCLUDED.clock_out_time,
      status = EXCLUDED.status,
      avatar = EXCLUDED.avatar,
      bank_account = EXCLUDED.bank_account,
      join_date = EXCLUDED.join_date
  `, [
    emp.id, emp.employeeCode, emp.name, emp.position, emp.department || '',
    emp.phone || '', emp.email || '', emp.basicSalary || 0, emp.allowance || 0,
    emp.commissionRate || 0, emp.todayAttendance || 'HADIR', emp.clockInTime || null,
    emp.clockOutTime || null, emp.status || 'ACTIVE', emp.avatar || '',
    emp.bankAccount || '', emp.joinDate || ''
  ]);
}

async function deleteEmployeeFromDb(id) {
  return query('DELETE FROM employees WHERE id = $1', [id]);
}

async function persistModule(mod) {
  return query(`
    INSERT INTO modules (id, key, name, description, icon, category, is_active, is_core, dependencies)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (id) DO UPDATE SET
      is_active = EXCLUDED.is_active
  `, [mod.id, mod.key, mod.name, mod.description, mod.icon, mod.category, mod.isActive, mod.isCore, JSON.stringify(mod.dependencies || [])]);
}

async function persistModuleHistory(hist) {
  return query(`
    INSERT INTO module_history (id, module_id, module_key, module_name, action, performed_by, performed_by_role, details, snapshot_data)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (id) DO NOTHING
  `, [hist.id, hist.moduleId, hist.moduleKey, hist.moduleName, hist.action, hist.performedBy, hist.performedByRole, hist.details, JSON.stringify(hist.snapshotData || {})]);
}

async function persistSettings(settings) {
  return query(`
    INSERT INTO system_settings (key, value, description)
    VALUES ($1, $2, $3)
    ON CONFLICT (key) DO UPDATE SET
      value = EXCLUDED.value,
      updated_at = CURRENT_TIMESTAMP
  `, ['store_settings', JSON.stringify(settings.store || settings), 'Pengaturan Toko POS PRIMA']);
}

async function persistNotification(notif) {
  return query(`
    INSERT INTO notifications (id, title, message, type, target_role, is_read)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id) DO UPDATE SET
      is_read = EXCLUDED.is_read
  `, [notif.id, notif.title, notif.message, notif.type || 'SYSTEM', notif.targetRole || 'ALL', !!notif.isRead]);
}

async function markNotificationReadInDb(id) {
  return query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [id]);
}

async function persistInventoryLog(log) {
  return query(`
    INSERT INTO inventory_logs (id, product_id, product_name, type, quantity, stock_before, stock_after, reason, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (id) DO NOTHING
  `, [log.id, log.productId, log.productName, log.type, log.quantity, log.stockBefore, log.stockAfter, log.reason, log.createdBy]);
}

async function persistAuditLog(log) {
  return query(`
    INSERT INTO audit_logs (id, user_id, username, role, action, target, details, severity, ip)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (id) DO NOTHING
  `, [log.id, log.userId, log.username, log.role, log.action, log.target, log.details, log.severity || 'INFO', log.ip || '127.0.0.1']);
}

async function clearOldAuditLogsInDb(cutoffDate) {
  return query('DELETE FROM audit_logs WHERE created_at < $1', [cutoffDate]);
}

async function persistApproval(appr) {
  return query(`
    INSERT INTO approvals (id, type, title, requester_name, requester_role, requester_id, data, status, required_role, category, details, reviewed_by, reviewed_at, review_notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      reviewed_by = EXCLUDED.reviewed_by,
      reviewed_at = EXCLUDED.reviewed_at,
      review_notes = EXCLUDED.review_notes
  `, [
    appr.id, appr.type, appr.title, appr.requesterName, appr.requesterRole,
    appr.requesterId || null, JSON.stringify(appr.data || {}), appr.status || 'PENDING',
    appr.requiredRole || 'any', appr.category || '', appr.details || '',
    appr.reviewedBy || null, appr.reviewedAt || null, appr.reviewNotes || ''
  ]);
}

module.exports = {
  autoSeedDatabase,
  loadAllData,
  persistUser,
  persistCustomer,
  deleteCustomerFromDb,
  persistProduct,
  deleteProductFromDb,
  persistTransaction,
  persistShift,
  persistPromo,
  persistPaymentMethod,
  persistEmployee,
  deleteEmployeeFromDb,
  persistModule,
  persistModuleHistory,
  persistSettings,
  persistNotification,
  markNotificationReadInDb,
  persistInventoryLog,
  persistAuditLog,
  clearOldAuditLogsInDb,
  persistApproval
};
