import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatRupiah } from '../../utils/formatters';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  UserCheck,
  Store,
  Crown,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ArrowRight,
  ShoppingBag,
  Gift,
  Key,
  Layers,
  FileCheck,
  Eye,
  Lock,
  MessageSquare,
  Sparkles,
  FileSpreadsheet,
  Check,
  X,
  ChevronRight,
  User,
  Phone,
  Mail,
  Receipt,
  Calendar,
  Info,
  ShieldAlert,
  ArrowUpRight,
  CheckCheck
} from 'lucide-react';

export default function ApprovalModule() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Selected item for Master-Detail view
  const [selectedId, setSelectedId] = useState(null);

  // Modal / Action states
  const [actionNotes, setActionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'approve' | 'reject' | null

  // View Layout mode: 'split' (Master-Detail) | 'table'
  const [viewMode, setViewMode] = useState('split');

  // Form for new request (e.g. from cashier)
  const [newRequestForm, setNewRequestForm] = useState({
    type: 'TRANSACTION_VOID',
    title: '',
    details: '',
    invoiceNumber: '',
    amount: ''
  });

  const isAdmin = user?.role === 'admin';
  const isCashier = user?.role === 'cashier';

  const fetchApprovals = async (silent = false) => {
    try {
      if (!silent) setIsRefreshing(true);
      const res = await api.getApprovals();
      if (res && res.success) {
        setApprovals(res.approvals || []);
        // Auto select first item if none selected or not found
        if (res.approvals?.length > 0) {
          setSelectedId(prev => {
            const exists = res.approvals.some(a => a.id === prev);
            return exists ? prev : res.approvals[0].id;
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch approvals:', err);
    } finally {
      setLoading(false);
      if (!silent) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
    const interval = setInterval(() => {
      fetchApprovals(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg, isError = false) => {
    setToastMsg({ text: msg, isError });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Filtered approvals
  const filteredApprovals = useMemo(() => {
    return approvals.filter(item => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchReq = item.requesterName?.toLowerCase().includes(q);
        const matchDetails = item.details?.toLowerCase().includes(q);
        const matchId = item.id?.toLowerCase().includes(q);
        if (!matchTitle && !matchReq && !matchDetails && !matchId) return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'ALL' && item.type !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [approvals, searchQuery, statusFilter, typeFilter]);

  // Selected item object
  const activeApproval = useMemo(() => {
    return approvals.find(a => a.id === selectedId) || filteredApprovals[0] || null;
  }, [approvals, selectedId, filteredApprovals]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = approvals.length;
    const pending = approvals.filter(a => a.status === 'PENDING').length;
    const approved = approvals.filter(a => a.status === 'APPROVED').length;
    const rejected = approvals.filter(a => a.status === 'REJECTED').length;
    const cashierReqs = approvals.filter(a => a.type === 'CASHIER_REGISTRATION').length;
    const customerReqs = approvals.filter(a => a.type === 'CUSTOMER_REGISTRATION').length;
    const voidReqs = approvals.filter(a => a.type === 'TRANSACTION_VOID').length;
    return { total, pending, approved, rejected, cashierReqs, customerReqs, voidReqs };
  }, [approvals]);

  const handleApprove = async (id, notes) => {
    setIsProcessing(true);
    try {
      const res = await api.approveRequest(id, notes);
      showToast(res.message || 'Permohonan berhasil disetujui!');
      setActionNotes('');
      setConfirmAction(null);
      fetchApprovals();
    } catch (err) {
      showToast(err.message || 'Gagal menyetujui permohonan', true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id, reason) => {
    if (!reason?.trim()) {
      alert('Harap masukkan alasan penolakan.');
      return;
    }
    setIsProcessing(true);
    try {
      const res = await api.rejectRequest(id, reason);
      showToast(res.message || 'Permohonan telah ditolak.');
      setActionNotes('');
      setConfirmAction(null);
      fetchApprovals();
    } catch (err) {
      showToast(err.message || 'Gagal menolak permohonan', true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await api.requestApproval({
        type: newRequestForm.type,
        title: newRequestForm.title || `Permintaan Otorisasi: ${newRequestForm.invoiceNumber || 'Khusus'}`,
        details: newRequestForm.details,
        data: {
          invoiceNumber: newRequestForm.invoiceNumber,
          amount: parseFloat(newRequestForm.amount) || 0
        },
        requiredRole: 'admin'
      });
      showToast('Permohonan otorisasi berhasil dikirim ke Administrator!');
      setIsNewRequestOpen(false);
      setNewRequestForm({ type: 'TRANSACTION_VOID', title: '', details: '', invoiceNumber: '', amount: '' });
      fetchApprovals();
    } catch (err) {
      showToast(err.message || 'Gagal mengirim permohonan', true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCSV = () => {
    if (!approvals.length) {
      showToast('Tidak ada data approval untuk diekspor', true);
      return;
    }
    const headers = ['ID', 'Waktu Pengajuan', 'Jenis Permohonan', 'Judul', 'Pemohon', 'Role', 'Status', 'Wewenang', 'Ditinjau Oleh', 'Catatan Review'];
    const rows = approvals.map(a => [
      a.id,
      new Date(a.createdAt).toLocaleString('id-ID'),
      a.type,
      `"${(a.title || '').replace(/"/g, '""')}"`,
      `"${a.requesterName}"`,
      a.requesterRole,
      a.status,
      a.requiredRole,
      `"${a.reviewedBy || '-'}"`,
      `"${(a.reviewNotes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Approval_Report_POS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan Approval berhasil diunduh');
  };

  // Check if current user can approve this item
  const canUserApprove = (item) => {
    if (!item || item.status !== 'PENDING') return false;
    if (isAdmin) return true; // Admin can approve everything
    if (isCashier && (item.type === 'CUSTOMER_REGISTRATION' || item.requiredRole === 'any')) {
      return true; // Cashier can approve customer registration
    }
    return false;
  };

  const getTypeMeta = (type) => {
    switch (type) {
      case 'CASHIER_REGISTRATION':
        return {
          label: 'Pendaftaran Kasir',
          icon: Store,
          color: '#4F46E5',
          bg: '#EEF2FF',
          border: '#C7D2FE'
        };
      case 'CUSTOMER_REGISTRATION':
        return {
          label: 'Registrasi Member',
          icon: UserCheck,
          color: '#059669',
          bg: '#F0FDF4',
          border: '#BBF7D0'
        };
      case 'TRANSACTION_VOID':
        return {
          label: 'Otorisasi VOID Transaksi',
          icon: ShoppingBag,
          color: '#DC2626',
          bg: '#FEF2F2',
          border: '#FECACA'
        };
      case 'DISCOUNT_OVERRIDE':
        return {
          label: 'Diskon Khusus Supervisor',
          icon: Gift,
          color: '#D97706',
          bg: '#FFFBEB',
          border: '#FDE68A'
        };
      default:
        return {
          label: type || 'Permohonan Umum',
          icon: FileCheck,
          color: '#2563EB',
          bg: '#EFF6FF',
          border: '#BFDBFE'
        };
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'APPROVED') {
      return (
        <span style={{
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          color: '#166534',
          padding: '3px 10px',
          borderRadius: '999px',
          fontSize: '0.72rem',
          fontWeight: 800,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <CheckCircle2 size={12} /> Disetujui
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          color: '#991B1B',
          padding: '3px 10px',
          borderRadius: '999px',
          fontSize: '0.72rem',
          fontWeight: 800,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <XCircle size={12} /> Ditolak
        </span>
      );
    }
    return (
      <span style={{
        background: '#FFFBEB',
        border: '1px solid #FDE68A',
        color: '#92400E',
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '0.72rem',
        fontWeight: 800,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <Clock size={12} /> Menunggu
      </span>
    );
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: toastMsg.isError ? '#FEF2F2' : '#F0FDF4',
          border: toastMsg.isError ? '1px solid #FECACA' : '1px solid #BBF7D0',
          color: toastMsg.isError ? '#991B1B' : '#166534',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          fontWeight: 700,
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toastMsg.isError ? <AlertTriangle size={18} color="#DC2626" /> : <CheckCircle2 size={18} color="#059669" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* ── HEADER CARD WITH DESKTOP COMMAND BAR ── */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        borderRadius: '18px',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              background: isAdmin ? '#EEF2FF' : '#F0FDF4',
              border: `1px solid ${isAdmin ? '#C7D2FE' : '#BBF7D0'}`,
              color: isAdmin ? '#4F46E5' : '#059669',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              {isAdmin ? <Crown size={13} /> : <Store size={13} />}
              {isAdmin ? 'OTORITAS ADMINISTRATOR (FULL ACCESS)' : 'TERMINAL PERSETUJUAN KASIR'}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              • {stats.pending} Permohonan Aktif
            </span>
          </div>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Pusat Persetujuan (Approval Center)
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.84rem', margin: '4px 0 0 0' }}>
            {isAdmin
              ? 'Verifikasi dan otorisasi pendaftaran akun kasir baru, registrasi member, pembatalan transaksi VOID, dan diskon supervisor.'
              : 'Verifikasi & aktivasi pendaftaran member baru langsung di meja kasir, serta pantau status pengajuan permohonan ke Admin.'}
          </p>
        </div>

        {/* Command Bar Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={fetchApprovals}
            disabled={isRefreshing}
            className="btn btn-secondary"
            style={{ padding: '9px 15px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Muat ulang daftar permohonan"
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin-icon' : ''} />
            <span>{isRefreshing ? 'Memuat...' : 'Refresh Feed'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{ padding: '9px 15px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Ekspor rekap approval ke file spreadsheet CSV"
          >
            <FileSpreadsheet size={14} style={{ color: '#059669' }} />
            <span>Ekspor CSV</span>
          </button>

          {isCashier && (
            <button
              onClick={() => setIsNewRequestOpen(true)}
              className="btn btn-primary"
              style={{ padding: '9px 16px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}
            >
              <Plus size={15} />
              <span>Ajukan Otorisasi VOID / Diskon</span>
            </button>
          )}
        </div>
      </div>

      {/* ── KPI METRICS CARDS (DESKTOP INTERACTIVE TILES) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px'
      }}>
        {/* Pending Card */}
        <div
          onClick={() => setStatusFilter('PENDING')}
          style={{
            background: statusFilter === 'PENDING' ? '#FFFBEB' : '#FFFFFF',
            border: `1.5px solid ${statusFilter === 'PENDING' ? '#F59E0B' : '#E2E8F0'}`,
            borderRadius: '14px',
            padding: '16px 20px',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: statusFilter === 'PENDING' ? '0 8px 20px -4px rgba(245, 158, 11, 0.15)' : '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Menunggu Tindakan
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#B45309', lineHeight: 1.2, marginTop: '2px' }}>
              {stats.pending} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#92400E' }}>Antrean</span>
            </div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} />
          </div>
        </div>

        {/* Approved Card */}
        <div
          onClick={() => setStatusFilter('APPROVED')}
          style={{
            background: statusFilter === 'APPROVED' ? '#F0FDF4' : '#FFFFFF',
            border: `1.5px solid ${statusFilter === 'APPROVED' ? '#059669' : '#E2E8F0'}`,
            borderRadius: '14px',
            padding: '16px 20px',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: statusFilter === 'APPROVED' ? '0 8px 20px -4px rgba(5, 150, 105, 0.15)' : '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Telah Disetujui
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669', lineHeight: 1.2, marginTop: '2px' }}>
              {stats.approved} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#166534' }}>Selesai</span>
            </div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#DCFCE7', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Cashier Requests / Member Registrations */}
        <div
          onClick={() => setTypeFilter(isAdmin ? (typeFilter === 'CASHIER_REGISTRATION' ? 'ALL' : 'CASHIER_REGISTRATION') : (typeFilter === 'CUSTOMER_REGISTRATION' ? 'ALL' : 'CUSTOMER_REGISTRATION'))}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '16px 20px',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: isAdmin ? '#4338CA' : '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isAdmin ? 'Pendaftaran Kasir' : 'Registrasi Member'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.2, marginTop: '2px' }}>
              {isAdmin ? stats.cashierReqs : stats.customerReqs} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>Pengajuan</span>
            </div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: isAdmin ? '#EEF2FF' : '#ECFDF5', color: isAdmin ? '#4F46E5' : '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isAdmin ? <Store size={20} /> : <UserCheck size={20} />}
          </div>
        </div>

        {/* Rejected Card */}
        <div
          onClick={() => setStatusFilter('REJECTED')}
          style={{
            background: statusFilter === 'REJECTED' ? '#FEF2F2' : '#FFFFFF',
            border: `1.5px solid ${statusFilter === 'REJECTED' ? '#DC2626' : '#E2E8F0'}`,
            borderRadius: '14px',
            padding: '16px 20px',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: statusFilter === 'REJECTED' ? '0 8px 20px -4px rgba(220, 38, 38, 0.15)' : '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Permohonan Ditolak
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#DC2626', lineHeight: 1.2, marginTop: '2px' }}>
              {stats.rejected} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#991B1B' }}>Ditolak</span>
            </div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XCircle size={20} />
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER TOOLBAR ── */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '14px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
      }}>
        {/* Search */}
        <div style={{ flex: '1 1 280px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px', height: '38px', fontSize: '0.84rem', background: '#F8FAFC', border: '1px solid #E2E8F0' }}
            placeholder="Cari pemohon, nomor ID, no invoice, atau rincian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Status Tabs */}
          <div style={{ display: 'inline-flex', background: '#F1F5F9', borderRadius: '10px', padding: '3px' }}>
            {[
              { key: 'PENDING', label: 'Menunggu (Pending)' },
              { key: 'APPROVED', label: 'Disetujui' },
              { key: 'REJECTED', label: 'Ditolak' },
              { key: 'ALL', label: 'Semua Status' }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  background: statusFilter === tab.key ? '#059669' : 'transparent',
                  color: statusFilter === tab.key ? '#FFFFFF' : '#64748B',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Type Select */}
          <select
            className="form-input"
            style={{ width: 'auto', height: '38px', fontSize: '0.8rem', padding: '0 10px', background: '#F8FAFC' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">Semua Kategori</option>
            {isAdmin && <option value="CASHIER_REGISTRATION">Pendaftaran Kasir</option>}
            <option value="CUSTOMER_REGISTRATION">Registrasi Member Baru</option>
            <option value="TRANSACTION_VOID">Otorisasi VOID Transaksi</option>
            <option value="DISCOUNT_OVERRIDE">Diskon Khusus</option>
          </select>
        </div>
      </div>

      {/* ── MAIN DESKTOP MASTER-DETAIL SPLIT PANE ── */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', borderRadius: '16px', background: '#FFFFFF' }}>
          <RefreshCw size={28} className="spin-icon" style={{ color: '#059669', margin: '0 auto 12px' }} />
          <p style={{ color: '#64748B', fontWeight: 600 }}>Memuat antrean persetujuan...</p>
        </div>
      ) : filteredApprovals.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', borderRadius: '16px', background: '#FFFFFF' }}>
          <CheckCircle2 size={36} style={{ color: '#059669', opacity: 0.7, margin: '0 auto 12px' }} />
          <h3 style={{ color: '#0F172A', fontSize: '1.15rem', fontWeight: 800, margin: '0 0 6px' }}>
            Tidak Ada Permohonan yang Perlu Ditinjau
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0 }}>
            Semua antrean approval dengan filter saat ini telah selesai diproses.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 420px) 1fr',
          gap: '16px',
          alignItems: 'start'
        }}>
          {/* ── LEFT COLUMN: MASTER LIST ── */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 280px)'
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#64748B'
            }}>
              <span>DAFTAR PERMOHONAN ({filteredApprovals.length})</span>
              <span>Pilih untuk meninjau</span>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
              {filteredApprovals.map((item) => {
                const isSelected = activeApproval?.id === item.id;
                const meta = getTypeMeta(item.type);
                const IconComponent = meta.icon;
                const date = new Date(item.createdAt);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: isSelected ? '#F0FDF4' : '#FFFFFF',
                      border: `1.5px solid ${isSelected ? '#059669' : '#F1F5F9'}`,
                      cursor: 'pointer',
                      marginBottom: '6px',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                  >
                    {/* Top Row: Type & Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: meta.color,
                        background: meta.bg,
                        border: `1px solid ${meta.border}`,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <IconComponent size={11} /> {meta.label}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>

                    {/* Title */}
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px', lineHeight: 1.3 }}>
                      {item.title}
                    </div>

                    {/* Requester & Time */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B' }}>
                      <span>Oleh: <b style={{ color: '#334155' }}>{item.requesterName}</b></span>
                      <span>{date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT COLUMN: RICH DETAIL WORKSPACE (DESKTOP DOSSIER) ── */}
          {activeApproval ? (
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {/* Detail Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    {(() => {
                      const meta = getTypeMeta(activeApproval.type);
                      const IconComponent = meta.icon;
                      return (
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          color: meta.color,
                          background: meta.bg,
                          border: `1px solid ${meta.border}`,
                          padding: '3px 10px',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <IconComponent size={13} /> {meta.label}
                        </span>
                      );
                    })()}
                    {getStatusBadge(activeApproval.status)}
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                      ID: {activeApproval.id}
                    </span>
                  </div>

                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                    {activeApproval.title}
                  </h2>
                  <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '4px 0 0 0' }}>
                    Diajukan pada {new Date(activeApproval.createdAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' })}
                  </p>
                </div>

                {/* Requester Avatar Card */}
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  textAlign: 'right',
                  flexShrink: 0
                }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>PEMOHON</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A' }}>{activeApproval.requesterName}</div>
                  <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase' }}>{activeApproval.requesterRole}</div>
                </div>
              </div>

              {/* Description Box */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Keterangan Permohonan
                </div>
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.875rem',
                  color: '#1E293B',
                  lineHeight: 1.6
                }}>
                  {activeApproval.details || 'Tidak ada keterangan tambahan yang dicantumkan.'}
                </div>
              </div>

              {/* ── SPECIALIZED PAYLOAD DOSSIER CARDS (Based on Approval Type) ── */}
              {activeApproval.type === 'CASHIER_REGISTRATION' && (
                <div style={{
                  padding: '18px 20px',
                  borderRadius: '14px',
                  background: '#EEF2FF',
                  border: '1px solid #C7D2FE'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Store size={18} style={{ color: '#4F46E5' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#312E81' }}>
                      Profil Akun Kasir yang Didaftarkan
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E0E7FF' }}>
                      <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block', fontWeight: 700 }}>NAMA LENGKAP</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1F2937' }}>{activeApproval.data?.name || activeApproval.requesterName}</span>
                    </div>

                    <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E0E7FF' }}>
                      <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block', fontWeight: 700 }}>USERNAME LOGIN</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#4F46E5', fontFamily: 'monospace' }}>@{activeApproval.data?.username || '-'}</span>
                    </div>

                    <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E0E7FF' }}>
                      <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block', fontWeight: 700 }}>EMAIL / KONTAK</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1F2937' }}>{activeApproval.data?.email || '-'}</span>
                    </div>

                    <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E0E7FF' }}>
                      <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block', fontWeight: 700 }}>HAK AKSES DIMINTA</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#059669' }}>Terminal Kasir POS</span>
                    </div>
                  </div>
                </div>
              )}

              {activeApproval.type === 'CUSTOMER_REGISTRATION' && (
                <div style={{
                  padding: '18px 20px',
                  borderRadius: '14px',
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <UserCheck size={18} style={{ color: '#059669' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#064E3B' }}>
                      Rincian Member / Pelanggan Baru
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: '10px', border: '1px solid #DCFCE7' }}>
                      <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block', fontWeight: 700 }}>NAMA MEMBER</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1F2937' }}>{activeApproval.data?.name || activeApproval.requesterName}</span>
                    </div>

                    <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: '10px', border: '1px solid #DCFCE7' }}>
                      <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block', fontWeight: 700 }}>NO. TELEPON / WA</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#059669' }}>{activeApproval.data?.phone || '-'}</span>
                    </div>

                    <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: '10px', border: '1px solid #DCFCE7' }}>
                      <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block', fontWeight: 700 }}>TIER AWAL</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#D97706' }}>{activeApproval.data?.tier || 'Silver'} Member</span>
                    </div>

                    <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: '10px', border: '1px solid #DCFCE7' }}>
                      <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block', fontWeight: 700 }}>BONUS POIN AKTIVASI</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#059669' }}>⭐ {activeApproval.data?.points || 50} Poin</span>
                    </div>
                  </div>
                </div>
              )}

              {activeApproval.type === 'TRANSACTION_VOID' && (
                <div style={{
                  padding: '18px 20px',
                  borderRadius: '14px',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <ShoppingBag size={18} style={{ color: '#DC2626' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#7F1D1D' }}>
                      Permohonan Pembatalan (VOID) Transaksi Kasir
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: '10px', border: '1px solid #FEE2E2' }}>
                      <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block', fontWeight: 700 }}>NO. INVOICE</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#DC2626', fontFamily: 'monospace' }}>
                        {activeApproval.data?.invoiceNumber || '-'}
                      </span>
                    </div>

                    <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: '10px', border: '1px solid #FEE2E2' }}>
                      <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block', fontWeight: 700 }}>NOMINAL TRANSAKSI</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 900, color: '#0F172A' }}>
                        {activeApproval.data?.amount ? formatRupiah(activeApproval.data.amount) : 'Rp 87.500'}
                      </span>
                    </div>

                    <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: '10px', border: '1px solid #FEE2E2' }}>
                      <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block', fontWeight: 700 }}>PENGARUH RESTORE STOK</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#059669' }}>Stok Kembali Otomatis</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── ACTION / REVIEW BOX ── */}
              {canUserApprove(activeApproval) ? (
                <div style={{
                  padding: '20px',
                  borderRadius: '14px',
                  background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  marginTop: '4px'
                }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                    Tindakan Reviewer
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>
                      CATATAN REVIEW (OPSIONAL UNTUK APPROVAL / WAJIB UNTUK PENOLAKAN):
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Tulis catatan atau alasan..."
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      style={{ background: '#FFFFFF', height: '40px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleReject(activeApproval.id, actionNotes)}
                      className="btn btn-secondary"
                      style={{ padding: '10px 18px', color: '#DC2626', borderColor: '#FECACA', fontWeight: 700, fontSize: '0.84rem' }}
                    >
                      <XCircle size={16} />
                      <span>Tolak Permohonan</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleApprove(activeApproval.id, actionNotes)}
                      className="btn btn-primary"
                      style={{ padding: '10px 22px', fontWeight: 800, fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <CheckCircle2 size={16} />
                      <span>{isProcessing ? 'Memproses...' : 'Setujui Permohonan (Approve)'}</span>
                    </button>
                  </div>
                </div>
              ) : activeApproval.status !== 'PENDING' ? (
                <div style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: activeApproval.status === 'APPROVED' ? '#F0FDF4' : '#FEF2F2',
                  border: `1px solid ${activeApproval.status === 'APPROVED' ? '#BBF7D0' : '#FECACA'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {activeApproval.status === 'APPROVED' ? <CheckCheck size={20} color="#059669" /> : <XCircle size={20} color="#DC2626" />}
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: activeApproval.status === 'APPROVED' ? '#166534' : '#991B1B' }}>
                        Permohonan telah {activeApproval.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        Oleh: <b>{activeApproval.reviewedBy || 'Admin'}</b> • Catatan: <i>"{activeApproval.reviewNotes || '-'}"</i>
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                    {activeApproval.reviewedAt ? new Date(activeApproval.reviewedAt).toLocaleString('id-ID') : '-'}
                  </span>
                </div>
              ) : (
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#92400E',
                  fontSize: '0.8125rem'
                }}>
                  <Lock size={18} style={{ color: '#D97706', flexShrink: 0 }} />
                  <span>Permohonan ini berstatus <b>Menunggu Tindakan Administrator</b>. Anda hanya dapat melihat informasi permohonan.</span>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* ── CASHIER NEW REQUEST MODAL ── */}
      {isNewRequestOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            width: '100%', maxWidth: '480px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '20px', padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#F0FDF4', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Store size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                    Ajukan Otorisasi Kasir ke Admin
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Permohonan akan langsung masuk ke antrean Admin</span>
                </div>
              </div>
              <button onClick={() => setIsNewRequestOpen(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '6px', color: '#64748B', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
                  Jenis Permohonan Otorisasi
                </label>
                <select
                  className="form-select"
                  value={newRequestForm.type}
                  onChange={(e) => setNewRequestForm({ ...newRequestForm, type: e.target.value })}
                >
                  <option value="TRANSACTION_VOID">Pembatalan (VOID) Transaksi Penjualan</option>
                  <option value="DISCOUNT_OVERRIDE">Otorisasi Diskon Khusus Pelanggan</option>
                  <option value="SHIFT_ADJUSTMENT">Klarifikasi Selisih Kas Shift</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
                  Nomor Invoice / Referensi
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Contoh: INV/20240902/0005"
                  value={newRequestForm.invoiceNumber}
                  onChange={(e) => setNewRequestForm({ ...newRequestForm, invoiceNumber: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
                  Nominal Terkait (Rp)
                </label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Contoh: 150000"
                  value={newRequestForm.amount}
                  onChange={(e) => setNewRequestForm({ ...newRequestForm, amount: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
                  Alasan Pengajuan
                </label>
                <textarea
                  className="form-input"
                  rows="3"
                  required
                  placeholder="Jelaskan alasan memerlukan otorisasi admin..."
                  value={newRequestForm.details}
                  onChange={(e) => setNewRequestForm({ ...newRequestForm, details: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsNewRequestOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={isProcessing} style={{ fontWeight: 800 }}>
                  {isProcessing ? 'Mengirim...' : 'Kirim Permohonan Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
