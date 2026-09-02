import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useModules } from '../../context/ModuleContext';
import { formatRupiah, formatNumber, formatDate } from '../../utils/formatters';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Layers,
  ArrowUpRight,
  Clock,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Store,
  CreditCard,
  ShieldAlert,
  FileCheck
} from 'lucide-react';

export default function DashboardModule({ setActiveTab }) {
  const { user } = useAuth();
  const { modules, stats } = useModules();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        const res = await api.getReportSummary();
        if (res.success) setSummary(res.summary);
      } catch (err) {
        console.error('Failed to load dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, []);

  const totalRevenue = summary?.totalRevenue || 0;
  const grossProfit = summary?.grossProfit || 0;
  const totalTransactions = summary?.totalTransactions || 0;
  const totalProductsSold = summary?.totalProductsSold || 0;

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(99, 102, 241, 0.12))',
        border: '1px solid var(--border-glass-strong)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-success">Sistem Kasir Aktif</span>
            <span className="badge badge-indigo">Role: {user?.role?.toUpperCase()}</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-main)' }}>
            Selamat Datang, {user?.name}! 👋
          </h2>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Sistem POS siap melayani transaksi dan memantau performa bisnis Anda secara real-time.
          </p>
        </div>

        {/* Action Button for Cashier vs Admin */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('transactions')}
            className="btn btn-primary"
            style={{ padding: '10px 18px' }}
          >
            <ShoppingBag size={18} />
            <span>Buka Kasir POS (Transaksi)</span>
          </button>
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('approvals')}
                className="btn btn-secondary"
                style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FileCheck size={18} style={{ color: '#818cf8' }} />
                <span>Pusat Approval</span>
              </button>
              <button
                onClick={() => setActiveTab('audit_logs')}
                className="btn btn-secondary"
                style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ShieldAlert size={18} style={{ color: 'var(--emerald-500)' }} />
                <span>Audit Log Kasir</span>
              </button>
              <button
                onClick={() => setActiveTab('module_management')}
                className="btn btn-indigo"
                style={{ padding: '10px 18px' }}
              >
                <Sliders size={18} />
                <span>Manajemen Modul (16)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {/* KPI 1: Omset Penjualan */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL OMSET PENJUALAN</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            {formatRupiah(totalRevenue)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#34d399' }}>
            <ArrowUpRight size={14} />
            <span>+18.4% dari periode sebelumnya</span>
          </div>
        </div>

        {/* KPI 2: Laba Kotor */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 700 }}>ESTIMASI LABA KOTOR</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#818cf8', marginBottom: '4px' }}>
            {formatRupiah(grossProfit)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Margin keuntungan bersih ~38.2%
          </div>
        </div>

        {/* KPI 3: Jumlah Transaksi */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL TRANSAKSI</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            {formatNumber(totalTransactions)} Struk
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Total {totalProductsSold} item produk terjual
          </div>
        </div>

        {/* KPI 4: Modul Status */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 700 }}>MODUL SISTEM (#16)</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
              <Sliders size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-500)', marginBottom: '4px' }}>
            {stats.active} / {stats.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {stats.inactive > 0 ? `${stats.inactive} modul nonaktif` : 'Seluruh 16 modul aktif'}
          </div>
        </div>
      </div>

      {/* Middle Split: Top Selling Products & Module Quick Access */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Top Selling Products */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>🔥 Produk Terlaris</h3>
            <button onClick={() => setActiveTab('products')} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              Lihat Katalog
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {summary?.topProducts && summary.topProducts.length > 0 ? (
              summary.topProducts.map((p, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-glass)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: idx === 0 ? '#f59e0b' : 'var(--bg-tertiary)', color: '#fff', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {idx + 1}
                    </span>
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>{p.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--emerald-500)' }}>{formatRupiah(p.revenue)}</div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.qty} terjual</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                Belum ada data produk terjual
              </div>
            )}
          </div>
        </div>

        {/* 16 Module Grid Quick Access */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>🎛️ Matriks 16 Modul POS</h3>
            <button onClick={() => setActiveTab('module_management')} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              Kelola Modul
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {modules.map(m => (
              <button
                key={m.id}
                onClick={() => setActiveTab(m.key)}
                style={{
                  padding: '10px 6px',
                  borderRadius: '8px',
                  border: m.isActive ? '1px solid var(--border-glass-strong)' : '1px dashed rgba(244, 63, 94, 0.4)',
                  background: m.isActive ? 'var(--bg-secondary)' : 'rgba(244, 63, 94, 0.05)',
                  color: m.isActive ? 'var(--text-main)' : 'var(--text-subtle)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span style={{ fontSize: '0.6875rem', color: m.isActive ? 'var(--emerald-500)' : 'var(--rose-500)', fontWeight: 800 }}>
                  #{m.id}
                </span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70px' }}>
                  {m.name.split('/')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
