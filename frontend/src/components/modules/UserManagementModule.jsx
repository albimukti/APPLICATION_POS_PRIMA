import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import { ShieldCheck, Plus, CheckCircle2, Crown, Store, UserCheck, Lock } from 'lucide-react';

export default function UserManagementModule() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ username: '', name: '', email: '', password: '', role: 'cashier', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const loadData = async () => {
    try {
      const res = await api.getUsers();
      if (res.success) setUsers((res.users || []).filter(u => u.role === 'admin' || u.role === 'cashier'));
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createUser(formData);
      setIsModalOpen(false);
      setFormData({ username: '', name: '', email: '', password: '', role: 'cashier', phone: '' });
      setSuccessMsg('Pengguna baru berhasil dibuat');
      loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message || 'Gagal membuat user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, name) => {
    try {
      await api.toggleUserStatus(id);
      loadData();
      setSuccessMsg(`Status akun ${name} berhasil diubah`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message || 'Gagal mengubah status');
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-indigo">Modul #8</span>
            <span className="badge badge-success">{users.length} Akun Terdaftar</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
            🔐 Manajemen Pengguna & Hak Akses (RBAC)
          </h2>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Tambah User Baru</span>
        </button>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {users.map(u => (
          <div key={u.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: u.isActive ? 1 : 0.6 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={u.avatar} alt={u.name} style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#1f2937' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{u.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{u.username}</span>
                  </div>
                </div>
                <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {u.isActive ? 'Aktif' : 'Blokir'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                <div>Email: <b>{u.email}</b></div>
                <div>Role: <b style={{ textTransform: 'uppercase', color: u.role === 'admin' ? '#818cf8' : '#34d399' }}>{u.role}</b></div>
                <div>Telepon: {u.phone || '-'}</div>
              </div>
            </div>

            <div style={{ paddingTop: '14px', marginTop: '14px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'flex-end' }}>
              {u.id !== currentUser?.id && (
                <button
                  onClick={() => handleToggleStatus(u.id, u.name)}
                  className={`btn ${u.isActive ? 'btn-danger' : 'btn-primary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                >
                  {u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add User */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Pendaftaran Akun Pengguna Baru" maxWidth="500px" icon={ShieldCheck}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Username:</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="kasir2"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nama Lengkap:</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Ratna Sari"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email:</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="ratna@pos.id"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password Awal:</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="Minimal 6 karakter"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hak Akses (Role):</label>
            <select
              className="form-select"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="cashier">Kasir (Terminal POS, Shift, Struk)</option>
              <option value="admin">Admin (Akses Penuh Semua 16 Modul)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Membuat User...' : 'Simpan User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
