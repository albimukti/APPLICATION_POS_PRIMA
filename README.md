# 🛒 POS PRIMA INDONESIA - Sistem POS Multi-Role 16 Modul

Sistem Point of Sale (POS) modern terpadu yang dibangun dengan **Node.js Express (Backend)**, **React.js + Vite (Frontend)**, dan **PostgreSQL Database (`POS_PRIMA`)** dengan 3 Role (**Admin**, **Kasir**, **Customer**) serta fitur unggulan **Manajemen Modul (Module Management #16)**.

---

## 🗄️ Konfigurasi PostgreSQL

- **Nama Database**: `POS_PRIMA`
- **Username**: `postgres`
- **Password**: `P@ssw0rd`
- **Host**: `localhost`
- **Port**: `5432`

---

## 👥 Akun Demo & Hak Akses

| Role | Username | Password | Deskripsi |
|---|---|---|---|
| 👑 **Admin** | `admin` | `admin123` | Akses penuh 16 modul, kontrol modul (#16), manajemen user, laporan finansial |
| 💼 **Kasir** | `kasir` | `kasir123` | Terminal kasir POS, buka/tutup shift, pembayaran tunai/QRIS, cetak struk |
| 👤 **Customer** | `customer` | `cust123` | Portal member, cek poin loyalitas, riwayat transaksi & struk digital |

*(Tersedia tombol **Quick Role Switcher** di bagian atas navbar untuk pergantian peran 1-klik).*

---

## 📦 Daftar 16 Modul POS

1. **📦 Transaksi/Penjualan**: Checkout kasir, keranjang, multi-payment, cetak struk, void transaksi.
2. **📊 Inventori**: Daftar stok real-time, batas minimum alert, penyesuaian stok in/out, log mutasi.
3. **🏷️ Produk**: Katalog produk, barcode EAN-13, SKU, kategori, harga modal & jual.
4. **👥 Customer**: Data pelanggan, keanggotaan (member), akumulasi poin, tier membership.
5. **💰 Pembayaran**: Tunai (kembalian otomatis), QRIS dinamis, Kartu EDC, Transfer, E-Wallet.
6. **🎁 Diskon/Promo**: Kode voucher promo, diskon %, nominal, minimal belanja, kuota.
7. **📈 Laporan**: Laporan omset penjualan, estimasi laba kotor, performa kasir per shift, ekspor CSV.
8. **🔐 Manajemen User**: Kelola akun kasir/admin, assign role, aktivasi/blokir akun.
9. **⏰ Shift/Kasir**: Buka shift modal awal, tutup shift kasir, rekonsiliasi kas fisik & selisih kas.
10. **🧾 Struk/Invoice**: Kustomisasi template struk toko, simulator cetak thermal 58/80mm.
11. **⭐ Loyalty**: Program poin belanja, reward katalog penukaran voucher belanja.
12. **⚙️ Pengaturan**: Profil toko, PPN 11%, status database PostgreSQL, unduh backup JSON.
13. **🔑 Login**: Autentikasi JWT, password hashing bcrypt, 1-klik demo switcher.
14. **👨‍💼 Karyawan**: Data staf, jabatan, basic salary, komisi, simulator presensi clock-in/out.
15. **🔔 Notifikasi**: Pusat peringatan stok menipis, promo aktif, status shift, audit sistem.
16. **🎛️ Manajemen Modul**: Kontrol aktivasi 16 modul, backup snapshot otomatis, diagram alur, preset bisnis (Retail, Cafe, Apotek).

---

## 🚀 Cara Menjalankan

### Backend:
```bash
cd backend
node server.js
```
*(Backend berjalan di port 5000)*

### Frontend:
```bash
cd frontend
npm run dev
```
*(Frontend berjalan di `http://localhost:5173`)*
