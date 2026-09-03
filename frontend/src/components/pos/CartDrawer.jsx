import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useModules } from '../../context/ModuleContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { formatRupiah } from '../../utils/formatters';
import Modal from '../common/Modal';
import {
  Trash2,
  Plus,
  Minus,
  Gift,
  Star,
  User,
  PauseCircle,
  PlayCircle,
  CreditCard,
  Percent,
  ReceiptText,
  Phone,
  CheckCircle2,
  Search,
  UserPlus,
  X,
  XCircle,
  Sparkles,
  ArrowRight,
  ShoppingCart
} from 'lucide-react';

export default function CartDrawer({ onOpenPayment }) {
  const {
    items,
    customer,
    promo,
    pointsToUse,
    subtotal,
    promoDiscount,
    pointsDiscount,
    totalDiscount,
    taxPercentage,
    taxAmount,
    totalAmount,
    totalItemsCount,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    setCustomer,
    setPromo,
    setPointsToUse,
    holdOrder,
    heldOrders,
    resumeOrder
  } = useCart();

  const { isModuleActive } = useModules();
  const { user } = useAuth();

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoError, setPromoError] = useState(null);
  const [customersList, setCustomersList] = useState([]);
  const [showHoldList, setShowHoldList] = useState(false);

  // Phone Lookup & Enter Search State
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneSearchError, setPhoneSearchError] = useState(null);
  const [isQuickRegisterOpen, setIsQuickRegisterOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const loadCustomers = async () => {
    try {
      const res = await api.getCustomers();
      if (res.success) {
        if (user?.role === 'customer' && res.customer) {
          setCustomer(res.customer);
        } else {
          setCustomersList(res.customers || []);
        }
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  };

  useEffect(() => {
    if (isModuleActive('customers')) {
      loadCustomers();
    }
  }, [isModuleActive, user?.role]);

  // Sync phone input if customer is already selected
  useEffect(() => {
    if (customer?.phone) {
      setPhoneInput(customer.phone);
    }
  }, [customer]);

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Execute Phone Number Search (via Click or Enter key)
  const handleExecutePhoneSearch = (e) => {
    if (e) e.preventDefault();
    setPhoneSearchError(null);

    const rawInput = phoneInput.trim();
    if (!rawInput) {
      setPhoneSearchError('Masukkan nomor telepon untuk mencari.');
      setCustomer(null);
      setPointsToUse(0);
      return;
    }

    const cleanVal = rawInput.replace(/\D/g, '');

    // Search by clean digits, partial, or exact phone
    const matched = customersList.find(c => {
      const cPhone = (c.phone || '').replace(/\D/g, '');
      return (
        (cleanVal && cPhone === cleanVal) ||
        (cleanVal.length >= 6 && cPhone.includes(cleanVal)) ||
        (c.phone && c.phone === rawInput) ||
        (c.code && c.code.toLowerCase() === rawInput.toLowerCase())
      );
    });

    if (matched) {
      setCustomer(matched);
      setPhoneSearchError(null);
    } else {
      setCustomer(null);
      setPhoneSearchError(`No. HP "${rawInput}" belum terdaftar.`);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCodeInput) return;
    setPromoError(null);
    try {
      const res = await api.validatePromo(promoCodeInput, subtotal);
      if (res.valid) {
        setPromo(res);
        setPromoCodeInput('');
      } else {
        setPromoError(res.message);
      }
    } catch (err) {
      setPromoError(err.message || 'Kode promo tidak valid');
    }
  };

  const handleQuickRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!newCustomerName || !phoneInput) return;
    setIsRegistering(true);
    try {
      const res = await api.createCustomer({
        name: newCustomerName,
        phone: phoneInput,
        email: newCustomerEmail || `${phoneInput.replace(/\D/g, '')}@memberpos.com`,
        points: '10'
      });
      if (res.success) {
        await loadCustomers();
        const created = {
          id: res.customer?.id || `cust-${Date.now()}`,
          name: newCustomerName,
          phone: phoneInput,
          email: newCustomerEmail,
          code: res.customer?.code || `MBR-${String(customersList.length + 1).padStart(3, '0')}`,
          tier: 'Bronze',
          points: 10
        };
        setCustomer(created);
        setIsQuickRegisterOpen(false);
        setNewCustomerName('');
        setNewCustomerEmail('');
        setPhoneSearchError(null);
      }
    } catch (err) {
      alert(err.message || 'Gagal mendaftarkan member baru');
    } finally {
      setIsRegistering(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Centered Modal Backdrop */}
      <div
        onClick={closeCart}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          animation: 'fadeIn 0.2s ease'
        }}
      >
        {/* Centered Modal Card */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            width: '520px',
            maxWidth: '96vw',
            maxHeight: '92vh',
            background: 'var(--bg-secondary)',
            borderRadius: '20px',
            border: '1px solid var(--border-glass-strong)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.08)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-glass-strong)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--emerald-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingCart size={18} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                Keranjang Penjualan
              </h3>
              {totalItemsCount > 0 && (
                <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '6px', fontWeight: 700 }}>
                  {totalItemsCount}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--rose-500)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '4px 6px'
                }}
              >
                Kosongkan
              </button>
            )}
            <button
              onClick={closeCart}
              className="btn-icon btn-secondary"
              style={{ width: '32px', height: '32px', borderRadius: '8px' }}
              title="Tutup Keranjang (Esc)"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Member Search & Loyalty Section */}
        {isModuleActive('customers') && user?.role !== 'customer' && (
          <div style={{ padding: '12px 18px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                <Phone size={13} style={{ color: 'var(--emerald-500)' }} />
                <span>Pelanggan & Member</span>
              </div>
              {customer ? (
                <span className="badge badge-success" style={{ fontSize: '0.625rem', padding: '2px 6px' }}>
                  ✓ Terverifikasi
                </span>
              ) : (
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Pelanggan Umum (Guest)
                </span>
              )}
            </div>

            {/* Form Search Phone Number with Enter & Search Button */}
            {!customer ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <form onSubmit={handleExecutePhoneSearch} style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Phone size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Ketik No. HP Member..."
                      value={phoneInput}
                      onChange={(e) => {
                        setPhoneInput(e.target.value);
                        if (phoneSearchError) setPhoneSearchError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleExecutePhoneSearch();
                        }
                      }}
                      style={{ height: '36px', paddingLeft: '32px', paddingRight: '8px', fontSize: '0.8125rem', borderRadius: '8px' }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ height: '36px', padding: '0 14px', fontSize: '0.78rem', gap: '5px', borderRadius: '8px', fontWeight: 700 }}
                    title="Cari nomor telepon member"
                  >
                    <Search size={13} />
                    <span>Cari</span>
                  </button>
                </form>

                {phoneSearchError && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: '6px', background: '#ffe4e6', border: '1px solid #fecdd3', fontSize: '0.72rem', color: '#9f1239' }}>
                    <span>{phoneSearchError}</span>
                    <button
                      type="button"
                      onClick={() => setIsQuickRegisterOpen(true)}
                      className="btn btn-primary"
                      style={{ padding: '2px 8px', fontSize: '0.6875rem', gap: '4px' }}
                    >
                      <UserPlus size={11} /> + Daftar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Verified Member Card Display */
              <div style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'var(--bg-secondary)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                        {customer.name}
                      </span>
                      <span className="badge badge-warning" style={{ fontSize: '0.625rem', padding: '1px 6px' }}>
                        {customer.tier}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      📱 {customer.phone} • {customer.code}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCustomer(null);
                      setPhoneInput('');
                      setPointsToUse(0);
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--rose-500)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, padding: '2px 4px' }}
                    title="Ganti / Lepas Pelanggan"
                  >
                    ✕ Ganti
                  </button>
                </div>

                {/* Loyalty Points Redemption Box */}
                {isModuleActive('loyalty') && customer.points > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-glass)', fontSize: '0.75rem' }}>
                    <span style={{ color: '#d97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={13} /> Poin ({customer.points}):
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="number"
                        min="0"
                        max={customer.points}
                        value={pointsToUse}
                        onChange={(e) => setPointsToUse(Math.min(customer.points, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                        style={{ width: '55px', height: '26px', padding: '2px 4px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass-strong)', color: 'var(--text-main)', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700 }}
                      />
                      <span style={{ color: 'var(--emerald-500)', fontWeight: 800 }}>
                        - {formatRupiah(pointsDiscount)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-subtle)', margin: 'auto' }}>
              <ReceiptText size={48} style={{ opacity: 0.25, margin: '0 auto 12px' }} />
              <p style={{ margin: '0 0 4px 0', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Keranjang Kosong</p>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pilih produk dari katalog untuk memulai transaksi.</span>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-glass-strong)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
                      {item.name}
                    </h5>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'inline-block' }}>
                      {formatRupiah(item.price)} <span style={{ opacity: 0.6 }}>/ {item.unit}</span>
                    </span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                    {formatRupiah(item.price * item.quantity)}
                  </div>
                </div>

                {/* Stepper and Remove Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px dashed var(--border-glass)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border-glass)' }}>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#ef4444'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      title="Kurangi kuantitas"
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ minWidth: '32px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'; e.currentTarget.style.color = '#10b981'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      title="Tambah kuantitas"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                    title="Hapus item dari keranjang"
                  >
                    <Trash2 size={13} />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Promo Code Applicator (Modul #6) */}
        {isModuleActive('promos') && (
          <div style={{ padding: '12px 18px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-glass)' }}>
            {promo ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Gift size={15} style={{ color: 'var(--emerald-500)' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--emerald-600)' }}>
                    {promo.promo.code} (-{formatRupiah(promoDiscount)})
                  </span>
                </div>
                <button
                  onClick={() => setPromo(null)}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}
                >
                  Hapus
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Percent size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Kode Promo (DISKON10)"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                      style={{ height: '36px', paddingLeft: '32px', fontSize: '0.8rem', borderRadius: '8px' }}
                    />
                  </div>
                  <button
                    onClick={handleApplyPromo}
                    className="btn btn-secondary"
                    style={{ height: '36px', padding: '0 14px', fontSize: '0.8rem', borderRadius: '8px', fontWeight: 700 }}
                  >
                    Terapkan
                  </button>
                </div>
                {promoError && (
                  <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                    {promoError}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Cart Summary & Checkout Footer */}
        <div style={{
          padding: '16px 20px',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-glass-strong)',
          display: 'flex',
          flexDirection: 'column',
          gap: '7px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            <span>Subtotal</span>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatRupiah(subtotal)}</span>
          </div>

          {totalDiscount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#ef4444', fontWeight: 700 }}>
              <span>Total Diskon & Poin</span>
              <span>- {formatRupiah(totalDiscount)}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            <span>PPN ({taxPercentage}%)</span>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatRupiah(taxAmount)}</span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            paddingTop: '8px',
            marginTop: '2px',
            borderTop: '1px dashed var(--border-glass-strong)'
          }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Total Akhir</span>
            <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--emerald-500)', letterSpacing: '-0.02em' }}>
              {formatRupiah(totalAmount)}
            </span>
          </div>

          {/* Action Buttons: Hold and Pay */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginTop: '8px' }}>
            <button
              onClick={holdOrder}
              disabled={items.length === 0}
              className="btn btn-secondary"
              title="Tahan transaksi untuk melayani pelanggan berikutnya"
              style={{
                height: '46px',
                padding: '0 12px',
                fontSize: '0.84rem',
                borderRadius: '10px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <PauseCircle size={17} />
              <span>Tahan ({heldOrders.length})</span>
            </button>

            <button
              onClick={() => {
                closeCart();
                if (onOpenPayment) onOpenPayment();
              }}
              disabled={items.length === 0}
              className="btn btn-primary"
              style={{
                height: '46px',
                padding: '0 18px',
                fontSize: '0.9375rem',
                borderRadius: '10px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
              }}
            >
              <CreditCard size={18} />
              <span>{user?.role === 'customer' ? 'Kirim Pesanan' : 'Bayar (F4)'}</span>
            </button>
          </div>

          {/* Held Orders List toggle if exists */}
          {heldOrders.length > 0 && (
            <div style={{ marginTop: '4px' }}>
              <button
                onClick={() => setShowHoldList(!showHoldList)}
                style={{ background: 'transparent', border: 'none', color: 'var(--indigo-500)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, width: '100%', textAlign: 'center' }}
              >
                {showHoldList ? '▲ Sembunyikan Antrean' : `▼ Buka Antrean Tertahan (${heldOrders.length})`}
              </button>
              {showHoldList && (
                <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {heldOrders.map(h => (
                    <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '0.75rem' }}>
                      <span>{h.time} ({h.items.length} Item)</span>
                      <button
                        onClick={() => resumeOrder(h.id)}
                        className="btn btn-indigo"
                        style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                      >
                        <PlayCircle size={12} /> Lanjutkan
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Register Member Modal */}
        <Modal
          isOpen={isQuickRegisterOpen}
          onClose={() => setIsQuickRegisterOpen(false)}
          title="Daftarkan Member Baru"
          maxWidth="440px"
          icon={UserPlus}
        >
          <form onSubmit={handleQuickRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nomor Telepon / WhatsApp:</label>
              <input
                type="tel"
                required
                className="form-input"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nama Pelanggan:</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Contoh: Rian Pratama"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email (Opsional):</label>
              <input
                type="email"
                className="form-input"
                placeholder="email@domain.com"
                value={newCustomerEmail}
                onChange={(e) => setNewCustomerEmail(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsQuickRegisterOpen(false)}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary" disabled={isRegistering}>
                {isRegistering ? 'Mendaftarkan...' : 'Simpan & Jadikan Member'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  </>
);
}
