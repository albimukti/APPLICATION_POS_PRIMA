import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatRupiah } from '../../utils/formatters';
import Modal from '../common/Modal';
import PaymentModal from '../pos/PaymentModal';
import CartDrawer from '../pos/CartDrawer';
import ReceiptModal from '../pos/ReceiptModal';
import {
  Tag,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Layers,
  Eye,
  CreditCard,
  ShoppingBag,
  Check,
  LayoutGrid,
  List
} from 'lucide-react';

export default function ProductModule() {
  const { user } = useAuth();
  const { items, addItem, updateQuantity, totalItemsCount, totalAmount } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [completedTrx, setCompletedTrx] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewMode, setViewMode] = useState(user?.role === 'admin' ? 'table' : 'grid');

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    sku: '',
    barcode: '',
    description: '',
    price: '',
    costPrice: '',
    stock: '',
    minStockAlert: '5',
    unit: 'pcs',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [quantityDrafts, setQuantityDrafts] = useState({});

  const loadData = async () => {
    try {
      const res = await api.getProducts();
      if (res.success) {
        setProducts(res.products);
        setCategories(res.categories || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      categoryId: categories[0]?.id || 'cat-1',
      sku: `PRD-${String(products.length + 1).padStart(3, '0')}`,
      barcode: `89927531234${products.length + 60}`,
      description: '',
      price: '',
      costPrice: '',
      stock: '20',
      minStockAlert: '5',
      unit: 'pcs',
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      categoryId: p.categoryId,
      sku: p.sku,
      barcode: p.barcode || '',
      description: p.description || '',
      price: String(p.price),
      costPrice: String(p.costPrice),
      stock: String(p.stock),
      minStockAlert: String(p.minStockAlert),
      unit: p.unit,
      imageUrl: p.imageUrl
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
        setSuccessMsg('Produk berhasil diperbarui');
      } else {
        await api.createProduct(formData);
        setSuccessMsg('Produk baru berhasil ditambahkan ke katalog');
      }
      setIsModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message || 'Gagal menyimpan produk');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk '${name}'?`)) {
      try {
        await api.deleteProduct(id);
        loadData();
        setSuccessMsg(`Produk ${name} berhasil dihapus`);
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err) {
        alert(err.message || 'Gagal menghapus produk');
      }
    }
  };

  const filtered = products.filter(p => {
    const matchCat = selectedCat === 'ALL' || p.categoryId === selectedCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search));
    return matchCat && matchSearch;
  });

  return (
    <div style={{
      padding: '24px 24px 80px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      maxWidth: '1400px',
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Top Card */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-indigo">Modul #3</span>
            <span className="badge badge-success">{products.length} Total Produk</span>
            <span className="badge badge-warning">Fitur + / - & Checkout Aktif</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
             Katalog Produk POS & Pemesanan
          </h2>
        </div>

        {user?.role === 'admin' && (
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={18} />
            <span>Tambah Produk Baru</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          <button
            onClick={() => setSelectedCat('ALL')}
            className={`btn ${selectedCat === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
          >
            Semua Kategori
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`btn ${selectedCat === c.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Cari nama, SKU, barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* View Mode Toggle: Grid Kartu Besar vs Tabel */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-tertiary)',
            padding: '3px',
            borderRadius: '9px',
            border: '1px solid var(--border-glass)'
          }}>
            <button
              onClick={() => setViewMode('grid')}
              title="Tampilan Grid Kartu Besar"
              style={{
                padding: '7px 11px',
                borderRadius: '6px',
                background: viewMode === 'grid' ? 'var(--bg-secondary)' : 'transparent',
                border: 'none',
                color: viewMode === 'grid' ? 'var(--emerald-500)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <LayoutGrid size={17} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Tampilan Tabel Rinci"
              style={{
                padding: '7px 11px',
                borderRadius: '6px',
                background: viewMode === 'table' ? 'var(--bg-secondary)' : 'transparent',
                border: 'none',
                color: viewMode === 'table' ? 'var(--emerald-500)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <List size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: ENLARGED CARD GRID (FOR CASHIER & CUSTOMER) */}
      {viewMode === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '22px'
        }}>
          {filtered.map(p => {
            const cartItem = items.find(i => i.id === p.id);
            const inCartQty = cartItem ? cartItem.quantity : 0;
            const isOutOfStock = p.stock <= 0;
            const isLowStock = p.stock <= p.minStockAlert;

            return (
              <div
                key={p.id}
                className="glass-panel glass-panel-hover"
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: inCartQty > 0 ? '2px solid var(--emerald-500)' : '1px solid var(--border-glass-strong)',
                  background: inCartQty > 0 ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)',
                  boxShadow: inCartQty > 0 ? '0 4px 16px rgba(5, 150, 105, 0.22)' : 'var(--shadow-sm)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  {/* Big 180px Image for High Clarity */}
                  <div
                    style={{
                      width: '100%',
                      height: '220px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      marginBottom: '12px',
                      background: 'var(--bg-tertiary)',
                      position: 'relative',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                    }}
                    onClick={() => !isOutOfStock && addItem(p)}
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                      className="hover-scale"
                    />
                    <span style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      backdropFilter: 'blur(4px)',
                      color: '#fff',
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: 700
                    }}>
                      {p.sku}
                    </span>

                    {inCartQty > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#fff',
                        fontSize: '0.75rem',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontWeight: 800,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <Check size={12} /> {inCartQty} di Keranjang
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>
                      {p.categoryName}
                    </span>
                    <span className={`badge ${isOutOfStock ? 'badge-danger' : isLowStock ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.72rem', padding: '3px 8px', fontWeight: 700 }}>
                      {isOutOfStock ? 'Habis' : `Stok: ${p.stock} ${p.unit}`}
                    </span>
                  </div>

                  <h4 style={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    margin: '3px 0 6px 0',
                    lineHeight: '1.35',
                    minHeight: '2.7em',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {p.name}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 10px 0', lineHeight: '1.4', height: '2.8em', overflow: 'hidden' }}>
                    {p.description || 'Pilihan produk terbaik dengan kualitas prima.'}
                  </p>

                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--emerald-500)', marginBottom: '12px' }}>
                    {formatRupiah(p.price)}
                  </div>
                </div>

                {/* Cart Action Buttons */}
                <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-glass-strong)' }}>
                  {inCartQty > 0 ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-glass-strong)',
                      borderRadius: '8px',
                      padding: '4px 6px'
                    }}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(p.id, inCartQty - 1)}
                        className="btn-stepper-minus"
                        style={{ width: '34px', height: '34px' }}
                        title="Kurangi kuantitas (- Merah)"
                      >
                        <Minus size={15} />
                      </button>

                      <div style={{ textAlign: 'center', padding: '0 4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            min="1"
                            max={p.stock}
                            value={quantityDrafts[p.id] ?? inCartQty}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              setQuantityDrafts(prev => ({ ...prev, [p.id]: e.target.value }));
                            }}
                            onBlur={(e) => {
                              const typedQty = Number(e.target.value);
                              if (Number.isFinite(typedQty) && typedQty >= 1) updateQuantity(p.id, Math.min(typedQty, p.stock));
                              setQuantityDrafts(prev => {
                                const next = { ...prev };
                                delete next[p.id];
                                return next;
                              });
                            }}
                            aria-label={`Jumlah ${p.name}`}
                            style={{ width: '52px', height: '28px', textAlign: 'center', border: '1px solid var(--border-glass-strong)', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--emerald-500)', fontWeight: 800, fontSize: '0.9rem' }}
                          />
                          <span style={{ fontWeight: 800, fontSize: '0.78rem', color: 'var(--emerald-500)' }}>{p.unit}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 700 }}>
                          {formatRupiah(p.price * inCartQty)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (inCartQty < p.stock) updateQuantity(p.id, inCartQty + 1);
                          else alert('Mencapai batas stok');
                        }}
                        className="btn-stepper-plus"
                        style={{ width: '34px', height: '34px' }}
                        title="Tambah kuantitas (+ Hijau)"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => !isOutOfStock && addItem(p)}
                      disabled={isOutOfStock}
                      className="btn btn-secondary"
                      style={{
                        width: '100%',
                        padding: '9px 14px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        gap: '6px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-glass-strong)'
                      }}
                    >
                      <Plus size={16} style={{ color: 'var(--emerald-500)' }} />
                      <span>+ Tambah ke Pesanan</span>
                    </button>
                  )}

                  {user?.role === 'admin' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-glass)' }}>
                      <button onClick={() => handleOpenEdit(p)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>
                        <Edit2 size={13} /> Edit
                      </button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>
                        <Trash2 size={13} /> Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW 2: DETAILED TABLE VIEW (ENLARGED THUMBNAILS & FONTS) */
        <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass-strong)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '14px 12px' }}>Produk</th>
                <th style={{ padding: '14px 12px' }}>SKU / Barcode</th>
                <th style={{ padding: '14px 12px' }}>Kategori</th>
                {user?.role === 'admin' && <th style={{ padding: '14px 12px' }}>Harga Modal</th>}
                <th style={{ padding: '14px 12px' }}>Harga Jual</th>
                <th style={{ padding: '14px 12px' }}>Stok</th>
                <th style={{ padding: '14px 12px', textAlign: 'center' }}>Pesan (+ / -)</th>
                {user?.role === 'admin' && <th style={{ padding: '14px 12px', textAlign: 'center' }}>Aksi Admin</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const cartItem = items.find(i => i.id === p.id);
                const inCartQty = cartItem ? cartItem.quantity : 0;
                const isOutOfStock = p.stock <= 0;

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-glass)', background: inCartQty > 0 ? 'rgba(16, 185, 129, 0.04)' : 'transparent' }}>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>{p.name}</div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.description?.slice(0, 45)}...</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{p.sku}</div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.barcode || '-'}</span>
                    </td>
                    <td style={{ padding: '14px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>{p.categoryName}</td>
                    {user?.role === 'admin' && <td style={{ padding: '14px 12px' }}>{formatRupiah(p.costPrice)}</td>}
                    <td style={{ padding: '14px 12px', fontWeight: 800, fontSize: '1.05rem', color: 'var(--emerald-500)' }}>{formatRupiah(p.price)}</td>
                    <td style={{ padding: '14px 12px', fontWeight: 700 }}>
                      <span className={`badge ${isOutOfStock ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.78rem', padding: '4px 8px' }}>
                        {isOutOfStock ? 'Habis' : `${p.stock} ${p.unit}`}
                      </span>
                    </td>

                    {/* + Hijau & - Merah Stepper Column */}
                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                      {inCartQty > 0 ? (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-glass-strong)',
                          borderRadius: '8px',
                          padding: '3px 6px'
                        }}>
                          <button
                            type="button"
                            onClick={() => updateQuantity(p.id, inCartQty - 1)}
                            className="btn-stepper-minus"
                            style={{ width: '30px', height: '30px' }}
                            title="Kurangi (- Merah)"
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={p.stock}
                            value={quantityDrafts[p.id] ?? inCartQty}
                            onChange={(e) => {
                              setQuantityDrafts(prev => ({ ...prev, [p.id]: e.target.value }));
                            }}
                            onBlur={(e) => {
                              const typedQty = Number(e.target.value);
                              if (Number.isFinite(typedQty) && typedQty >= 1) updateQuantity(p.id, Math.min(typedQty, p.stock));
                              setQuantityDrafts(prev => {
                                const next = { ...prev };
                                delete next[p.id];
                                return next;
                              });
                            }}
                            aria-label={`Jumlah ${p.name}`}
                            style={{ width: '48px', height: '28px', textAlign: 'center', border: '1px solid var(--border-glass-strong)', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text-main)', fontWeight: 800, fontSize: '0.9rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (inCartQty < p.stock) updateQuantity(p.id, inCartQty + 1);
                              else alert('Mencapai batas stok');
                            }}
                            className="btn-stepper-plus"
                            style={{ width: '30px', height: '30px' }}
                            title="Tambah (+ Hijau)"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => !isOutOfStock && addItem(p)}
                          disabled={isOutOfStock}
                          className="btn btn-secondary"
                          style={{ padding: '7px 14px', fontSize: '0.8125rem', gap: '5px', fontWeight: 700 }}
                        >
                          <Plus size={14} style={{ color: 'var(--emerald-500)' }} />
                          <span>Tambah</span>
                        </button>
                      )}
                    </td>

                    {/* Admin Edit/Delete Column */}
                    {user?.role === 'admin' && (
                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                          <button onClick={() => handleOpenEdit(p)} className="btn btn-secondary" style={{ padding: '6px 10px' }} title="Edit Produk">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => handleDelete(p.id, p.name)} className="btn btn-danger" style={{ padding: '6px 10px' }} title="Hapus Produk">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating Sticky Quick Checkout Bar */}
      {totalItemsCount > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '850px',
          padding: '14px 24px',
          borderRadius: '16px',
          background: 'var(--bg-secondary)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(5, 150, 105, 0.4)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.16)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 90,
          animation: 'scaleUp 0.25s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--emerald-500)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Pesanan Terpilih: <b>{totalItemsCount} Item</b>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emerald-500)' }}>
                Total: {formatRupiah(totalAmount)}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsPaymentOpen(true)}
            className="btn btn-primary pulse-active"
            style={{ padding: '12px 24px', fontSize: '0.9375rem', fontWeight: 800, gap: '8px' }}
          >
            <CreditCard size={18} />
            <span>Bayar / Checkout Sekarang</span>
          </button>
        </div>
      )}

      {/* Payment Modal */}
      <CartDrawer onOpenPayment={() => setIsPaymentOpen(true)} />
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccessPayment={(trx) => setCompletedTrx(trx)}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(completedTrx)}
        onClose={() => setCompletedTrx(null)}
        transaction={completedTrx}
      />

      {/* Add / Edit Product Modal */}
      {user?.role === 'admin' && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingProduct ? `Edit Produk: ${editingProduct.name}` : 'Tambah Produk Baru'}
          maxWidth="600px"
          icon={Tag}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Nama Produk:</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Contoh: Kopi Latte 250ml"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Kategori:</label>
                <select
                  className="form-select"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Satuan Unit:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="pcs / btl / pck"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">SKU Produk:</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Barcode EAN-13:</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Harga Modal (Rp):</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Harga Jual (Rp):</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Stok Awal:</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alert Stok Minimum:</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.minStockAlert}
                  onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">URL Foto Produk:</label>
              <input
                type="text"
                className="form-input"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
