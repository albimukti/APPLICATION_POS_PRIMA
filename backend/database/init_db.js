const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'P@ssw0rd';
const targetDbName = process.env.DB_NAME || 'POS_PRIMA';

async function initializeDatabase() {
  console.log(`[DB Init] Menghubungkan ke PostgreSQL di ${dbHost}:${dbPort} dengan user '${dbUser}'...`);

  // 1. Connect to default 'postgres' database to check / create POS_PRIMA database
  const rootClient = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: 'postgres',
    connectionTimeoutMillis: 3000
  });

  try {
    await rootClient.connect();
    console.log('[DB Init] Berhasil terhubung ke server PostgreSQL root.');

    const checkRes = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1 OR datname = $2`,
      [targetDbName, targetDbName.toLowerCase()]
    );

    if (checkRes.rowCount === 0) {
      console.log(`[DB Init] Database "${targetDbName}" belum ada. Membuat database "${targetDbName}"...`);
      await rootClient.query(`CREATE DATABASE "${targetDbName}"`);
      console.log(`[DB Init] ✅ Database "${targetDbName}" berhasil dibuat!`);
    } else {
      console.log(`[DB Init] Database "${targetDbName}" sudah tersedia.`);
    }
  } catch (err) {
    console.warn(`[DB Init] Catatan saat cek/buat database: ${err.message}`);
  } finally {
    try {
      await rootClient.end();
    } catch (_) {}
  }

  // 2. Connect to the target database 'POS_PRIMA' and run schema DDL
  const targetClient = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: targetDbName,
    connectionTimeoutMillis: 3000
  });

  try {
    await targetClient.connect();
    console.log(`[DB Init] Terhubung ke database "${targetDbName}".`);

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await targetClient.query(schemaSql);
      console.log('[DB Init] ✅ Skema tabel (16 Modul POS) berhasil diimpor ke PostgreSQL.');
    }
  } catch (err) {
    console.warn(`[DB Init] Catatan koneksi "${targetDbName}": ${err.message}`);
  } finally {
    try {
      await targetClient.end();
    } catch (_) {}
  }
}

if (require.main === module) {
  initializeDatabase().then(() => {
    console.log('[DB Init] Inisialisasi database selesai.');
    process.exit(0);
  });
}

module.exports = { initializeDatabase };
