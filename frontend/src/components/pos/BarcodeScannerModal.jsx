import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import { formatRupiah } from '../../utils/formatters';
import { QrCode, Scan, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BarcodeScannerModal({ isOpen, onClose }) {
  const { addItem } = useCart();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!barcodeInput) return;
    setError(null);
    try {
      const res = await api.getProducts({ search: barcodeInput });
      if (res.success && res.products.length > 0) {
        const found = res.products.find(p => p.barcode === barcodeInput || p.sku === barcodeInput) || res.products[0];
        addItem(found);
        setScannedProduct(found);
        setBarcodeInput('');
      } else {
        setError(`Produk dengan Barcode/SKU '${barcodeInput}' tidak ditemukan.`);
      }
    } catch (err) {
      setError('Gagal mencari produk barcode');
    }
  };

  const sampleBarcodes = [
    { name: 'Kopi Arabika', code: '8992753123451' },
    { name: 'Matcha Latte', code: '8992753123452' },
    { name: 'Roti Sourdough', code: '8992753123453' },
    { name: 'Croissant Butter', code: '8992753123454' },
    { name: 'Beras Organik 5kg', code: '8992753123456' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Simulator Pemindai Barcode (Scanner)" maxWidth="520px" icon={QrCode}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Animated Scanner Graphic */}
        <div style={{
          height: '140px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '2px dashed var(--emerald-500)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Scan size={44} style={{ color: 'var(--emerald-500)', marginBottom: '8px' }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Arahkan barcode fisik atau klik barcode sampel di bawah
          </span>
        </div>

        {/* Input form */}
        <form onSubmit={handleScan} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Ketik atau Scan Barcode/SKU (lalu Enter)..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn btn-primary">
            Scan & Tambah
          </button>
        </form>

        {/* Sample click buttons */}
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            Barcode Cepat untuk Pengujian:
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {sampleBarcodes.map(b => (
              <button
                key={b.code}
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                onClick={() => {
                  setBarcodeInput(b.code);
                }}
              >
                {b.name} ({b.code.slice(-4)})
              </button>
            ))}
          </div>
        </div>

        {/* Success Alert */}
        {scannedProduct && (
          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem' }}>
            <CheckCircle2 size={18} />
            <span>Berhasil menambahkan <b>{scannedProduct.name}</b> ({formatRupiah(scannedProduct.price)}) ke keranjang!</span>
          </div>
        )}

        {error && (
          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </Modal>
  );
}
