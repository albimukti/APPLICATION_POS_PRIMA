import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Camera,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Crown,
  Store,
  Sparkles,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

const AVATAR_PRESETS = [
  { id: 'admin_1', label: 'Admin Eksekutif', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminPrima' },
  { id: 'cashier_fem', label: 'Kasir Ramah (Wanita)', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SitiKasir' },
  { id: 'cashier_male', label: 'Kasir Sigap (Pria)', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RianKasir' },
  { id: 'barista', label: 'Barista / F&B Staff', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BaristaPro' },
  { id: 'bot_tech', label: 'Smart Bot POS', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=PosPrimaBot' },
  { id: 'vip_cust', label: 'Member VIP', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VipCustomer' },
];

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [customUrl, setCustomUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'preset' | 'url'
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  // Handle local file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file foto maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const payload = {
        name,
        email,
        phone,
        avatar,
        ...(newPassword.trim().length >= 6 ? { password: newPassword } : {})
      };

      await updateProfile(payload);
      setSuccessMsg('Foto profil dan data akun berhasil disimpan!');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan perubahan profil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetAvatar = () => {
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`;
    setAvatar(defaultAvatar);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '22px',
        padding: '30px',
        boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.25)',
        maxHeight: '92vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F0FDF4', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Pengaturan Profil Pengguna
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0 0' }}>
                Ubah foto profil, informasi identitas, dan kredensial akun
              </p>
            </div>
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
            <X size={18} />
          </button>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontWeight: 700 }}>
            <CheckCircle2 size={18} color="#059669" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontWeight: 700 }}>
            <X size={18} color="#DC2626" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ── AVATAR UPLOAD & PREVIEW SECTION ── */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px'
        }}>
          {/* Avatar Image Preview with Camera Overlay */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid #059669',
              boxShadow: '0 8px 25px rgba(5, 150, 105, 0.2)',
              background: '#E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {avatar ? (
                <img src={avatar} alt="Foto Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={48} color="#94A3B8" />
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#059669',
                color: '#FFFFFF',
                border: '2px solid #FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
              title="Unggah foto dari perangkat"
            >
              <Camera size={16} />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp, image/gif"
            style={{ display: 'none' }}
          />

          {/* Avatar Method Switcher Tabs */}
          <div style={{ display: 'flex', background: '#E2E8F0', borderRadius: '10px', padding: '3px', gap: '3px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              style={{
                background: activeTab === 'upload' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'upload' ? '#0F172A' : '#64748B',
                border: 'none',
                borderRadius: '8px',
                padding: '5px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Upload size={12} style={{ display: 'inline', marginRight: '4px' }} /> Unggah File
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preset')}
              style={{
                background: activeTab === 'preset' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'preset' ? '#0F172A' : '#64748B',
                border: 'none',
                borderRadius: '8px',
                padding: '5px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} /> Avatar Galeri
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('url')}
              style={{
                background: activeTab === 'url' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'url' ? '#0F172A' : '#64748B',
                border: 'none',
                borderRadius: '8px',
                padding: '5px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <ImageIcon size={12} style={{ display: 'inline', marginRight: '4px' }} /> Link URL
            </button>
          </div>

          {/* Tab Content 1: Upload */}
          {activeTab === 'upload' && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '7px 14px' }}
              >
                <Upload size={14} /> Pilih Gambar dari Komputer
              </button>

              <button
                type="button"
                onClick={handleResetAvatar}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '7px 12px', color: '#64748B' }}
                title="Kembalikan ke avatar standar"
              >
                <RefreshCw size={13} /> Reset
              </button>
            </div>
          )}

          {/* Tab Content 2: Preset Gallery */}
          {activeTab === 'preset' && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {AVATAR_PRESETS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setAvatar(p.url)}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: avatar === p.url ? '2.5px solid #059669' : '2px solid #E2E8F0',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                    boxShadow: avatar === p.url ? '0 0 10px rgba(5, 150, 105, 0.4)' : 'none'
                  }}
                  title={p.label}
                >
                  <img src={p.url} alt={p.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}

          {/* Tab Content 3: URL Input */}
          {activeTab === 'url' && (
            <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '380px' }}>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/foto.jpg"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                style={{ height: '36px', fontSize: '0.8rem' }}
              />
              <button
                type="button"
                onClick={() => { if (customUrl) setAvatar(customUrl); }}
                className="btn btn-primary"
                style={{ padding: '0 14px', fontSize: '0.78rem' }}
              >
                Terapkan
              </button>
            </div>
          )}
        </div>

        {/* ── USER DETAILS FORM ── */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Role & Username info row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>USERNAME (LOGIN)</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>@{user?.username || 'user'}</span>
            </div>

            <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>HAK AKSES / PERAN</span>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: user?.role === 'admin' ? '#4F46E5' : '#059669',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '2px'
              }}>
                {user?.role === 'admin' ? <Crown size={13} /> : <Store size={13} />}
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
              Nama Lengkap
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                required
                className="form-input"
                style={{ paddingLeft: '36px', height: '40px', fontSize: '0.875rem' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap Anda"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
              Alamat Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '36px', height: '40px', fontSize: '0.875rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@toko.id"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
              Nomor Telepon / WhatsApp
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="tel"
                className="form-input"
                style={{ paddingLeft: '36px', height: '40px', fontSize: '0.875rem' }}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
              />
            </div>
          </div>

          {/* Optional: Change Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
              Ganti Password Baru (Opsional)
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '36px', paddingRight: '40px', height: '40px', fontSize: '0.875rem' }}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kosongkan jika tidak ingin mengubah password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ padding: '10px 18px', fontSize: '0.85rem' }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {isSaving ? (
                <>
                  <RefreshCw size={15} className="spin-icon" /> Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Simpan Perubahan Profil
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
