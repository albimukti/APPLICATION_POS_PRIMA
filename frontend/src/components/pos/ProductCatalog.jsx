import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { formatRupiah } from '../../utils/formatters';
import {
  Search,
  QrCode,
  Sparkles,
  Plus,
  Minus,
  AlertCircle,
  ShoppingBag,
  CreditCard,
  Check
} from 'lucide-react';

export default function ProductCatalog({ onOpenScanner, onOpenPayment }) {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.getProducts();
        if (res.success) {
          setProducts(res.products);
          setCategories(res.categories || []);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const matchSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery));
    return matchCat && matchSearch && p.isActive;
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      gap: '10px',
      minHeight: 0,
      overflow: 'hidden'
    }}>
      {/* Search & Category Filter Header */}
      <div className="glass-panel" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', paddingRight: '8px', paddingBottom: '7px', paddingTop: '7px', fontSize: '0.8125rem' }}
              placeholder="Cari nama produk, SKU, atau barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={onOpenScanner}
            className="btn btn-secondary" 
            title="Scan Barcode Simulator"
            style={{ padding: '7px 12px', fontSize: '0.78rem', gap: '6px' }}
          >
            <QrCode size={16} />
            <span>Scan</span>
          </button>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`btn ${selectedCategory === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '5px 12px', fontSize: '0.75rem', borderRadius: '999px' }}
          >
            Semua ({products.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '5px 12px', fontSize: '0.75rem', borderRadius: '999px' }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid with neat, compact .pos-product-grid */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingRight: '2px',
        paddingBottom: '10px',
        minHeight: 0
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Memuat katalog produk...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ShoppingBag size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: '0.84rem' }}>Tidak ada produk yang sesuai dengan pencarian.</p>
          </div>
        ) : (
          <div className="pos-product-grid">
            {filteredProducts.map(product => {
              const isLowStock = product.stock <= product.minStockAlert;
              const isOutOfStock = product.stock <= 0;
              
              const cartItem = items.find(i => i.id === product.id);
              const inCartQty = cartItem ? cartItem.quantity : 0;

              return (
                <div
                  key={product.id}
                  className="glass-panel glass-panel-hover"
                  style={{
                    padding: '14px 14px 12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '14px',
                    border: inCartQty > 0 ? '2px solid var(--emerald-500)' : '1px solid var(--border-glass-strong)',
                    boxShadow: inCartQty > 0 ? '0 4px 14px rgba(5, 150, 105, 0.22)' : 'var(--shadow-sm)',
                    background: inCartQty > 0 ? 'rgba(5, 150, 105, 0.04)' : 'var(--bg-card)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    {/* Image container - ENLARGED TO 160px FOR HIGH CLARITY */}
                    <div style={{
                      width: '100%',
                      height: '160px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      marginBottom: '10px',
                      background: 'var(--bg-tertiary)',
                      position: 'relative',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                    }}
                    onClick={() => !isOutOfStock && addItem(product)}
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                        className="hover-scale"
                      />
                      <span style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        background: 'rgba(15, 23, 42, 0.78)',
                        backdropFilter: 'blur(4px)',
                        color: '#fff',
                        fontSize: '0.6875rem',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        fontWeight: 700
                      }}>
                        {product.sku}
                      </span>

                      {inCartQty > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#fff',
                          fontSize: '0.72rem',
                          padding: '3px 8px',
                          borderRadius: '999px',
                          fontWeight: 800,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <Check size={11} /> {inCartQty} di Keranjang
                        </span>
                      )}
                    </div>

                    {/* Title & Category - ENLARGED & BOLD */}
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>
                        {product.categoryName}
                      </span>
                      <h4 style={{
                        fontSize: '0.975rem',
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
                        {product.name}
                      </h4>
                    </div>

                    {/* Price & Stock - ENLARGED */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--emerald-500)' }}>
                        {formatRupiah(product.price)}
                      </div>
                      <span className={`badge ${isOutOfStock ? 'badge-danger' : isLowStock ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.72rem', padding: '3px 8px', fontWeight: 700 }}>
                        {isOutOfStock ? 'Habis' : `Stok: ${product.stock} ${product.unit}`}
                      </span>
                    </div>
                  </div>

                  {/* Stepper Controls on Fresh Bright Box */}
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-glass-strong)' }}>
                    {inCartQty > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {/* Stepper with - Merah and + Hijau */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-glass-strong)',
                          borderRadius: '8px',
                          padding: '4px 6px'
                        }}>
                          {/* - Merah */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(product.id, inCartQty - 1);
                            }}
                            className="btn-stepper-minus"
                            style={{ width: '32px', height: '32px' }}
                            title="Kurangi kuantitas (- Merah)"
                          >
                            <Minus size={15} />
                          </button>

                          <div style={{ textAlign: 'center', padding: '0 4px' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--emerald-500)', display: 'block', lineHeight: 1.1 }}>
                              {inCartQty} {product.unit}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-main)', fontWeight: 700 }}>
                              {formatRupiah(product.price * inCartQty)}
                            </span>
                          </div>

                          {/* + Hijau */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (inCartQty < product.stock) {
                                addItem(product);
                              } else {
                                alert('Mencapai batas stok yang tersedia');
                              }
                            }}
                            className="btn-stepper-plus"
                            style={{ width: '32px', height: '32px' }}
                            title="Tambah kuantitas (+ Hijau)"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isOutOfStock) addItem(product);
                        }}
                        disabled={isOutOfStock}
                        className="btn btn-secondary"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          gap: '6px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-glass-strong)'
                        }}
                      >
                        <Plus size={15} style={{ color: 'var(--emerald-500)' }} />
                        <span>+ Tambah Pesanan</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
