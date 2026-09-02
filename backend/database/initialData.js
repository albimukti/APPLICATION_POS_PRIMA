const bcrypt = require('bcryptjs');

const salt = bcrypt.genSaltSync(10);
const adminPassword = bcrypt.hashSync('P@ssw0rd', salt);

const initialModules = [
  {
    id: 1,
    key: 'transactions',
    name: 'Transaksi/Penjualan',
    description: 'Checkout, keranjang belanja, hitung total, void/return, dan multi-payment',
    icon: 'ShoppingBag',
    category: 'Penjualan',
    isActive: true,
    isCore: true,
    dependencies: ['products', 'payments'],
    permissions: { admin: 'full', cashier: 'full', customer: 'none' }
  },
  {
    id: 2,
    key: 'inventory',
    name: 'Inventori & Stok',
    description: 'Daftar stok, adjustment, alert minimum, barang masuk/keluar & mutasi',
    icon: 'Layers',
    category: 'Logistik',
    isActive: true,
    isCore: false,
    dependencies: ['products'],
    permissions: { admin: 'full', cashier: 'read', customer: 'none' }
  },
  {
    id: 3,
    key: 'products',
    name: 'Produk & Katalog',
    description: 'Katalog produk, barcode SKU, kategori, harga modal & jual, upload gambar',
    icon: 'Tag',
    category: 'Master Data',
    isActive: true,
    isCore: true,
    dependencies: [],
    permissions: { admin: 'full', cashier: 'read', customer: 'read' }
  },
  {
    id: 4,
    key: 'customers',
    name: 'Customer & Member',
    description: 'Daftar pelanggan, profil, riwayat belanja, dan status tier member',
    icon: 'Users',
    category: 'Master Data',
    isActive: true,
    isCore: false,
    dependencies: [],
    permissions: { admin: 'full', cashier: 'full', customer: 'own' }
  },
  {
    id: 5,
    key: 'payments',
    name: 'Metode Pembayaran',
    description: 'Tunai, Kartu EDC, QRIS Dinamis, Transfer Bank, E-Wallet & Split Bill',
    icon: 'CreditCard',
    category: 'Keuangan',
    isActive: true,
    isCore: true,
    dependencies: [],
    permissions: { admin: 'full', cashier: 'full', customer: 'none' }
  },
  {
    id: 6,
    key: 'promos',
    name: 'Diskon & Promosi',
    description: 'Voucher kode promo, diskon persentase/nominal, kuota dan periode berlaku',
    icon: 'Gift',
    category: 'Marketing',
    isActive: true,
    isCore: false,
    dependencies: [],
    permissions: { admin: 'full', cashier: 'full', customer: 'read' }
  },
  {
    id: 7,
    key: 'reports',
    name: 'Laporan & Analitik',
    description: 'Laporan omset harian/bulanan, laba kotor, produk terlaris & kinerja kasir',
    icon: 'TrendingUp',
    category: 'Keuangan',
    isActive: true,
    isCore: false,
    dependencies: ['transactions'],
    permissions: { admin: 'full', cashier: 'own', customer: 'none' }
  },
  {
    id: 8,
    key: 'users',
    name: 'Manajemen User',
    description: 'Kelola akun user, assign role (Admin/Kasir/Customer), reset password & status',
    icon: 'ShieldCheck',
    category: 'Sistem',
    isActive: true,
    isCore: true,
    dependencies: [],
    permissions: { admin: 'full', cashier: 'none', customer: 'none' }
  },
  {
    id: 9,
    key: 'shifts',
    name: 'Shift & Kasir',
    description: 'Buka shift, tutup shift, hitung uang fisik kas, audit selisih kas & laporan shift',
    icon: 'Clock',
    category: 'Operasional',
    isActive: true,
    isCore: false,
    dependencies: ['transactions'],
    permissions: { admin: 'full', cashier: 'full', customer: 'none' }
  },
  {
    id: 10,
    key: 'receipts',
    name: 'Struk & Invoice',
    description: 'Cetak struk thermal 58/80mm, kustom template struk toko, QRIS & digital receipt',
    icon: 'Receipt',
    category: 'Penjualan',
    isActive: true,
    isCore: false,
    dependencies: ['transactions'],
    permissions: { admin: 'full', cashier: 'none', customer: 'none' }
  },
  {
    id: 11,
    key: 'loyalty',
    name: 'Loyalty & Poin',
    description: 'Program reward poin belanja, tier member (Bronze-Platinum), redeem potongan belanja',
    icon: 'Star',
    category: 'Marketing',
    isActive: true,
    isCore: false,
    dependencies: ['customers'],
    permissions: { admin: 'full', cashier: 'full', customer: 'full' }
  },
  {
    id: 12,
    key: 'settings',
    name: 'Pengaturan Toko',
    description: 'Konfigurasi nama toko, PPN/Pajak, mata uang, printer thermal, backup JSON',
    icon: 'Settings',
    category: 'Sistem',
    isActive: true,
    isCore: false,
    dependencies: [],
    permissions: { admin: 'full', cashier: 'none', customer: 'none' }
  },
  {
    id: 13,
    key: 'auth',
    name: 'Login & Autentikasi',
    description: 'Autentikasi JWT, ganti password, role switcher, dan keamanan sesi',
    icon: 'Key',
    category: 'Sistem',
    isActive: true,
    isCore: true,
    dependencies: [],
    permissions: { admin: 'full', cashier: 'full', customer: 'full' }
  },
  {
    id: 14,
    key: 'employees',
    name: 'Karyawan & Staf',
    description: 'Data staf karyawan, jadwal kerja, absensi clock-in/out, komisi penjualan',
    icon: 'Briefcase',
    category: 'SDM',
    isActive: true,
    isCore: false,
    dependencies: [],
    permissions: { admin: 'full', cashier: 'none', customer: 'none' }
  },
  {
    id: 15,
    key: 'notifications',
    name: 'Notifikasi Sistem',
    description: 'Pusat peringatan stok menipis, transaksi besar, promo aktif, dan audit sistem',
    icon: 'Bell',
    category: 'Operasional',
    isActive: true,
    isCore: false,
    dependencies: [],
    permissions: { admin: 'full', cashier: 'full', customer: 'own' }
  },
  {
    id: 16,
    key: 'module_management',
    name: 'Manajemen Modul',
    description: 'Kontrol aktivasi 16 modul, backup snapshot otomatis, audit log history & preset bisnis',
    icon: 'Sliders',
    category: 'Sistem',
    isActive: true,
    isCore: true,
    dependencies: [],
    permissions: { admin: 'full', cashier: 'none', customer: 'none' }
  }
];

