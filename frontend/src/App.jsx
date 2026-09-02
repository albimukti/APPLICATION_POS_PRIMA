import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModuleProvider, useModules } from './context/ModuleContext';
import { CartProvider } from './context/CartContext';
import { ShiftProvider, useShift } from './context/ShiftContext';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';

import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import Modal from './components/common/Modal';
import LoginScreen from './components/auth/LoginScreen';
import { formatRupiah } from './utils/formatters';

// 16 Modules components
import DashboardModule from './components/modules/DashboardModule';
import TransactionModule from './components/modules/TransactionModule';
import InventoryModule from './components/modules/InventoryModule';
import ProductModule from './components/modules/ProductModule';
import CustomerModule from './components/modules/CustomerModule';
import PaymentMethodsModule from './components/modules/PaymentMethodsModule';
import PromoModule from './components/modules/PromoModule';
import ReportModule from './components/modules/ReportModule';
import UserManagementModule from './components/modules/UserManagementModule';
import ShiftModule from './components/modules/ShiftModule';
import ReceiptTemplateModule from './components/modules/ReceiptTemplateModule';
import LoyaltyModule from './components/modules/LoyaltyModule';
import SettingModule from './components/modules/SettingModule';
import LoginModule from './components/modules/LoginModule';
import EmployeeModule from './components/modules/EmployeeModule';
import NotificationModule from './components/modules/NotificationModule';
import ModuleManagement from './components/modules/ModuleManagement';
import AuditLogModule from './components/modules/AuditLogModule';
import ApprovalModule from './components/modules/ApprovalModule';

import { Play, Square, Clock, ShieldAlert, Lock } from 'lucide-react';

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

