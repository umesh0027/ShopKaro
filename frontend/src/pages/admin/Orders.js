import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiEye, FiFilter } from 'react-icons/fi';
import { orderAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const statusColors = {
  placed: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-indigo-100 text-indigo-700',
  processing: 'bg-amber-100 text-amber-700',
  shipped: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  return_requested: 'bg-pink-100 text-pink-700',
  returned: 'bg-gray-100 text-gray-500',
};

const allStatuses = ['', 'placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [stats, setStats] = useState({});
  const [total, setTotal] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await orderAPI.getAdminAll({ search, status, page, limit: 15 });
      setOrders(data.orders);
      setPages(data.pages);
      setTotal(data.total);
      setStats(data.stats || {});
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [search, status, page]);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500">{total} total orders</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {[
          { label: 'All', value: stats.total, color: 'bg-gray-50 border-gray-200' },
          { label: 'New', value: stats.placed, color: 'bg-blue-50 border-blue-200' },
          { label: 'Processing', value: stats.processing, color: 'bg-amber-50 border-amber-200' },
          { label: 'Shipped', value: stats.shipped, color: 'bg-purple-50 border-purple-200' },
          { label: 'Delivered', value: stats.delivered, color: 'bg-green-50 border-green-200' },
          { label: 'Cancelled', value: stats.cancelled, color: 'bg-red-50 border-red-200' },
          { label: 'Revenue', value: `₹${((stats.revenue || 0) / 1000).toFixed(1)}K`, color: 'bg-primary-50 border-primary-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-3 border ${s.color}`}>
            <p className="font-display font-bold text-lg text-gray-900">{s.value ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-50 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by order number..." className="input-field pl-9 text-sm py-2.5" />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter size={14} className="text-gray-400" />
            <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="input-field text-sm py-2.5 pr-8 min-w-40">
              {allStatuses.map(s => (
                <option key={s} value={s}>{s ? s.replace(/_/g, ' ').toUpperCase() : 'All Status'}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Items</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-mono font-bold text-primary-600 text-xs">#{order.orderNumber?.slice(-10)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{order.user?.name}</p>
                        <p className="text-xs text-gray-400">{order.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.items?.length} item(s)</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">₹{order.totalPrice?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${order.paymentInfo?.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {order.paymentInfo?.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {order.orderStatus?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/orders/${order._id}`} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors inline-block">
                        <FiEye size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <div className="text-center py-12 text-gray-500">No orders found</div>}
          </div>
        )}

        {pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-50">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary py-1.5 px-4 text-xs disabled:opacity-50">Prev</button>
            <span className="py-1.5 px-4 text-xs font-medium text-gray-600">{page} / {pages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === pages} className="btn-secondary py-1.5 px-4 text-xs disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
