import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useModules } from '../../context/ModuleContext';
import { useShift } from '../../context/ShiftContext';
import { useSettings } from '../../context/SettingsContext';
import { formatRupiah } from '../../utils/formatters';
import { DEFAULT_MODULES } from '../../utils/defaultModules';
import {
  ShoppingBag,
  Layers,
  BarChart3,
  Tag,
  Users,
  CreditCard,
  Gift,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Receipt,
  Star,
  Settings,
  Key,
  Briefcase,
  Bell,
  Sliders,
  LayoutDashboard,
  Lock,
  Crown,
  Store,
  UserCheck,
  Eye,
  PanelLeftClose,
  FileCheck
} from 'lucide-react';

const iconMap = {
  ShoppingBag,
  Layers,
  BarChart3,
  Tag,
  Users,
  CreditCard,
  Gift,
  TrendingUp,
  ShieldCheck,
  Clock,
  Receipt,
  Star,
  Settings,
  Key,
  Briefcase,
  Bell,
  Sliders
};

export default function Sidebar({ activeTab, setActiveTab, isOpen, onToggle }) {
  const { user } = useAuth();
  const { modules, stats, isModuleActive } = useModules();
  const { activeShift } = useShift();
  const { settings } = useSettings();

  const appName = settings?.store?.appName || 'POS PRIMA';

  const allowedKeysByRole = {
    admin: [
      'dashboard', 'transactions', 'inventory', 'products', 'customers',
      'payments', 'promos', 'reports', 'users', 'shifts',
      'receipts', 'loyalty', 'settings', 'employees',
      'module_management', 'audit_logs', 'approvals'
    ],
    cashier: [
      'transactions', 'shifts', 'products', 'inventory',
      'customers', 'payments', 'promos', 'loyalty', 'reports',
      'approvals'
    ],
    customer: [
      'transactions', 'products', 'promos', 'loyalty'
    ]
  };

  const currentRole = user?.role || 'customer';
  const roleAllowed = allowedKeysByRole[currentRole] || allowedKeysByRole.customer;

  // Role Specific Categories
  const getCategoriesForRole = () => {
    if (currentRole === 'admin') {
      return ['Overview', 'Penjualan', 'Master Data', 'Logistik', 'Keuangan', 'Marketing', 'Operasional', 'SDM', 'Sistem'];
    }
    if (currentRole === 'cashier') {
      return ['Terminal Kasir', 'Katalog & Stok', 'Pelanggan & Promo', 'Laporan & Shift'];
    }
    return ['Portal Member', 'Katalog & Belanja', 'Poin & Struk'];
  };

  const getCategoryName = (modKey, defaultCat) => {
    if (currentRole === 'admin') return defaultCat;

    if (currentRole === 'cashier') {
      if (['transactions', 'shifts', 'receipts'].includes(modKey)) return 'Terminal Kasir';
      if (['products', 'inventory'].includes(modKey)) return 'Katalog & Stok';
      if (['customers', 'payments', 'promos', 'loyalty'].includes(modKey)) return 'Pelanggan & Promo';
      if (['reports', 'notifications', 'auth'].includes(modKey)) return 'Laporan & Shift';
      return 'Lainnya';
    }

    if (currentRole === 'customer') {
      if (['notifications'].includes(modKey)) return 'Portal Member';
      if (['products', 'promos'].includes(modKey)) return 'Katalog & Belanja';
      if (['loyalty', 'receipts', 'auth'].includes(modKey)) return 'Poin & Struk';
      return 'Lainnya';
    }

    return defaultCat;
  };

  const effectiveModules = (modules && modules.length > 0) ? modules : DEFAULT_MODULES;

  const menuList = [
    ...(currentRole === 'admin' ? [{
      id: 'dashboard',
      key: 'dashboard',
      name: 'Dashboard Utama',
      icon: LayoutDashboard,
      category: 'Overview',
      isActive: true
    }] : []),
    ...effectiveModules
      .filter(m => m.key !== 'auth' && m.key !== 'notifications')
      .filter(m => roleAllowed.includes(m.key))
      .map(m => ({
        ...m,
        iconComponent: iconMap[m.icon] || Tag,
        displayCategory: getCategoryName(m.key, m.category)
      })),
    ...(currentRole === 'admin' ? [{
      id: 'audit_logs',
      key: 'audit_logs',
      name: 'Audit Log Kasir',
      icon: ShieldAlert,
      iconComponent: ShieldAlert,
      category: 'Sistem',
      displayCategory: 'Sistem',
      isActive: true,
      badge: 'Audit'
    },
    {
      id: 'approvals',
      key: 'approvals',
      name: 'Pusat Approval',
      icon: FileCheck,
      iconComponent: FileCheck,
      category: 'Sistem',
      displayCategory: 'Sistem',
      isActive: true,
      badge: 'Admin'
    }] : []),
    ...(currentRole === 'cashier' ? [{
      id: 'approvals',
      key: 'approvals',
      name: 'Approval Member',
      icon: FileCheck,
      iconComponent: FileCheck,
      category: 'Pelanggan & Promo',
      displayCategory: 'Pelanggan & Promo',
      isActive: true,
      badge: 'Kasir'
    }] : [])
  ];

  const categories = getCategoriesForRole();

  return (
    <aside className="app-sidebar" style={{
      width: isOpen ? '275px' : '0px',
      opacity: isOpen ? 1 : 0,
      background: 'var(--bg-secondary)',
      borderRight: isOpen ? '1px solid var(--border-glass)' : 'none',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      userSelect: 'none',
      zIndex: 20,
      overflow: 'hidden',
      transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease',
      whiteSpace: 'nowrap'
    }}>
      {/* ROLE HEADER CARD */}
      <div style={{ padding: '16px 14px 10px 14px', minWidth: '275px' }}>
        {currentRole === 'admin' && (
          <div
            onClick={() => setActiveTab('module_management')}
            className="sidebar-role-card"
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(16, 185, 129, 0.08))',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '7px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--indigo-500)'
                }}>
                  <Crown size={15} />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.02em' }}>
                  ADMIN WORKSPACE
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '3px', display: 'flex', alignItems: 'center' }}
                title="Tutup Sidebar"
              >
                <PanelLeftClose size={15} />
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
              <span style={{ color: 'var(--emerald-500)', fontWeight: 700 }}>● {stats.active} Modul Aktif</span>
              <span style={{ color: stats.inactive > 0 ? '#e11d48' : 'var(--text-subtle)', fontWeight: 600 }}>
                ● {stats.inactive} Off
              </span>
            </div>
          </div>
        )}

        {currentRole === 'cashier' && (
          <div className="sidebar-role-card" style={{
            padding: '12px 14px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08))',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '7px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--emerald-500)'
                }}>
                  <Store size={15} />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.02em' }}>
                  KASIR POS TERMINAL
                </span>
              </div>
              <button
                onClick={onToggle}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '3px', display: 'flex', alignItems: 'center' }}
                title="Tutup Sidebar"
              >
                <PanelLeftClose size={15} />
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>Kasir: <b style={{ color: 'var(--text-main)' }}>{user?.name ? user.name.split(' ')[0] : 'Siti'}</b></span>
              <span className={`badge ${activeShift ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.625rem', padding: '2px 7px', borderRadius: '5px' }}>
                {activeShift ? 'Shift Aktif' : 'Shift Tutup'}
              </span>
            </div>
          </div>
        )}

        {currentRole === 'customer' && (
          <div className="sidebar-role-card" style={{
            padding: '12px 14px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(16, 185, 129, 0.08))',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '7px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--amber-500)'
                }}>
                  <UserCheck size={15} />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.02em' }}>
                  PORTAL MEMBER VIP
                </span>
              </div>
              <button
                onClick={onToggle}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '3px', display: 'flex', alignItems: 'center' }}
                title="Tutup Sidebar"
              >
                <PanelLeftClose size={15} />
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Member: <b style={{ color: 'var(--text-main)' }}>{user?.name ? user.name.split(' ')[0] : 'Budi'}</b></span>
              <span style={{ color: '#d97706', fontWeight: 800 }}>⭐ Member VIP</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu List */}
      <div className="sidebar-navigation" style={{ flex: 1, overflowY: 'auto', padding: '4px 10px 20px 10px', minWidth: '275px' }}>
        {categories.map(cat => {
          const itemsInCat = menuList.filter(item => {
            const itemCat = item.displayCategory || item.category;
            return itemCat === cat;
          });

          if (itemsInCat.length === 0) return null;

          return (
            <div key={cat} className="sidebar-section">
              <div className="sidebar-section-title">
                {cat}
              </div>

              {itemsInCat.map(item => {
                const Icon = item.iconComponent || item.icon;
                const isCurrent = activeTab === item.key;
                const isDisabled = !item.isActive;

                return (
                  <button
                    key={item.key}
                    className={`sidebar-nav-item${isCurrent ? ' is-active' : ''}`}
                    onClick={() => {
                      if (!isDisabled || currentRole === 'admin') {
                        setActiveTab(item.key);
                      }
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.84rem',
                      fontWeight: isCurrent ? 700 : 500,
                      cursor: isDisabled && currentRole !== 'admin' ? 'not-allowed' : 'pointer',
                      marginBottom: '2px',
                      opacity: isDisabled ? 0.6 : 1
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={16} style={{ color: isCurrent ? 'var(--emerald-500)' : isDisabled ? 'var(--text-subtle)' : 'var(--text-muted)' }} />
                      <span style={{ color: isCurrent ? 'var(--emerald-600)' : 'inherit' }}>{item.name}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {isDisabled && (
                        <span className="badge badge-danger" style={{ fontSize: '0.625rem', padding: '1px 5px' }}>
                          <Lock size={9} /> Off
                        </span>
                      )}

                      {item.key === 'module_management' && (
                        <span className="badge badge-indigo" style={{ fontSize: '0.625rem', padding: '1px 5px' }}>
                          #16
                        </span>
                      )}

                      {item.key === 'audit_logs' && (
                        <span className="badge badge-success" style={{ fontSize: '0.625rem', padding: '1px 5px' }}>
                          Live
                        </span>
                      )}

                      {item.key === 'approvals' && (
                        <span className={`badge ${currentRole === 'admin' ? 'badge-indigo' : 'badge-success'}`} style={{ fontSize: '0.625rem', padding: '1px 5px' }}>
                          {currentRole === 'admin' ? 'Pusat' : 'Member'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* FOOTER BAR */}
      <div className="sidebar-footer" style={{
        padding: '10px 14px',
        borderTop: '1px solid var(--border-glass)',
        fontSize: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minWidth: '275px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {settings?.store?.logoUrl ? (
            <img src={settings.store.logoUrl} alt="Logo" style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'cover' }} />
          ) : (
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--emerald-500)',
              display: 'inline-block'
            }} />
          )}
          <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>{appName}</span>
        </div>
        <span className="badge badge-indigo" style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '6px', textTransform: 'capitalize' }}>
          Role: {currentRole}
        </span>
      </div>
    </aside>
  );
}
