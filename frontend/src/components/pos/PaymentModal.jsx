import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { formatRupiah } from '../../utils/formatters';
import confetti from 'canvas-confetti';
import {
  Banknote,
  QrCode,
  CreditCard,
  Building2,
  Smartphone,
  CheckCircle2,
  Receipt,
  ArrowRight
} from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, onSuccessPayment, overrideTotal }) {
  const {
    items,
    customer,
    promo,
    pointsToUse,
    subtotal,
    discountAmount,
    totalDiscount,
    taxPercentage,
    taxAmount,
    totalAmount,
    clearCart
  } = useCart();
  const { settings } = useSettings();
  const { user } = useAuth();
  // Use overridden total if provided to ensure consistent checkout amount across payment methods
  const displayedTotal = typeof overrideTotal === 'number' ? overrideTotal : totalAmount;
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('CASH');
  const [cashGiven, setCashGiven] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  // QR code zoom toggle
  const [isQrZoomed, setIsQrZoomed] = useState(false);


  // Link QRIS Toko resmi (dikelola oleh Admin di Pengaturan Toko)
  const activeQrisLink = settings?.store?.qrisUrl || localStorage.getItem('pos_custom_qris_link') || '';

  useEffect(() => {
    async function loadMethods() {
      try {
        const res = await api.getPaymentMethods();
        if (res.success) {
          const active = res.methods.filter(m => m.isActive);
          setPaymentMethods(active);
          if (active.length > 0 && !active.find(m => m.code === selectedMethod)) {
            setSelectedMethod(active[0].code);
          }
        }
      } catch (err) {
        console.error('Failed to load payment methods:', err);
      }
    }
    if (isOpen) {
      loadMethods();
      setCashGiven(String(displayedTotal));
      setErrorMessage(null);
    }
  }, [isOpen, totalAmount]);

  const cashAmount = parseFloat(cashGiven) || 0;
  const changeAmount = selectedMethod === 'CASH' ? Math.max(0, cashAmount - displayedTotal) : 0;
  const isCashInsufficient = selectedMethod === 'CASH' && cashAmount < displayedTotal;

  // Preset cash buttons
  const quickCashOptions = [
    { label: 'Uang Pas', value: displayedTotal },
    { label: 'Rp 20.000', value: 20000 },
    { label: 'Rp 50.000', value: 50000 },
    { label: 'Rp 100.000', value: 100000 },
    { label: 'Rp 200.000', value: 200000 }
  ].filter(opt => opt.value >= displayedTotal || opt.label === 'Uang Pas');

  const handleProcessPayment = async () => {
    if (isCashInsufficient) {
      setErrorMessage('Nominal uang tunai yang diterima kurang dari total tagihan.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const payload = {
        items: items.map(i => ({
          productId: i.id,
          sku: i.sku,
          name: i.name,
          categoryName: i.categoryName,
          price: i.price,
          quantity: i.quantity,
          discount: i.discount || 0
        })),
        customerId: customer?.id || null,
        customerName: customer?.name || 'Pelanggan Umum (Guest)',
        subtotal,
        taxPercentage,
        taxAmount,
        discountAmount: totalDiscount,
        promoCode: promo?.promo?.code || null,
        pointsUsed: pointsToUse,
        pointsDiscount: pointsToUse * 100,
        totalAmount: displayedTotal,
        paymentMethod: selectedMethod,
        amountPaid: selectedMethod === 'CASH' ? cashAmount : displayedTotal,
        changeAmount: changeAmount
      };

      const res = await api.createTransaction(payload);
      if (res.success) {
        // Trigger celebratory confetti effect
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        clearCart();
        onClose();
        onSuccessPayment(res.transaction);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Gagal memproses pembayaran');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMethodIcon = (cat) => {
    switch (cat) {
      case 'CASH': return Banknote;
      case 'QRIS': return QrCode;
      case 'CARD': return CreditCard;
      case 'E_WALLET': return Smartphone;
      case 'TRANSFER': return Building2;
      default: return CreditCard;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Proses Pembayaran & Checkout" maxWidth="640px" icon={CreditCard}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Total Bill Display */}
        <div style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(99, 102, 241, 0.15))',
          border: '1px solid var(--emerald-500)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL TAGIHAN</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--emerald-500)' }}>
              {formatRupiah(displayedTotal)}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <div>{items.length} Macam Barang</div>
            {customer && <div style={{ color: '#818cf8', fontWeight: 600 }}>Member: {customer.name}</div>}
          </div>
        </div>

        {/* Payment Method Selector Grid */}
        <div>
          <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
            Pilih Metode Pembayaran:
          </label>
          <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
            {paymentMethods.map(method => {
              const Icon = getMethodIcon(method.category);
              const isSelected = selectedMethod === method.code;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.code)}
                  style={{
                    padding: '12px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--emerald-500)' : '1px solid var(--border-glass-strong)',
                    background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)',
                    color: isSelected ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={22} style={{ color: isSelected ? 'var(--emerald-500)' : 'inherit' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{method.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Payment Interface */}
        {selectedMethod === 'CASH' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Uang Tunai Diterima (Cash In):</label>
              <input
                type="number"
                className="form-input"
                style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emerald-500)' }}
                value={cashGiven}
                onChange={(e) => setCashGiven(e.target.value)}
                placeholder="0"
                autoFocus
              />
            </div>

            {/* Quick Cash Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {quickCashOptions.map(opt => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setCashGiven(String(opt.value))}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Change Display */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: isCashInsufficient ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              border: `1px solid ${isCashInsufficient ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
            }}>
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: isCashInsufficient ? '#fb7185' : 'var(--text-main)' }}>
                {isCashInsufficient ? 'Uang Masih Kurang:' : 'Kembalian (Change):'}
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: isCashInsufficient ? '#f43f5e' : '#34d399' }}>
                {isCashInsufficient ? formatRupiah(displayedTotal - cashAmount) : formatRupiah(changeAmount)}
              </span>
            </div>
          </div>
        )}

        {/* QRIS Display (Pengaturan dikelola terpusat di Pengaturan Toko oleh Admin) */}
        {selectedMethod === 'QRIS' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-glass)',
            textAlign: 'center',
            gap: '12px'
          }}>
            <div style={{
              padding: '14px',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
              maxWidth: '360px',
              maxHeight: '360px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '2px solid #00a86b'
            }}>
              <img
                src={activeQrisLink || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020101021226580016ID.CO.QRIS.WWW01189360091100000000000215ID102000000000005204541153033605802ID5914POS+PRIMA+ID6007JAKARTA62070703A016304${displayedTotal}`}
                alt="QRIS Toko"
                style={{
                  maxWidth: isQrZoomed ? '350px' : '190px',
                  maxHeight: isQrZoomed ? '350px' : '190px',
                  objectFit: 'contain',
                  display: 'block',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease'
                }}
                onClick={() => setIsQrZoomed(prev => !prev)}
                onError={(e) => {
                  e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=POS_PRIMA_${displayedTotal}`;
                }}
              />
            </div>

            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {activeQrisLink ? 'Scan QRIS Merchant Resmi' : 'Scan QRIS Dinamis'}
              </h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Mendukung BCA, Mandiri, GoPay, OVO, ShopeePay, DANA, LinkAja & Seluruh Mobile Banking
              </p>
            </div>

            {user?.role === 'admin' && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                💡 <i>Pengaturan upload QRIS & tarif pajak dikelola di <b>Pengaturan Toko (Khusus Admin)</b>.</i>
              </div>
            )}
          </div>
        )}

        {/* Card EDC / Transfer Display */}
        {['DEBIT_BCA', 'DEBIT_MANDIRI', 'TRANSFER', 'GOPAY'].includes(selectedMethod) && (
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-glass)',
            textAlign: 'center'
          }}>
            <CreditCard size={32} style={{ color: 'var(--indigo-500)', margin: '0 auto 8px' }} />
            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9375rem', fontWeight: 700 }}>
              Instruksi {selectedMethod}
            </h4>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Silakan gesek atau masukkan kartu ke mesin EDC, lalu verifikasi keberhasilan transaksi sebelum menekan tombol Selesaikan Transaksi.
            </p>
          </div>
        )}

        {errorMessage && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', fontSize: '0.8125rem' }}>
            {errorMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Batal
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleProcessPayment}
            disabled={isSubmitting || isCashInsufficient}
            style={{ padding: '12px 24px', fontSize: '0.9375rem' }}
          >
            {isSubmitting ? 'Memproses Transaksi...' : 'Selesaikan Pembayaran (Lunas)'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
