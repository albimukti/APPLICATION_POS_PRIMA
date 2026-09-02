import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import {
  ShoppingBag,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  X,
  RefreshCw,
  UserPlus,
  Store,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Database
} from 'lucide-react';
import confetti from 'canvas-confetti';

/* ─────────────────────────────────────────────
   CAPTCHA Helper
───────────────────────────────────────────── */
function generateCaptcha() {
  const ops = ['+', '−', '×'];
  const op = ops[Math.floor(Math.random() * 3)];
  let a, b, answer;
  if (op === '+') {
    a = Math.floor(Math.random() * 9) + 1;
    b = Math.floor(Math.random() * 9) + 1;
    answer = a + b;
  } else if (op === '−') {
    a = Math.floor(Math.random() * 9) + 5;
    b = Math.floor(Math.random() * a) + 1;
    answer = a - b;
  } else {
    a = Math.floor(Math.random() * 5) + 2;
    b = Math.floor(Math.random() * 5) + 1;
    answer = a * b;
  }
  return { question: `${a} ${op} ${b}`, answer };
}

/* ─────────────────────────────────────────────
   Toast Notification Component
───────────────────────────────────────────── */
function ToastPopup({ message, type = 'error', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  const isError = type === 'error';
  const isSuccess = type === 'success';

  const style = isError
    ? {
        background: '#FEF2F2',
        border: '1px solid #FECACA',
        color: '#991B1B',
        boxShadow: '0 12px 30px rgba(220, 38, 38, 0.12)'
      }
    : isSuccess
    ? {
        background: '#F0FDF4',
        border: '1px solid #BBF7D0',
        color: '#166534',
        boxShadow: '0 12px 30px rgba(5, 150, 105, 0.12)'
      }
    : {
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        color: '#1E293B',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)'
      };

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        animation: 'toastSlideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        minWidth: '320px',
        maxWidth: '480px'
      }}
    >
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.95); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>
      <div
        style={{
          ...style,
          borderRadius: '14px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}
      >
        <div style={{ flexShrink: 0, marginTop: '2px' }}>
          {isError ? <AlertTriangle size={18} color="#DC2626" /> : isSuccess ? <CheckCircle2 size={18} color="#059669" /> : <Clock size={18} color="#64748B" />}
        </div>
        <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.5 }}>
          {message}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            flexShrink: 0,
            opacity: 0.7,
            padding: '2px'
          }}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Register Modal Component (Clean & Bright)
