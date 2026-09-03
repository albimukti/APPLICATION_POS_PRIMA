const { Pool } = require('pg');
const initialData = require('../database/initialData');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'POS_PRIMA',
  password: process.env.DB_PASSWORD || 'P@ssw0rd',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function cleanseDatabase() {
  console.log('========================================================');
  console.log(' [POS PRIMA] MEMULAI CLEANSING TOTAL DATABASE POSTGRESQL');
  console.log('========================================================');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Truncate all operational, transactional, and demo tables
    console.log(' Mengosongkan tabel transaksi, shift, log, produk, kategori, pelanggan, promo...');
    await client.query(`
      TRUNCATE TABLE 
        transaction_items,
        transactions,
        shifts,
        inventory_logs,
        audit_logs,
        approvals,
        notifications,
        products,
        categories,
        customers,
        promo_codes,
        loyalty_rewards,
        employees
      CASCADE;
    `);

    // 2. Set the cleansing flag in system_settings
    console.log(' Menandai flag database_cleansed di system_settings...');
    await client.query(`
      INSERT INTO system_settings (key, value, description)
      VALUES (
        'database_cleansed', 
        $1, 
        'Flag tanda database telah di-cleansing total untuk pengetesan dari nol'
      )
      ON CONFLICT (key) DO UPDATE SET 
        value = EXCLUDED.value,
        updated_at = NOW();
    `, [JSON.stringify({ cleansed: true, timestamp: new Date().toISOString() })]);

    // 3. Ensure core users exist so login is always functional
    console.log(' Memastikan akun login utama siap (admin, kasir, customer)...');
    for (const u of initialData.initialUsers) {
      await client.query(`
        INSERT INTO users (id, username, name, email, password, role, phone, avatar, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          username = EXCLUDED.username,
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          password = EXCLUDED.password,
          role = EXCLUDED.role,
          is_active = EXCLUDED.is_active;
      `, [u.id, u.username, u.name, u.email, u.password, u.role, u.phone || '', u.avatar || '', u.isActive !== false]);
    }

    // 4. Ensure all 16 modules are active and configured
    console.log(' Memastikan 16 Modul POS PRIMA terpasang dan aktif...');
    for (const m of initialData.initialModules) {
      await client.query(`
        INSERT INTO modules (id, key, name, description, icon, category, is_active, is_core, dependencies)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          is_active = EXCLUDED.is_active;
      `, [m.id, m.key, m.name, m.description, m.icon, m.category, m.isActive, m.isCore, JSON.stringify(m.dependencies)]);
    }

    // 5. Ensure core payment methods exist
    console.log(' Memastikan metode pembayaran standar aktif (Cash, QRIS, Transfer, Debit)...');
    for (const pm of initialData.initialPaymentMethods) {
      await client.query(`
        INSERT INTO payment_methods (id, code, name, category, fee_percentage, fee_fixed, icon, is_active, instructions)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING;
      `, [pm.id, pm.code, pm.name, pm.category, pm.feePercentage, pm.feeFixed, pm.icon, pm.isActive, pm.instructions]);
    }

    // 6. Insert clean initial audit log
    console.log(' Menulis log audit inisialisasi awal...');
    await client.query(`
      INSERT INTO audit_logs (id, user_id, username, role, action, target, details, severity, ip)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      'audit-init-001',
      'usr-admin',
      'Administrator',
      'admin',
      'DATABASE_CLEANSED',
      'POS_PRIMA',
      'Database PostgreSQL berhasil dibersihkan total. Sistem dalam keadaan bersih (Clean Slate) siap dites dari awal.',
      'INFO',
      '127.0.0.1'
    ]);

    await client.query('COMMIT');
    console.log(' TRANSAKSI BERHASIL DI-COMMIT KE POSTGRESQL!\n');

    // 7. Verify Row Counts in PostgreSQL
    console.log(' REKAPITULASI DATA DALAM DATABASE SEKARANG:');
    const tables = [
      'products',
      'categories',
      'customers',
      'transactions',
      'transaction_items',
      'shifts',
      'inventory_logs',
      'promo_codes',
      'loyalty_rewards',
      'employees',
      'users',
      'modules',
      'payment_methods',
      'audit_logs'
    ];

    for (const tbl of tables) {
      const res = await client.query(`SELECT COUNT(*) FROM ${tbl}`);
      console.log(` - ${tbl.padEnd(20)}: ${res.rows[0].count} baris`);
    }

    console.log('\n========================================================');
    console.log(' DATABASE TELAH BERSIH TOTAL & SIAP PENGETESAN DARI NOL!');
    console.log('========================================================');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(' Terjadi kesalahan saat cleansing database:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanseDatabase();
