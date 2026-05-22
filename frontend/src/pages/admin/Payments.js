



import React, { useState, useEffect } from 'react';
import { FiCreditCard, FiFilter } from 'react-icons/fi';
import { paymentAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paidCount, setPaidCount] = useState(0);
  const [refundCount, setRefundCount] = useState(0);
  const [refundTotal, setRefundTotal] = useState(0);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await paymentAPI.getAll({ status, page, limit: 15 });
      setPayments(data.payments);
      setPages(data.pages);
      setTotal(data.total);
      setTotalRevenue(data.totalRevenue);
      setPaidCount(data.paidCount);
      setRefundCount(data.refundCount || 0);
      setRefundTotal(data.refundTotal || 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPayments(); }, [status, page]);

  const paymentStatusColors = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500">{total} transactions</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: `₹${(totalRevenue / 1000).toFixed(1)}K`, color: 'bg-green-50 border-green-200', textColor: 'text-green-700' },
          { label: 'Paid Orders', value: paidCount, color: 'bg-primary-50 border-primary-200', textColor: 'text-primary-700' },
          { label: 'Total Transactions', value: total, color: 'bg-gray-50 border-gray-200', textColor: 'text-gray-700' },
        { label: 'Refunds Issued', value: refundCount, color: 'bg-purple-50 border-purple-200', textColor: 'text-purple-700' },
        ].map(card => (
          <div key={card.label} className={`rounded-2xl p-5 border ${card.color}`}>
            <p className={`font-display text-2xl font-bold ${card.textColor}`}>{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Filter */}
        <div className="p-4 border-b border-gray-50 flex items-center gap-3">
          <FiFilter size={14} className="text-gray-400" />
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="input-field text-sm py-2 pr-8 w-48">
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Txn / Refund ID</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-mono font-bold text-primary-600 text-xs">#{p.orderNumber?.slice(-10)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 text-sm">{p.user?.name}</p>
                      <p className="text-xs text-gray-400">{p.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">₹{p.totalPrice?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-gray-100 text-gray-700 text-xs capitalize">{p.paymentInfo?.method}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${paymentStatusColors[p.paymentInfo?.status] || 'bg-gray-100 text-gray-600'}`}>
                        {p.paymentInfo?.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-mono text-xs text-gray-500 truncate">{p.paymentInfo?.razorpayPaymentId || '—'}</p>
                        {p.paymentInfo?.refundId && (
                          <p className="font-mono text-xs text-purple-600 mt-0.5">↩ {p.paymentInfo.refundId}</p>
                        )}
                        {p.paymentInfo?.refundError && (
                          <p className="text-xs text-red-500 mt-0.5">⚠ Refund failed</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payments.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <FiCreditCard size={32} className="mx-auto mb-3" />
                <p>No payments found</p>
              </div>
            )}
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

export default Payments;