───────────────────────────────────────────── */
function RegisterModal({ onClose, registerType, onRegisterCustomer, onRegisterCashier }) {
  const isCashier = registerType === 'cashier';
  const [form, setForm] = useState({ name: '', username: '', password: '', email: '', phone: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isCashier) {
        await onRegisterCashier(form);
      } else {
        await onRegisterCustomer(form);
      }
      setDone(true);
    } catch (err) {
      // Handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          animation: 'modalFadeIn 0.25s ease-out'
        }}
      >
        <style>{`
          @keyframes modalFadeIn {
            from { opacity: 0; transform: scale(0.96) translateY(10px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {done ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            {isCashier ? (
              <>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#FEF3C7',
                    color: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  <Clock size={32} />
                </div>
                <h3 style={{ color: '#0F172A', fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>
                  Menunggu Persetujuan Admin
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: 1.6, margin: '0 0 24px 0' }}>
                  Permohonan pendaftaran akun kasir Anda telah dikirim. Administrator akan mereview dan mengaktifkan akun Anda sebelum dapat digunakan login.
                </p>
              </>
            ) : (
              <>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#FEF3C7',
                    color: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  <Clock size={32} />
                </div>
                <h3 style={{ color: '#0F172A', fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>
                  Menunggu Persetujuan Kasir / Admin
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: 1.6, margin: '0 0 24px 0' }}>
                  Permohonan pendaftaran akun member Anda telah terkirim ke Pusat Approval. Kasir atau Administrator akan memverifikasi dan mengaktifkan akun Anda sebelum dapat digunakan login.
                </p>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '12px',
                border: 'none',
                background: '#059669',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.9375rem',
                cursor: 'pointer'
              }}
            >
              Kembali ke Halaman Login
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isCashier ? '#EEF2FF' : '#F0FDF4',
                    border: `1px solid ${isCashier ? '#C7D2FE' : '#BBF7D0'}`,
                    borderRadius: '999px',
                    padding: '4px 10px',
                    marginBottom: '8px'
                  }}
                >
                  {isCashier ? <Store size={13} style={{ color: '#4F46E5' }} /> : <UserCheck size={13} style={{ color: '#059669' }} />}
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isCashier ? '#4F46E5' : '#059669', letterSpacing: '0.04em' }}>
                    {isCashier ? 'PENDAFTARAN KASIR' : 'PENDAFTARAN MEMBER'}
                  </span>
                </div>
                <h3 style={{ color: '#0F172A', fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                  {isCashier ? 'Daftar Akun Kasir' : 'Daftar Member Baru'}
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.8125rem', marginTop: '4px', margin: '4px 0 0 0' }}>
                  {isCashier ? '⚠️ Memerlukan persetujuan Administrator sebelum aktif.' : '⏳ Memerlukan verifikasi persetujuan Kasir / Admin sebelum aktif.'}
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px',
                  color: '#64748B',
                  cursor: 'pointer',
                  lineHeight: 0
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap Anda"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={modalInputStyle}
                />
              </div>

              {!isCashier && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
                    No. HP / WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="08xx-xxxx-xxxx"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={modalInputStyle}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="Buat username unik"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  style={modalInputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={modalInputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
                  Email (Opsional)
                </label>
                <input
                  type="email"
                  placeholder="email@toko.id"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={modalInputStyle}
                />
              </div>

              {isCashier && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}
                >
                  <Clock size={16} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#92400E', lineHeight: 1.5 }}>
                    Akun kasir akan berstatus <b>Menunggu Persetujuan</b> di Pusat Approval Administrator sebelum dapat dipakai bertransaksi.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  marginTop: '6px',
                  padding: '13px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#059669',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.9375rem',
                  cursor: isLoading ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background 0.2s'
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="spin-icon" /> Mendaftarkan...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} /> {isCashier ? 'Kirim Permohonan Kasir' : 'Daftar Member Sekarang'}
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const modalInputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '10px',
  border: '1px solid #E2E8F0',
  background: '#FFFFFF',
  color: '#0F172A',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s'
};

/* ─────────────────────────────────────────────
   MAIN LoginScreen Component
───────────────────────────────────────────── */
export default function LoginScreen() {
  const { login, registerCustomer, registerCashier } = useAuth();
  const { settings } = useSettings();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // CAPTCHA
  const [failCount, setFailCount] = useState(0);
  const [captcha, setCaptcha] = useState(null);
  const [captchaInput, setCaptchaInput] = useState('');

  // Toast
  const [toast, setToast] = useState(null);

  // Register modal
  const [registerModal, setRegisterModal] = useState(null);

  const appName = settings?.store?.appName || 'POS PRIMA';
  const appSubtitle = settings?.store?.appSubtitle || 'INDONESIA POINT OF SALE';

  const showCaptcha = failCount >= 1;

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
  }, []);

  useEffect(() => {
    if (showCaptcha && !captcha) refreshCaptcha();
  }, [showCaptcha, captcha, refreshCaptcha]);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      showToast('Username dan password tidak boleh kosong!');
      return;
    }

    if (showCaptcha) {
      if (!captchaInput.trim()) {
        showToast('Harap selesaikan verifikasi CAPTCHA terlebih dahulu!');
        return;
      }
      if (parseInt(captchaInput, 10) !== captcha.answer) {
        showToast('Jawaban CAPTCHA salah! Silakan coba lagi.');
        refreshCaptcha();
        setCaptchaInput('');
        return;
      }
    }

    setIsLoggingIn(true);
    try {
      await login(username, password);
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#059669', '#10B981', '#34D399', '#6EE7B7']
      });
    } catch (err) {
      const newFail = failCount + 1;
      setFailCount(newFail);
      refreshCaptcha();
      showToast(
        newFail >= 3
          ? `Login gagal ${newFail}× — Periksa username & password atau hubungi Administrator.`
          : err.message || 'Username atau password salah! Periksa kembali dan coba lagi.',
        'error'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterCustomer = async (data) => {
    const res = await registerCustomer(data);
    showToast(res?.message || 'Permohonan akun member berhasil dikirim ke Pusat Approval!', 'success');
  };

  const handleRegisterCashier = async (data) => {
    await registerCashier(data);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        background: '#F8FAF9'
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');

        .login-input-clean {
          width: 100%;
          padding: 13px 44px 13px 42px;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
          color: #0F172A;
          font-size: 0.9375rem;
          font-family: inherit;
          font-weight: 500;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .login-input-clean::placeholder {
          color: #94A3B8;
        }
        .login-input-clean:focus {
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
        }

        .login-btn-solid {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: #059669;
          color: #FFFFFF;
          font-size: 0.975rem;
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25);
        }
        .login-btn-solid:not(:disabled):hover {
          background: #047857;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(5, 150, 105, 0.35);
        }
        .login-btn-solid:not(:disabled):active {
          transform: translateY(0);
        }
        .login-btn-solid:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .register-btn-outline {
          flex: 1;
          min-width: 140px;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
          color: #475569;
          font-size: 0.8125rem;
          font-family: inherit;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .register-btn-outline:hover {
          border-color: #059669;
          color: #059669;
          background: #F0FDF4;
        }

        .captcha-box-clean {
          background: #F8FAF9;
          border: 1px dashed #CBD5E1;
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .captcha-question-clean {
          font-size: 1.25rem;
          font-weight: 900;
          font-family: 'Outfit', monospace;
          color: #065F46;
          letter-spacing: 0.05em;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .captcha-input-clean {
          width: 72px;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #059669;
          background: #FFFFFF;
          color: #0F172A;
          font-size: 1.05rem;
          font-weight: 800;
          text-align: center;
          outline: none;
          font-family: inherit;
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Subtle Background Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(5, 150, 105, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-5%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(5, 150, 105, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Toast Notification */}
      {toast && (
        <ToastPopup
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Register Modal */}
      {registerModal && (
        <RegisterModal
          registerType={registerModal}
          onClose={() => setRegisterModal(null)}
          onRegisterCustomer={handleRegisterCustomer}
          onRegisterCashier={handleRegisterCashier}
        />
      )}

      {/* ── Main Solid White Card ── */}
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          borderRadius: '20px',
          overflow: 'hidden',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 50px -12px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* ── LEFT: Deep Forest Green Hero Branding Panel ── */}
        <div
          style={{
            padding: '44px 38px',
            background: 'linear-gradient(150deg, #064E3B 0%, #065F46 100%)',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          <div>
            {/* Store Logo & App Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0, overflow: 'hidden' }}>
                {settings?.store?.logoUrl ? (
                  <img
                    src={settings.store.logoUrl}
                    alt="Logo"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '14px',
                      border: '2px solid rgba(255, 255, 255, 0.25)'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '14px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF'
                    }}
                  >
                    <ShoppingBag size={26} />
                  </div>
                )}
              </div>
              <div>
                <div
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    fontFamily: "'Outfit', sans-serif"
                  }}
                >
                  {appName}
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#A7F3D0',
                    letterSpacing: '0.08em',
                    marginTop: '2px',
                    textTransform: 'uppercase'
                  }}
                >
                  {appSubtitle}
                </div>
              </div>
            </div>

            {/* Headline */}
            <h2
              style={{
                fontSize: '1.65rem',
                fontWeight: 900,
                lineHeight: 1.28,
                marginBottom: '12px',
                fontFamily: "'Outfit', sans-serif"
              }}
            >
              Sistem Kasir Pintar & <br />
              <span style={{ color: '#6EE7B7' }}>Manajemen Bisnis Terpadu</span>
            </h2>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.82)',
                lineHeight: 1.65,
                marginBottom: '28px'
              }}
            >
              Platform Point of Sale modern dengan 16 modul terintegrasi untuk kelancaran operasional toko retail, kafe, dan apotek Anda.
            </p>

            {/* Feature Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                {
                  icon: <Zap size={16} />,
                  title: 'Terminal Kasir Kilat (POS)',
                  desc: 'Multi-payment, QRIS Dinamis & cetak struk thermal'
                },
                {
                  icon: <Database size={16} />,
                  title: 'Database PostgreSQL POS_PRIMA',
                  desc: 'Keamanan data terisolasi & role-based access control'
                },
                {
                  icon: <ShieldCheck size={16} />,
                  title: 'Pusat Approval & Audit Log',
                  desc: 'Pemantauan aktivitas kasir & otorisasi admin transparan'
                }
              ].map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)'
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                      color: '#A7F3D0'
                    }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF' }}>{f.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.75)', marginTop: '2px' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Minimalist System Status at Bottom */}
          <div
            style={{
              marginTop: '32px',
              padding: '10px 14px',
              background: 'rgba(0, 0, 0, 0.15)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#34D399',
                  display: 'inline-block',
                  boxShadow: '0 0 8px #34D399'
                }}
              />
              <span style={{ fontWeight: 700 }}>Sistem Kasir Siap</span>
            </div>
            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>16 Modul Aktif</span>
          </div>
        </div>

        {/* ── RIGHT: Solid Clean Login Form Panel ── */}
        <div
          style={{
            padding: '44px 38px',
            background: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '999px',
                padding: '4px 12px',
                marginBottom: '10px'
              }}
            >
              <ShieldCheck size={13} style={{ color: '#059669' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', letterSpacing: '0.04em' }}>
                AUTENTIKASI AMAN
              </span>
            </div>
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#0F172A',
                margin: '0 0 6px 0',
                fontFamily: "'Outfit', sans-serif"
              }}
            >
              Masuk ke Akun Anda
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0 }}>
              Masukkan username dan password untuk membuka sesi kerja.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Username */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={17}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94A3B8',
                    pointerEvents: 'none'
                  }}
                />
                <input
                  type="text"
                  className="login-input-clean"
                  placeholder="Masukkan username Anda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={17}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94A3B8',
                    pointerEvents: 'none'
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="login-input-clean"
                  style={{ paddingRight: '44px' }}
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '2px',
                    lineHeight: 0
                  }}
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* CAPTCHA (Hanya tampil setelah login gagal >= 1x) */}
            {showCaptcha && captcha && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  Verifikasi Keamanan
                </label>
                <div className="captcha-box-clean">
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Hitung:</span>
                  <span className="captcha-question-clean">{captcha.question} = ?</span>
                  <input
                    type="number"
                    className="captcha-input-clean"
                    placeholder="?"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '8px',
                      color: '#64748B',
                      cursor: 'pointer',
                      lineHeight: 0,
                      flexShrink: 0
                    }}
                    title="Ganti soal CAPTCHA"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
                <p style={{ fontSize: '0.72rem', color: '#D97706', margin: '4px 0 0 0' }}>
                  ⚠️ Verifikasi aktif untuk mencegah upaya login berulang yang tidak sah.
                </p>
              </div>
            )}

            {/* Submit Solid Green Button */}
            <button type="submit" disabled={isLoggingIn} className="login-btn-solid" style={{ marginTop: '6px' }}>
              {isLoggingIn ? (
                <>
                  <RefreshCw size={18} className="spin-icon" /> Memvalidasi Akun...
                </>
              ) : (
                <>
                  <span>Masuk ke Aplikasi</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Outlined Registration Options */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #F1F5F9'
            }}
          >
            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748B', marginBottom: '12px', fontWeight: 600 }}>
              Belum memiliki akun?
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="register-btn-outline"
                onClick={() => setRegisterModal('customer')}
                title="Daftar sebagai Member / Pelanggan"
              >
                <UserCheck size={15} style={{ color: '#059669' }} />
                <span>Daftar Member</span>
              </button>

              <button
                type="button"
                className="register-btn-outline"
                onClick={() => setRegisterModal('cashier')}
                title="Daftar akun Kasir (Perlu Approval Admin)"
              >
                <Store size={15} style={{ color: '#4F46E5' }} />
                <span>Daftar Kasir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
