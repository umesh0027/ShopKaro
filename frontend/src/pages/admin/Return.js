import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiRotateCcw, FiCheck, FiX, FiEye, FiDollarSign, FiPackage } from 'react-icons/fi';
import { orderAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const returnStatusColors = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  picked_up: 'bg-purple-100 text-purple-700',
  refunded: 'bg-green-100 text-green-700',
};

const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({});
  const [processing, setProcessing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [actionForm, setActionForm] = useState({ adminNote: '', refundAmount: '' });

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const { data } = await orderAPI.getAdminReturns({ status: statusFilter, page, limit: 15 });
      setReturns(data.returns);
      setPages(data.pages);
      setTotal(data.total);
      setStats(data.returnStats || {});
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchReturns(); }, [statusFilter, page]);

  const handleAction = async (orderId, action) => {
    const confirmMessages = {
      approve: 'Approve this return request?',
      reject: 'Reject this return request?',
      pickup: 'Mark item as picked up?',
      refund: `Process refund of ₹${actionForm.refundAmount || selected?.totalPrice}?`,
    };
    if (!window.confirm(confirmMessages[action])) return;
    setProcessing(orderId + action);
    try {
      await orderAPI.processReturn(orderId, {
        action,
        adminNote: actionForm.adminNote,
        refundAmount: actionForm.refundAmount ? Number(actionForm.refundAmount) : undefined,
      });
      toast.success(`Return ${action}d successfully! Customer notified.`);
      setSelected(null);
      setActionForm({ adminNote: '', refundAmount: '' });
      fetchReturns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally { setProcessing(null); }
  };

  const getNextActions = (returnStatus, orderStatus) => {
    switch (returnStatus) {
      case 'pending': return [
        { action: 'approve', label: 'Approve', icon: FiCheck, color: 'text-blue-600 hover:bg-blue-50 border-blue-200' },
        { action: 'reject', label: 'Reject', icon: FiX, color: 'text-red-500 hover:bg-red-50 border-red-200' },
      ];
      case 'approved': return [
        { action: 'pickup', label: 'Mark Picked Up', icon: FiPackage, color: 'text-purple-600 hover:bg-purple-50 border-purple-200' },
      ];
      case 'picked_up': return [
        { action: 'refund', label: 'Process Refund', icon: FiDollarSign, color: 'text-green-600 hover:bg-green-50 border-green-200' },
      ];
      default: return [];
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Return Requests</h1>
        <p className="text-sm text-gray-500">{total} return requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'bg-gray-50 border-gray-200' },
          { label: 'Pending', value: stats.pending, color: 'bg-amber-50 border-amber-200' },
          { label: 'Approved', value: stats.approved, color: 'bg-blue-50 border-blue-200' },
          { label: 'Rejected', value: stats.rejected || 0, color: 'bg-red-50 border-red-200' },
          { label: 'Refunded', value: stats.refunded, color: 'bg-green-50 border-green-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-3 border ${s.color}`}>
            <p className="font-display font-bold text-xl text-gray-900">{s.value ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { value: '', label: 'All' },
          { value: 'pending', label: '🕐 Pending' },
          { value: 'approved', label: '✅ Approved' },
          { value: 'rejected', label: '❌ Rejected' },
          { value: 'picked_up', label: '📦 Picked Up' },
          { value: 'refunded', label: '💰 Refunded' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors border ${
              statusFilter === tab.value
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? <LoadingSpinner /> : returns.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm">
              <FiRotateCcw size={36} className="mx-auto mb-3" />
              <p>No return requests found</p>
            </div>
          ) : returns.map(ret => (
            <div
              key={ret._id}
              onClick={() => { setSelected(ret); setActionForm({ adminNote: ret.returnRequest?.adminNote || '', refundAmount: ret.returnRequest?.refundAmount || ret.totalPrice }); }}
              className={`bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-hover transition-all border-2 ${selected?._id === ret._id ? 'border-primary-300' : 'border-transparent'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-mono font-bold text-primary-600 text-xs">#{ret.orderNumber?.slice(-10)}</p>
                  <p className="font-semibold text-sm text-gray-900 mt-0.5">{ret.user?.name}</p>
                  <p className="text-xs text-gray-500">{ret.user?.email}</p>
                </div>
                <span className={`badge text-xs ${returnStatusColors[ret.returnRequest?.status] || 'bg-gray-100 text-gray-600'}`}>
                  {ret.returnRequest?.status?.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <p className="text-xs text-gray-600 font-medium">{ret.returnRequest?.reason}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {ret.returnRequest?.requestedAt && new Date(ret.returnRequest.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </p>
                </div>
                <p className="font-bold text-gray-900 text-sm">₹{ret.totalPrice?.toLocaleString()}</p>
              </div>
            </div>
          ))}

          {pages > 1 && (
            <div className="flex gap-2 justify-center pt-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary py-1.5 px-4 text-xs disabled:opacity-50">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page === pages} className="btn-secondary py-1.5 px-4 text-xs disabled:opacity-50">Next</button>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-6 animate-fade-in">
              {/* Return header */}
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="font-display font-semibold text-lg text-gray-900">Return Details</h2>
                  <p className="text-sm text-gray-500 font-mono">#{selected.orderNumber}</p>
                </div>
                <Link to={`/admin/orders/${selected._id}`} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
                  <FiEye size={13} /> View Order
                </Link>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Customer</p>
                    <p className="font-semibold text-gray-900">{selected.user?.name}</p>
                    <p className="text-xs text-gray-500">{selected.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Order Amount</p>
                    <p className="font-bold text-lg text-gray-900">₹{selected.totalPrice?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{selected.items?.length} item(s)</p>
                  </div>
                </div>
              </div>

              {/* Return Request Details */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-gray-800">Return Request</h3>
                  <span className={`badge text-xs ${returnStatusColors[selected.returnRequest?.status]}`}>
                    {selected.returnRequest?.status?.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-gray-500 shrink-0">Reason:</span>
                    <span className="font-medium text-gray-800">{selected.returnRequest?.reason}</span>
                  </div>
                  {selected.returnRequest?.description && (
                    <div className="flex gap-2">
                      <span className="text-gray-500 shrink-0">Details:</span>
                      <span className="text-gray-700">{selected.returnRequest.description}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <span className="text-gray-500 shrink-0">Requested:</span>
                    <span className="text-gray-700">
                      {new Date(selected.returnRequest?.requestedAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {selected.returnRequest?.refundedAt && (
                    <div className="flex gap-2">
                      <span className="text-gray-500 shrink-0">Refunded:</span>
                      <span className="text-green-700 font-medium">
                        ₹{selected.returnRequest.refundAmount?.toLocaleString()} on {new Date(selected.returnRequest.refundedAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">Items in Order</p>
                <div className="space-y-2">
                  {selected.items?.map((item, i) => (
                    <div key={i} className="flex gap-3 bg-gray-50 rounded-xl p-2.5">
                      <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="text-xs font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} · ₹{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action form */}
              {getNextActions(selected.returnRequest?.status).length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-semibold text-sm text-gray-800 mb-3">Process Return</h3>
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Admin Note (sent to customer)</label>
                      <textarea rows={2} value={actionForm.adminNote}
                        onChange={e => setActionForm(p => ({ ...p, adminNote: e.target.value }))}
                        placeholder="Optional note to customer..."
                        className="input-field text-sm resize-none py-2" />
                    </div>
                    {selected.returnRequest?.status === 'picked_up' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Refund Amount (₹)</label>
                        <input
                          type="number"
                          value={actionForm.refundAmount}
                          onChange={e => setActionForm(p => ({ ...p, refundAmount: e.target.value }))}
                          placeholder={`Default: ₹${selected.totalPrice?.toLocaleString()}`}
                          className="input-field text-sm py-2"
                        />
                        <p className="text-xs text-gray-400 mt-1">Leave empty to refund full amount</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getNextActions(selected.returnRequest?.status).map(({ action, label, icon: Icon, color }) => (
                      <button
                        key={action}
                        onClick={() => handleAction(selected._id, action)}
                        disabled={!!processing}
                        className={`btn-secondary py-2 px-4 text-sm flex items-center gap-2 ${color} disabled:opacity-50`}
                      >
                        {processing === selected._id + action
                          ? <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                          : <Icon size={14} />
                        }
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed state */}
              {selected.returnRequest?.status === 'refunded' && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-2 mb-1">
                    <FiCheck className="text-green-600" size={18} />
                    <p className="font-semibold text-green-800">Return Completed</p>
                  </div>
                  <p className="text-sm text-green-700">
                    Refund of ₹{selected.returnRequest.refundAmount?.toLocaleString()} processed on{' '}
                    {new Date(selected.returnRequest.refundedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}
              {selected.returnRequest?.status === 'rejected' && (
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                  <div className="flex items-center gap-2 mb-1">
                    <FiX className="text-red-500" size={18} />
                    <p className="font-semibold text-red-700">Return Rejected</p>
                  </div>
                  {selected.returnRequest.adminNote && (
                    <p className="text-sm text-red-600">Reason: {selected.returnRequest.adminNote}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-16 shadow-sm text-center text-gray-400">
              <FiRotateCcw size={40} className="mx-auto mb-3" />
              <p>Select a return request to review</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Returns;