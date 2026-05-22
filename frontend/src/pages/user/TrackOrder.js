import React, { useState } from 'react';
import { FiSearch, FiPackage } from 'react-icons/fi';
import { orderAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) { toast.error('Enter order number'); return; }
    setLoading(true);
    try {
      const { data } = await orderAPI.track(orderNumber.trim(), email.trim());
      setOrder(data.order);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order not found');
      setOrder(null);
    } finally { setLoading(false); }
  };

  const statusSteps = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
  const statusLabels = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

  return (
    <div className="pt-20 pb-16 bg-gray-50 min-h-screen">
      <div className="page-container py-12 max-w-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiPackage size={28} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Track Your Order</h1>
          <p className="text-gray-500 mt-2">Enter your order number to see the live status</p>
        </div>

        <div className="card mb-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Number *</label>
              <input value={orderNumber} onChange={e => setOrderNumber(e.target.value)} placeholder="e.g. ORD-1234567890-ABCDE"
                className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email (optional)</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="input-field" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSearch size={16} />}
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
          </form>
        </div>

        {order && (
          <div className="card animate-fade-in">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="font-mono font-bold text-primary-600">#{order.orderNumber}</p>
                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <span className="badge bg-primary-100 text-primary-700 capitalize">
                {order.orderStatus.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Timeline */}
            <div className="overflow-x-auto pb-4">
              <div className="flex items-center gap-0 min-w-max">
                {statusSteps.map((step, i) => {
                  const currentIdx = statusSteps.indexOf(order.orderStatus);
                  const isCompleted = currentIdx >= i;
                  return (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center w-20">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isCompleted ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {isCompleted ? '✓' : i + 1}
                        </div>
                        <span className={`text-xs mt-1 text-center ${isCompleted ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>{statusLabels[i]}</span>
                      </div>
                      {i < statusSteps.length - 1 && (
                        <div className={`w-8 h-0.5 mb-4 ${currentIdx > i ? 'bg-primary-600' : 'bg-gray-200'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {order.estimatedDelivery && order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
              <p className="text-sm text-gray-600 mt-4 bg-amber-50 px-4 py-2 rounded-xl">
                📦 Expected delivery: <strong>{new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</strong>
              </p>
            )}
            {order.trackingNumber && (
              <p className="text-sm text-gray-600 mt-2">🔎 Tracking No: <span className="font-mono font-bold">{order.trackingNumber}</span></p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