const initialCategories = [
  { id: 'cat-1', name: 'Makanan & Snack', slug: 'makanan', icon: 'Utensils', color: '#f59e0b' },
  { id: 'cat-2', name: 'Minuman Segar', slug: 'minuman', icon: 'Coffee', color: '#06b6d4' },
  { id: 'cat-3', name: 'Sembako & Dapur', slug: 'sembako', icon: 'ShoppingBag', color: '#10b981' },
  { id: 'cat-4', name: 'Perawatan & Obat', slug: 'perawatan', icon: 'HeartPulse', color: '#ec4899' },
  { id: 'cat-5', name: 'Alat Tulis & Kantor', slug: 'atk', icon: 'BookOpen', color: '#8b5cf6' }
];

const initialProducts = [
  {
    id: 'prod-1',
    sku: 'PRD-001',
    barcode: '8992753123451',
    name: 'Kopi Arabika Gayo Single Origin 250g',
    categoryId: 'cat-2',
    categoryName: 'Minuman Segar',
    description: 'Biji kopi pilihan roasted medium dark aroma wangi khas Aceh Gayo',
    price: 65000,
    costPrice: 42000,
    stock: 50,
    minStockAlert: 10,
    unit: 'pck',
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=60',
    isActive: true
  },
  {
    id: 'prod-2',
    sku: 'PRD-002',
    barcode: '8992753123452',
    name: 'Matcha Latte Premium Cold Brew 350ml',
    categoryId: 'cat-2',
    categoryName: 'Minuman Segar',
    description: 'Minuman matcha asli Kyoto dengan susu segar creamy segar',
    price: 28000,
    costPrice: 16000,
    stock: 35,
    minStockAlert: 8,
    unit: 'btl',
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=60',
    isActive: true
  },
  {
    id: 'prod-3',
    sku: 'PRD-003',
    barcode: '8992753123453',
    name: 'Roti Sourdough Artisan Truffle Butter',
    categoryId: 'cat-1',
    categoryName: 'Makanan & Snack',
    description: 'Roti panggang alami fermentasi 24 jam dengan olesan butter premium',
    price: 35000,
    costPrice: 20000,
    stock: 25,
    minStockAlert: 5,
    unit: 'pcs',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
    isActive: true
  },
  {
    id: 'prod-4',
    sku: 'PRD-004',
    barcode: '8992753123454',
    name: 'Beras Organik Pandan Wangi 5kg',
    categoryId: 'cat-3',
    categoryName: 'Sembako & Dapur',
    description: 'Beras pulen wangi kualitas super panen petani lokal',
    price: 88000,
    costPrice: 72000,
    stock: 40,
    minStockAlert: 10,
    unit: 'sak',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60',
    isActive: true
  }
];

