import React from 'react';
import Modal from '../common/Modal';
import { useSettings } from '../../context/SettingsContext';
import { formatRupiah, formatDate } from '../../utils/formatters';
import { Printer, Download, CheckCircle, Receipt } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, transaction }) {
  const { settings } = useSettings();
  if (!transaction) return null;

  const storeInfo = settings?.store || {};
  const storeName = storeInfo.name || storeInfo.appName || 'POS PRIMA INDONESIA';
  const storeAddress = storeInfo.address || 'Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan';
  const storePhone = storeInfo.phone || 'Telp: (021) 5790-1234';
  const receiptHeader = storeInfo.receiptHeader || 'Terima kasih atas kunjungan Anda!';
  const receiptFooter = storeInfo.receiptFooter || 'Barang yang dibeli tidak dapat ditukar kecuali dengan membawa struk asli.';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Struk Pembayaran Berhasil" maxWidth="480px" icon={Receipt}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Printable Thermal Receipt Container */}
        <div className="printable-area">
          <div className="thermal-receipt">
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              {storeInfo.logoUrl && (
                <img
                  src={storeInfo.logoUrl}
                  alt="Store Logo"
                  style={{
                    maxHeight: '44px',
                    maxWidth: '120px',
                    objectFit: 'contain',
                    margin: '0 auto 6px',
                    display: 'block'
                  }}
                />
              )}
              <div style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '0.05em' }}>
                {storeName}
              </div>
              <div style={{ fontSize: '11px', color: '#444' }}>
                {storeAddress}
              </div>
              <div style={{ fontSize: '11px', color: '#444' }}>
                {storePhone}
              </div>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                {receiptHeader}
              </div>
            </div>

            <div className="thermal-divider" />

            {/* Metadata Info */}
            <div style={{ fontSize: '11px', lineHeight: '1.5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>No. Invoice:</span>
                <span style={{ fontWeight: 700 }}>{transaction.invoiceNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tanggal:</span>
                <span>{formatDate(transaction.createdAt)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Kasir:</span>
                <span>{transaction.cashierName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Pelanggan:</span>
                <span>{transaction.customerName || 'Umum (Guest)'}</span>
              </div>
            </div>

            <div className="thermal-divider" />

            {/* Items List */}
            <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {transaction.items && transaction.items.map((item, idx) => (
                <div key={idx}>
                  <div style={{ fontWeight: 600 }}>{item.productName}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#333' }}>
                    <span>{item.quantity} x {formatRupiah(item.price)}</span>
                    <span style={{ fontWeight: 600 }}>{formatRupiah(item.total)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="thermal-divider" />

            {/* Financial Totals */}
            <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>{formatRupiah(transaction.subtotal)}</span>
              </div>

              {transaction.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b91c1c' }}>
                  <span>Diskon Promo/Poin:</span>
                  <span>- {formatRupiah(transaction.discountAmount)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>PPN ({transaction.taxPercentage || 11}%):</span>
                <span>{formatRupiah(transaction.taxAmount)}</span>
              </div>

              <div className="thermal-divider-double" />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '14px' }}>
                <span>TOTAL:</span>
                <span>{formatRupiah(transaction.totalAmount)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span>Metode Bayar:</span>
                <span>{transaction.paymentMethod}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Diterima (Bayar):</span>
                <span>{formatRupiah(transaction.amountPaid)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Kembalian:</span>
                <span>{formatRupiah(transaction.changeAmount)}</span>
              </div>

              {transaction.pointsEarned > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#047857', fontWeight: 600, marginTop: '4px' }}>
                  <span>Poin Diperoleh:</span>
                  <span>+{transaction.pointsEarned} Poin</span>
                </div>
              )}
            </div>

            <div className="thermal-divider" />

            {/* Footer Notice */}
            <div style={{ textAlign: 'center', fontSize: '10px', color: '#555', marginTop: '8px' }}>
              <div>{receiptFooter}</div>
              <div style={{ marginTop: '6px', fontWeight: 700, letterSpacing: '0.1em' }}>
                *** LUNAS ***
              </div>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Tutup
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePrint}
            >
              <Printer size={16} />
              <span>Cetak Struk (Thermal)</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
