

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiEye, FiTrash2, FiX, FiAlertTriangle, FiFilter } from 'react-icons/fi';
import { orderAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const statusColors = {
  placed:           'bg-blue-100 text-blue-700',
  confirmed:        'bg-indigo-100 text-indigo-700',
  processing:       'bg-amber-100 text-amber-700',
  shipped:          'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered:        'bg-green-100 text-green-700',
  cancelled:        'bg-red-100 text-red-700',
  return_requested: 'bg-pink-100 text-pink-700',
  returned:         'bg-gray-100 text-gray-600',
};

const statusLabels = {
  placed: 'Placed', confirmed: 'Confirmed', processing: 'Processing',
  shipped: 'Shipped', out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered', cancelled: 'Cancelled',
  return_requested: 'Return Requested', returned: 'Returned',
};

// Which statuses can be deleted from history
const DELETABLE_STATUSES = ['delivered', 'cancelled', 'returned'];

// Confirm delete modal
const DeleteConfirmModal = ({ order, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel}/>
    <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
          <FiTrash2 size={20} className="text-red-500"/>
        </div>
        <div>
          <h3 className="font-display font-bold text-gray-900">Remove from History?</h3>
          <p className="text-xs text-gray-500 font-mono">#{order.orderNumber}</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-5">
        <div className="flex gap-2">
          <FiAlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5"/>
          <div className="text-xs text-amber-700 leading-relaxed">
            <p className="font-semibold mb-0.5">This will hide the order from your history.</p>
            <p>The order record is still saved securely. You will not be able to see it again in My Orders.</p>
          </div>
        </div>
      </div>

      {/* Order summary */}
      <div className="bg-gray-50 rounded-xl p-3 mb-5 text-sm">
        <div className="flex justify-between text-gray-600 mb-1">
          <span>Items</span>
          <span>{order.items?.length} item(s)</span>
        </div>
        <div className="flex justify-between font-semibold text-gray-900">
          <span>Total</span>
          <span>₹{order.totalPrice?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-500 text-xs mt-1">
          <span>Status</span>
          <span className={`badge ${statusColors[order.orderStatus]}`}>{statusLabels[order.orderStatus]}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onCancel} className="btn-secondary flex-1 py-2.5 text-sm">Keep it</button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2">
          {loading
            ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Removing...</>
            : <><FiTrash2 size={14}/> Yes, Remove</>
          }
        </button>
      </div>
    </div>
  </div>
);

const MyOrders = () => {
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [pages, setPages]           = useState(1);
  const [total, setTotal]           = useState(0);
  const [deleteModal, setDeleteModal] = useState(null); // order object
  const [deleting, setDeleting]     = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await orderAPI.getMyOrders({ page, limit: 10 });
      setOrders(data.orders);
      setPages(data.pages);
      setTotal(data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await orderAPI.deleteFromHistory(deleteModal._id);
      toast.success('Order removed from history');
      setDeleteModal(null);
      // Remove from local state immediately
      setOrders(prev => prev.filter(o => o._id !== deleteModal._id));
      setTotal(prev => prev - 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove order');
    } finally { setDeleting(false); }
  };

  // Filter by status client-side
  const displayedOrders = statusFilter
    ? orders.filter(o => o.orderStatus === statusFilter)
    : orders;

  return (
    <div className="pt-20 pb-16 bg-gray-50 min-h-screen">
      <div className="page-container py-8 max-w-4xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500 mt-1">
              {total} order{total !== 1 ? 's' : ''} in your history
            </p>
          </div>

          {/* Status filter */}
          {orders.length > 0 && (
            <div className="flex items-center gap-2">
              <FiFilter size={14} className="text-gray-400"/>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="input-field text-sm py-2 pr-8 min-w-40">
                <option value="">All Orders</option>
                {Object.entries(statusLabels).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? <LoadingSpinner/> : displayedOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPackage size={36} className="text-gray-300"/>
            </div>
            <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
              {statusFilter ? `No ${statusLabels[statusFilter]} orders` : 'No orders yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {statusFilter ? 'Try a different filter' : "You haven't placed any orders"}
            </p>
            {statusFilter
              ? <button onClick={() => setStatusFilter('')} className="btn-secondary text-sm py-2 px-5">Clear Filter</button>
              : <Link to="/products" className="btn-primary">Start Shopping</Link>
            }
          </div>
        ) : (
          <div className="space-y-4">
            {displayedOrders.map(order => {
              const canDelete = DELETABLE_STATUSES.includes(order.orderStatus);
              return (
                <div key={order._id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-card transition-shadow overflow-hidden">
                  {/* Status bar at top */}
                  <div className={`h-1 ${order.orderStatus === 'delivered' ? 'bg-green-400' : order.orderStatus === 'cancelled' ? 'bg-red-300' : 'bg-primary-400'}`}/>

                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        {/* Order number + status */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <p className="font-mono font-bold text-primary-600 text-sm">#{order.orderNumber}</p>
                          <span className={`badge text-xs ${statusColors[order.orderStatus]}`}>
                            {statusLabels[order.orderStatus]}
                          </span>
                          {order.paymentInfo?.status === 'refunded' && (
                            <span className="badge bg-purple-100 text-purple-700 text-xs">Refunded</span>
                          )}
                          {order.paymentInfo?.method === 'cod' && order.paymentInfo?.status !== 'paid' && order.orderStatus === 'delivered' && (
                            <span className="badge bg-amber-100 text-amber-700 text-xs">COD Pending</span>
                          )}
                        </div>

                        <p className="text-xs text-gray-400 mb-1">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.items.length} item(s) ·{' '}
                          <span className="font-bold text-gray-900">₹{order.totalPrice.toLocaleString()}</span>
                        </p>
                      </div>

                      {/* Item thumbnails */}
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, i) => (
                            <div key={i} className="relative">
                              <img
                                src={item.image?.url || item.image || 'https://via.placeholder.com/40'}
                                alt={item.name}
                                className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-sm"
                                onError={e => { e.target.src = 'https://via.placeholder.com/40'; }}
                              />
                              {item.selectedColorHex && (
                                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                                  style={{ backgroundColor: item.selectedColorHex }}/>
                              )}
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-11 h-11 rounded-xl bg-gray-100 border-2 border-white flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-500">+{order.items.length - 3}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Link to={`/orders/${order._id}`}
                            className="btn-secondary py-2 px-4 text-sm flex items-center gap-1.5">
                            <FiEye size={14}/> View
                          </Link>
                          {canDelete && (
                            <button
                              onClick={() => setDeleteModal(order)}
                              title="Remove from history"
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-gray-200 hover:border-red-200">
                              <FiTrash2 size={15}/>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom info */}
                    <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-4 text-xs text-gray-500">
                      {order.estimatedDelivery && !['delivered','cancelled','returned'].includes(order.orderStatus) && (
                        <span>📦 Expected: <span className="font-semibold text-gray-700">
                          {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span></span>
                      )}
                      {order.orderStatus === 'delivered' && order.deliveredAt && (
                        <span>✅ Delivered: <span className="font-semibold text-gray-700">
                          {new Date(order.deliveredAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span></span>
                      )}
                      {order.paymentInfo?.method && (
                        <span>{order.paymentInfo.method === 'cod' ? '💵' : '💳'} {order.paymentInfo.method.toUpperCase()}</span>
                      )}
                      {canDelete && (
                        <span className="text-gray-300 ml-auto">
                          Click 🗑 to remove from history
                        </span>
                      )}
                    </div>

                    {/* Refund info */}
                    {order.orderStatus === 'cancelled' && order.paymentInfo?.status === 'refunded' && (
                      <div className="mt-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                        ✅ Refund of ₹{order.totalPrice.toLocaleString()} initiated to your original payment method
                      </div>
                    )}
                    {order.orderStatus === 'cancelled' && order.paymentInfo?.method === 'razorpay' && order.paymentInfo?.status === 'paid' && (
                      <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                        ⏳ Refund of ₹{order.totalPrice.toLocaleString()} pending — contact support if not received in 7 days
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex gap-2 justify-center pt-4">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                  className="btn-secondary py-2 px-5 text-sm disabled:opacity-50">← Prev</button>
                <span className="py-2 px-4 text-sm font-medium text-gray-600 bg-white rounded-xl border border-gray-200">
                  {page} / {pages}
                </span>
                <button onClick={() => setPage(p => p + 1)} disabled={page === pages}
                  className="btn-secondary py-2 px-5 text-sm disabled:opacity-50">Next →</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteModal && (
        <DeleteConfirmModal
          order={deleteModal}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default MyOrders;