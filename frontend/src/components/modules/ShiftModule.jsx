import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useShift } from '../../context/ShiftContext';
import { formatRupiah, formatDate } from '../../utils/formatters';
import Modal from '../common/Modal';
import { Clock, CheckCircle2, DollarSign, AlertCircle, Play, Square, FileText } from 'lucide-react';

export default function ShiftModule() {
  const { user } = useAuth();
  const { activeShift, fetchActiveShift, openShift, closeShift } = useShift();
  const [allShifts, setAllShifts] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isCloseModal, setIsCloseModal] = useState(false);
  const [startCashInput, setStartCashInput] = useState('500000');
  const [openNotes, setOpenNotes] = useState('');
  const [actualCashInput, setActualCashInput] = useState('');
  const [closeNotes, setCloseNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const loadShifts = async () => {
    try {
      const res = await api.getAllShifts();
      if (res.success) setAllShifts(res.shifts);
    } catch (err) {
      console.error('Failed to load shifts:', err);
    }
  };

  useEffect(() => {
    loadShifts();
  }, [activeShift]);

  const handleOpenShift = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await openShift(startCashInput, openNotes);
      setIsOpenModal(false);
      setSuccessMsg('Shift baru berhasil dibuka!');
      loadShifts();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message || 'Gagal membuka shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseShift = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await closeShift(actualCashInput, closeNotes);
      setIsCloseModal(false);
      setSuccessMsg('Shift kasir berhasil ditutup dan direkonsiliasi!');
      loadShifts();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message || 'Gagal menutup shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-indigo">Modul #9</span>
            <span className={`badge ${activeShift ? 'badge-success' : 'badge-danger'}`}>
              {activeShift ? 'Shift Sedang Berjalan' : 'Tidak Ada Shift Terbuka'}
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
            ⏰ Manajemen Shift Kerja & Kas Kasir
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {!activeShift ? (
            <button onClick={() => setIsOpenModal(true)} className="btn btn-primary">
              <Play size={16} />
              <span>Buka Shift Kasir Baru</span>
            </button>
          ) : (
            <button onClick={() => { setActualCashInput(String(activeShift.expectedCash)); setIsCloseModal(true); }} className="btn btn-danger">
              <Square size={16} />
              <span>Tutup Shift Sekarang</span>
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Active Shift Card */}
      {activeShift && (
        <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--emerald-500)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(99, 102, 241, 0.05))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={24} style={{ color: 'var(--emerald-500)' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>{activeShift.shiftNumber}</h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Kasir: {activeShift.cashierName} (Mulai: {formatDate(activeShift.startTime)})</span>
              </div>
            </div>
            <span className="badge badge-success">● Status OPEN</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kas Awal (Starting Float):</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                {formatRupiah(activeShift.startingCash)}
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Penjualan Kas (Tunai):</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
                {formatRupiah(activeShift.cashSales)}
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Penjualan Non-Tunai:</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#818cf8', marginTop: '4px' }}>
                {formatRupiah(activeShift.nonCashSales)}
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimasi Kas Fisik Sistem:</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emerald-500)', marginTop: '4px' }}>
                {formatRupiah(activeShift.expectedCash)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shifts History Table */}
      <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>
          📋 Riwayat Rekonsiliasi Shift Kasir
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass-strong)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px' }}>No. Shift</th>
              <th style={{ padding: '12px' }}>Petugas Kasir</th>
              <th style={{ padding: '12px' }}>Waktu Mulai - Selesai</th>
              <th style={{ padding: '12px' }}>Kas Awal</th>
              <th style={{ padding: '12px' }}>Total Omset</th>
              <th style={{ padding: '12px' }}>Kas Sistem vs Fisik</th>
              <th style={{ padding: '12px' }}>Selisih Kas</th>
              <th style={{ padding: '12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {allShifts.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-main)' }}>{s.shiftNumber}</td>
                <td style={{ padding: '12px' }}>{s.cashierName}</td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {formatDate(s.startTime)} <br /> ➔ {s.endTime ? formatDate(s.endTime) : 'Sedang Berjalan'}
                </td>
                <td style={{ padding: '12px' }}>{formatRupiah(s.startingCash)}</td>
                <td style={{ padding: '12px', fontWeight: 700, color: 'var(--emerald-500)' }}>{formatRupiah(s.totalSales)}</td>
                <td style={{ padding: '12px' }}>
                  {formatRupiah(s.expectedCash)} <br />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fisik: {formatRupiah(s.actualCash)}</span>
                </td>
                <td style={{ padding: '12px', fontWeight: 800, color: s.difference === 0 ? '#34d399' : s.difference < 0 ? '#f43f5e' : '#fbbf24' }}>
                  {formatRupiah(s.difference)}
                </td>
                <td style={{ padding: '12px' }}>
                  <span className={`badge ${s.status === 'OPEN' ? 'badge-success' : 'badge-indigo'}`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Open Shift */}
      <Modal isOpen={isOpenModal} onClose={() => setIsOpenModal(false)} title="Buka Shift Kasir Baru" maxWidth="480px" icon={Play}>
        <form onSubmit={handleOpenShift} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Modal Kas Awal (Starting Float):</label>
            <input
              type="number"
              required
              className="form-input"
              value={startCashInput}
              onChange={(e) => setStartCashInput(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Catatan Shift (Opsional):</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Shift Pagi 08:00 - 16:00"
              value={openNotes}
              onChange={(e) => setOpenNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsOpenModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Membuka...' : 'Buka Shift Kasir'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Close Shift */}
      <Modal isOpen={isCloseModal} onClose={() => setIsCloseModal(false)} title="Tutup Shift & Hitung Kas Fisik" maxWidth="480px" icon={Square}>
        <form onSubmit={handleCloseShift} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', fontSize: '0.84rem' }}>
            <div>Estimasi Kas Seharusnya: <b>{formatRupiah(activeShift?.expectedCash || 0)}</b></div>
          </div>

          <div className="form-group">
            <label className="form-label">Hasil Penghitungan Uang Fisik di Laci Kas (Actual Cash):</label>
            <input
              type="number"
              required
              className="form-input"
              style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--emerald-500)' }}
              value={actualCashInput}
              onChange={(e) => setActualCashInput(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Catatan Penutupan Shift:</label>
            <input
              type="text"
              className="form-input"
              placeholder="Shift selesai dengan lancar..."
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCloseModal(false)}>Batal</button>
            <button type="submit" className="btn btn-danger" disabled={isSubmitting}>
              {isSubmitting ? 'Menutup...' : 'Tutup & Rekonsiliasi'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
