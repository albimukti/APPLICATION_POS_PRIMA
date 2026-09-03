const { Pool, Client } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const poolConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'POS_PRIMA',
  password: process.env.DB_PASSWORD || 'P@ssw0rd',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  connectionTimeoutMillis: 2000,
};

let pool = null;
let isPostgresConnected = false;

async function ensureDatabaseExists() {
  const rootClient = new Client({
    user: poolConfig.user,
    host: poolConfig.host,
    password: poolConfig.password,
    port: poolConfig.port,
    database: 'postgres',
    connectionTimeoutMillis: 2000
  });

  try {
    await rootClient.connect();
    const res = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1 OR datname = $2`,
      [poolConfig.database, poolConfig.database.toLowerCase()]
    );
    if (res.rowCount === 0) {
      await rootClient.query(`CREATE DATABASE "${poolConfig.database}"`);
      console.log(`[Database] Database "${poolConfig.database}" berhasil dibuat di PostgreSQL.`);
    }
  } catch (e) {
    // quiet check if already exists or server not reachable
  } finally {
    try { await rootClient.end(); } catch (_) {}
  }
}

async function initPostgres() {
  return new Promise(async (resolve) => {
    try {
      await ensureDatabaseExists();

      pool = new Pool(poolConfig);
      pool.on('error', (err) => {
        // quiet error to prevent crash
      });

      pool.connect(async (err, client, release) => {
        if (err) {
          console.log(`[Database] Mode: In-Memory Fast Engine (PostgreSQL belum aktif di ${poolConfig.host}:${poolConfig.port} atau kredensial berbeda: ${err.message}).`);
          isPostgresConnected = false;
          resolve(false);
          return;
        }

        console.log(`[Database] ✅ Sukses terhubung ke PostgreSQL: ${poolConfig.database} (${poolConfig.host}:${poolConfig.port})`);
        isPostgresConnected = true;

        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        if (fs.existsSync(schemaPath)) {
          const schemaSql = fs.readFileSync(schemaPath, 'utf8');
          client.query(schemaSql, async (qErr) => {
            release();
            if (!qErr) {
              console.log(`[Database] ✅ Skema tabel PostgreSQL "${poolConfig.database}" berhasil disinkronkan.`);
            } else {
              console.warn(`[Database] Skema query notice:`, qErr.message);
            }
            try {
              const dataStore = require('../services/dataStore');
              await dataStore.initializeFromDb();
            } catch (initErr) {
              console.error('[Database] DataStore init error:', initErr.message);
            }
            resolve(true);
          });
        } else {
          release();
          try {
            const dataStore = require('../services/dataStore');
            await dataStore.initializeFromDb();
          } catch (initErr) {}
          resolve(true);
        }
      });
    } catch (e) {
      console.log('[Database] Mode: In-Memory Fast Engine.');
      isPostgresConnected = false;
      resolve(false);
    }
  });
}

function getPool() {
  return pool;
}

function getStatus() {
  return {
    isPostgresConnected,
    mode: isPostgresConnected ? `PostgreSQL Connected (${poolConfig.database})` : 'Hybrid Memory Engine (Ready for PG sync)',
    config: {
      host: poolConfig.host,
      port: poolConfig.port,
      database: poolConfig.database,
      user: poolConfig.user
    }
  };
}

module.exports = {
  initPostgres,
  getPool,
  getStatus
};
