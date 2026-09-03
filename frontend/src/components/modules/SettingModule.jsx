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
  Check
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
  const [activeTabSub, setActiveTabSub] = useState('branding'); // 'branding', 'store', 'receipt', 'system'

  useEffect(() => {
    if (settings?.store) {
      setFormData(prev => ({
        ...prev,
        ...settings.store,
        appName: settings.store.appName || 'POS PRIMA',
        appSubtitle: settings.store.appSubtitle || 'INDONESIA POINT OF SALE',
        logoUrl: settings.store.logoUrl || ''
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
      await updateSettings({
        store: {
          ...formData,
          taxPercentage: parseFloat(formData.taxPercentage) || 0,
          pointsPer10k: parseInt(formData.pointsPer10k, 10) || 1
        }
      });
      setSuccessMsg('Pengaturan logo, nama aplikasi & toko berhasil disimpan!');
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
              onClick={() => setActiveTabSub('receipt')}
              className={`btn ${activeTabSub === 'receipt' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 14px', fontSize: '0.8125rem', gap: '6px' }}
            >
              <Receipt size={16} />
              <span>Struk & Pajak</span>
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

            {/* TAB 3: RECEIPT & TAX */}
            {activeTabSub === 'receipt' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="grid-responsive" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Tarif Pajak PPN (%):</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={formData.taxPercentage}
                      onChange={(e) => setFormData({ ...formData, taxPercentage: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Simbol Mata Uang:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.currencySymbol}
                      onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                    />
                  </div>
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
        </div>
      </div>
    </div>
  );
}
