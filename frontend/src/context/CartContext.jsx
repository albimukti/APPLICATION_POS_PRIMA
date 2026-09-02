import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState(null); // Selected customer object
  const [promo, setPromo] = useState(null); // Applied promo object
  const [pointsToUse, setPointsToUse] = useState(0); // Customer loyalty points to redeem
  const [taxPercentage, setTaxPercentage] = useState(11); // Standard 11% PPN
  const [notes, setNotes] = useState('');
  const [heldOrders, setHeldOrders] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false); // Global drawer state for top cart button

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  // Add item to cart or increment quantity
  const addItem = (product, quantity = 1) => {
    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(i => i.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prevItems, {
          id: product.id,
          sku: product.sku,
          barcode: product.barcode,
          name: product.name,
          categoryName: product.categoryName,
          price: product.price,
          costPrice: product.costPrice,
          imageUrl: product.imageUrl,
          unit: product.unit,
          stock: product.stock,
          quantity: quantity,
          discount: 0,
          notes: ''
        }];
      }
    });
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev => prev.map(i => i.id === productId ? { ...i, quantity: newQty } : i));
  };

  const removeItem = (productId) => {
    setItems(prev => prev.filter(i => i.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setCustomer(null);
    setPromo(null);
    setPointsToUse(0);
    setNotes('');
  };

  // Hold current cart and start fresh
  const holdOrder = () => {
    if (items.length === 0) return;
    const newHold = {
      id: `hold-${Date.now()}`,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      items: [...items],
      customer,
      promo,
      pointsToUse,
      notes
    };
    setHeldOrders(prev => [newHold, ...prev]);
    clearCart();
  };

  // Resume held cart
  const resumeOrder = (holdId) => {
    const order = heldOrders.find(o => o.id === holdId);
    if (order) {
      setItems(order.items);
      setCustomer(order.customer);
      setPromo(order.promo);
      setPointsToUse(order.pointsToUse);
      setNotes(order.notes);
      setHeldOrders(prev => prev.filter(o => o.id !== holdId));
      setIsCartOpen(true);
    }
  };

  // Calculations
  const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity) - (i.discount || 0), 0);
  
  // Promo calculation
  let promoDiscount = 0;
  if (promo && promo.valid) {
    promoDiscount = promo.discountCalculated || 0;
  }

  // Loyalty points discount (e.g. 1 point = Rp 100)
  const pointsDiscount = pointsToUse * 100;

  const totalDiscount = promoDiscount + pointsDiscount;
  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const taxAmount = (taxableAmount * taxPercentage) / 100;
  const totalAmount = taxableAmount + taxAmount;
  const totalItemsCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        customer,
        promo,
        pointsToUse,
        taxPercentage,
        notes,
        heldOrders,
        subtotal,
        promoDiscount,
        pointsDiscount,
        totalDiscount,
        taxAmount,
        totalAmount,
        totalItemsCount,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        setCustomer,
        setPromo,
        setPointsToUse,
        setTaxPercentage,
        setNotes,
        holdOrder,
        resumeOrder
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
