# 🛒 POS PRIMA INDONESIA

> **Sistem Point of Sale (POS) Pintar, Multi-Role & Manajemen 16 Modul Terpadu**  
> Dibangun dengan **React + Vite** (Frontend), **Node.js Express** (Backend), dan database **PostgreSQL**.

---

## 🔑 Kredensial Login Master

| Akun | Username | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| 👑 **Administrator** | `admin` | `P@ssw0rd` | Akses penuh 16 Modul, Audit Log Kasir, dan Pusat Approval |

> ℹ️ **Catatan Registrasi Akun**:
> - **Pendaftaran Kasir Baru**: Memerlukan persetujuan (*approval*) dari Administrator sebelum dapat digunakan.
> - **Pendaftaran Member/Customer**: Dapat langsung aktif dan disetujui di meja kasir atau admin.

---

## ✨ Fitur Unggulan

- ⚡ **Terminal Kasir Kilat (POS)**: Multi-metode pembayaran (Tunai, QRIS Dinamis, EDC Kartu, Transfer) dengan cetak struk thermal & barcode scanner.
- 🛡️ **Pusat Persetujuan (Approval Center)**: Otorisasi terstruktur untuk pendaftaran kasir, registrasi member, diskon khusus, dan pembatalan transaksi (VOID).
- 📜 **Audit Log Aktivitas**: Pemantauan rekonsiliasi kasir, mutasi kas, login, dan pencatatan transaksi secara transparan.
- 📸 **Profil & Avatar Interaktif**: Pengaturan foto profil (unggah file komputer, galeri preset avatar, atau tautan URL) dan data pengguna.
- 🧩 **Kontrol 16 Modul**: Manajemen aktivasi modul, pencadangan snapshot otomatis, dan preset bisnis (Retail, Kafe, Apotek).

---

## 📋 Daftar 16 Modul Terintegrasi

| No | Modul | Deskripsi Singkat |
| :-: | :--- | :--- |
| 1 | 🛍️ **Transaksi/Penjualan** | Terminal POS checkout, keranjang, hitung kembalian, cetak struk & VOID |
| 2 | 📊 **Inventori & Stok** | Stok real-time, batas minimum alert, penyesuaian stok in/out & log mutasi |
| 3 | 🏷️ **Produk & Katalog** | Katalog produk, barcode SKU, kategori barang, harga modal & harga jual |
| 4 | 👥 **Customer & Member** | Data member, tier loyalitas (Bronze - Platinum), dan akumulasi poin |
| 5 | 💳 **Metode Pembayaran** | Pengaturan metode pembayaran tunai, QRIS, kartu EDC, transfer bank |
| 6 | 🎁 **Diskon & Promosi** | Kupon voucher promo, diskon nominal / persentase, dan kuota berlaku |
| 7 | 📈 **Laporan & Analitik** | Laporan omset penjualan harian/bulanan, laba kotor, dan performa kasir |
| 8 | 🔐 **Manajemen User** | Pengelolaan pengguna, assign role (Admin/Kasir/Customer), & status akun |
| 9 | ⏰ **Shift & Kasir** | Buka/tutup shift, hitung uang fisik kas, dan audit selisih kas operasional |
| 10 | 🧾 **Struk & Invoice** | Kustomisasi template struk toko, cetak thermal 58/80mm & struk digital |
| 11 | ⭐ **Loyalty & Reward** | Program penukaran poin belanja pelanggan dengan voucher reward |
| 12 | ⚙️ **Pengaturan Toko** | Profil identitas toko, logo aplikasi, pajak PPN 11%, dan backup JSON |
| 13 | 🔑 **Autentikasi Aman** | Login aman terenkripsi JWT bcrypt dilengkapi verifikasi CAPTCHA |
| 14 | 💼 **Karyawan & Staf** | Data staf karyawan, absensi kerja, gaji pokok, dan komisi penjualan |
| 15 | 🔔 **Notifikasi Sistem** | Peringatan stok menipis, promo baru aktif, dan log sistem |
| 16 | 🎛️ **Manajemen Modul** | Pusat kontrol saklar 16 modul, backup snapshot, & preset bisnis instan |

---

## 🚀 Cara Menjalankan Aplikasi

### Opsi A: Menggunakan Paket Siap Pakai (Paling Mudah)
Masuk ke folder `publish/` dan jalankan script:
- **Windows**: Dobel-klik file `start.bat`
- **Linux/VPS**: Jalankan `./start.sh` atau `npm start`
- Akses aplikasi di: **`http://localhost:5000`**

### Opsi B: Mode Pengembangan (Development)

1. **Jalankan Backend (Port 5000)**:
   ```bash
   cd backend
   npm install
   node server.js
   ```

2. **Jalankan Frontend (Port 5173)**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Buka browser di **`http://localhost:5173`**.

---

## 🗄️ Konfigurasi Database PostgreSQL (Opsional)

Jika ingin menghubungkan ke database PostgreSQL lokal:
- **Nama Database**: `POS_PRIMA`
- **User / Password**: `postgres` / `P@ssw0rd`
- **Host / Port**: `localhost:5432`

> 💡 *Sistem memiliki fitur auto-fallback ke in-memory engine yang tetap handal jika PostgreSQL belum terpasang.*

---

## 📁 Struktur Folder Project

```
POS/
├── backend/             # Source code REST API & database
├── frontend/            # Source code UI React + Vite
├── publish/             # Paket distribusi Fullstack (1 Port 5000) siap deploy
├── publish_frontend/    # Khusus build frontend statis (Vercel/Netlify/cPanel)
└── publish_backend/     # Khusus build backend API (VPS/Railway/Render)
```

---

© 2026 **POS PRIMA INDONESIA** — Hak Cipta Dilindungi.
