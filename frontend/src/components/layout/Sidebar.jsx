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
      'transactions', 'shifts', 'receipts', 'products', 'inventory',
      'customers', 'payments', 'promos', 'loyalty', 'reports',
      'approvals'
    ],
    customer: [
      'customers', 'products', 'promos', 'receipts', 'loyalty'
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
      if (['customers', 'notifications'].includes(modKey)) return 'Portal Member';
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
    <aside style={{
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
      <div style={{ padding: '16px 16px 8px 16px', minWidth: '275px' }}>
        {currentRole === 'admin' && (
          <div
            onClick={() => setActiveTab('module_management')}
            className="glass-panel-hover"
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(16, 185, 129, 0.15))',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Crown size={16} style={{ color: 'var(--indigo-500)' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                  ADMIN WORKSPACE
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                title="Tutup Sidebar"
              >
                <PanelLeftClose size={15} />
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--emerald-500)', fontWeight: 700 }}>● {stats.active} Modul Aktif</span>
              <span style={{ color: stats.inactive > 0 ? '#e11d48' : 'var(--text-subtle)', fontWeight: 700 }}>
                ● {stats.inactive} Off
              </span>
            </div>
          </div>
        )}

        {currentRole === 'cashier' && (
          <div style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.12), rgba(6, 182, 212, 0.08))',
            border: '1px solid rgba(5, 150, 105, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Store size={16} style={{ color: 'var(--emerald-500)' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  KASIR POS TERMINAL
                </span>
              </div>
              <button
                onClick={onToggle}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                title="Tutup Sidebar"
              >
                <PanelLeftClose size={15} />
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>Kasir: <b>{user?.name?.split(' ')[0]}</b></span>
              <span className={`badge ${activeShift ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.625rem' }}>
                {activeShift ? 'Shift Aktif' : 'Shift Tutup'}
              </span>
            </div>
          </div>
        )}

        {currentRole === 'customer' && (
          <div style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.12), rgba(147, 51, 234, 0.08))',
            border: '1px solid rgba(217, 119, 6, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={16} style={{ color: 'var(--amber-500)' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  PORTAL MEMBER VIP
                </span>
              </div>
              <button
                onClick={onToggle}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                title="Tutup Sidebar"
              >
                <PanelLeftClose size={15} />
              </button>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>
              Saldo Poin: ⭐ 450 Poin
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px 24px 12px', minWidth: '275px' }}>
        {categories.map(cat => {
          const itemsInCat = menuList.filter(item => {
            const itemCat = item.displayCategory || item.category;
            return itemCat === cat;
          });

          if (itemsInCat.length === 0) return null;

          return (
            <div key={cat} style={{ marginBottom: '16px' }}>
              <div style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: 'var(--text-subtle)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '4px 12px',
                marginBottom: '4px'
              }}>
                {cat}
              </div>

              {itemsInCat.map(item => {
                const Icon = item.iconComponent || item.icon;
                const isCurrent = activeTab === item.key;
                const isDisabled = !item.isActive;

                const isReadOnly = (currentRole === 'cashier' && ['inventory', 'products'].includes(item.key)) ||
                  (currentRole === 'customer' && ['products', 'promos'].includes(item.key));

                return (
                  <button
                    key={item.key}
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
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: isCurrent 
                        ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))' 
                        : 'transparent',
                      color: isCurrent 
                        ? 'var(--emerald-500)' 
                        : isDisabled 
                        ? 'var(--text-subtle)' 
                        : 'var(--text-main)',
                      fontSize: '0.84rem',
                      fontWeight: isCurrent ? 700 : 500,
                      cursor: isDisabled && currentRole !== 'admin' ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                      borderLeft: isCurrent ? '3px solid var(--emerald-500)' : '3px solid transparent',
                      marginBottom: '2px',
                      opacity: isDisabled ? 0.6 : 1
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={17} style={{ color: isCurrent ? 'var(--emerald-500)' : isDisabled ? 'var(--text-subtle)' : 'var(--text-muted)' }} />
                      <span>{item.name}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {isReadOnly && (
                        <span style={{ fontSize: '0.625rem', color: '#38bdf8', background: 'rgba(6, 182, 212, 0.15)', padding: '2px 5px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Eye size={10} /> Lihat
                        </span>
                      )}

                      {isDisabled && (
                        <span className="badge badge-danger" style={{ fontSize: '0.625rem', padding: '2px 6px' }}>
                          <Lock size={10} /> Off
                        </span>
                      )}

                      {item.key === 'module_management' && (
                        <span className="badge badge-indigo" style={{ fontSize: '0.625rem', padding: '2px 6px' }}>
                          #16
                        </span>
                      )}

                      {item.key === 'audit_logs' && (
                        <span className="badge badge-success" style={{ fontSize: '0.625rem', padding: '2px 6px' }}>
                          Live
                        </span>
                      )}

                      {item.key === 'approvals' && (
                        <span className={`badge ${currentRole === 'admin' ? 'badge-indigo' : 'badge-success'}`} style={{ fontSize: '0.625rem', padding: '2px 6px' }}>
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
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border-glass)',
        background: 'var(--bg-primary)',
        fontSize: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minWidth: '275px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {settings?.store?.logoUrl ? (
            <img src={settings.store.logoUrl} alt="Logo" style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }} />
          ) : (
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--emerald-500)',
              display: 'inline-block'
            }} />
          )}
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{appName}</span>
        </div>
        <span className="badge badge-indigo" style={{ fontSize: '0.6875rem', textTransform: 'capitalize' }}>
          Role: {currentRole}
        </span>
      </div>
    </aside>
  );
}
