import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useModules } from '../../context/ModuleContext';
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
      if (res.success) setCustomersList(res.customers || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  };

  useEffect(() => {
    if (isModuleActive('customers')) {
      loadCustomers();
    }
  }, [isModuleActive]);

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
      {/* Backdrop overlay */}
      <div
        onClick={closeCart}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          zIndex: 998,
          animation: 'fadeIn 0.2s ease'
        }}
      />

      {/* Slide-over Right Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '450px',
          maxWidth: '96vw',
          height: '100vh',
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-glass-strong)',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.2)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <ShoppingCart size={22} style={{ color: 'var(--emerald-500)' }} />
              {totalItemsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-7px',
                  right: '-9px',
                  background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                  color: '#fff',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px'
                }}>
                  {totalItemsCount}
                </span>
              )}
            </div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>Keranjang Penjualan</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                style={{ background: 'transparent', border: 'none', color: 'var(--rose-500)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
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
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Mandatory Phone Number Search & Enter Feature */}
        {isModuleActive('customers') && (
          <div style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-glass-strong)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Phone size={13} style={{ color: 'var(--emerald-500)' }} />
                Cari No. HP Member (Tekan Enter):
              </span>
              {customer ? (
                <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>
                  ✓ Member Terverifikasi
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
                <form onSubmit={handleExecutePhoneSearch} style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Phone size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Ketik No. HP lalu tekan Enter..."
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
                      style={{ paddingLeft: '32px', paddingRight: '8px', fontSize: '0.8125rem' }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: '0.78rem', gap: '4px' }}
                    title="Cari nomor telepon member"
                  >
                    <Search size={14} />
                    <span>Cari</span>
                  </button>
                </form>

                {phoneSearchError && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderRadius: '6px', background: '#ffe4e6', border: '1px solid #fecdd3', fontSize: '0.72rem', color: '#9f1239' }}>
                    <span>{phoneSearchError}</span>
                    <button
                      type="button"
                      onClick={() => setIsQuickRegisterOpen(true)}
                      className="btn btn-primary"
                      style={{ padding: '3px 8px', fontSize: '0.6875rem', gap: '4px' }}
                    >
                      <UserPlus size={11} /> + Daftar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Verified Member Card Display */
              <div style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'var(--bg-secondary)',
                border: '1px solid rgba(5, 150, 105, 0.4)',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.15)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                        {customer.name}
                      </span>
                      <span className="badge badge-warning" style={{ fontSize: '0.625rem' }}>
                        {customer.tier}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      📱 <b>{customer.phone}</b> • {customer.code}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCustomer(null);
                      setPhoneInput('');
                      setPointsToUse(0);
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--rose-500)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, padding: 0 }}
                    title="Ganti / Lepas Pelanggan"
                  >
                    ✕ Ganti
                  </button>
                </div>

                {/* Loyalty Points Redemption Box */}
                {isModuleActive('loyalty') && customer.points > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-glass-strong)', fontSize: '0.75rem' }}>
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
                        style={{ width: '55px', padding: '2px 4px', borderRadius: '4px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass-strong)', color: 'var(--text-main)', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700 }}
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-subtle)' }}>
              <ReceiptText size={48} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
              <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: 'var(--text-main)' }}>Keranjang Masih Kosong</p>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pilih produk dari katalog untuk memulai transaksi kasir.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {items.map(item => (
                <div
                  key={item.id}
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-glass-strong)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h5 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {item.name}
                      </h5>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatRupiah(item.price)} / {item.unit}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {formatRupiah(item.price * item.quantity)}
                    </div>
                  </div>

                  {/* Quantity Stepper: - Merah & + Hijau */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '3px 4px', border: '1px solid var(--border-glass-strong)' }}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="btn-stepper-minus"
                        style={{ width: '26px', height: '26px' }}
                        title="Kurangi kuantitas (- Merah)"
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, minWidth: '28px', textAlign: 'center', color: 'var(--text-main)' }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="btn-stepper-plus"
                        style={{ width: '26px', height: '26px' }}
                        title="Tambah kuantitas (+ Hijau)"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      style={{ background: '#ffe4e6', border: '1px solid #fecdd3', color: '#be123c', borderRadius: '6px', cursor: 'pointer', padding: '5px 8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 700 }}
                      title="Hapus item dari keranjang"
                    >
                      <Trash2 size={13} /> Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Promo Code Applicator (Modul #6) */}
        {isModuleActive('promos') && (
          <div style={{ padding: '10px 16px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-glass-strong)' }}>
            {promo ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: '6px', background: '#d1fae5', border: '1px solid #a7f3d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Gift size={14} style={{ color: '#065f46' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46' }}>{promo.promo.code} ({formatRupiah(promoDiscount)})</span>
                </div>
                <button
                  onClick={() => setPromo(null)}
                  style={{ background: 'transparent', border: 'none', color: '#be123c', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700 }}
                >
                  Hapus
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Kode Promo (DISKON10)"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                    style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                  >
                    Terapkan
                  </button>
                </div>
                {promoError && (
                  <span style={{ fontSize: '0.7rem', color: '#e11d48', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                    {promoError}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Cart Summary & Checkout */}
        <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-glass-strong)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <span>Subtotal</span>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatRupiah(subtotal)}</span>
          </div>

          {totalDiscount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--rose-500)', fontWeight: 700 }}>
              <span>Total Diskon & Poin</span>
              <span>- {formatRupiah(totalDiscount)}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <span>PPN ({taxPercentage}%)</span>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatRupiah(taxAmount)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 800, color: 'var(--emerald-500)', paddingTop: '6px', borderTop: '1px dashed var(--border-glass-strong)' }}>
            <span>Total Akhir</span>
            <span>{formatRupiah(totalAmount)}</span>
          </div>

          {/* Action Buttons: Hold and Pay */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px', marginTop: '8px' }}>
            <button
              onClick={holdOrder}
              disabled={items.length === 0}
              className="btn btn-secondary"
              title="Tahan transaksi untuk melayani pelanggan berikutnya"
              style={{ padding: '12px 8px', fontSize: '0.8125rem' }}
            >
              <PauseCircle size={16} />
              <span>Tahan ({heldOrders.length})</span>
            </button>

            <button
              onClick={() => {
                closeCart();
                if (onOpenPayment) onOpenPayment();
              }}
              disabled={items.length === 0}
              className="btn btn-primary pulse-active"
              style={{ padding: '12px 16px', fontSize: '0.9375rem' }}
            >
              <CreditCard size={18} />
              <span>Bayar (F4)</span>
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
    </>
  );
}
