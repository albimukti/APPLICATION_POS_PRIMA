import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatRupiah, formatDate } from '../../utils/formatters';
import Modal from '../common/Modal';
import ReceiptModal from '../pos/ReceiptModal';
import {
  Users,
  Plus,
  Star,
  Phone,
  Mail,
  MapPin,
  Search,
  CheckCircle2,
  Crown,
  Gift,
  Receipt,
  ShoppingBag,
  Sparkles,
  Tag,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export default function CustomerModule() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [singleCustomer, setSingleCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loyaltyRewards, setLoyaltyRewards] = useState([]);
  const [promos, setPromos] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', points: '0' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const loadData = async () => {
    try {
      const res = await api.getCustomers();
      if (res.success) {
        if (user?.role === 'customer') {
          setSingleCustomer(res.customer);
        } else {
          setCustomers(res.customers || []);
        }
      }

      // Load transactions for customer history
      const trxRes = await api.getTransactions();
      if (trxRes.success) {
        setTransactions(trxRes.transactions || []);
      }

      // Load loyalty rewards
      const rewRes = await api.getLoyaltyRewards();
      if (rewRes.success) {
        setLoyaltyRewards(rewRes.rewards || []);
      }

      // Load active promos
      const prmRes = await api.getPromos();
      if (prmRes.success) {
        setPromos(prmRes.promos || []);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createCustomer(formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', address: '', points: '0' });
      setSuccessMsg('Pelanggan baru berhasil didaftarkan');
      loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message || 'Gagal menambahkan member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRedeemReward = async (reward) => {
    const custId = singleCustomer?.id || 'cust-1';
    try {
      const res = await api.redeemReward(custId, reward.id);
      if (res.success) {
        setSuccessMsg(res.message);
        loadData();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      alert(err.message || 'Gagal menukarkan reward');
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Platinum': return '#a855f7';
      case 'Gold': return '#eab308';
      case 'Silver': return '#94a3b8';
      default: return '#b45309';
    }
  };

  // ================= CUSTOMER PORTAL VIEW =================
  if (user?.role === 'customer') {
    const cust = singleCustomer || {
      id: 'cust-1',
      name: user.name,
      email: user.email,
      phone: user.phone || '081377889900',
      address: 'Jl. Sudirman No. 45, Jakarta Pusat',
      code: 'MBR-001',
      tier: 'Gold',
      points: 450,
      totalSpent: 3450000,
      transactionCount: 18
    };

    const myTransactions = transactions.filter(t => t.customerId === cust.id || t.customerName === cust.name || !t.customerId);

    return (
      <div style={{
        padding: '24px',
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxSizing: 'border-box'
      }}>
        {/* Success Alert */}
        {successMsg && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} />
            <span style={{ fontWeight: 600 }}>{successMsg}</span>
          </div>
        )}

        {/* 1. VIP Member Profile Banner */}
        <div className="glass-panel" style={{
          padding: '28px',
          background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12), rgba(168, 85, 247, 0.08), var(--bg-card))',
          border: '1px solid rgba(234, 179, 8, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #eab308, #ca8a04)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(234, 179, 8, 0.4)'
              }}>
                <Crown size={36} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{cust.name}</h2>
                  <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
                    {cust.tier} VIP Member
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  ID Member: <b>{cust.code}</b> • Email: {cust.email} • Telp: {cust.phone}
                </p>
              </div>
            </div>

            <span className="badge badge-success" style={{ padding: '8px 16px', fontSize: '0.8125rem' }}>
              ● Akun Aktif & Terverifikasi
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>SALDO POIN LOYALITAS</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', marginTop: '2px' }}>
                ⭐ {cust.points} Poin
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Setara voucher potongan {formatRupiah(cust.points * 100)}</span>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL AKUMULASI BELANJA</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-500)', marginTop: '2px' }}>
                {formatRupiah(cust.totalSpent)}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{cust.transactionCount} Transaksi Sukses</span>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>TIER BENEFIT</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#c084fc', marginTop: '2px' }}>
                Diskon 15% VIP
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Gunakan kode: VIPGOLD</span>
            </div>
          </div>
        </div>

        {/* 2. Rewards Redemption Catalog */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gift size={20} style={{ color: '#fbbf24' }} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Tukarkan Poin dengan Hadiah Menarik</h3>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Saldo Poin Anda: <b>{cust.points} Poin</b></span>
          </div>

          <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {loyaltyRewards.map(rew => (
              <div key={rew.id} style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="badge badge-warning">⭐ {rew.pointsCost} Poin</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-500)' }}>{formatRupiah(rew.rewardValue)}</span>
                  </div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9375rem', fontWeight: 700 }}>{rew.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{rew.description}</p>
                </div>

                <button
                  onClick={() => handleRedeemReward(rew)}
                  disabled={cust.points < rew.pointsCost}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.78rem' }}
                >
                  {cust.points >= rew.pointsCost ? 'Tukarkan Poin Sekarang' : 'Poin Belum Cukup'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Promo Vouchers Active */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={20} style={{ color: 'var(--emerald-500)' }} />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Voucher & Kupon Promo yang Tersedia</h3>
          </div>

          <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {promos.map(p => (
              <div key={p.id} style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-indigo" style={{ fontWeight: 800 }}>{p.code}</span>
                  <span className="badge badge-success">
                    {p.discountType === 'PERCENTAGE' ? `${p.discountValue}% OFF` : `Potongan ${formatRupiah(p.discountValue)}`}
                  </span>
                </div>
                <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700 }}>{p.name}</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Min. Belanja: <b>{formatRupiah(p.minOrderAmount)}</b>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Recent Transactions & Digital Receipts */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={20} style={{ color: '#38bdf8' }} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Riwayat Transaksi & Struk Digital Anda</h3>
            </div>
            <span className="badge badge-info">{myTransactions.length} Struk</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass-strong)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px' }}>No. Faktur</th>
                  <th style={{ padding: '10px' }}>Tanggal</th>
                  <th style={{ padding: '10px' }}>Metode</th>
                  <th style={{ padding: '10px' }}>Total Belanja</th>
                  <th style={{ padding: '10px' }}>Poin Diperoleh</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Struk Digital</th>
                </tr>
              </thead>
              <tbody>
                {myTransactions.map(trx => (
                  <tr key={trx.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '10px', fontWeight: 700 }}>{trx.invoiceNumber}</td>
                    <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{formatDate(trx.createdAt)}</td>
                    <td style={{ padding: '10px' }}>
                      <span className="badge badge-indigo">{trx.paymentMethod}</span>
                    </td>
                    <td style={{ padding: '10px', fontWeight: 800, color: 'var(--emerald-500)' }}>
                      {formatRupiah(trx.totalAmount)}
                    </td>
                    <td style={{ padding: '10px', color: '#fbbf24', fontWeight: 700 }}>
                      +{trx.pointsEarned || 0} Poin
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedReceipt(trx)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}
                      >
                        <Receipt size={13} /> Lihat Struk
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Digital Receipt Modal */}
        <ReceiptModal
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
          transaction={selectedReceipt}
        />
      </div>
    );
  }

  // ================= ADMIN / KASIR CUSTOMER LIST VIEW =================
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

  return (
    <div style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      maxWidth: '1400px',
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-indigo">Modul #4</span>
            <span className="badge badge-success">{customers.length} Member Terdaftar</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
            👥 Direktori Pelanggan & Member POS
          </h2>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Tambah Pelanggan Baru</span>
        </button>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Cari nama member, kode, nomor HP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filtered.map(cust => (
          <div key={cust.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-indigo" style={{ fontSize: '0.6875rem' }}>{cust.code}</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: 700 }}>{cust.name}</h3>
              </div>
              <span className="badge" style={{ background: `${getTierColor(cust.tier)}22`, color: getTierColor(cust.tier), border: `1px solid ${getTierColor(cust.tier)}55` }}>
                {cust.tier}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} /> {cust.phone || '-'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} /> {cust.email || '-'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} /> {cust.address || '-'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-glass)', fontSize: '0.8125rem' }}>
              <div>
                <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Total Belanja:</span>
                <span style={{ fontWeight: 700, color: 'var(--emerald-500)' }}>{formatRupiah(cust.totalSpent)}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--text-subtle)', display: 'block' }}>Saldo Poin:</span>
                <span style={{ fontWeight: 800, color: '#fbbf24' }}>⭐ {cust.points}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Pendaftaran Pelanggan / Member Baru" maxWidth="500px" icon={Users}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap:</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Contoh: Rian Pratama"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nomor Telepon / WhatsApp:</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="0812xxxxxxxx"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email:</label>
            <input
              type="email"
              className="form-input"
              placeholder="email@domain.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Alamat Lengkap:</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Alamat rumah / domisili..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
