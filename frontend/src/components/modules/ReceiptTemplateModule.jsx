import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Receipt, Save, CheckCircle2, Eye, Printer, ShieldAlert } from 'lucide-react';

export default function ReceiptTemplateModule() {
  const { user } = useAuth();
  const [template, setTemplate] = useState({
    storeName: 'POS PRIMA INDONESIA',
    tagline: 'Smart & Modern POS System',
    address: 'Jl. Jenderal Sudirman Kav. 52-53, Senayan, Jakarta Selatan',
    phone: '(021) 5790-1234 / 0812-3456-7890',
    header: 'Terima kasih atas kunjungan Anda!',
    footer: 'Barang yang sudah dibeli dapat ditukar maksimal 2x24 jam dengan membawa struk asli.',
    taxPercentage: 11,
    currency: 'Rp'
  });
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    async function loadTemplate() {
      try {
        const res = await api.getReceiptTemplate();
        if (res.success && res.template) setTemplate(res.template);
      } catch (err) {
        console.error('Failed to load receipt template:', err);
      }
    }
    loadTemplate();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.updateSettings({
        store: {
          name: template.storeName,
          tagline: template.tagline,
          address: template.address,
          phone: template.phone,
          receiptHeader: template.header,
          receiptFooter: template.footer,
          taxPercentage: template.taxPercentage
        }
      });
      setSuccessMsg('Template struk toko berhasil diperbarui');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert('Gagal menyimpan template struk');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '650px', margin: '60px auto' }} className="glass-panel">
        <ShieldAlert size={56} style={{ color: 'var(--rose-500)', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--rose-500)', marginBottom: '8px' }}>
          Akses Ditolak: Khusus Administrator
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
          Fitur edit dan kustomisasi template struk toko hanya berhak diakses oleh <b>Administrator</b>. Kasir dan Customer dilarang mengubah pengaturan struk.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-indigo">Modul #10</span>
            <span className="badge badge-success">Thermal 58mm / 80mm</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
            🧾 Kustomisasi Template Struk & Invoice
          </h2>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Split: Editor Form & Live Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Left: Template Form */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>
            ⚙️ Pengaturan Teks Struk
          </h3>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Nama Toko / Usaha:</label>
              <input
                type="text"
                className="form-input"
                value={template.storeName}
                onChange={(e) => setTemplate({ ...template, storeName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Slogan Toko:</label>
              <input
                type="text"
                className="form-input"
                value={template.tagline}
                onChange={(e) => setTemplate({ ...template, tagline: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alamat Toko:</label>
              <input
                type="text"
                className="form-input"
                value={template.address}
                onChange={(e) => setTemplate({ ...template, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nomor Telepon Toko:</label>
              <input
                type="text"
                className="form-input"
                value={template.phone}
                onChange={(e) => setTemplate({ ...template, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pesan Header Struk:</label>
              <input
                type="text"
                className="form-input"
                value={template.header}
                onChange={(e) => setTemplate({ ...template, header: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pesan Footer / Syarat Penukaran:</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={template.footer}
                onChange={(e) => setTemplate({ ...template, footer: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
              <Save size={16} />
              <span>Simpan Template Struk</span>
            </button>
          </form>
        </div>

        {/* Right: Live Preview */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>
            👁️ Pratinjau Struk Thermal Langsung
          </h3>

          <div className="thermal-receipt" style={{ width: '100%', maxWidth: '340px' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <div style={{ fontWeight: 800, fontSize: '15px' }}>{template.storeName}</div>
              <div style={{ fontSize: '11px', color: '#555' }}>{template.tagline}</div>
              <div style={{ fontSize: '10px', color: '#666' }}>{template.address}</div>
              <div style={{ fontSize: '10px', color: '#666' }}>Telp: {template.phone}</div>
            </div>

            <div className="thermal-divider" />

            <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>No: INV/20260901/0042</span>
                <span>01 Sep 2026 14:30</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Kasir: Siti Nurhaliza</span>
                <span>Pelanggan: Umum</span>
              </div>
            </div>

            <div className="thermal-divider" />

            <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>2 x Kopi Arabika Gayo</span>
                <span>Rp 130.000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>1 x Croissant French</span>
                <span>Rp 24.000</span>
              </div>
            </div>

            <div className="thermal-divider" />

            <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>Rp 154.000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>PPN (11%):</span>
                <span>Rp 16.940</span>
              </div>
              <div className="thermal-divider-double" />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px' }}>
                <span>TOTAL:</span>
                <span>Rp 170.940</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Metode:</span>
                <span>QRIS Dinamis</span>
              </div>
            </div>

            <div className="thermal-divider" />

            <div style={{ textAlign: 'center', fontSize: '10px', color: '#555' }}>
              <div>{template.header}</div>
              <div style={{ marginTop: '4px' }}>{template.footer}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
