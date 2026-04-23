import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export const Kitchen = () => {
  const [tab, setTab] = useState('active'); // 'active' | 'delivered'
  const [orders, setOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDelivered, setIsLoadingDelivered] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/kitchen/active');
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to fetch kitchen orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [deliveredError, setDeliveredError] = useState('');

  const fetchDeliveredOrders = async () => {
    setIsLoadingDelivered(true);
    setDeliveredError('');
    try {
      const res = await api.get('/orders');
      // Filter to only delivered orders
      setDeliveredOrders(res.data.filter(o => o.status === 'Delivered'));
    } catch (error) {
      console.error('Failed to fetch delivered orders:', error);
      setDeliveredError(error.response?.data?.detail || 'Failed to load delivered orders.');
    } finally {
      setIsLoadingDelivered(false);
    }
  };

  // Poll for active orders every 10 seconds
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch delivered orders when that tab is selected
  useEffect(() => {
    if (tab === 'delivered') {
      fetchDeliveredOrders();
    }
  }, [tab]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(current => {
        if (newStatus === 'Delivered') {
          return current.filter(o => o.id !== orderId);
        }
        return current.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      alert("Failed to update status.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Received': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'Preparing': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'Ready': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'Delivered': return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-pulse text-brand-400 text-xl">Loading Orders...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center border-b border-slate-700 pb-4">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center">
          <svg className="w-8 h-8 mr-3 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Kitchen Dashboard
        </h1>
        <div className="flex items-center gap-4">
          {/* Tab Switcher */}
          <div className="inline-flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setTab('active')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                tab === 'active' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active Orders
            </button>
            <button
              onClick={() => setTab('delivered')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                tab === 'delivered' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Delivered Orders
            </button>
          </div>
          {tab === 'active' && (
            <div className="flex items-center text-sm text-slate-400 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              Live Updates
            </div>
          )}
        </div>
      </div>

      {/* Active Orders Tab */}
      {tab === 'active' && (
        <>
          {orders.length === 0 ? (
            <div className="glass rounded-xl p-12 flex flex-col items-center justify-center text-slate-500">
              <svg className="w-16 h-16 opacity-30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <p className="text-xl font-medium">No active orders</p>
              <p className="text-sm mt-2">The kitchen is clear.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map(order => (
                <div key={order.id} className="glass rounded-xl border-t-4 border-slate-700 hover:border-brand-500 transition-colors flex flex-col overflow-hidden">
                  <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-100">Order #{order.id}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="p-4 flex-1">
                    <p className="text-xs text-slate-400 mb-4">Received: {new Date(order.created_at).toLocaleTimeString()}</p>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start text-sm">
                          <div className="flex gap-3">
                            <span className="font-bold text-brand-400">{item.quantity}x</span>
                            <span className="text-slate-200 font-medium">{item.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-800/50 border-t border-slate-700">
                    <div className="flex gap-2">
                      {order.status === 'Received' && (
                        <button onClick={() => updateStatus(order.id, 'Preparing')} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/50">
                          Start Preparing
                        </button>
                      )}
                      {order.status === 'Preparing' && (
                        <button onClick={() => updateStatus(order.id, 'Ready')} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/50">
                          Mark Ready
                        </button>
                      )}
                      {order.status === 'Ready' && (
                        <button onClick={() => updateStatus(order.id, 'Delivered')} className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 rounded-lg text-sm font-medium transition-colors border border-slate-500">
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Delivered Orders Tab */}
      {tab === 'delivered' && (
        <>
          {isLoadingDelivered ? (
            <div className="text-center py-12 text-brand-400 animate-pulse text-lg">Loading delivered orders...</div>
          ) : deliveredOrders.length === 0 ? (
            <div className="glass rounded-xl p-12 flex flex-col items-center justify-center text-slate-500">
              <svg className="w-16 h-16 opacity-30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5 13l4 4L19 7" /></svg>
              <p className="text-xl font-medium">No delivered orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-400">{deliveredOrders.length} delivered order(s)</p>
                <button onClick={fetchDeliveredOrders} className="text-sm text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors">
                  ↻ Refresh
                </button>
              </div>
              <div className="glass rounded-xl overflow-hidden border border-slate-700">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-800/80">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 bg-slate-800/30">
                    {deliveredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">#{order.id}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {order.items.map((item, idx) => (
                            <span key={idx}>
                              {item.quantity}x {item.name}{idx < order.items.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-400">${order.total.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{new Date(order.created_at).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
