import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, Banknote, QrCode, Smartphone, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function PaymentMethodsModule() {
  const { user } = useAuth();
  const [methods, setMethods] = useState([]);
  const [successMsg, setSuccessMsg] = useState(null);

  const loadData = async () => {
    try {
      const res = await api.getPaymentMethods();
      if (res.success) setMethods(res.methods);
    } catch (err) {
      console.error('Failed to load payment methods:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (id, name) => {
    if (user?.role !== 'admin') return;
    try {
      await api.togglePaymentMethod(id);
      loadData();
      setSuccessMsg(`Status metode pembayaran '${name}' diperbarui.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message || 'Gagal mengubah status');
    }
  };

  const getIcon = (cat) => {
    switch (cat) {
      case 'CASH': return Banknote;
      case 'QRIS': return QrCode;
      case 'CARD': return CreditCard;
      case 'E_WALLET': return Smartphone;
      case 'TRANSFER': return Building2;
      default: return CreditCard;
    }
  };


  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-indigo">Modul #5</span>
            <span className="badge badge-success">{methods.filter(m => m.isActive).length} Aktif</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
             Gateway & Metode Pembayaran POS
          </h2>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* QRIS & Pajak Consolidated Info */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: 'rgba(0, 168, 107, 0.06)', border: '1.5px solid rgba(0, 168, 107, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0, 168, 107, 0.15)', color: '#00a86b' }}>
            <QrCode size={24} />
          </div>
          <div>
            <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Pengaturan Upload Link QRIS & Tarif Pajak
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Upload barcode QRIS toko dan persentase tarif pajak dikelola terpusat di menu <b>Pengaturan Toko (Modul #12)</b> dan hanya dapat diakses oleh Administrator.
            </p>
          </div>
        </div>
      </div>

      <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {methods.map(m => {
          const Icon = getIcon(m.category);
          return (
            <div key={m.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: m.isActive ? 1 : 0.6 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ padding: '10px', borderRadius: '10px', background: m.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)', color: m.isActive ? '#10b981' : '#f43f5e' }}>
                    <Icon size={24} />
                  </div>
                  <span className={`badge ${m.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {m.isActive ? '● Aktif' : '○ Nonaktif'}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 700 }}>{m.name}</h3>
                <span className="badge badge-indigo" style={{ fontSize: '0.6875rem', marginBottom: '8px' }}>Kode: {m.code}</span>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '8px 0 0 0' }}>{m.instructions}</p>
              </div>

              {user?.role === 'admin' && (
                <div style={{ paddingTop: '16px', marginTop: '16px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Biaya MDR: {m.feePercentage}%</span>
                  <button
                    onClick={() => handleToggle(m.id, m.name)}
                    className={`btn ${m.isActive ? 'btn-danger' : 'btn-primary'}`}
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                  >
                    {m.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
