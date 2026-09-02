import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Key, Crown, Store, UserCheck, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';

export default function LoginModule() {
  const { user, login, switchRole, loading } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await login(username, password);
      setSuccessMsg(`Login berhasil! Masuk sebagai ${username}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Login gagal, periksa username dan password.');
    }
  };

  const handleQuickLogin = async (targetRole) => {
    try {
      await switchRole(targetRole);
      setSuccessMsg(`Beralih instan ke mode ${targetRole.toUpperCase()}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg('Gagal switch role');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, var(--emerald-500), var(--indigo-500))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          margin: '0 auto 12px'
        }}>
          <Key size={28} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
          <span className="badge badge-indigo">Modul #13</span>
          <span className="badge badge-success">JWT + RBAC Security</span>
        </div>
        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', fontWeight: 800 }}>
          🔑 Autentikasi Pengguna & Demo Quick Switcher
        </h2>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Pilih akun demo di bawah untuk menguji hak akses (Admin, Kasir, Customer) secara langsung.
        </p>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Lock size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Demo Login Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {/* Admin Card */}
        <div
          onClick={() => handleQuickLogin('admin')}
          className="glass-panel glass-panel-hover"
          style={{
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            border: user?.role === 'admin' ? '2px solid var(--indigo-500)' : '1px solid var(--border-glass)'
          }}
        >
          <Crown size={32} style={{ color: '#818cf8', margin: '0 auto 8px' }} />
          <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700 }}>Akun Admin</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>admin / admin123</span>
          <div style={{ marginTop: '10px' }}>
            <span className="badge badge-indigo">Akses 16 Modul</span>
          </div>
        </div>

        {/* Kasir Card */}
        <div
          onClick={() => handleQuickLogin('cashier')}
          className="glass-panel glass-panel-hover"
          style={{
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            border: user?.role === 'cashier' ? '2px solid var(--emerald-500)' : '1px solid var(--border-glass)'
          }}
        >
          <Store size={32} style={{ color: '#34d399', margin: '0 auto 8px' }} />
          <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700 }}>Akun Kasir</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>kasir / kasir123</span>
          <div style={{ marginTop: '10px' }}>
            <span className="badge badge-success">Terminal POS & Shift</span>
          </div>
        </div>

        {/* Customer Card */}
        <div
          onClick={() => handleQuickLogin('customer')}
          className="glass-panel glass-panel-hover"
          style={{
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            border: user?.role === 'customer' ? '2px solid #fbbf24' : '1px solid var(--border-glass)'
          }}
        >
          <UserCheck size={32} style={{ color: '#fbbf24', margin: '0 auto 8px' }} />
          <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700 }}>Akun Customer</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>customer / cust123</span>
          <div style={{ marginTop: '10px' }}>
            <span className="badge badge-warning">Member & Poin</span>
          </div>
        </div>
      </div>

      {/* Manual Login Form */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>
          Masuk dengan Akun Manual
        </h3>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Username atau Email:</label>
            <input
              type="text"
              required
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password:</label>
            <input
              type="password"
              required
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '12px', fontSize: '0.9375rem' }}>
            {loading ? 'Memverifikasi...' : 'Masuk ke Sistem POS'}
          </button>
        </form>
      </div>
    </div>
  );
}
