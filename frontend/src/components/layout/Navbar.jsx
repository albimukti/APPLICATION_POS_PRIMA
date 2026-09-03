import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useShift } from '../../context/ShiftContext';
import { useSettings } from '../../context/SettingsContext';
import { useCart } from '../../context/CartContext';
import {
  Sun,
  Moon,
  Bell,
  Clock,
  LogOut,
  ShoppingBag,
  ShoppingCart,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Star,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  User,
  Camera
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';
import ProfileModal from '../common/ProfileModal';

export default function Navbar({ onOpenShiftModal, setActiveTab, isSidebarOpen, onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { activeShift } = useShift();
  const { settings } = useSettings();
  const { totalItemsCount, totalAmount, toggleCart, isCartOpen } = useCart();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const appName = settings?.store?.appName || 'POS PRIMA';
  const appSubtitle = settings?.store?.appSubtitle || 'Sistem Kasir 16 Modul';

  const [notifications, setNotifications] = useState([]);

  const fetchNotifs = async () => {
    try {
      const res = await api.getNotifications();
      if (res && res.success && Array.isArray(res.notifications)) {
        setNotifications(res.notifications.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          time: new Date(n.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          type: n.type === 'WARNING' ? 'warning' : n.type === 'SUCCESS' ? 'success' : 'info',
          isRead: Boolean(n.isRead)
        })));
      }
    } catch (err) {
      // Keep existing
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 12000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await Promise.all(notifications.filter(n => !n.isRead).map(n => api.markNotificationRead(n.id)));
  };

  const handleMarkItemRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      api.markNotificationRead(id);
    } catch (err) {
      // Quiet
    }
  };

  return (
    <header className="glass-header" style={{ height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', zIndex: 40 }}>
      {/* Left: Sidebar Toggle & Dynamic Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Toggle Sidebar Button */}
        <button
          onClick={onToggleSidebar}
          className="btn-icon btn-secondary"
          title={isSidebarOpen ? 'Tutup Sidebar (Perluas Tampilan Layar)' : 'Buka Sidebar Navigasi'}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: isSidebarOpen ? 'var(--bg-secondary)' : 'rgba(16, 185, 129, 0.15)',
            border: isSidebarOpen ? '1px solid var(--border-glass-strong)' : '1px solid rgba(16, 185, 129, 0.4)',
            color: isSidebarOpen ? 'var(--text-main)' : 'var(--emerald-500)',
            transition: 'all 0.2s ease'
          }}
        >
          {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>

        {/* Dynamic Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          {settings?.store?.logoUrl ? (
            <img
              src={settings.store.logoUrl}
              alt="Brand Logo"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '9px',
                objectFit: 'cover',
                border: '1px solid var(--border-glass-strong)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)'
              }}
            />
          ) : (
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, var(--emerald-500), var(--indigo-500))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 3px 10px var(--emerald-glow)'
            }}>
              <ShoppingBag size={20} />
            </div>
          )}
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: 'var(--text-main)' }}>
              {appName}
            </h1>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
              {appSubtitle}
            </p>
          </div>
        </div>

        {/* Shift Badge Indicator for Cashier/Admin */}
        {(user?.role === 'cashier' || user?.role === 'admin') && (
          <button
            onClick={onOpenShiftModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '999px',
              border: '1px solid var(--border-glass-strong)',
              background: activeShift ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
              color: activeShift ? '#059669' : '#e11d48',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 700,
              transition: 'all 0.2s ease'
            }}
          >
            <Clock size={14} />
            <span>
              {activeShift ? `Shift ${activeShift.shiftNumber}` : 'Buka Shift'}
            </span>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: activeShift ? '#10b981' : '#f43f5e',
              display: 'inline-block'
            }} />
          </button>
        )}

        {/* Member Points Indicator for Customer */}
        {user?.role === 'customer' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '999px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#d97706',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            <Star size={14} />
            <span>VIP: 450 Poin</span>
          </div>
        )}
      </div>

      {/* Right Controls: Top Cart Button with Red Badge Counter, Theme, Notifications, User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* TOP SHOPPING CART BUTTON WITH RED BADGE NUMBER */}
        <button
          onClick={toggleCart}
          title="Buka Keranjang Belanja Penjualan"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            borderRadius: '999px',
            background: totalItemsCount > 0 ? 'rgba(5, 150, 105, 0.1)' : 'var(--bg-tertiary)',
            border: totalItemsCount > 0 ? '1.5px solid var(--emerald-500)' : '1px solid var(--border-glass-strong)',
            color: 'var(--text-main)',
            cursor: 'pointer',
            position: 'relative',
            fontWeight: 700,
            fontSize: '0.8125rem',
            boxShadow: totalItemsCount > 0 ? '0 2px 8px rgba(5, 150, 105, 0.2)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <ShoppingCart size={19} style={{ color: totalItemsCount > 0 ? 'var(--emerald-500)' : 'var(--text-muted)' }} />
            {totalItemsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-10px',
                background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: 800,
                minWidth: '20px',
                height: '20px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
                boxShadow: '0 2px 6px rgba(225, 29, 72, 0.4)',
                animation: 'scaleUp 0.2s ease'
              }}>
                {totalItemsCount}
              </span>
            )}
          </div>
          <span style={{ fontWeight: 800, marginLeft: totalItemsCount > 0 ? '4px' : '0' }}>
            {totalItemsCount > 0 ? formatRupiah(totalAmount) : 'Keranjang'}
          </span>
        </button>

        {/* Admin Shortcut to Module Management */}
        {user?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('module_management')}
            className="btn btn-indigo"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            title="Buka Modul #16 Manajemen Modul"
          >
            <Sliders size={15} />
            <span>Kelola (16)</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="btn-icon btn-secondary"
          title={`Ganti ke ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          style={{ width: '36px', height: '36px' }}
        >
          {theme === 'dark' ? <Sun size={17} style={{ color: '#fbbf24' }} /> : <Moon size={17} style={{ color: '#6366f1' }} />}
        </button>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn-icon btn-secondary"
            style={{ position: 'relative', width: '36px', height: '36px' }}
            title="Notifikasi Sistem"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: '#ffffff',
                fontSize: '0.625rem',
                fontWeight: 800,
                minWidth: '17px',
                height: '17px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
                border: '1.5px solid var(--bg-primary)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="glass-panel" style={{
              position: 'absolute',
              right: 0,
              top: '46px',
              width: '320px',
              padding: '14px',
              zIndex: 50,
              boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
              borderRadius: 'var(--radius-lg)',
              animation: 'scaleUp 0.2s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bell size={15} style={{ color: 'var(--emerald-500)' }} />
                  <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 700 }}>Notifikasi Sistem</h4>
                </div>
                {unreadCount > 0 ? (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--emerald-500)',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Tandai Semua Dibaca
                  </button>
                ) : (
                  <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>Semua Terbaca</span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleMarkItemRead(n.id)}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: n.isRead ? 'var(--bg-tertiary)' : 'rgba(99, 102, 241, 0.08)',
                      border: n.isRead ? '1px solid var(--border-glass)' : '1px solid rgba(99, 102, 241, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: n.isRead ? 'var(--text-main)' : 'var(--emerald-500)' }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{n.time}</span>
                    </div>
                    {n.message && (
                      <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                        {n.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Card & Logout */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px 4px 4px',
          borderRadius: '999px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-glass-strong)'
        }}>
          {/* Clickable Profile Info to open Edit Modal */}
          <div
            onClick={() => setIsProfileModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              borderRadius: '999px',
              padding: '2px 4px 2px 2px',
              transition: 'opacity 0.2s'
            }}
            title="Klik untuk ubah foto profil & data akun"
            className="hover-opacity"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Foto Profil"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid var(--emerald-500)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              />
            ) : (
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.75rem'
              }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: '1.2' }}>
                {user?.name || 'Kasir 1'}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--emerald-500)', fontWeight: 800, textTransform: 'uppercase' }}>
                {user?.role} ✏️
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="btn-icon"
            style={{ width: '26px', height: '26px', marginLeft: '2px', background: 'transparent', color: 'var(--rose-500)', border: 'none', cursor: 'pointer' }}
            title="Keluar (Logout)"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
}