// Single fresh admin user with username: admin & password: P@ssw0rd
const initialUsers = [
  {
    id: 'usr-admin',
    username: 'admin',
    name: 'Administrator',
    email: 'admin@posprima.id',
    password: adminPassword,
    role: 'admin',
    phone: '081234567890',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

const initialCustomers = [];

const initialPromos = [
  {
    id: 'prm-1',
    code: 'DISKON10',
    name: 'Diskon Grand Opening 10%',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderAmount: 50000,
    maxDiscountAmount: 25000,
    quota: 100,
    usedCount: 0,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
    isActive: true
  }
];

const initialPaymentMethods = [
  { id: 'pay-1', code: 'CASH', name: 'Tunai / Cash', category: 'CASH', feePercentage: 0, feeFixed: 0, icon: 'Banknote', isActive: true, instructions: 'Terima uang fisik dan hitung kembalian' },
  { id: 'pay-2', code: 'QRIS', name: 'QRIS Dinamis', category: 'QRIS', feePercentage: 0.7, feeFixed: 0, icon: 'QrCode', isActive: true, instructions: 'Scan QRIS via BCA, GoPay, OVO, ShopeePay, DANA' },
  { id: 'pay-3', code: 'DEBIT', name: 'Debit / Kartu EDC', category: 'CARD', feePercentage: 0.15, feeFixed: 0, icon: 'CreditCard', isActive: true, instructions: 'Gesek / Dip kartu pada mesin EDC' },
  { id: 'pay-4', code: 'TRANSFER', name: 'Transfer Bank', category: 'TRANSFER', feePercentage: 0, feeFixed: 0, icon: 'Building2', isActive: true, instructions: 'Transfer rekening kas operasional' }
];

const initialShifts = [];
const initialTransactions = [];
const initialLoyaltyRewards = [
  { id: 'rew-1', title: 'Voucher Potongan Rp 10.000', description: 'Gunakan 100 poin untuk potongan langsung Rp 10.000', pointsCost: 100, rewardType: 'DISCOUNT_VOUCHER', rewardValue: 10000, isActive: true },
  { id: 'rew-2', title: 'Voucher Potongan Rp 30.000', description: 'Gunakan 250 poin untuk potongan langsung Rp 30.000', pointsCost: 250, rewardType: 'DISCOUNT_VOUCHER', rewardValue: 30000, isActive: true }
];
const initialEmployees = [
  {
    id: 'emp-1',
    employeeCode: 'EMP-001',
    name: 'Dimas Prasetyo',
    position: 'Store Supervisor',
    department: 'Manajemen',
    phone: '0812-8877-6655',
    email: 'dimas@posprima.id',
    basicSalary: 5500000,
    allowance: 750000,
    commissionRate: 2.5,
    todayAttendance: 'HADIR',
    clockInTime: '07:55',
    clockOutTime: null,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dimas',
    joinDate: '2023-03-15',
    bankAccount: 'BCA - 8820192831',
    status: 'ACTIVE'
  },
  {
    id: 'emp-2',
    employeeCode: 'EMP-002',
    name: 'Siti Nurhaliza',
    position: 'Senior Cashier & POS Lead',
    department: 'Kasir',
    phone: '0813-2233-4455',
    email: 'siti@posprima.id',
    basicSalary: 3800000,
    allowance: 500000,
    commissionRate: 1.5,
    todayAttendance: 'HADIR',
    clockInTime: '08:02',
    clockOutTime: null,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
    joinDate: '2023-08-01',
    bankAccount: 'Mandiri - 1370019283741',
    status: 'ACTIVE'
  },
  {
    id: 'emp-3',
    employeeCode: 'EMP-003',
    name: 'Bagus Wicaksono',
    position: 'Head Barista & Kitchen Chef',
    department: 'Dapur / Bar',
    phone: '0819-3344-5566',
    email: 'bagus@posprima.id',
    basicSalary: 4200000,
    allowance: 600000,
    commissionRate: 2.0,
    todayAttendance: 'HADIR',
    clockInTime: '07:45',
    clockOutTime: null,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bagus',
    joinDate: '2024-01-10',
    bankAccount: 'BRI - 020601058291504',
    status: 'ACTIVE'
  },
  {
    id: 'emp-4',
    employeeCode: 'EMP-004',
    name: 'Aulia Rahmawati',
    position: 'Staff Logistik & Inventory',
    department: 'Gudang',
    phone: '0857-1122-3344',
    email: 'aulia@posprima.id',
    basicSalary: 3500000,
    allowance: 400000,
    commissionRate: 1.0,
    todayAttendance: 'LIBUR',
    clockInTime: null,
    clockOutTime: null,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aulia',
    joinDate: '2024-05-12',
    bankAccount: 'BSI - 7182938471',
    status: 'ACTIVE'
  },
  {
    id: 'emp-5',
    employeeCode: 'EMP-005',
    name: 'Rian Kusuma',
    position: 'Junior Cashier / Crew',
    department: 'Kasir',
    phone: '0812-9988-7766',
    email: 'rian@posprima.id',
    basicSalary: 3200000,
    allowance: 400000,
    commissionRate: 1.0,
    todayAttendance: 'BELUM_ABSEN',
    clockInTime: null,
    clockOutTime: null,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rian',
    joinDate: '2024-07-20',
    bankAccount: 'BCA - 5420198231',
    status: 'ACTIVE'
  }
];
const initialNotifications = [];

const initialHistory = [
  {
    id: 'hist-1',
    moduleId: 16,
    moduleKey: 'module_management',
    moduleName: 'Manajemen Modul',
    action: 'SYSTEM_INIT',
    performedBy: 'Administrator',
    performedByRole: 'admin',
    details: 'Inisialisasi sistem baru POS PRIMA dengan 16 modul aktif dan database fresh siap pakai',
    snapshotData: { activeModulesCount: 16, totalModules: 16 },
    createdAt: new Date().toISOString()
  }
];

const initialSettings = {
  store: {
    name: 'POS PRIMA INDONESIA',
    tagline: 'Modern & Smart Point of Sale System',
    address: 'Jl. Jenderal Sudirman Kav. 52-53, Senayan, Jakarta Selatan',
    phone: '(021) 5790-1234 / 0812-3456-7890',
    email: 'admin@posprima.id',
    website: 'https://posprima.id',
    npwp: '01.234.567.8-012.000',
    taxPercentage: 11,
    currencySymbol: 'Rp',
    receiptHeader: 'Terima kasih atas kunjungan Anda!',
    receiptFooter: 'Barang yang sudah dibeli dapat ditukar maksimal 2x24 jam dengan membawa struk asli.',
    enableLoyalty: true,
    pointsPer10k: 1,
    pointValueInRp: 100,
    theme: 'light'
  }
};

module.exports = {
  initialModules,
  initialCategories,
  initialProducts,
  initialUsers,
  initialCustomers,
  initialPromos,
  initialPaymentMethods,
  initialShifts,
  initialTransactions,
  initialLoyaltyRewards,
  initialEmployees,
  initialNotifications,
  initialHistory,
  initialSettings
};
