import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export const POS = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);
  
  const { isAuthenticated } = useAuth(); // If they aren't authenticated, the backend will reject the POST /orders, but GET /menu works.

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await api.get('/menu');
      setMenuItems(res.data);
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((cItem) => cItem.id === item.id);
      if (existing) {
        return prevCart.map((cItem) =>
          cItem.id === item.id
            ? { ...cItem, quantity: cItem.quantity + 1 }
            : cItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null; // null to remove
        }
        return item;
      }).filter(Boolean); // removes nulls
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const submitOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    
    // Check if user is logged in first. If not, maybe show an alert.
    if (!isAuthenticated) {
      alert("You must be logged in to submit an order.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity
        }))
      };
      
      const res = await api.post('/orders', payload);
      setOrderComplete(res.data);
      setCart([]); // clear cart
    } catch (error) {
      console.error('Failed to submit order:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="text-xl animate-pulse text-brand-400">Loading Menu...</div>
      </div>
    );
  }

  // Categories list
  const categories = [...new Set(menuItems.map(item => item.category))];

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-full overflow-hidden">
      
      {/* Menu Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        {orderComplete && (
          <div className="bg-emerald-900/40 border border-emerald-500/50 p-6 rounded-xl relative shadow-lg glass animate-in fade-in slide-in-from-top-4">
            <button 
              onClick={() => setOrderComplete(null)} 
              className="absolute top-4 right-4 text-emerald-400 hover:text-emerald-200"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-emerald-400 mb-2">Order Submitted!</h2>
            <p className="text-emerald-100">Order #{orderComplete.id} has been sent to the kitchen.</p>
            <p className="text-sm mt-2 text-emerald-200/70">Estimated wait: 15 mins (AI estimation coming Phase 2)</p>
          </div>
        )}

        {categories.map((category) => (
          <section key={category}>
            <h2 className="text-2xl font-bold text-slate-100 mb-4 tracking-wide">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {menuItems
                .filter((item) => item.category === category)
                .map((item) => (
                  <div 
                    key={item.id} 
                    className="glass rounded-xl overflow-hidden group hover:-translate-y-1 hover:shadow-brand-500/10 hover:border-brand-500/30 transition-all cursor-pointer flex flex-col"
                    onClick={() => addToCart(item)}
                  >
                    <div className="bg-slate-700/50 h-32 w-full flex items-center justify-center relative overflow-hidden group-hover:bg-slate-700/80 transition-colors">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-slate-500 font-medium">No Image</span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                      <span className="absolute bottom-3 right-3 bg-brand-600 text-white font-bold py-1 px-3 rounded-full text-sm shadow-md">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-slate-100 mb-1">{item.name}</h3>
                      <p className="text-sm text-slate-400 line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 bg-slate-800/90 backdrop-blur-xl border-l border-slate-700 flex flex-col h-full shadow-2xl z-10 flex-shrink-0">
        <div className="p-6 border-b border-slate-700 bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-100 flex items-center">
            <svg className="w-5 h-5 mr-3 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Current Order
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
              <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <div className="flex-1 pr-3">
                  <h4 className="text-sm font-semibold text-slate-200">{item.name}</h4>
                  <div className="text-brand-400 text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div className="flex items-center bg-slate-800 rounded-md shadow-sm border border-slate-600">
                  <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-l-md transition-colors"
                  >−</button>
                  <span className="w-8 flex items-center justify-center text-sm font-bold">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-r-md transition-colors"
                  >+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-slate-700 bg-slate-800/80 space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Tax (8%)</span>
              <span>${(cartTotal * 0.08).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-slate-700">
              <span>Total</span>
              <span>${(cartTotal * 1.08).toFixed(2)}</span>
            </div>
          </div>
          
          <button
            onClick={submitOrder}
            disabled={cart.length === 0 || isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl font-bold tracking-wide text-white bg-brand-600 hover:bg-brand-500 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSubmitting ? 'Sending to Kitchen...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};
