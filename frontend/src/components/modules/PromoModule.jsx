import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatRupiah } from '../../utils/formatters';
import Modal from '../common/Modal';
import {
  Gift, Plus, CheckCircle2, Ticket, Sparkles, Edit2, Trash2,
  Power, PowerOff, Search, Calendar, PercentSquare, Tag, AlertTriangle
} from 'lucide-react';

const EMPTY_FORM = {
  code: '',
  name: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minOrderAmount: '50000',
  maxDiscountAmount: '25000',
  quota: '100',
  validFrom: new Date().toISOString().slice(0, 10),
  validUntil: '2026-12-31',
};

function PromoFormModal({ isOpen, onClose, onSuccess, initialData }) {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        setFormData({
          code: initialData.code || '',
          name: initialData.name || '',
          discountType: initialData.discountType || 'PERCENTAGE',
          discountValue: String(initialData.discountValue ?? ''),
          minOrderAmount: String(initialData.minOrderAmount ?? '50000'),
          maxDiscountAmount: String(initialData.maxDiscountAmount ?? '25000'),
          quota: String(initialData.quota ?? '100'),
          validFrom: initialData.validFrom ? initialData.validFrom.slice(0, 10) : new Date().toISOString().slice(0, 10),
          validUntil: initialData.validUntil ? initialData.validUntil.slice(0, 10) : '2026-12-31',
        });
      } else {
        setFormData(EMPTY_FORM);
      }
      setError(null);
    }
  }, [isOpen, isEdit, initialData]);

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil + 'T23:59:59').toISOString(),
      };
      if (isEdit) {
        await api.updatePromo(initialData.id, payload);
      } else {
        await api.createPromo(payload);
      }
      onSuccess(isEdit ? 'Promo berhasil diperbarui!' : 'Voucher promo baru berhasil diterbitkan!');
      onClose();
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Promo: ${initialData?.code}` : 'Buat Kode Promo Baru'}
      maxWidth="540px"
      icon={isEdit ? Edit2 : Gift}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {error && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Kode Voucher:</label>
            <input type="text" required className="form-input" placeholder="Contoh: MERDEKA20"
              value={formData.code} onChange={e => set('code', e.target.value.toUpperCase())} />
          </div>
          <div className="form-group">
            <label className="form-label">Kuota Kupon:</label>
            <input type="number" min="1" className="form-input" value={formData.quota}
              onChange={e => set('quota', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Nama Promo:</label>
          <input type="text" required className="form-input" placeholder="Contoh: Diskon Kemerdekaan 20%"
            value={formData.name} onChange={e => set('name', e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Tipe Diskon:</label>
            <select className="form-select" value={formData.discountType} onChange={e => set('discountType', e.target.value)}>
              <option value="PERCENTAGE">Persentase (%)</option>
              <option value="FIXED">Nominal Tetap (Rp)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Nilai Diskon {formData.discountType === 'PERCENTAGE' ? '(%)' : '(Rp)'}:</label>
            <input type="number" required min="0" className="form-input"
              placeholder={formData.discountType === 'PERCENTAGE' ? 'Misal: 20' : 'Misal: 20000'}
              value={formData.discountValue} onChange={e => set('discountValue', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Minimal Belanja (Rp):</label>
            <input type="number" min="0" className="form-input" value={formData.minOrderAmount}
              onChange={e => set('minOrderAmount', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Maks. Diskon (Rp):</label>
            <input type="number" min="0" className="form-input" placeholder="0 = tidak dibatasi"
              value={formData.maxDiscountAmount} onChange={e => set('maxDiscountAmount', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Berlaku Dari:</label>
            <input type="date" className="form-input" value={formData.validFrom} onChange={e => set('validFrom', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Berlaku Hingga:</label>
            <input type="date" className="form-input" value={formData.validUntil} onChange={e => set('validUntil', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (isEdit ? 'Menyimpan...' : 'Menerbitkan...') : (isEdit ? 'Simpan Perubahan' : 'Terbitkan Voucher')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteConfirmModal({ isOpen, promo, onClose, onConfirm }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const handleConfirm = async () => {
    setIsDeleting(true);
    try { await onConfirm(); } finally { setIsDeleting(false); }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hapus Kode Promo" maxWidth="400px" icon={Trash2}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Trash2 size={28} color="#f87171" />
          </div>
          <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: '1.05rem' }}>
            Hapus voucher <span style={{ color: '#818cf8' }}>{promo?.code}</span>?
          </p>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Tindakan ini tidak dapat dibatalkan. Semua data voucher akan dihapus secara permanen.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ minWidth: '100px' }}>Batal</button>
          <button className="btn btn-danger" onClick={handleConfirm} disabled={isDeleting} style={{ minWidth: '100px' }}>
            {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function PromoStatusBadge({ promo }) {
  const now = new Date();
  const until = new Date(promo.validUntil);
  if (!promo.isActive) return <span className="badge badge-danger">Nonaktif</span>;
  if (until < now) return <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>Kedaluwarsa</span>;
  if (promo.usedCount >= promo.quota) return <span className="badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>Kuota Habis</span>;
  return <span className="badge badge-success">Aktif</span>;
}

export default function PromoModule() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [successMsg, setSuccessMsg] = useState(null);
  const [formModal, setFormModal] = useState({ open: false, promo: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, promo: null });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getPromos();
      if (res.success) setPromos(res.promos);
    } catch (err) {
      console.error('Failed to load promos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleToggle = async (promo) => {
    try {
      await api.togglePromo(promo.id);
      showSuccess(`Voucher ${promo.code} berhasil ${promo.isActive ? 'dinonaktifkan' : 'diaktifkan'}`);
      loadData();
    } catch { alert('Gagal mengubah status voucher'); }
  };

  const handleDelete = async () => {
    if (!deleteModal.promo) return;
    try {
      await api.deletePromo(deleteModal.promo.id);
      showSuccess(`Voucher ${deleteModal.promo.code} berhasil dihapus`);
      setDeleteModal({ open: false, promo: null });
      loadData();
    } catch (err) {
      alert(err.message || 'Gagal menghapus voucher');
    }
  };

  const filtered = promos.filter(p => {
    const matchSearch = p.code.toLowerCase().includes(search.toLowerCase()) || p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' && p.isActive) || (filterStatus === 'inactive' && !p.isActive);
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-indigo">Modul #6</span>
              <span className="badge badge-success">{promos.filter(p => p.isActive).length} Aktif</span>
              <span className="badge" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>{promos.length} Total</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gift size={22} /> Manajemen Diskon &amp; Voucher Promo
            </h2>
          </div>
          {isAdmin && (
            <button onClick={() => setFormModal({ open: true, promo: null })} className="btn btn-primary">
              <Plus size={18} /> <span>Buat Kode Promo</span>
            </button>
          )}
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" className="form-input" placeholder="Cari kode atau nama promo..."
              value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '36px' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'active', 'inactive'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`btn ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                {s === 'all' ? 'Semua' : s === 'active' ? 'Aktif' : 'Nonaktif'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {successMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} /><span style={{ fontWeight: 600 }}>{successMsg}</span>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <Sparkles size={32} style={{ marginBottom: '12px', opacity: 0.5 }} /><p>Memuat data promo...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Gift size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <h3 style={{ margin: '0 0 8px', opacity: 0.6 }}>{search || filterStatus !== 'all' ? 'Tidak ada promo yang cocok' : 'Belum ada kode promo'}</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.5 }}>
            {isAdmin ? 'Klik "Buat Kode Promo" untuk menerbitkan voucher baru.' : 'Hubungi admin untuk menambahkan kode promo.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filtered.map(p => {
            const usagePercent = Math.min(100, (p.usedCount / p.quota) * 100);
            const isExpired = new Date(p.validUntil) < new Date();
            const isFullyActive = p.isActive && !isExpired && p.usedCount < p.quota;
            return (
              <div key={p.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: isFullyActive ? 1 : 0.65, position: 'relative', overflow: 'hidden' }}>
                {/* Top accent bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: isFullyActive ? 'linear-gradient(90deg, #6366f1, #10b981)' : 'linear-gradient(90deg, #6b7280, #4b5563)' }} />

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', paddingTop: '4px' }}>
                    <span className="badge badge-indigo" style={{ fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                      <Ticket size={14} /> {p.code}
                    </span>
                    <PromoStatusBadge promo={p} />
                  </div>

                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 700 }}>{p.name}</h3>

                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emerald-500)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {p.discountType === 'PERCENTAGE'
                      ? <><PercentSquare size={18} /> Diskon {p.discountValue}%</>
                      : <><Tag size={18} /> Potongan {formatRupiah(p.discountValue)}</>}
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                    <div>Min. Belanja: <b>{formatRupiah(p.minOrderAmount)}</b></div>
                    {p.maxDiscountAmount > 0 && <div>Maks. Diskon: <b>{formatRupiah(p.maxDiscountAmount)}</b></div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> s/d {new Date(p.validUntil).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Usage bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span>Pemakaian</span>
                      <span><b>{p.usedCount}</b> / {p.quota} kuota</span>
                    </div>
                    <div style={{ height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '3px', width: `${usagePercent}%`, background: usagePercent >= 90 ? '#ef4444' : usagePercent >= 60 ? '#f59e0b' : '#10b981', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                {isAdmin && (
                  <div style={{ paddingTop: '14px', marginTop: '14px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button onClick={() => handleToggle(p)} title={p.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      className={`btn ${p.isActive ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {p.isActive ? <><PowerOff size={14} /> Nonaktifkan</> : <><Power size={14} /> Aktifkan</>}
                    </button>
                    <button onClick={() => setFormModal({ open: true, promo: p })} title="Edit Promo"
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Edit2 size={14} /> Edit
                    </button>
                    <button onClick={() => setDeleteModal({ open: true, promo: p })} title="Hapus Promo"
                      className="btn btn-danger"
                      style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <PromoFormModal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, promo: null })}
        onSuccess={(msg) => { showSuccess(msg); loadData(); }}
        initialData={formModal.promo}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        promo={deleteModal.promo}
        onClose={() => setDeleteModal({ open: false, promo: null })}
        onConfirm={handleDelete}
      />
    </div>
  );
}