function AppContent() {
  const { user } = useAuth();
  const { isModuleActive, fetchModules } = useModules();
  const { activeShift, openShift, closeShift } = useShift();

  // Set default initial tab based on role
  const getDefaultTabForRole = (role) => {
    if (role === 'cashier') return 'transactions';
    if (role === 'customer') return 'customers';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(() => getDefaultTabForRole(user?.role));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [startCash, setStartCash] = useState('500000');
  const [actualCash, setActualCash] = useState('');
  const [shiftNotes, setShiftNotes] = useState('');
  const [isSubmittingShift, setIsSubmittingShift] = useState(false);

  // When user role changes (e.g. login or logout), adjust activeTab & ensure modules are up-to-date
  useEffect(() => {
    if (user) {
      if (fetchModules) fetchModules();
      const allowed = allowedKeysByRole[user.role] || allowedKeysByRole.customer;
      if (!allowed.includes(activeTab)) {
        setActiveTab(getDefaultTabForRole(user.role));
      }
    }
  }, [user, fetchModules]);

  // If user is not logged in, show LoginScreen
  if (!user) {
    return <LoginScreen />;
  }

  const handleQuickShiftSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingShift(true);
    try {
      if (!activeShift) {
        await openShift(startCash, shiftNotes);
      } else {
        await closeShift(actualCash, shiftNotes);
      }
      setIsShiftModalOpen(false);
      setShiftNotes('');
    } catch (err) {
      alert(err.message || 'Gagal memproses shift');
    } finally {
      setIsSubmittingShift(false);
    }
  };

  const renderActiveModule = () => {
    const allowed = allowedKeysByRole[user.role] || allowedKeysByRole.customer;

    // 1. Role Authorization Check (RBAC Guard)
    if (!allowed.includes(activeTab)) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '60px auto' }} className="glass-panel">
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Lock size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--rose-500)', marginBottom: '8px' }}>
            Akses Ditolak (Hak Akses Terbatas)
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5' }}>
            Peran Anda saat ini (<b>{user.role.toUpperCase()}</b>) tidak memiliki izin untuk mengakses modul ini. Modul ini khusus untuk Administrator.
          </p>
          <button onClick={() => setActiveTab(getDefaultTabForRole(user.role))} className="btn btn-primary" style={{ marginTop: '16px' }}>
            Kembali ke Halaman Utama ({getDefaultTabForRole(user.role).toUpperCase()})
          </button>
        </div>
      );
    }

    // 2. Disabled Module Check
    if (activeTab !== 'dashboard' && activeTab !== 'module_management' && !isModuleActive(activeTab) && user?.role !== 'admin') {
      return (
        <div style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '60px auto' }} className="glass-panel">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--rose-500)', marginBottom: '8px' }}>
            Modul Dinonaktifkan
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5' }}>
            Modul ini saat ini dinonaktifkan oleh Administrator Sistem melalui Modul Manajemen (#16).
          </p>
          <button onClick={() => setActiveTab(getDefaultTabForRole(user.role))} className="btn btn-primary" style={{ marginTop: '16px' }}>
            Kembali ke Halaman Utama
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard': return <DashboardModule setActiveTab={setActiveTab} />;
      case 'transactions': return <TransactionModule />;
      case 'inventory': return <InventoryModule />;
      case 'products': return <ProductModule />;
      case 'customers': return <CustomerModule />;
      case 'payments': return <PaymentMethodsModule />;
      case 'promos': return <PromoModule />;
      case 'reports': return <ReportModule />;
      case 'users': return <UserManagementModule />;
      case 'shifts': return <ShiftModule />;
      case 'receipts': return <ReceiptTemplateModule />;
      case 'loyalty': return <LoyaltyModule />;
      case 'settings': return <SettingModule />;
      case 'auth': return <LoginModule />;
      case 'employees': return <EmployeeModule />;
      case 'notifications': return <NotificationModule />;
      case 'module_management': return <ModuleManagement />;
      case 'audit_logs': return <AuditLogModule />;
      case 'approvals': return <ApprovalModule />;
      default: return <DashboardModule setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* Collapsible Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="main-content" style={{ flex: 1, minWidth: 0, transition: 'all 0.28s ease' }}>
        {/* Top Navbar */}
        <Navbar
          onOpenShiftModal={() => {
            if (activeShift) {
              setActualCash(String(activeShift.expectedCash));
            }
            setIsShiftModalOpen(true);
          }}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Dynamic Module Workspace */}
        <main className="workspace-scrollable">
          {renderActiveModule()}
        </main>

        {/* Footer: always below the scrollable workspace, never overlapping */}
        <Footer onOpenShiftModal={() => setIsShiftModalOpen(true)} />
      </div>

      {/* Quick Shift Modal from Navbar */}
      <Modal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        title={!activeShift ? 'Buka Shift Kasir Baru' : 'Tutup Shift Kasir'}
        maxWidth="460px"
        icon={Clock}
      >
        <form onSubmit={handleQuickShiftSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!activeShift ? (
            <>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
                Masukkan modal uang kas fisik awal pada laci kasir untuk memulai transaksi hari ini.
              </p>
              <div className="form-group">
                <label className="form-label">Modal Kas Awal (Rp):</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--emerald-500)' }}
                  value={startCash}
                  onChange={(e) => setStartCash(e.target.value)}
                  autoFocus
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', fontSize: '0.84rem' }}>
                <div>Shift Aktif: <b>{activeShift.shiftNumber}</b></div>
                <div>Estimasi Kas Sistem: <b>{formatRupiah(activeShift.expectedCash)}</b></div>
              </div>
              <div className="form-group">
                <label className="form-label">Hitung Uang Fisik di Laci Kas (Actual Cash):</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--emerald-500)' }}
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  autoFocus
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Catatan (Opsional):</label>
            <input
              type="text"
              className="form-input"
              placeholder="Catatan shift..."
              value={shiftNotes}
              onChange={(e) => setShiftNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsShiftModalOpen(false)}>Batal</button>
            <button
              type="submit"
              className={`btn ${!activeShift ? 'btn-primary' : 'btn-danger'}`}
              disabled={isSubmittingShift}
            >
              {isSubmittingShift ? 'Memproses...' : !activeShift ? 'Buka Shift Sekarang' : 'Tutup Shift Sekarang'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <AuthProvider>
          <ModuleProvider>
            <CartProvider>
              <ShiftProvider>
                <AppContent />
              </ShiftProvider>
            </CartProvider>
          </ModuleProvider>
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
