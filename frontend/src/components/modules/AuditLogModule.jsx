import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Download,
  Trash2,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Activity,
  ShoppingBag,
  Store,
  Key,
  Database,
  ArrowUpDown,
  ExternalLink,
  Eye,
  Sliders,
  Layers,
  Terminal,
  FileSpreadsheet
} from 'lucide-react';

export default function AuditLogModule() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'timeline'
  const [selectedLog, setSelectedLog] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const fetchLogs = async () => {
    try {
      setIsRefreshing(true);
      const res = await api.getAuditLogs();
      if (res && res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      // Fallback local mock data if offline/unreachable
      setLogs([
        {
          id: 'audit-001',
          userId: 'usr-cashier',
          username: 'Siti Nurhaliza',
          role: 'cashier',
          action: 'LOGIN',
          target: 'Auth System',
          details: 'Kasir berhasil login ke aplikasi POS melalui terminal kasir 1',
          severity: 'INFO',
          ip: '192.168.1.10',
          timestamp: new Date(Date.now() - 3600 * 1000 * 4).toISOString()
        },
        {
          id: 'audit-002',
          userId: 'usr-cashier',
          username: 'Siti Nurhaliza',
          role: 'cashier',
          action: 'SHIFT_OPEN',
          target: 'SHF-20240902-01',
          details: 'Membuka Shift Kasir dengan modal kas awal Rp 500.000',
          severity: 'INFO',
          ip: '192.168.1.10',
          timestamp: new Date(Date.now() - 3600 * 1000 * 3.8).toISOString()
        },
        {
          id: 'audit-003',
          userId: 'usr-cashier',
          username: 'Siti Nurhaliza',
          role: 'cashier',
          action: 'TRANSACTION_CREATED',
          target: 'INV/20240902/0001',
          details: 'Memproses transaksi senilai Rp 125.000 (3 item, QRIS Dinamis)',
          severity: 'INFO',
          ip: '192.168.1.10',
          timestamp: new Date(Date.now() - 3600 * 1000 * 2.5).toISOString()
        },
        {
          id: 'audit-004',
          userId: 'usr-cashier',
          username: 'Siti Nurhaliza',
          role: 'cashier',
          action: 'TRANSACTION_VOID',
          target: 'INV/20240902/0002',
          details: 'Membatalkan (VOID) transaksi senilai Rp 87.500 — Alasan: Salah pilih item oleh pelanggan',
          severity: 'WARNING',
          ip: '192.168.1.10',
          timestamp: new Date(Date.now() - 3600 * 1000 * 1.5).toISOString()
        },
        {
          id: 'audit-005',
          userId: 'usr-cashier',
          username: 'Siti Nurhaliza',
          role: 'cashier',
          action: 'LOGIN_FAILED',
          target: 'Auth System',
          details: 'Percobaan login gagal dengan password keliru (2x percobaan)',
          severity: 'CRITICAL',
          ip: '192.168.1.10',
          timestamp: new Date(Date.now() - 3600 * 1000 * 0.8).toISOString()
        },
        {
          id: 'audit-006',
          userId: 'usr-admin',
          username: 'Ahmad Administrator',
          role: 'admin',
          action: 'PRICE_UPDATE',
          target: 'Kopi Arabika Gayo 250g',
          details: 'Admin mengubah harga jual dari Rp 45.000 menjadi Rp 48.000',
          severity: 'INFO',
          ip: '192.168.1.1',
          timestamp: new Date(Date.now() - 3600 * 1000 * 0.4).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Yakin ingin membersihkan log aktivitas lama (retensi 30 hari)? Log penting akan tetap dipertahankan.')) {
      return;
    }
    try {
      const res = await api.clearAuditLogs();
      showToast(res?.message || 'Log aktivitas lama berhasil dibersihkan');
      fetchLogs();
    } catch (err) {
      showToast('Gagal membersihkan log: ' + err.message);
    }
  };

  const handleExportCSV = () => {
    if (!filteredLogs.length) {
      showToast('Tidak ada data log untuk diekspor');
      return;
    }

    const headers = ['ID Log', 'Waktu', 'Pengguna', 'Role', 'Aksi', 'Target', 'Tingkat Severity', 'Rincian', 'Alamat IP'];
    const rows = filteredLogs.map(l => [
      l.id,
      new Date(l.timestamp).toLocaleString('id-ID'),
      `"${l.username}"`,
      l.role,
      l.action,
      `"${l.target || '-'}"`,
      l.severity,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      l.ip || '-'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Log_POS_PRIMA_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV Audit Log berhasil diunduh');
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter(item => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchUser = item.username?.toLowerCase().includes(q);
        const matchAction = item.action?.toLowerCase().includes(q);
        const matchTarget = item.target?.toLowerCase().includes(q);
        const matchDetails = item.details?.toLowerCase().includes(q);
        const matchIp = item.ip?.toLowerCase().includes(q);
        if (!matchUser && !matchAction && !matchTarget && !matchDetails && !matchIp) return false;
      }

      // Role
      if (selectedRole !== 'all' && item.role !== selectedRole) {
        return false;
      }

      // Severity
      if (selectedSeverity !== 'all' && item.severity !== selectedSeverity) {
        return false;
      }

      // Action type
      if (selectedAction !== 'all') {
        if (!item.action.toLowerCase().includes(selectedAction.toLowerCase())) return false;
      }

      // Date range
      if (dateFilter !== 'all') {
        const logDate = new Date(item.timestamp);
        const now = new Date();
        if (dateFilter === 'today') {
          const isToday = logDate.toDateString() === now.toDateString();
          if (!isToday) return false;
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
          if (logDate < weekAgo) return false;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
          if (logDate < monthAgo) return false;
        }
      }

      return true;
    });
  }, [logs, searchQuery, selectedRole, selectedSeverity, selectedAction, dateFilter]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = logs.length;
    const cashierLogs = logs.filter(l => l.role === 'cashier').length;
    const warnings = logs.filter(l => l.severity === 'WARNING').length;
    const criticals = logs.filter(l => l.severity === 'CRITICAL').length;
    const voids = logs.filter(l => l.action.includes('VOID')).length;
    return { total, cashierLogs, warnings, criticals, voids };
  }, [logs]);

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            padding: '3px 8px',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <AlertCircle size={12} /> CRITICAL
          </span>
        );
      case 'WARNING':
        return (
          <span style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#fbbf24',
            padding: '3px 8px',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <AlertTriangle size={12} /> WARNING
          </span>
        );
      default:
        return (
          <span style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            padding: '3px 8px',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <CheckCircle2 size={12} /> INFO
          </span>
        );
    }
  };

  const getActionIcon = (action) => {
    if (action.includes('TRANSACTION')) return <ShoppingBag size={15} style={{ color: 'var(--emerald-500)' }} />;
    if (action.includes('SHIFT')) return <Clock size={15} style={{ color: 'var(--indigo-500)' }} />;
    if (action.includes('LOGIN') || action.includes('AUTH')) return <Key size={15} style={{ color: '#fbbf24' }} />;
    if (action.includes('PRODUCT') || action.includes('PRICE') || action.includes('STOCK')) return <Database size={15} style={{ color: '#38bdf8' }} />;
    return <Activity size={15} style={{ color: 'var(--text-muted)' }} />;
  };

  return (
    <div className="module-container" style={{ paddingBottom: '40px' }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #064e3b, #059669)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          fontWeight: 700,
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Module Header */}
      <div className="module-header" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--emerald-500)',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <ShieldAlert size={14} /> KHUSUS ADMINISTRATOR
            </span>
          </div>
          <h1 className="module-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            Audit Log Aktivitas Kasir
          </h1>
          <p className="module-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '4px 0 0 0' }}>
            Pantau secara real-time seluruh aktivitas operasional kasir, pembukaan shift, transaksi void, riwayat penjualan, dan keamanan sistem.
          </p>
        </div>

        {/* Top Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={fetchLogs}
            disabled={isRefreshing}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}
            title="Muat ulang log aktivitas terkini"
          >
            <RefreshCw size={15} className={isRefreshing ? 'spin-icon' : ''} />
            <span>{isRefreshing ? 'Memuat...' : 'Refresh Feed'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}
            title="Download log sebagai spreadsheet CSV"
          >
            <FileSpreadsheet size={15} style={{ color: 'var(--emerald-500)' }} />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handleClearLogs}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: '#f43f5e' }}
            title="Bersihkan log riwayat yang sudah lebih dari 30 hari"
          >
            <Trash2 size={15} />
            <span>Bersihkan Log Lama</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Total Logs */}
        <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--indigo-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Log Aktivitas
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {stats.total} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Entri</span>
            </div>
          </div>
        </div>

        {/* Cashier Actions */}
        <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--emerald-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Store size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Aktivitas Kasir
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--emerald-500)', lineHeight: 1.2 }}>
              {stats.cashierLogs} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Aksi</span>
            </div>
          </div>
        </div>

        {/* Void Transactions */}
        <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Transaksi Dibatalkan (VOID)
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#fbbf24', lineHeight: 1.2 }}>
              {stats.voids} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Void</span>
            </div>
          </div>
        </div>

        {/* Warning / Critical Alerts */}
        <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Peringatan & Critical
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#f87171', lineHeight: 1.2 }}>
              {stats.warnings + stats.criticals} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Peristiwa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px', height: '40px', fontSize: '0.85rem' }}
              placeholder="Cari kasir, no invoice, aksi, atau rincian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Role Filter */}
            <select
              className="form-input"
              style={{ width: 'auto', height: '40px', fontSize: '0.8125rem', padding: '0 12px' }}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">Semua Peran (Role)</option>
              <option value="cashier">Kasir Saja</option>
              <option value="admin">Administrator Saja</option>
              <option value="system">Sistem Otomatis</option>
            </select>

            {/* Action Filter */}
            <select
              className="form-input"
              style={{ width: 'auto', height: '40px', fontSize: '0.8125rem', padding: '0 12px' }}
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
            >
              <option value="all">Semua Jenis Aksi</option>
              <option value="TRANSACTION">Penjualan & Transaksi</option>
              <option value="VOID">Pembatalan (VOID)</option>
              <option value="SHIFT">Shift Kasir (Buka/Tutup)</option>
              <option value="LOGIN">Autentikasi & Login</option>
              <option value="PRODUCT">Katalog & Harga</option>
            </select>

            {/* Severity Filter */}
            <select
              className="form-input"
              style={{ width: 'auto', height: '40px', fontSize: '0.8125rem', padding: '0 12px' }}
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
            >
              <option value="all">Semua Severity</option>
              <option value="INFO">INFO (Normal)</option>
              <option value="WARNING">WARNING (Perhatian)</option>
              <option value="CRITICAL">CRITICAL (Kritis)</option>
            </select>

            {/* Date Filter */}
            <select
              className="form-input"
              style={{ width: 'auto', height: '40px', fontSize: '0.8125rem', padding: '0 12px' }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="week">7 Hari Terakhir</option>
              <option value="month">30 Hari Terakhir</option>
            </select>

            {/* View Mode Toggle */}
            <div style={{
              display: 'inline-flex',
              background: 'var(--bg-tertiary)',
              borderRadius: '8px',
              padding: '3px',
              border: '1px solid var(--border-glass)'
            }}>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  background: viewMode === 'table' ? 'var(--emerald-500)' : 'transparent',
                  color: viewMode === 'table' ? '#fff' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Layers size={13} /> Tabel
              </button>
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                style={{
                  background: viewMode === 'timeline' ? 'var(--emerald-500)' : 'transparent',
                  color: viewMode === 'timeline' ? '#fff' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Clock size={13} /> Timeline
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Timeline */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', borderRadius: '16px' }}>
          <RefreshCw size={28} className="spin-icon" style={{ color: 'var(--emerald-500)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Memuat log audit aktivitas kasir...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', borderRadius: '16px' }}>
          <ShieldAlert size={36} style={{ color: 'var(--text-muted)', opacity: 0.5, margin: '0 auto 12px' }} />
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px' }}>
            Tidak Ada Log Aktivitas yang Cocok
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            Coba ubah kata kunci pencarian atau sesuaikan filter severity, peran, dan rentang tanggal.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-glass-strong)' }}>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Waktu</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Kasir / Pengguna</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Jenis Aksi</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Target Objek</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Rincian Aktivitas</th>
                  <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Severity</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const date = new Date(log.timestamp);
                  const isCashier = log.role === 'cashier';

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      style={{
                        borderBottom: '1px solid var(--border-glass)',
                        cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                      className="table-row-hover"
                    >
                      {/* Timestamp */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>

                      {/* User / Cashier */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: isCashier ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                            color: isCashier ? 'var(--emerald-500)' : 'var(--indigo-500)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.75rem'
                          }}>
                            {log.username ? log.username.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)' }}>
                              {log.username || 'Tidak Diketahui'}
                            </div>
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              color: isCashier ? 'var(--emerald-500)' : 'var(--indigo-500)',
                              textTransform: 'uppercase'
                            }}>
                              {log.role}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {getActionIcon(log.action)}
                          <span style={{
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            color: 'var(--text-main)',
                            background: 'var(--bg-tertiary)',
                            padding: '3px 7px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-glass)'
                          }}>
                            {log.action}
                          </span>
                        </div>
                      </td>

                      {/* Target */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                          {log.target || '-'}
                        </span>
                      </td>

                      {/* Details */}
                      <td style={{ padding: '14px 18px', maxWidth: '380px' }}>
                        <div style={{
                          fontSize: '0.8125rem',
                          color: 'var(--text-main)',
                          lineHeight: 1.4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {log.details}
                        </div>
                        {log.ip && (
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>
                            IP: {log.ip}
                          </span>
                        )}
                      </td>

                      {/* Severity */}
                      <td style={{ padding: '14px 18px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {getSeverityBadge(log.severity)}
                      </td>

                      {/* Inspect Button */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                          className="btn btn-secondary"
                          style={{ padding: '5px 9px', fontSize: '0.75rem', borderRadius: '8px' }}
                          title="Inspeksi detail log"
                        >
                          <Eye size={13} /> Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{
            padding: '12px 18px',
            background: 'var(--bg-tertiary)',
            borderTop: '1px solid var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            color: 'var(--text-muted)'
          }}>
            <span>Menampilkan <b>{filteredLogs.length}</b> dari total <b>{logs.length}</b> log aktivitas</span>
            <span>Real-time Logging Active ●</span>
          </div>
        </div>
      ) : (
        /* TIMELINE FEED VIEW */
        <div className="glass-panel" style={{ padding: '24px 28px', borderRadius: '16px' }}>
          <div style={{ position: 'relative', paddingLeft: '24px' }}>
            {/* Vertical timeline line */}
            <div style={{
              position: 'absolute',
              left: '7px',
              top: '10px',
              bottom: '10px',
              width: '2px',
              background: 'linear-gradient(to bottom, var(--emerald-500), var(--indigo-500), transparent)'
            }} />

            {filteredLogs.map((log) => {
              const date = new Date(log.timestamp);
              const isCashier = log.role === 'cashier';

              return (
                <div key={log.id} style={{ position: 'relative', marginBottom: '24px' }}>
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-24px',
                    top: '4px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: log.severity === 'CRITICAL' ? '#ef4444' : log.severity === 'WARNING' ? '#f59e0b' : 'var(--emerald-500)',
                    border: '3px solid var(--bg-primary)',
                    boxShadow: '0 0 10px rgba(0,0,0,0.2)'
                  }} />

                  {/* Card */}
                  <div
                    onClick={() => setSelectedLog(log)}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease'
                    }}
                    className="glass-panel-hover"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          fontFamily: 'monospace',
                          background: 'var(--bg-tertiary)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-glass)',
                          color: 'var(--text-main)'
                        }}>
                          {log.action}
                        </span>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {log.username} ({log.role.toUpperCase()})
                        </span>
                        {log.target && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--emerald-500)', fontWeight: 600 }}>
                            ➜ {log.target}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getSeverityBadge(log.severity)}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {date.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' })}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', margin: '0 0 6px 0', lineHeight: 1.5 }}>
                      {log.details}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                      <span>IP Address: <code>{log.ip || '127.0.0.1'}</code></span>
                      <span style={{ color: 'var(--emerald-500)', fontWeight: 700 }}>Klik untuk rincian ➜</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* INSPECT LOG MODAL */}
      {selectedLog && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '560px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-glass-strong)',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--emerald-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Terminal size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Inspeksi Log Aktivitas
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {selectedLog.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  fontWeight: 700
                }}
              >
                Tutup ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="glass-panel" style={{ padding: '12px 14px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>PENGGUNA / KASIR</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>{selectedLog.username}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--emerald-500)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>{selectedLog.role}</span>
                </div>

                <div className="glass-panel" style={{ padding: '12px 14px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>TINGKAT SEVERITY</span>
                  <div style={{ marginTop: '4px' }}>{getSeverityBadge(selectedLog.severity)}</div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '12px 14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, marginBottom: '4px' }}>JENIS AKSI & TARGET</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--emerald-500)' }}>{selectedLog.action}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>➜ {selectedLog.target || '-'}</span>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '12px 14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, marginBottom: '4px' }}>RINCIAN PERISTIWA</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  {selectedLog.details}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="glass-panel" style={{ padding: '12px 14px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>WAKTU TERCATAT</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {new Date(selectedLog.timestamp).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="glass-panel" style={{ padding: '12px 14px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>ALAMAT IP TERMINAL</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-main)' }}>
                    {selectedLog.ip || '127.0.0.1'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="btn btn-primary"
                style={{ padding: '10px 20px', fontSize: '0.875rem' }}
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
