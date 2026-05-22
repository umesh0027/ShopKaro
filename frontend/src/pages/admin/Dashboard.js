import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiPackage, FiUsers, FiDollarSign, FiTrendingUp, FiAlertTriangle, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {trend >= 0 ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
          {Math.abs(trend).toFixed(1)}%
        </span>
      )}
    </div>
    <p className="font-display text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-0.5">{title}</p>
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
  </div>
);

const statusColors = {
  placed: 'bg-blue-100 text-blue-700', confirmed: 'bg-indigo-100 text-indigo-700',
  processing: 'bg-amber-100 text-amber-700', shipped: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-orange-100 text-orange-700', delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard().then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const { stats, orderStats, monthlyOrders, topProducts, recentOrders, lowStock } = data;
  const revenueTrend = stats.lastMonthRevenue ? ((stats.monthlyRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100 : 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`₹${(stats.totalRevenue / 1000).toFixed(1)}K`} subtitle={`₹${stats.monthlyRevenue.toLocaleString()} this month`} icon={FiDollarSign} color="bg-primary-500" trend={revenueTrend} />
        <StatCard title="Total Orders" value={stats.totalOrders.toLocaleString()} subtitle={`${orderStats.placed || 0} new today`} icon={FiShoppingBag} color="bg-amber-500" />
        <StatCard title="Products" value={stats.totalProducts.toLocaleString()} subtitle={`${stats.outOfStock} out of stock`} icon={FiPackage} color="bg-green-500" />
        <StatCard title="Customers" value={stats.totalUsers.toLocaleString()} icon={FiUsers} color="bg-purple-500" />
      </div>

      {/* Order Status + Monthly Chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Order Status */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-display font-semibold text-gray-900 mb-4">Order Status</h2>
          <div className="space-y-3">
            {Object.entries(orderStats).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`badge text-xs ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
                    {status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-100 rounded-full h-1.5">
                    <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${(count / stats.totalOrders) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Orders */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-display font-semibold text-gray-900 mb-4">Monthly Revenue</h2>
          <div className="flex items-end gap-2 h-32">
            {monthlyOrders.map((m, i) => {
              const maxRev = Math.max(...monthlyOrders.map(x => x.revenue));
              const height = maxRev ? (m.revenue / maxRev) * 100 : 0;
              const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-primary-100 rounded-t-lg relative" style={{ height: `${Math.max(height, 5)}%` }}>
                    <div className="absolute inset-0 bg-primary-500 rounded-t-lg opacity-80" />
                  </div>
                  <span className="text-xs text-gray-400">{months[m._id.month - 1]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Products + Recent Orders */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display font-semibold text-gray-900">Top Selling</h2>
            <Link to="/admin/products" className="text-xs text-primary-600 hover:text-primary-700 font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{i+1}</span>
                {p.image && <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-50" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.totalSold} sold</p>
                </div>
                <span className="text-sm font-bold text-gray-900">₹{p.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-primary-600 hover:text-primary-700 font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map(order => (
              <Link key={order._id} to={`/admin/orders/${order._id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-yellow-500 rounded-lg flex items-center justify-center shrink-0">
                  <span className="font-bold text-white text-xs">{order.user?.name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{order.user?.name}</p>
                  <p className="font-mono text-xs text-gray-500">#{order.orderNumber?.slice(-8)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">₹{order.totalPrice?.toLocaleString()}</p>
                  <span className={`badge text-xs ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>{order.orderStatus}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <FiAlertTriangle className="text-amber-500" size={18} />
            <h2 className="font-display font-semibold text-gray-900">Low Stock Alert</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {lowStock.map(p => (
              <div key={p._id} className="flex items-center gap-3 bg-amber-50 rounded-xl p-3">
                <img src={p.images?.[0]?.url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-amber-700 font-bold">{p.stock} left</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
