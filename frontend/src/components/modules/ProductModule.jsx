import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { formatRupiah } from '../../utils/formatters';
import Modal from '../common/Modal';
import PaymentModal from '../pos/PaymentModal';
import ReceiptModal from '../pos/ReceiptModal';
import {
  Tag,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  ShoppingBag,
  Coffee,
  Utensils,
  CupSoda,
  Cookie,
  Cake,
  Flame,
  PauseCircle,
  XCircle,
  Check
} from 'lucide-react';

function getCategoryIcon(catName) {
  const lower = (catName || '').toLowerCase();
  if (lower.includes('kopi') || lower.includes('coffee')) return Coffee;
  if (lower.includes('minum') || lower.includes('beverage') || lower.includes('drink') || lower.includes('teh') || lower.includes('boba')) return CupSoda;
  if (lower.includes('makan') || lower.includes('food') || lower.includes('siomay') || lower.includes('mie') || lower.includes('nasi') || lower.includes('ayam')) return Utensils;
  if (lower.includes('bbq') || lower.includes('panggang') || lower.includes('bakar')) return Flame;
  if (lower.includes('snack') || lower.includes('camilan') || lower.includes('keripik') || lower.includes('gorengan')) return Cookie;
  if (lower.includes('roti') || lower.includes('kue') || lower.includes('pastry') || lower.includes('desert') || lower.includes('dessert')) return Cake;
  return Tag;
}

