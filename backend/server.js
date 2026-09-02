const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initPostgres } = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-role']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'POS PRIMA INDONESIA REST API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Register all 16 Module Routes
app.use('/api/auth', require('./routes/auth.routes.js'));
app.use('/api/modules', require('./routes/module.routes.js')); // #16 Manajemen Modul
app.use('/api/products', require('./routes/product.routes.js')); // #3 Produk
app.use('/api/transactions', require('./routes/transaction.routes.js')); // #1 Transaksi
app.use('/api/inventory', require('./routes/inventory.routes.js')); // #2 Inventori
app.use('/api/customers', require('./routes/customer.routes.js')); // #4 Customer
app.use('/api/payments', require('./routes/payment.routes.js')); // #5 Pembayaran
app.use('/api/promos', require('./routes/promo.routes.js')); // #6 Diskon/Promo
app.use('/api/reports', require('./routes/report.routes.js')); // #7 Laporan
app.use('/api/users', require('./routes/user.routes.js')); // #8 Manajemen User
app.use('/api/shifts', require('./routes/shift.routes.js')); // #9 Shift/Kasir
app.use('/api/receipts', require('./routes/receipt.routes.js')); // #10 Struk
app.use('/api/loyalty', require('./routes/loyalty.routes.js')); // #11 Loyalty
app.use('/api/settings', require('./routes/setting.routes.js')); // #12 Pengaturan
app.use('/api/employees', require('./routes/employee.routes.js')); // #14 Karyawan
app.use('/api/notifications', require('./routes/notification.routes.js')); // #15 Notifikasi
app.use('/api/audit-logs', require('./routes/audit-logs.routes.js')); // Audit Log (Admin Only)
app.use('/api/approvals', require('./routes/approval.routes.js')); // Approval Center (Admin & Kasir)

// 404 handler for API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Endpoint '${req.originalUrl}' tidak ditemukan` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server & Database
async function startServer() {
  await initPostgres();
  const server = app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 POS Backend Server berjalan di http://localhost:${PORT}`);
    console.log(`📦 Siap melayani 16 Modul POS dengan RBAC (Admin, Kasir, Customer)`);
    console.log(`=================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Server Error] Port ${PORT} sedang digunakan. Harap pastikan tidak ada server backend lain yang berjalan.`);
    } else {
      console.error('[Server Error]', err);
    }
  });
}

startServer();
