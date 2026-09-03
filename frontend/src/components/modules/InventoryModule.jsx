import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatRupiah, formatDate } from '../../utils/formatters';
import Modal from '../common/Modal';
import {
  BarChart3,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  SlidersHorizontal,
  History,
  CheckCircle2,
  Layers,
  Search,
  Eye
} from 'lucide-react';

export default function InventoryModule() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [totalAssetValue, setTotalAssetValue] = useState(0);
  const [activeTabSub, setActiveTabSub] = useState('stock'); // 'stock' or 'logs'
  const [search, setSearch] = useState('');
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [adjustType, setAdjustType] = useState('IN'); // 'IN', 'OUT', 'ADJUSTMENT'
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const loadData = async () => {
    try {
      const invRes = await api.getInventory();
      if (invRes.success) {
        setInventory(invRes.inventory);
        setLowStockCount(invRes.lowStockCount);
        setTotalAssetValue(invRes.totalAssetValue);
      }
      const logsRes = await api.getInventoryLogs();
      if (logsRes.success) {
        setLogs(logsRes.logs);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExecuteAdjust = async (e) => {
    e.preventDefault();
    if (!adjustTarget || !adjustQty) return;
    setIsSubmitting(true);
    try {
      const res = await api.adjustStock({
        productId: adjustTarget.id,
        quantity: parseInt(adjustQty, 10),
        type: adjustType,
        reason: adjustReason
      });
      if (res.success) {
        setSuccessMsg(res.message);
        setAdjustTarget(null);
        setAdjustQty('');
        setAdjustReason('');
        loadData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      alert(err.message || 'Gagal menyesuaikan stok');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredInventory = inventory.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase()) ||
    (i.categoryName && i.categoryName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Header Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL ITEM PRODUK</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            {inventory.length} SKU
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fb7185' }}>PERINGATAN STOK MENIPIS</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f43f5e', marginTop: '4px' }}>
            {lowStockCount} Produk
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="glass-panel" style={{ padding: '20px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399' }}>ESTIMASI NILAI ASET STOK</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-500)', marginTop: '4px' }}>
              {formatRupiah(totalAssetValue)}
            </div>
          </div>
        )}
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Navigation Subtabs & Search */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setActiveTabSub('stock')}
              className={`btn ${activeTabSub === 'stock' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <BarChart3 size={16} />
              <span>Daftar Stok Inventori</span>
            </button>
            <button
              onClick={() => setActiveTabSub('logs')}
              className={`btn ${activeTabSub === 'logs' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <History size={16} />
              <span>Log Mutasi Stok ({logs.length})</span>
            </button>
            {user?.role !== 'admin' && (
              <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Eye size={12} /> Mode Cek Stok (Hanya Lihat)
              </span>
            )}
          </div>

          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Cari produk / SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* SUBTAB 1: STOCK LIST */}
        {activeTabSub === 'stock' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass-strong)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>SKU</th>
                  <th style={{ padding: '12px' }}>Nama Produk</th>
                  <th style={{ padding: '12px' }}>Kategori</th>
                  {user?.role === 'admin' && <th style={{ padding: '12px' }}>Harga Modal</th>}
                  <th style={{ padding: '12px' }}>Harga Jual</th>
                  <th style={{ padding: '12px' }}>Sisa Stok</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  {user?.role === 'admin' && <th style={{ padding: '12px', textAlign: 'center' }}>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{item.sku}</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{item.categoryName}</td>
                    {user?.role === 'admin' && <td style={{ padding: '12px' }}>{formatRupiah(item.costPrice)}</td>}
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--emerald-500)' }}>{formatRupiah(item.price)}</td>
                    <td style={{ padding: '12px', fontWeight: 800, fontSize: '0.9375rem' }}>
                      {item.stock} {item.unit}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${item.stock <= 0 ? 'badge-danger' : item.isLowStock ? 'badge-warning' : 'badge-success'}`}>
                        {item.stock <= 0 ? 'Habis' : item.isLowStock ? 'Menipis' : 'Aman'}
                      </span>
                    </td>
                    {user?.role === 'admin' && (
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => setAdjustTarget(item)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}
                        >
                          <SlidersHorizontal size={13} /> Penyesuaian
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SUBTAB 2: MUTASI LOGS */}
        {activeTabSub === 'logs' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass-strong)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Tanggal & Waktu</th>
                  <th style={{ padding: '12px' }}>Nama Produk</th>
                  <th style={{ padding: '12px' }}>Tipe Mutasi</th>
                  <th style={{ padding: '12px' }}>Jumlah</th>
                  <th style={{ padding: '12px' }}>Stok Awal Akhir</th>
                  <th style={{ padding: '12px' }}>Alasan / Sumber</th>
                  <th style={{ padding: '12px' }}>Petugas</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{formatDate(log.createdAt)}</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-main)' }}>{log.productName}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${
                        log.type === 'IN' ? 'badge-success' :
                        log.type === 'OUT' || log.type === 'SALE' ? 'badge-danger' :
                        log.type === 'RETURN' ? 'badge-indigo' :
                        'badge-warning'
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 800, color: log.quantity > 0 ? '#10b981' : '#f43f5e' }}>
                      {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                    </td>
                    <td style={{ padding: '12px' }}>{log.stockBefore} {log.stockAfter}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{log.reason || '-'}</td>
                    <td style={{ padding: '12px', color: 'var(--emerald-500)', fontWeight: 600 }}>{log.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {adjustTarget && user?.role === 'admin' && (
        <Modal isOpen={Boolean(adjustTarget)} onClose={() => setAdjustTarget(null)} title={`Penyesuaian Stok: ${adjustTarget.name}`} maxWidth="480px" icon={SlidersHorizontal}>
          <form onSubmit={handleExecuteAdjust} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-secondary)', fontSize: '0.84rem' }}>
              <div>Stok Saat Ini: <b>{adjustTarget.stock} {adjustTarget.unit}</b></div>
              <div>Batas Minimum: <b>{adjustTarget.minStockAlert} {adjustTarget.unit}</b></div>
            </div>

            <div className="form-group">
              <label className="form-label">Tipe Penyesuaian:</label>
              <select className="form-select" value={adjustType} onChange={(e) => setAdjustType(e.target.value)}>
                <option value="IN">Barang Masuk / Pembelian (+)</option>
                <option value="OUT">Barang Keluar / Rusak / Expired (-)</option>
                <option value="ADJUSTMENT">Stock Opname / Koreksi Manual</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Jumlah Unit:</label>
              <input
                type="number"
                min="1"
                required
                className="form-input"
                placeholder="Jumlah penyesuaian..."
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Keterangan / Alasan:</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Contoh: Penerimaan stok dari gudang pusat"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setAdjustTarget(null)}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan Stok'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