export default function ProductModule() {
  const { user } = useAuth();
  const {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    holdOrder,
    resumeOrder,
    heldOrders,
    totalItemsCount
  } = useCart();
  const { settings } = useSettings();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Micro-animation click feedback state
  const [activeClickId, setActiveClickId] = useState(null);

  const handleProductCardClick = (p) => {
    setActiveClickId(p.id);
    addItem(p);
    setTimeout(() => {
      setActiveClickId(prev => (prev === p.id ? null : prev));
    }, 420);
  };

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [completedTrx, setCompletedTrx] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // Category Manual Form State (Ketik Sendiri)
  const [newCatName, setNewCatName] = useState('');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // Product Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryName: '',
    categoryId: '',
    sku: '',
    barcode: '',
    description: '',
    price: '',
    costPrice: '',
    stock: '20',
    minStockAlert: '5',
    unit: 'pcs',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const loadData = async () => {
    try {
      const res = await api.getProducts();
      if (res.success) {
        setProducts(res.products || []);
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
      categoryName: categories[0]?.name || '',
      categoryId: categories[0]?.id || '',
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

  const handleOpenEdit = (e, p) => {
    e.stopPropagation();
    setEditingProduct(p);
    setFormData({
      name: p.name,
      categoryName: p.categoryName || '',
      categoryId: p.categoryId || '',
      sku: p.sku || '',
      barcode: p.barcode || '',
      description: p.description || '',
      price: String(p.price || 0),
      costPrice: String(p.costPrice || 0),
      stock: String(p.stock || 0),
      minStockAlert: String(p.minStockAlert || 5),
      unit: p.unit || 'pcs',
      imageUrl: p.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
        setSuccessMsg(`Produk "${formData.name}" berhasil diperbarui!`);
      } else {
        await api.createProduct(formData);
        setSuccessMsg(`Produk "${formData.name}" berhasil ditambahkan!`);
      }
      setIsModalOpen(false);
      await loadData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      alert(err.message || 'Gagal menyimpan produk');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (e, id, name) => {
    e.stopPropagation();
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)) {
      try {
        await api.deleteProduct(id);
        setSuccessMsg(`Produk "${name}" berhasil dihapus`);
        await loadData();
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err) {
        alert(err.message || 'Gagal menghapus produk');
      }
    }
  };

  const handleAddCategory = async (e) => {
    if (e) e.preventDefault();
    if (!newCatName || !newCatName.trim()) return;

    setIsSubmittingCat(true);
    try {
      const res = await api.createCategory({
        name: newCatName.trim(),
        color: '#10b981',
        icon: 'Tag'
      });
      if (res.success) {
        setSuccessMsg(`Kategori "${res.category.name}" berhasil disimpan!`);
        setNewCatName('');
        await loadData();
        setFormData(prev => ({
          ...prev,
          categoryName: res.category.name,
          categoryId: res.category.id
        }));
        setTimeout(() => setSuccessMsg(null), 3500);
      }
    } catch (err) {
      alert(err.message || 'Gagal menambahkan kategori');
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${catName}"?`)) {
      try {
        const res = await api.deleteCategory(catId);
        if (res.success) {
          setSuccessMsg(`Kategori "${catName}" berhasil dihapus`);
          if (selectedCat === catId) setSelectedCat('ALL');
          await loadData();
          setTimeout(() => setSuccessMsg(null), 3000);
        }
      } catch (err) {
        alert(err.message || 'Gagal menghapus kategori');
      }
    }
  };

  // Calculations for Checkout Sidebar using Admin Store Settings
  const activeTaxRate = settings?.store?.enableTax !== false
    ? (settings?.store?.taxPercentage !== undefined ? parseFloat(settings.store.taxPercentage) : 11)
    : 0;
  const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const discountAmount = (subtotal * (parseFloat(discountPercent) || 0)) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * activeTaxRate) / 100;
  const finalTotal = taxableAmount + taxAmount;

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchCat = selectedCat === 'ALL' || p.categoryId === selectedCat || (p.categoryName && p.categoryName.toLowerCase() === selectedCat.toLowerCase());
    const q = search.toLowerCase().trim();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)) || (p.barcode && p.barcode.includes(q));
    return matchCat && matchSearch;
  });

  return (
    <div style={{
      display: 'flex',
      gap: '18px',
      height: 'calc(100vh - 145px)',
      boxSizing: 'border-box',
      overflow: 'hidden',
      padding: '4px 0'
    }}>
      {/* Micro-animation CSS Keyframes */}
      <style>{`
        @keyframes floatPlusOne {
          0% { transform: translate(-50%, 0) scale(0.6); opacity: 0; }
          40% { transform: translate(-50%, -18px) scale(1.15); opacity: 1; }
          100% { transform: translate(-50%, -36px) scale(0.95); opacity: 0; }
        }
        @keyframes haloPulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 168, 107, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(0, 168, 107, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 168, 107, 0); }
        }
      `}</style>
      {/* ================= LEFT SECTION: PRODUCT CATALOG & BOTTOM CATEGORIES ================= */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        height: '100%'
      }}>
        {/* White Card Container for Products */}
        <div style={{
          flex: 1,
          minHeight: 0,
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: '18px 20px'
        }}>
          {/* Top Bar inside Card: + ADD NEW ITEM & Search Box */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {/* Left Action: + ADD NEW ITEM */}
            {user?.role === 'admin' ? (
              <button
                type="button"
                onClick={handleOpenAdd}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00a86b',
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 4px',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}
              >
                <Plus size={17} strokeWidth={2.5} />
                <span>ADD NEW ITEM</span>
              </button>
            ) : (
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>
                Katalog Menu
              </div>
            )}

            {/* Right: Search Pill with Round Green Search Button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f1f5f9',
              borderRadius: '999px',
              padding: '3px 4px 3px 16px',
              width: '280px',
              border: '1px solid #e2e8f0'
            }}>
              <input
                type="text"
                placeholder="Search items here..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.85rem',
                  color: '#1e293b',
                  width: '100%'
                }}
              />
              <button
                type="button"
                title="Cari"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#00a86b',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <Search size={15} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#059669',
              fontSize: '0.825rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Product Cards Grid (Scrollable) */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '4px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))',
            gap: '16px',
            alignContent: 'start'
          }}>
            {filteredProducts.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '48px 20px',
                color: '#94a3b8'
              }}>
                <ShoppingBag size={40} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748b' }}>Belum ada produk</div>
                <p style={{ fontSize: '0.825rem', margin: '6px 0 16px 0' }}>
                  {user?.role === 'admin' ? 'Klik "+ ADD NEW ITEM" di atas untuk menambahkan produk pertama Anda.' : 'Katalog masih kosong.'}
                </p>
                {user?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={handleOpenAdd}
                    className="btn btn-primary"
                    style={{ padding: '8px 18px', fontSize: '0.825rem' }}
                  >
                    <Plus size={15} /> Tambah Produk
                  </button>
                )}
              </div>
            ) : (
              filteredProducts.map(p => {
                const inCartItem = items.find(i => i.id === p.id);
                const inCartQty = inCartItem ? inCartItem.quantity : 0;
                const isJustClicked = activeClickId === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => handleProductCardClick(p)}
                    style={{
                      background: '#ffffff',
                      border: isJustClicked ? '2px solid #00a86b' : (inCartQty > 0 ? '2px solid #00a86b' : '1px solid #edf2f7'),
                      borderRadius: '12px',
                      padding: '12px 10px',
                      cursor: 'pointer',
                      transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      position: 'relative',
                      transform: isJustClicked ? 'scale(0.95)' : 'none',
                      boxShadow: isJustClicked
                        ? '0 0 0 4px rgba(0, 168, 107, 0.25), 0 8px 20px rgba(0, 168, 107, 0.2)'
                        : (inCartQty > 0 ? '0 4px 14px rgba(0, 168, 107, 0.16)' : '0 1px 4px rgba(0, 0, 0, 0.02)')
                    }}
                    onMouseEnter={(e) => {
                      if (!isJustClicked && inCartQty === 0) e.currentTarget.style.borderColor = '#cbd5e1';
                      if (!isJustClicked) e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isJustClicked && inCartQty === 0) e.currentTarget.style.borderColor = '#edf2f7';
                      if (!isJustClicked) e.currentTarget.style.transform = 'none';
                    }}
                  >
                    {/* Floating +1 Pop Badge Animation */}
                    {isJustClicked && (
                      <div style={{
                        position: 'absolute',
                        top: '40%',
                        left: '50%',
                        background: '#00a86b',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        fontWeight: 900,
                        padding: '3px 12px',
                        borderRadius: '999px',
                        boxShadow: '0 4px 14px rgba(0, 168, 107, 0.5)',
                        animation: 'floatPlusOne 0.42s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards',
                        zIndex: 20,
                        pointerEvents: 'none'
                      }}>
                        +1
                      </div>
                    )}
                    {/* Admin Actions: Edit / Delete on Hover */}
                    {user?.role === 'admin' && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          display: 'flex',
                          gap: '4px',
                          zIndex: 2
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(e, p)}
                          title="Edit Produk"
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            border: 'none',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteProduct(e, p.id, p.name)}
                          title="Hapus Produk"
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            background: '#fee2e2',
                            border: 'none',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}

                    {/* Quantity Badge if in cart */}
                    {inCartQty > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        background: '#00a86b',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '999px',
                        boxShadow: '0 2px 6px rgba(0, 168, 107, 0.4)'
                      }}>
                        {inCartQty}
                      </div>
                    )}

                    {/* Product Image Frame */}
                    <div style={{
                      width: '100%',
                      height: '110px',
                      borderRadius: '8px',
                      background: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      marginBottom: '10px'
                    }}>
                      <img
                        src={p.imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60'}
                        alt={p.name}
                        style={{
                          maxHeight: '100%',
                          maxWidth: '100%',
                          objectFit: 'contain'
                        }}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60';
                        }}
                      />
                    </div>

                    {/* Product Name */}
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#1e293b',
                      lineHeight: '1.25',
                      marginBottom: '4px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '2.4em'
                    }}>
                      {p.name}
                    </div>

                    {/* Price in Bold Green */}
                    <div style={{
                      fontSize: '0.925rem',
                      fontWeight: 800,
                      color: '#00a86b',
                      letterSpacing: '-0.01em'
                    }}>
                      {formatRupiah(p.price)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom Category Tabs Bar & Cancel / Hold Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {/* Category Tabs Row */}
          <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '2px',
            alignItems: 'stretch'
          }}>
            {/* "Semua" / All Category Button */}
            <button
              type="button"
              onClick={() => setSelectedCat('ALL')}
              style={{
                minWidth: '100px',
                padding: '10px 14px',
                borderRadius: '12px',
                background: '#ffffff',
                border: selectedCat === 'ALL' ? '2px solid #00a86b' : '1px solid #e2e8f0',
                color: selectedCat === 'ALL' ? '#00a86b' : '#64748b',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: selectedCat === 'ALL' ? '0 4px 12px rgba(0, 168, 107, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.02)'
              }}
            >
              <ShoppingBag size={20} color={selectedCat === 'ALL' ? '#00a86b' : '#94a3b8'} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Semua</span>
            </button>

            {/* Dynamic Category Buttons */}
            {categories.map(c => {
              const IconComp = getCategoryIcon(c.name);
              const isActive = selectedCat === c.id || selectedCat.toLowerCase() === c.name.toLowerCase();

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCat(c.id)}
                  style={{
                    minWidth: '100px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: '#ffffff',
                    border: isActive ? '2px solid #00a86b' : '1px solid #e2e8f0',
                    color: isActive ? '#00a86b' : '#64748b',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? '0 4px 12px rgba(0, 168, 107, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.02)'
                  }}
                >
                  <IconComp size={20} color={isActive ? '#00a86b' : '#94a3b8'} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{c.name}</span>
                </button>
              );
            })}

            {/* + Kategori Button to type new category */}
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              title="Tambah Kategori Baru (Ketik Sendiri)"
              style={{
                minWidth: '95px',
                padding: '10px 12px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1.5px dashed #cbd5e1',
                color: '#64748b',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={20} color="#64748b" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' }}>+ Kategori</span>
            </button>
          </div>

          {/* Action Buttons Row: Cancel Order & Hold Order */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            alignItems: 'center'
          }}>
            {heldOrders.length > 0 && (
              <button
                type="button"
                onClick={() => resumeOrder(heldOrders[0].id)}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #3b82f6',
                  color: '#3b82f6',
                  borderRadius: '10px',
                  padding: '9px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <PauseCircle size={15} />
                <span>Resume Order ({heldOrders.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (items.length === 0) return;
                if (confirm('Batalkan seluruh pesanan saat ini?')) {
                  clearCart();
                }
              }}
              style={{
                background: '#ffffff',
                border: '1.5px solid #ef4444',
                color: '#ef4444',
                borderRadius: '10px',
                padding: '9px 22px',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: items.length > 0 ? 'pointer' : 'not-allowed',
                opacity: items.length > 0 ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Cancel Order</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (items.length === 0) return;
                holdOrder();
                setSuccessMsg('Pesanan berhasil di-Hold/Disimpan!');
                setTimeout(() => setSuccessMsg(null), 3000);
              }}
              style={{
                background: '#ffffff',
                border: '1.5px solid #00a86b',
                color: '#00a86b',
                borderRadius: '10px',
                padding: '9px 22px',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: items.length > 0 ? 'pointer' : 'not-allowed',
                opacity: items.length > 0 ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Hold Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= RIGHT SECTION: PERMANENT INTEGRATED CHECKOUT PANEL ================= */}
      <div style={{
        width: '360px',
        flexShrink: 0,
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}>
        {/* Checkout Header */}
        <div style={{
          padding: '16px 20px',
          textAlign: 'center',
          borderBottom: '1px solid #f1f5f9',
          fontSize: '1.15rem',
          fontWeight: 800,
          color: '#1e293b',
          letterSpacing: '-0.01em'
        }}>
          Checkout
        </div>

        {/* Column Subheaders: Name | QTY | Price */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 108px 75px',
          padding: '8px 18px',
          background: '#f8fafc',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          <div>Name</div>
          <div style={{ textAlign: 'center' }}>QTY</div>
          <div style={{ textAlign: 'right' }}>Price</div>
        </div>

        {/* Scrollable Cart Item Rows */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {items.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 16px',
              color: '#94a3b8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}>
              <ShoppingBag size={34} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#64748b' }}>Pesanan Kosong</div>
              <p style={{ fontSize: '0.78rem', margin: '4px 0 0 0' }}>Klik produk di sebelah kiri untuk memasukkan ke keranjang.</p>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 108px 75px',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #f8fafc'
                }}
              >
                {/* Name & Trash Icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    title="Hapus item"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
                  >
                    <Trash2 size={15} />
                  </button>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#1e293b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.name}
                  </span>
                </div>

                {/* Circular Stepper (-) QTY Input (+) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      border: '1.5px solid #00a86b',
                      color: '#00a86b',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0,
                      flexShrink: 0
                    }}
                  >
                    <Minus size={11} strokeWidth={3} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      updateQuantity(item.id, isNaN(val) || val <= 0 ? 1 : val);
                    }}
                    style={{
                      width: '38px',
                      height: '24px',
                      borderRadius: '6px',
                      border: '1.5px solid #00a86b',
                      textAlign: 'center',
                      fontSize: '0.825rem',
                      fontWeight: 800,
                      color: '#1e293b',
                      background: '#ffffff',
                      padding: '0 2px',
                      outline: 'none',
                      MozAppearance: 'textfield'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      border: '1.5px solid #00a86b',
                      color: '#00a86b',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0,
                      flexShrink: 0
                    }}
                  >
                    <Plus size={11} strokeWidth={3} />
                  </button>
                </div>

                {/* Line Total Price */}
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  textAlign: 'right'
                }}>
                  {formatRupiah(item.price * item.quantity)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculation Summary at Bottom */}
        <div style={{
          borderTop: '1px solid #f1f5f9',
          background: '#fafbfc',
          padding: '12px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '0.825rem'
        }}>
          {/* Discount (%) Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#64748b', fontWeight: 600 }}>Discount (%)</span>
            <input
              type="number"
              min="0"
              max="100"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
              style={{
                width: '56px',
                padding: '3px 6px',
                textAlign: 'center',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.825rem',
                fontWeight: 700,
                outline: 'none',
                color: '#1e293b'
              }}
            />
          </div>

          {/* Subtotal */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#64748b', fontWeight: 600 }}>Sub Total</span>
            <span style={{ fontWeight: 700, color: '#1e293b' }}>{formatRupiah(subtotal)}</span>
          </div>

          {/* Tax */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#00a86b', fontWeight: 600 }}>
              {activeTaxRate > 0 ? `Tax ${activeTaxRate}%` : 'Tax (0%)'}
            </span>
            <span style={{ fontWeight: 700, color: '#1e293b' }}>{formatRupiah(taxAmount)}</span>
          </div>

          {/* Total */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '6px',
            borderTop: '1px dashed #e2e8f0'
          }}>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>Total</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#00a86b' }}>
              {formatRupiah(finalTotal)}
            </span>
          </div>
        </div>

        {/* Full-Width Pay Button */}
        <div style={{
          padding: '12px 18px 16px 18px',
          background: '#fafbfc'
        }}>
          <button
            type="button"
            disabled={items.length === 0}
            onClick={() => setIsPaymentOpen(true)}
            style={{
              width: '100%',
              background: items.length > 0 ? '#00a86b' : '#94a3b8',
              color: '#ffffff',
              padding: '14px',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 800,
              border: 'none',
              cursor: items.length > 0 ? 'pointer' : 'not-allowed',
              boxShadow: items.length > 0 ? '0 4px 14px rgba(0, 168, 107, 0.3)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Pay ({formatRupiah(finalTotal)})
          </button>
        </div>
      </div>

      {/* ================= MODALS: ADD / EDIT PRODUCT ================= */}
      {user?.role === 'admin' && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingProduct ? `Edit Produk: ${editingProduct.name}` : 'Tambah Produk Baru'}
          maxWidth="600px"
          icon={Tag}
        >
          <form onSubmit={handleSubmitProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Nama Produk:</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Contoh: Kopi Latte, Siomay Ayam..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Kategori Produk (Ketik Sendiri):</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Ketik kategori (contoh: Makanan, Minuman, Snack)..."
                  list="category-datalist"
                  value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                />
                <datalist id="category-datalist">
                  {categories.map(c => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label className="form-label">Satuan Unit:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="pcs / btl / porsi"
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
                <label className="form-label">Barcode:</label>
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================= MODAL: TAMBAH KATEGORI (KETIK SENDIRI) ================= */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Tambah Kategori Produk"
        maxWidth="480px"
        icon={Tag}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Ketik Nama Kategori Baru:</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ketik nama kategori (contoh: Makanan, Minuman, Snack)..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="submit"
                disabled={isSubmittingCat || !newCatName.trim()}
                className="btn btn-primary"
                style={{ padding: '8px 18px' }}
              >
                <Plus size={16} />
                <span>{isSubmittingCat ? 'Menyimpan...' : 'Simpan Kategori'}</span>
              </button>
            </div>
          </form>

          {/* Existing Categories Directory */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>
              Daftar Kategori yang Sudah Dibuat ({categories.length}):
            </div>
            {categories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                Belum ada kategori. Ketik nama kategori di atas lalu klik "Simpan Kategori".
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {categories.map(c => {
                  const prodCount = products.filter(p => p.categoryId === c.id || (p.categoryName && p.categoryName.toLowerCase() === c.name.toLowerCase())).length;
                  return (
                    <div
                      key={c.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.875rem' }}>{c.name}</span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({prodCount} produk)</span>
                      </div>
                      {user?.role === 'admin' && prodCount === 0 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(c.id, c.name)}
                          title="Hapus Kategori"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCategoryModalOpen(false)}>
              Selesai / Tutup
            </button>
          </div>
        </div>
      </Modal>

      {/* Payment & Receipt Modals */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccessPayment={(trx) => setCompletedTrx(trx)}
        overrideTotal={finalTotal}
      />

      <ReceiptModal
        isOpen={Boolean(completedTrx)}
        onClose={() => setCompletedTrx(null)}
        transaction={completedTrx}
      />
    </div>
  );
}
