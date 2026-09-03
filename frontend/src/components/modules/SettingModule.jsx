import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Settings,
  Store,
  Receipt,
  Percent,
  Star,
  Database,
  Save,
  CheckCircle2,
  Download,
  Server,
  Sparkles,
  ShoppingBag,
  Eye,
  Type,
  FileText,
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Link,
  Check,
  ShieldAlert,
  QrCode
} from 'lucide-react';

export default function SettingModule() {
  const { settings, updateSettings } = useSettings();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    appName: 'POS PRIMA',
    appSubtitle: 'INDONESIA POINT OF SALE',
    logoUrl: '',
    name: 'POS PRIMA INDONESIA',
    tagline: 'Sistem Kasir 16 Modul Terpadu',
    address: 'Jl. Jenderal Sudirman Kav. 52-53, Senayan, Jakarta Selatan',
    phone: '(021) 5790-1234 / 0812-3456-7890',
    email: 'info@posprima.co.id',
    website: 'https://posprima.co.id',
    npwp: '01.234.567.8-012.000',
    taxPercentage: 11,
    enableTax: true,
    qrisUrl: localStorage.getItem('pos_custom_qris_link') || '',
    currencySymbol: 'Rp',
    receiptHeader: 'Terima kasih atas kunjungan Anda!',
    receiptFooter: 'Barang yang sudah dibeli dapat ditukar maksimal 2x24 jam dengan membawa struk asli.',
    enableLoyalty: true,
    pointsPer10k: 1
  });

  const [dbStatus, setDbStatus] = useState({
    isPostgresConnected: true,
    mode: 'PostgreSQL Connected (POS_PRIMA)'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [activeTabSub, setActiveTabSub] = useState('branding'); // 'branding', 'store', 'qris_tax', 'receipt', 'system'

  useEffect(() => {
    if (settings?.store) {
      setFormData(prev => ({
        ...prev,
        ...settings.store,
        appName: settings.store.appName || 'POS PRIMA',
        appSubtitle: settings.store.appSubtitle || 'INDONESIA POINT OF SALE',
        logoUrl: settings.store.logoUrl || '',
        qrisUrl: settings.store.qrisUrl || localStorage.getItem('pos_custom_qris_link') || '',
        enableTax: settings.store.enableTax !== false,
        taxPercentage: settings.store.taxPercentage !== undefined ? settings.store.taxPercentage : 11
      }));
    }
  }, [settings]);

  useEffect(() => {
    async function checkDb() {
      try {
        const res = await api.getSettings();
        if (res.dbStatus) setDbStatus(res.dbStatus);
      } catch (e) {}
    }
    checkDb();
  }, []);

  // Handle Logo File Upload (reads into base64 Data URL)
  const handleLogoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar (PNG, JPG, SVG, WEBP).');
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal ukuran gambar adalah 2.5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      setFormData(prev => ({ ...prev, logoUrl: base64Data }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      if (formData.qrisUrl) {
        localStorage.setItem('pos_custom_qris_link', formData.qrisUrl.trim());
      } else {
        localStorage.removeItem('pos_custom_qris_link');
      }

      await updateSettings({
        store: {
          ...formData,
          taxPercentage: parseFloat(formData.taxPercentage) || 0,
          enableTax: formData.enableTax !== false,
          qrisUrl: formData.qrisUrl ? formData.qrisUrl.trim() : '',
          pointsPer10k: parseInt(formData.pointsPer10k, 10) || 1
        }
      });
      setSuccessMsg('Pengaturan toko, pajak & QRIS berhasil disimpan!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      alert(err.message || 'Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportBackup = () => {
    const fullBackup = {
      appName: formData.appName,
      exportDate: new Date().toISOString(),
      database: 'POS_PRIMA',
      store: formData,
      exportedBy: user?.name || 'Administrator'
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pos-backup-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Proteksi Akses: Hanya Admin yang bisa mengakses Pengaturan Toko
  if (user?.role !== 'admin') {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', maxWidth: '560px', margin: '40px auto' }} className="glass-panel">
        <ShieldAlert size={56} style={{ color: '#ef4444', margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
          Akses Terbatas (Khusus Admin)
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
          Halaman Pengaturan Toko (termasuk upload link QRIS, tarif pajak PPN, profil toko, dan konfigurasi database) hanya dapat diakses dan diubah oleh akun Administrator.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Top Header Card */}
      <div className="glass-panel" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-indigo">Modul #12</span>
            <span className="badge badge-success">Kustomisasi Logo & Identitas Aplikasi</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Profil Toko & Pengaturan Sistem
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Ubah logo brand toko, nama aplikasi POS, kontak, kebijakan struk thermal, dan sinkronisasi database.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={handleExportBackup} className="btn btn-secondary" style={{ gap: '6px' }}>
            <Download size={16} />
            <span>Ekspor Konfigurasi</span>
          </button>
          <button type="button" onClick={handleSubmit} disabled={isSaving} className="btn btn-primary" style={{ gap: '6px' }}>
            <Save size={16} />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#059669', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span style={{ fontWeight: 700 }}>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Form Left, Live Preview Right */}
      <div className="grid-responsive" style={{ gridTemplateColumns: 'minmax(400px, 1.35fr) minmax(320px, 0.65fr)', gap: '20px', alignItems: 'start' }}>
        
        {/* LEFT: SETTINGS TABS & FORM */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Sub Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-glass-strong)', paddingBottom: '14px', overflowX: 'auto' }}>
            <button
              type="button"
              onClick={() => setActiveTabSub('branding')}
              className={`btn ${activeTabSub === 'branding' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 14px', fontSize: '0.8125rem', gap: '6px' }}
            >
              <ImageIcon size={16} />
              <span>Logo & Nama Aplikasi</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTabSub('store')}
              className={`btn ${activeTabSub === 'store' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 14px', fontSize: '0.8125rem', gap: '6px' }}
            >
              <Store size={16} />
              <span>Profil Toko & Kontak</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTabSub('qris_tax')}
              className={`btn ${activeTabSub === 'qris_tax' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 14px', fontSize: '0.8125rem', gap: '6px' }}
            >
              <QrCode size={16} />
              <span>Pajak & QRIS Toko</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTabSub('receipt')}
              className={`btn ${activeTabSub === 'receipt' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 14px', fontSize: '0.8125rem', gap: '6px' }}
            >
              <Receipt size={16} />
              <span>Struk Thermal</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTabSub('system')}
              className={`btn ${activeTabSub === 'system' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 14px', fontSize: '0.8125rem', gap: '6px' }}
            >
              <Database size={16} />
              <span>Database PostgreSQL</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* TAB 1: BRANDING, LOGO & APP NAME */}
            {activeTabSub === 'branding' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.25)', fontSize: '0.8125rem', color: 'var(--indigo-500)' }}>
                   <b>Kustomisasi Logo & Identitas Brand</b>: Unggah logo toko Anda untuk menggantikan seluruh logo di Navbar, Sidebar, Halaman Login, Struk Kasir, dan Footer secara serentak.
                </div>

                {/* 1. UPLOAD LOGO SECTION */}
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-glass-strong)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
                    <ImageIcon size={16} style={{ color: 'var(--emerald-500)' }} />
                    <span>Logo Resmi Aplikasi & Toko:</span>
                  </label>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    {/* Current Logo Preview Box */}
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '12px',
                      background: 'var(--bg-secondary)',
                      border: '2px dashed var(--border-glass-strong)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: 'var(--shadow-sm)',
                      flexShrink: 0
                    }}>
                      {formData.logoUrl ? (
                        <img
                          src={formData.logoUrl}
                          alt="App Logo"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-subtle)', padding: '6px' }}>
                          <ShoppingBag size={28} style={{ color: 'var(--emerald-500)', margin: '0 auto 2px' }} />
                          <span style={{ fontSize: '0.625rem', display: 'block', fontWeight: 600 }}>Ikon Default</span>
                        </div>
                      )}
                    </div>

                    {/* Upload & Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Hidden file input */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleLogoFileUpload}
                          accept="image/png, image/jpeg, image/webp, image/svg+xml"
                          style={{ display: 'none' }}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="btn btn-primary"
                          style={{ padding: '8px 14px', fontSize: '0.8125rem', gap: '6px' }}
                        >
                          <Upload size={15} />
                          <span>Pilih & Unggah File Logo</span>
                        </button>

                        {formData.logoUrl && (
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="btn btn-danger"
                            style={{ padding: '8px 12px', fontSize: '0.8125rem', gap: '5px' }}
                            title="Hapus custom logo dan gunakan ikon default"
                          >
                            <Trash2 size={14} />
                            <span>Hapus Logo</span>
                          </button>
                        )}
                      </div>

                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Format yang didukung: <b>PNG (transparan disarankan)</b>, JPG, SVG, WEBP (Maksimal 2.5 MB).
                      </span>
                    </div>
                  </div>

                  {/* Direct Image URL input */}
                  <div className="form-group" style={{ marginBottom: 0, marginTop: '4px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Link size={13} /> Atau Masukkan URL Gambar Logo Online:
                    </label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://domain-anda.com/logo.png"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                {/* 2. APP NAME & SLOGAN */}
                <div className="form-group">
                  <label className="form-label">Nama Utama Aplikasi POS:</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    style={{ fontSize: '1.05rem', fontWeight: 700 }}
                    placeholder="Contoh: POS PRIMA / SIOMAY BROTHER 99 / CAFE BERKAH"
                    value={formData.appName}
                    onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Tampil pada header navbar, tab browser, dan halaman login utama.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Sub-Nama / Slogan / Subtitle:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: SIOMAY ASLI IKAN TENGGIRI / Smart Retail Point of Sale"
                    value={formData.appSubtitle}
                    onChange={(e) => setFormData({ ...formData, appSubtitle: e.target.value })}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Tampil sebagai teks pelengkap di bawah nama aplikasi pada header.
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: STORE PROFILE */}
            {activeTabSub === 'store' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Nama Resmi Toko / Badan Usaha:</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tagline Toko:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat Lengkap Toko:</label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="grid-responsive" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">No. Telepon / WhatsApp:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Support Toko:</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-responsive" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Website Toko (Opsional):</label>
                    <input
                      type="url"
                      className="form-input"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">NPWP Usaha (Opsional):</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.npwp}
                      onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: QRIS & PAJAK TOKO (KHUSUS ADMIN) */}
            {activeTabSub === 'qris_tax' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(0, 168, 107, 0.1)', border: '1px solid rgba(0, 168, 107, 0.3)', color: '#00a86b', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <QrCode size={20} />
                  <span>
                    <b>Pengaturan Pembayaran & Pajak Resmi Toko (Khusus Admin):</b> Konfigurasi link QRIS dan persentase pajak ini dikelola terpusat di sini dan otomatis diterapkan di kasir.
                  </span>
                </div>

                {/* 1. UPLOAD / ATUR LINK QRIS TOKO */}
                <div style={{
                  padding: '18px',
                  borderRadius: '12px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-glass-strong)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <QrCode size={18} style={{ color: 'var(--emerald-500)' }} />
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      1. Upload / Atur Link Gambar QRIS Toko
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Masukkan link URL gambar barcode QRIS toko Anda (misal dari link hosting gambar, Imgur, atau server Anda). Pelanggan dapat scan gambar QRIS ini saat pembayaran di kasir.
                  </p>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 700 }}>
                      URL Link Gambar QRIS:
                    </label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="Contoh: https://i.imgur.com/barcode-qris-toko.jpg atau https://domain.com/qris.png"
                      value={formData.qrisUrl}
                      onChange={(e) => setFormData({ ...formData, qrisUrl: e.target.value })}
                    />
                  </div>

                  {/* QRIS Live Preview Box */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    background: 'var(--bg-secondary)',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-glass)'
                  }}>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      background: '#ffffff',
                      borderRadius: '8px',
                      padding: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1.5px solid #00a86b',
                      flexShrink: 0
                    }}>
                      <img
                        src={formData.qrisUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=POS_PRIMA_DEMO_QRIS'}
                        alt="Preview QRIS"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                        onError={(e) => {
                          e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=POS_PRIMA_DEMO_QRIS';
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className={`badge ${formData.qrisUrl ? 'badge-success' : 'badge-indigo'}`}>
                          {formData.qrisUrl ? '● Menggunakan Link Custom' : '○ Menggunakan QR Dinamis Bawaan'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {formData.qrisUrl ? 'Gambar QRIS Siap Digunakan di Kasir' : 'Belum Ada Link Khusus (QR Dinamis Aktif)'}
                      </div>
                      {formData.qrisUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, qrisUrl: '' })}
                          className="btn btn-danger"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', marginTop: '8px' }}
                        >
                          Hapus Link QRIS
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. PENGATURAN TARIF PAJAK */}
                <div style={{
                  padding: '18px',
                  borderRadius: '12px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-glass-strong)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Percent size={18} style={{ color: 'var(--emerald-500)' }} />
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      2. Pengaturan Pajak Penjualan (PPN / PB1 / Tax)
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Tentukan persentase pajak yang dibebankan pada setiap transaksi penjualan saat checkout kasir.
                  </p>

                  <div className="grid-responsive" style={{ gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 700 }}>
                        Tarif Pajak (%):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        className="form-input"
                        value={formData.taxPercentage}
                        onChange={(e) => setFormData({ ...formData, taxPercentage: e.target.value })}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        Standar Indonesia: 11% (PPN) atau 10% (PB1 Resto)
                      </span>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 700 }}>
                        Status Penerapan Pajak:
                      </label>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-glass)',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.enableTax !== false}
                          onChange={(e) => setFormData({ ...formData, enableTax: e.target.checked })}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--emerald-500)' }}
                        />
                        <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {formData.enableTax !== false ? 'Pajak Aktif pada Checkout' : 'Pajak Dinonaktifkan (0%)'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: RECEIPT / STRUK */}
            {activeTabSub === 'receipt' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Simbol Mata Uang:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.currencySymbol}
                    onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pesan Header Struk Thermal:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.receiptHeader}
                    onChange={(e) => setFormData({ ...formData, receiptHeader: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Catatan Kebijakan Footer Struk:</label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    value={formData.receiptFooter}
                    onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* TAB 4: DATABASE & SYSTEM */}
            {activeTabSub === 'system' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Database size={24} style={{ color: 'var(--emerald-500)' }} />
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: 'var(--emerald-500)' }}>
                      {dbStatus.mode}
                    </h5>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Terkoneksi ke server PostgreSQL dengan data terisolasi & aman.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="submit" disabled={isSaving} className="btn btn-primary" style={{ padding: '10px 20px', gap: '6px' }}>
                <Save size={16} />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Konfigurasi'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: LIVE PREVIEW CARDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Live Preview Navbar Card */}
          <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <Eye size={14} />
              <span>Live Preview Header / Navbar</span>
            </div>

            <div style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-glass-strong)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="Preview Logo"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    border: '1px solid var(--border-glass-strong)'
                  }}
                />
              ) : (
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--emerald-500), var(--indigo-500))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  <ShoppingBag size={20} />
                </div>
              )}
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {formData.appName || 'POS PRIMA'}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--emerald-500)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {formData.appSubtitle || 'INDONESIA POINT OF SALE'}
                </div>
              </div>
            </div>
          </div>

          {/* Live Thermal Receipt Header Preview */}
          <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <Receipt size={14} />
              <span>Live Preview Header Struk Thermal</span>
            </div>

            <div style={{
              background: '#ffffff',
              color: '#000',
              padding: '16px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '11px',
              textAlign: 'center',
              border: '1px solid #cbd5e1'
            }}>
              {formData.logoUrl && (
                <img
                  src={formData.logoUrl}
                  alt="Receipt Logo"
                  style={{ maxHeight: '36px', maxWidth: '100px', objectFit: 'contain', margin: '0 auto 6px', display: 'block' }}
                />
              )}
              <div style={{ fontWeight: 800, fontSize: '13px' }}>
                {formData.name || formData.appName}
              </div>
              <div style={{ color: '#444', fontSize: '10px' }}>
                {formData.address}
              </div>
              <div style={{ color: '#444', fontSize: '10px' }}>
                {formData.phone}
              </div>
              <div style={{ borderTop: '1px dashed #666', margin: '8px 0' }} />
              <div style={{ fontSize: '9px', color: '#555' }}>
                {formData.receiptHeader}
              </div>
            </div>
          </div>

          {/* Live QRIS Barcode Preview */}
          <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <QrCode size={14} />
              <span>Live Preview Barcode QRIS Toko</span>
            </div>

            <div style={{
              background: '#ffffff',
              borderRadius: '10px',
              padding: '14px',
              textAlign: 'center',
              border: '1px solid #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}>
              <img
                src={formData.qrisUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=POS_PRIMA_DEMO_QRIS'}
                alt="QRIS Preview"
                style={{ width: '130px', height: '130px', objectFit: 'contain', display: 'block' }}
                onError={(e) => {
                  e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=POS_PRIMA_DEMO_QRIS';
                }}
              />
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b' }}>
                {formData.name || 'QRIS Merchant Resmi'}
              </div>
              <span className={`badge ${formData.qrisUrl ? 'badge-success' : 'badge-indigo'}`} style={{ fontSize: '0.7rem' }}>
                {formData.qrisUrl ? '● Menggunakan Link Gambar Admin' : '○ Menggunakan QR Dinamis Bawaan'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
