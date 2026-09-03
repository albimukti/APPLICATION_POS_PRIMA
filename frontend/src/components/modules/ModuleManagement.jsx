import React, { useState } from 'react';
import { useModules } from '../../context/ModuleContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sliders,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  AlertTriangle,
  Layers,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Store,
  Coffee,
  Pill
} from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';

export default function ModuleManagement() {
  const { modules, stats, history, toggleModule, applyPreset, loading } = useModules();
  const { user } = useAuth();

  const [selectedModule, setSelectedModule] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { module, targetStatus }
  const [reasonInput, setReasonInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTabSub, setActiveTabSub] = useState('list'); // 'list', 'flowchart', 'history', 'presets'
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);

  const handleOpenToggleConfirm = (mod) => {
    const targetStatus = !mod.isActive;
    setConfirmAction({ module: mod, targetStatus });
    setReasonInput('');
    setErrorMessage(null);
  };

  const handleExecuteToggle = async () => {
    if (!confirmAction) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await toggleModule(confirmAction.module.id, confirmAction.targetStatus, reasonInput);
      setSuccessMessage(res.message);
      setConfirmAction(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Gagal mengubah status modul.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyPreset = async (presetKey) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await applyPreset(presetKey);
      setSuccessMessage(res.message);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menerapkan preset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Top Banner & Title */}
      <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-indigo" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                <Sliders size={14} /> Modul #16
              </span>
              <span className="badge badge-success">Admin Control Center</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
               Dashboard Manajemen Modul
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0, maxWidth: '700px' }}>
              Kontrol aktivasi 16 modul sistem POS secara modular. Nonaktifkan modul dengan konfirmasi & otomatis backup data snapshot, validasi dependensi, dan catat riwayat log history.
            </p>
          </div>

          {/* Stats Badges */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase' }}>Total Modul</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>16</div>
            </div>

            <div style={{
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>Modul Aktif</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>{stats.active}</div>
            </div>

            <div style={{
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.75rem', color: '#fb7185', fontWeight: 700, textTransform: 'uppercase' }}>Nonaktif</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f43f5e' }}>{stats.inactive}</div>
            </div>
          </div>
        </div>

        {/* Success / Error Alerts */}
        {successMessage && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.875rem'
          }}>
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.875rem'
          }}>
            <AlertTriangle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Sub Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
          <button
            onClick={() => setActiveTabSub('list')}
            className={`btn ${activeTabSub === 'list' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Layers size={16} />
            <span>Daftar 16 Modul</span>
          </button>
          <button
            onClick={() => setActiveTabSub('flowchart')}
            className={`btn ${activeTabSub === 'flowchart' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Sparkles size={16} />
            <span>Diagram Alur Sistem</span>
          </button>
          <button
            onClick={() => setActiveTabSub('presets')}
            className={`btn ${activeTabSub === 'presets' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Store size={16} />
            <span>Konfigurasi Preset Bisnis</span>
          </button>
          <button
            onClick={() => setActiveTabSub('history')}
            className={`btn ${activeTabSub === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Clock size={16} />
            <span>Riwayat Perubahan ({history.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: DAFTAR 16 MODUL */}
      {activeTabSub === 'list' && (
        <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {modules.map(mod => {
            return (
              <div
                key={mod.id}
                className="glass-panel"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: mod.isActive ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(244, 63, 94, 0.25)',
                  background: mod.isActive ? 'var(--bg-glass)' : 'rgba(17, 24, 39, 0.45)',
                  opacity: mod.isActive ? 1 : 0.85,
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: mod.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8125rem',
                        fontWeight: 800,
                        color: mod.isActive ? '#10b981' : '#f43f5e'
                      }}>
                        #{mod.id}
                      </span>
                      <span className="badge badge-indigo" style={{ fontSize: '0.6875rem' }}>
                        {mod.category}
                      </span>
                    </div>

                    <span className={`badge ${mod.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {mod.isActive ? '● Aktif' : '○ Nonaktif'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-main)' }}>
                    {mod.name}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: '1.4', margin: '0 0 12px 0' }}>
                    {mod.description}
                  </p>

                  {/* Dependencies indicator */}
                  {mod.dependencies && mod.dependencies.length > 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 600 }}>Ketergantungan: </span>
                      {mod.dependencies.map(d => (
                        <span key={d} style={{ display: 'inline-block', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', margin: '2px' }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Role Permissions Matrix Preview */}
                  <div style={{
                    display: 'flex',
                    gap: '6px',
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    fontSize: '0.6875rem',
                    marginBottom: '16px'
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>Hak Akses:</span>
                    <span style={{ color: '#818cf8', fontWeight: 700 }}>Admin: Full</span>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>
                      Kasir: {mod.permissions?.cashier === 'full' ? 'Full' : mod.permissions?.cashier === 'read' ? 'Lihat' : 'Tidak'}
                    </span>
                    <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                      Customer: {mod.permissions?.customer === 'full' ? 'Full' : mod.permissions?.customer === 'read' ? 'Lihat' : mod.permissions?.customer === 'own' ? 'Data Diri' : 'Tidak'}
                    </span>
                  </div>
                </div>

                {/* Toggle Action Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-glass)' }}>
                  {mod.isCore ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--amber-500)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldAlert size={14} /> Modul Inti Sistem
                    </span>
                  ) : (
                    <button
                      onClick={() => handleOpenToggleConfirm(mod)}
                      className={`btn ${mod.isActive ? 'btn-danger' : 'btn-primary'}`}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.8125rem' }}
                    >
                      {mod.isActive ? (
                        <>
                          <XCircle size={15} /> Nonaktifkan Modul
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={15} /> Aktifkan Modul
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: DIAGRAM ALUR FLOWCHART */}
      {activeTabSub === 'flowchart' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
            Visualisasi Diagram Alur Manajemen Modul
          </h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            padding: '24px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-glass)'
          }}>
            {/* Step 1 */}
            <div style={{ padding: '12px 24px', borderRadius: '8px', background: 'var(--indigo-600)', color: '#fff', fontWeight: 700, textAlign: 'center' }}>
              ADMIN LOGIN KE POS SYSTEM
            </div>
            <ArrowRight size={20} style={{ transform: 'rotate(90deg)', color: 'var(--text-muted)' }} />

            {/* Step 2 */}
            <div style={{ padding: '12px 24px', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass-strong)', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>DASHBOARD ADMIN</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Menu Utama & Manajemen Modul</div>
            </div>
            <ArrowRight size={20} style={{ transform: 'rotate(90deg)', color: 'var(--text-muted)' }} />

            {/* Step 3 */}
            <div style={{ padding: '14px 28px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(16,185,129,0.2))', border: '1px solid var(--indigo-500)', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.05rem' }}>Dashboard Manajemen Modul</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--emerald-500)', fontWeight: 600 }}>Total: 16 Modul | Aktif: {stats.active} | Nonaktif: {stats.inactive}</div>
            </div>

            {/* Branch 2 Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%', maxWidth: '800px', marginTop: '12px' }}>
              {/* Left: Aktifkan Modul */}
              <div style={{ padding: '18px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <h4 style={{ color: '#34d399', fontWeight: 800, margin: '0 0 8px 0' }}> AKTIFKAN MODUL</h4>
                <ol style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', paddingLeft: '18px', lineHeight: '1.6' }}>
                  <li>Pilih modul yang berstatus nonaktif</li>
                  <li>Klik tombol <b>[Aktifkan Modul]</b></li>
                  <li>Sistem memeriksa prasyarat & dependensi</li>
                  <li>Modul aktif & hak akses (permission) diperbarui</li>
                  <li>Pencatatan log history audit</li>
                </ol>
              </div>

              {/* Right: Nonaktifkan Modul */}
              <div style={{ padding: '18px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                <h4 style={{ color: '#fb7185', fontWeight: 800, margin: '0 0 8px 0' }}> NONAKTIFKAN MODUL</h4>
                <ol style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', paddingLeft: '18px', lineHeight: '1.6' }}>
                  <li>Pilih modul aktif yang ingin dinonaktifkan</li>
                  <li>Klik tombol <b>[Nonaktifkan Modul]</b></li>
                  <li>Dialog konfirmasi + alasan perubahan</li>
                  <li><b>Otomatis backup data snapshot (JSON)</b></li>
                  <li>Modul dinonaktifkan & disembunyikan</li>
                  <li>Pencatatan log history audit</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: PRESET BISNIS */}
      {activeTabSub === 'presets' && (
        <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Preset 1: Retail */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Store size={24} style={{ color: 'var(--emerald-500)' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Toko Retail (14 Modul)</h3>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                Konfigurasi ideal untuk minimarket, toko kelontong, butik baju, dan toko aksesoris retail.
              </p>
              <div style={{ fontSize: '0.8125rem', marginBottom: '12px' }}>
                <div style={{ color: '#34d399', fontWeight: 600, marginBottom: '4px' }}>
                   Aktif: 1-3, 4-8, 10-13, 15, 16
                </div>
                <div style={{ color: '#fb7185', fontWeight: 600 }}>
                   Nonaktif: 9 (Shift), 14 (Karyawan)
                </div>
              </div>
            </div>
            <button
              onClick={() => handleApplyPreset('retail')}
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ marginTop: '16px' }}
            >
              Terapkan Preset Retail
            </button>
          </div>

          {/* Preset 2: Restoran / Cafe */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Coffee size={24} style={{ color: '#06b6d4' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Restoran / Cafe (15 Modul)</h3>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                Konfigurasi untuk coffee shop, resto, bakery, dengan dukungan shift kasir operasional harian.
              </p>
              <div style={{ fontSize: '0.8125rem', marginBottom: '12px' }}>
                <div style={{ color: '#34d399', fontWeight: 600, marginBottom: '4px' }}>
                   Aktif: 1-13, 15, 16 (Semua modul operasional)
                </div>
                <div style={{ color: '#fb7185', fontWeight: 600 }}>
                   Nonaktif: 14 (Karyawan)
                </div>
              </div>
            </div>
            <button
              onClick={() => handleApplyPreset('cafe')}
              disabled={isSubmitting}
              className="btn btn-indigo"
              style={{ marginTop: '16px' }}
            >
              Terapkan Preset Resto/Cafe
            </button>
          </div>

          {/* Preset 3: Apotek */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Pill size={24} style={{ color: '#ec4899' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Apotek & Obat (12 Modul)</h3>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                Konfigurasi ringkas untuk apotek dan klinik farmasi fokus pada inventori dan penjualan langsung.
              </p>
              <div style={{ fontSize: '0.8125rem', marginBottom: '12px' }}>
                <div style={{ color: '#34d399', fontWeight: 600, marginBottom: '4px' }}>
                   Aktif: 1-3, 4, 5, 7, 8, 10, 12, 13, 15, 16
                </div>
                <div style={{ color: '#fb7185', fontWeight: 600 }}>
                   Nonaktif: 6 (Promo), 9 (Shift), 11 (Loyalty), 14 (Karyawan)
                </div>
              </div>
            </div>
            <button
              onClick={() => handleApplyPreset('apotek')}
              disabled={isSubmitting}
              className="btn btn-secondary"
              style={{ marginTop: '16px' }}
            >
              Terapkan Preset Apotek
            </button>
          </div>
        </div>
      )}

      {/* VIEW 4: RIWAYAT / HISTORY PERUBAHAN */}
      {activeTabSub === 'history' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
               Log Riwayat Perubahan Modul (Audit Trail)
            </h3>
            <span className="badge badge-indigo">{history.length} Catatan</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass-strong)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Tanggal & Waktu</th>
                  <th style={{ padding: '12px' }}>Aksi</th>
                  <th style={{ padding: '12px' }}>Modul</th>
                  <th style={{ padding: '12px' }}>Dilakukan Oleh</th>
                  <th style={{ padding: '12px' }}>Keterangan / Alasan</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Snapshot Backup</th>
                </tr>
              </thead>
              <tbody>
                {history.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                      {formatDate(item.createdAt)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${
                        item.action === 'ACTIVATE' ? 'badge-success' :
                        item.action === 'DEACTIVATE' ? 'badge-danger' :
                        'badge-indigo'
                      }`}>
                        {item.action}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {item.moduleName}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--emerald-500)', fontWeight: 600 }}>
                      {item.performedBy}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                      {item.details || item.reason || '-'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {item.snapshotId ? (
                        <a
                          href={`/api/modules/snapshot/${item.snapshotId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}
                        >
                          <Download size={13} /> Unduh Snapshot
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-subtle)', fontSize: '0.75rem' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal when Toggling Module */}
      <ConfirmDialog
        isOpen={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleExecuteToggle}
        title={confirmAction?.targetStatus ? 'Konfirmasi Aktivasi Modul' : 'Konfirmasi Nonaktifkan Modul & Buat Backup'}
        isDanger={!confirmAction?.targetStatus}
        confirmText={confirmAction?.targetStatus ? 'Ya, Aktifkan Modul' : 'Ya, Nonaktifkan & Backup Data'}
        loading={isSubmitting}
        message={
          confirmAction?.targetStatus
            ? `Apakah Anda yakin ingin mengaktifkan modul '${confirmAction?.module.name}'? Seluruh hak akses dan menu pengguna akan segera dipulihkan.`
            : `PERINGATAN: Menonaktifkan modul '${confirmAction?.module.name}' akan menyembunyikan modul dari sistem. Sistem akan secara otomatis membuat snapshot data cadangan (Backup JSON) sebelum modul dinonaktifkan.`
        }
        note={
          !confirmAction?.targetStatus && (
            <div>
              <div className="form-group" style={{ marginTop: '8px', marginBottom: 0 }}>
                <label className="form-label" style={{ color: '#fb7185' }}>Alasan Nonaktifkan (Opsional):</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Fitur belum dibutuhkan untuk toko cabang ini"
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                />
              </div>
            </div>
          )
        }
      />
    </div>
  );
}
