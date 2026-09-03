import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { useShift } from '../../context/ShiftContext';
import { ShoppingBag, Clock } from 'lucide-react';

export default function Footer() {
  const { settings } = useSettings();
  const { user } = useAuth();
  const { activeShift } = useShift();

  const storeInfo = settings?.store || {};
  const appName = storeInfo.appName || 'POS PRIMA';
  const storePhone = storeInfo.phone || '(021) 5790-1234';
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-glass-strong)',
      padding: '8px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '8px',
      flexShrink: 0
    }}>
      {/* Left: Brand + Copyright */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {storeInfo.logoUrl ? (
          <img
            src={storeInfo.logoUrl}
            alt="Logo"
            style={{ width: '22px', height: '22px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-glass-strong)' }}
          />
        ) : (
          <div style={{
            width: '22px', height: '22px', borderRadius: '6px',
            background: 'linear-gradient(135deg, var(--emerald-500), var(--indigo-500))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
          }}>
            <ShoppingBag size={13} />
          </div>
        )}
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          © {currentYear} <b style={{ color: 'var(--text-main)' }}>{appName}</b>
        </span>
        <span style={{
          background: 'rgba(5, 150, 105, 0.1)',
          color: 'var(--emerald-500)',
          border: '1px solid rgba(5, 150, 105, 0.25)',
          padding: '1px 6px', borderRadius: '999px',
          fontWeight: 700, fontSize: '0.65rem'
        }}>
          v2.4.0
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
           {storePhone}
        </span>
      </div>

      {/* Right: Shift status + User role */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          fontSize: '0.72rem', color: activeShift ? 'var(--emerald-500)' : 'var(--rose-500)',
          fontWeight: 700
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: activeShift ? '#10b981' : '#f43f5e',
            display: 'inline-block',
            boxShadow: activeShift ? '0 0 5px #10b981' : '0 0 5px #f43f5e'
          }} />
          <Clock size={11} />
          <span>{activeShift ? `Shift ${activeShift.shiftNumber} (Aktif)` : 'Shift Belum Dibuka'}</span>
        </div>

        <span style={{
          background: 'var(--bg-tertiary)', padding: '3px 8px',
          borderRadius: '6px', border: '1px solid var(--border-glass-strong)',
          fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700
        }}>
          {user?.role?.toUpperCase()}: <b style={{ color: 'var(--text-main)' }}>{user?.name}</b>
        </span>
      </div>
    </footer>
  );
}
