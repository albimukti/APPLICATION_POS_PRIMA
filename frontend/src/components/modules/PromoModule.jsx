import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatRupiah } from '../../utils/formatters';
import Modal from '../common/Modal';
import { Gift, Plus, CheckCircle2, Ticket, Sparkles } from 'lucide-react';

export default function PromoModule() {
  const { user } = useAuth();
  const [promos, setPromos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '50000',
    maxDiscountAmount: '25000',
    quota: '100'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const loadData = async () => {
    try {
      const res = await api.getPromos();
      if (res.success) setPromos(res.promos);
    } catch (err) {
      console.error('Failed to load promos:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createPromo(formData);
      setIsModalOpen(false);
      setFormData({ code: '', name: '', discountType: 'PERCENTAGE', discountValue: '', minOrderAmount: '50000', maxDiscountAmount: '25000', quota: '100' });
      setSuccessMsg('Voucher promo baru berhasil diterbitkan');
      loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message || 'Gagal membuat voucher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.togglePromo(id);
      loadData();
    } catch (err) {
      alert('Gagal mengubah status voucher');
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-indigo">Modul #6</span>
            <span className="badge badge-success">{promos.filter(p => p.isActive).length} Voucher Aktif</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
             Manajemen Diskon & Voucher Promo
          </h2>
        </div>

        {user?.role === 'admin' && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Buat Kode Promo Baru</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {promos.map(p => (
          <div key={p.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: p.isActive ? 1 : 0.6 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span className="badge badge-indigo" style={{ fontSize: '0.875rem', fontWeight: 800 }}>
                  <Ticket size={14} /> {p.code}
                </span>
                <span className={`badge ${p.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {p.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: 700 }}>{p.name}</h3>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emerald-500)', marginBottom: '8px' }}>
                {p.discountType === 'PERCENTAGE' ? `Diskon ${p.discountValue}%` : `Potongan ${formatRupiah(p.discountValue)}`}
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>Min. Belanja: <b>{formatRupiah(p.minOrderAmount)}</b></div>
                {p.maxDiscountAmount > 0 && <div>Maks. Diskon: <b>{formatRupiah(p.maxDiscountAmount)}</b></div>}
                <div>Terpakai: <b>{p.usedCount} / {p.quota} Kuota</b></div>
              </div>
            </div>

            {user?.role === 'admin' && (
              <div style={{ paddingTop: '14px', marginTop: '14px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleToggle(p.id)}
                  className={`btn ${p.isActive ? 'btn-danger' : 'btn-primary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                >
                  {p.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Add Promo */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Penerbitan Kode Promo Baru" maxWidth="500px" icon={Gift}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Kode Voucher (Kapital):</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Contoh: MERDEKA20"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nama Promo:</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Contoh: Diskon Kemerdekaan 20%"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Tipe Diskon:</label>
              <select
                className="form-select"
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              >
                <option value="PERCENTAGE">Persentase (%)</option>
                <option value="FIXED">Nominal Tetap (Rp)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Nilai Diskon:</label>
              <input
                type="number"
                required
                className="form-input"
                placeholder="Misal: 10 atau 20000"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Minimal Belanja (Rp):</label>
              <input
                type="number"
                className="form-input"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kuota Kupon:</label>
              <input
                type="number"
                className="form-input"
                value={formData.quota}
                onChange={(e) => setFormData({ ...formData, quota: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Menerbitkan...' : 'Terbitkan Voucher'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
