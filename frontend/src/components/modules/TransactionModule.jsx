import React, { useState, useEffect } from 'react';
import ProductModule from './ProductModule';
import CartDrawer from '../pos/CartDrawer';
import PaymentModal from '../pos/PaymentModal';
import ReceiptModal from '../pos/ReceiptModal';
import BarcodeScannerModal from '../pos/BarcodeScannerModal';
import ConfirmDialog from '../common/ConfirmDialog';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatRupiah, formatDate } from '../../utils/formatters';
import {
  ShoppingBag,
  History,
  Receipt,
  RotateCcw,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  ShoppingCart
} from 'lucide-react';

export default function TransactionModule() {
  const { user } = useAuth();
  const { totalItemsCount, totalAmount, openCart } = useCart();
  const [subTab, setSubTab] = useState('pos'); // 'pos' or 'history'
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState(null);
  const [selectedReceiptTrx, setSelectedReceiptTrx] = useState(null);

  // History state
  const [transactions, setTransactions] = useState([]);
  const [historySearch, setHistorySearch] = useState('');
  const [voidTrxTarget, setVoidTrxTarget] = useState(null);
  const [voidReason, setVoidReason] = useState('');
  const [isVoiding, setIsVoiding] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(null);

  const loadTransactions = async () => {
    try {
      const res = await api.getTransactions();
      if (res.success) setTransactions(res.transactions);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  };

  useEffect(() => {
    if (subTab === 'history') {
      loadTransactions();
    }
  }, [subTab]);

  const handleSuccessPayment = (trx) => {
    setCompletedTransaction(trx);
  };

  const handleExecuteVoid = async () => {
    if (!voidTrxTarget) return;
    setIsVoiding(true);
    try {
      const res = await api.voidTransaction(voidTrxTarget.id, voidReason || 'Pembatalan kasir');
      if (res.success) {
        setVoidTrxTarget(null);
        setVoidReason('');
        loadTransactions();
      }
    } catch (err) {
      alert(err.message || 'Gagal membatalkan transaksi');
    } finally {
      setIsVoiding(false);
    }
  };

  const handleProcessOrder = async (transaction) => {
    setIsProcessingOrder(transaction.id);
    try {
      await api.processTransaction(transaction.id);
      loadTransactions();
    } catch (err) {
      alert(err.message || 'Gagal memproses pesanan customer');
    } finally {
      setIsProcessingOrder(null);
    }
  };

  const filteredHistory = transactions.filter(t =>
    t.invoiceNumber.toLowerCase().includes(historySearch.toLowerCase()) ||
    (t.customerName && t.customerName.toLowerCase().includes(historySearch.toLowerCase())) ||
    t.paymentMethod.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '8px 18px',
      gap: '10px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Subtab Navigation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setSubTab('pos')}
            className={`btn ${subTab === 'pos' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 16px', fontSize: '0.85rem' }}
          >
            <ShoppingBag size={15} />
            <span>Terminal POS Kasir</span>
          </button>
          <button
            onClick={() => setSubTab('history')}
            className={`btn ${subTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 16px', fontSize: '0.85rem' }}
          >
            <History size={15} />
            <span>Riwayat Transaksi Penjualan</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-indigo">{user?.role === 'customer' ? 'Katalog Produk & Checkout' : 'Terminal Kasir & Checkout'}</span>
        </div>
      </div>

      {/* VIEW 1: CASHIER POS SCREEN (SPACIOUS FULL-WIDTH CATALOG) */}
      {subTab === 'pos' && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <ProductModule />
        </div>
      )}

      {/* VIEW 2: TRANSACTION HISTORY SCREEN */}
      {subTab === 'history' && (
        <div className="glass-panel" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ position: 'relative', width: '360px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="Cari nomor invoice, pelanggan..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
            </div>
            <button onClick={loadTransactions} className="btn btn-secondary">
              Refresh Data
            </button>
          </div>

          {/* Transactions Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass-strong)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>No. Faktur</th>
                  <th style={{ padding: '12px' }}>Tanggal</th>
                  <th style={{ padding: '12px' }}>Kasir</th>
                  <th style={{ padding: '12px' }}>Pelanggan</th>
                  <th style={{ padding: '12px' }}>Metode</th>
                  <th style={{ padding: '12px' }}>Total Bayar</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map(trx => (
                  <tr key={trx.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {trx.invoiceNumber}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                      {formatDate(trx.createdAt)}
                    </td>
                    <td style={{ padding: '12px' }}>{trx.cashierName}</td>
                    <td style={{ padding: '12px', color: 'var(--emerald-500)', fontWeight: 600 }}>
                      {trx.customerName || 'Umum'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className="badge badge-indigo">{trx.paymentMethod}</span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 800, color: 'var(--text-main)' }}>
                      {formatRupiah(trx.totalAmount)}
                    </td>
                    <td style={{ padding: '12px' }}>
                        <span className={`badge ${trx.status === 'COMPLETED' ? 'badge-success' : trx.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                        {trx.status === 'COMPLETED' ? '● LUNAS' : trx.status === 'PENDING' ? '◷ MENUNGGU PROSES' : '○ VOID'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                        <button
                          onClick={() => setSelectedReceiptTrx(trx)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                          title="Lihat & Cetak Struk"
                        >
                          <Receipt size={14} /> Struk
                        </button>
                        {trx.status === 'PENDING' && (user?.role === 'admin' || user?.role === 'cashier') && (
                          <button
                            onClick={() => handleProcessOrder(trx)}
                            className="btn btn-primary"
                            disabled={isProcessingOrder === trx.id}
                            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                            title="Proses pesanan customer"
                          >
                            <CheckCircle2 size={14} /> {isProcessingOrder === trx.id ? 'Memproses...' : 'Proses'}
                          </button>
                        )}
                        {trx.status === 'COMPLETED' && (user?.role === 'admin' || user?.role === 'cashier') && (
                          <button
                            onClick={() => setVoidTrxTarget(trx)}
                            className="btn btn-danger"
                            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                            title="Batalkan Transaksi (VOID)"
                          >
                            <RotateCcw size={14} /> Void
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-over Cart Drawer Modal */}
      <CartDrawer
        onOpenPayment={() => setIsPaymentOpen(true)}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccessPayment={handleSuccessPayment}
      />

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      {/* Receipt Modal (Upon payment or viewing history) */}
      <ReceiptModal
        isOpen={Boolean(completedTransaction || selectedReceiptTrx)}
        onClose={() => {
          setCompletedTransaction(null);
          setSelectedReceiptTrx(null);
        }}
        transaction={completedTransaction || selectedReceiptTrx}
      />

      {/* Void Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(voidTrxTarget)}
        onClose={() => setVoidTrxTarget(null)}
        onConfirm={handleExecuteVoid}
        title={`Konfirmasi Void Transaksi (${voidTrxTarget?.invoiceNumber})`}
        message={`Apakah Anda yakin ingin membatalkan transaksi penjualan ini? Stok barang akan otomatis dikembalikan ke inventori.`}
        isDanger={true}
        confirmText="Ya, Batalkan (VOID)"
        loading={isVoiding}
        note={
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ color: '#fb7185' }}>Alasan Pembatalan:</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Kesalahan input item oleh kasir / Pelanggan membatalkan"
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
            />
          </div>
        }
      />
    </div>
  );
}
