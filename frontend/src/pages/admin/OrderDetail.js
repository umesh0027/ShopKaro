



import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiPackage, FiSave, FiCheck, FiDollarSign } from 'react-icons/fi';
import { orderAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: 'placed', label: 'Placed' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'return_requested', label: 'Return Requested' },
  { value: 'returned', label: 'Returned' },
];

const statusColors = {
  placed: 'bg-blue-100 text-blue-700', confirmed: 'bg-indigo-100 text-indigo-700',
  processing: 'bg-amber-100 text-amber-700', shipped: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-orange-100 text-orange-700', delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [markingCOD, setMarkingCOD] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', trackingNumber: '', message: '' });

  useEffect(() => {
    orderAPI.getOne(id).then(r => {
      setOrder(r.data.order);
      setStatusForm(p => ({ ...p, status: r.data.order.orderStatus, trackingNumber: r.data.order.trackingNumber || '' }));
    }).catch(() => toast.error('Order not found')).finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { data } = await orderAPI.updateStatus(id, statusForm);
      setOrder(data.order);
      toast.success('Order status updated & email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(false); }
  };

  const handleMarkCODPaid = async () => {
    if (!window.confirm('Mark this COD order as payment received?')) return;
    setMarkingCOD(true);
    try {
      const { data } = await orderAPI.markCODPaid(id);
      setOrder(data.order);
      toast.success('COD payment marked as paid! Customer notified via email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setMarkingCOD(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!order) return <div className="p-6 text-center text-gray-500">Order not found</div>;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/orders')} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <FiArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
        </div>
        <span className={`badge ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-600'} text-sm py-1.5 px-3`}>
          {order.orderStatus?.replace(/_/g, ' ').toUpperCase()}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiPackage size={16} className="text-primary-600" /> Order Items
            </h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                  
                  <div key={i} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-white" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                      {(item.selectedColor || item.selectedSize) && (
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          {item.selectedColor && (
                            <span className="text-xs text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded-full "  style={{backgroundColor: item.selectedColorHex || '#ccc'}}>{item.selectedColor}</span>
                          )}
                          {item.selectedSize && (
                            <span className="text-xs text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-full font-semibold">Size: {item.selectedSize}</span>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                      <p className="font-bold text-gray-900 text-sm mt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>

                // <div key={i} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                //   <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-white" />
                //   <div className="flex-1">
                //     <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                //     <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                //     <p className="font-bold text-gray-900 text-sm mt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
                //   </div>
                // </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Items Subtotal</span><span>₹{order.itemsPrice?.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-600"><span>GST</span><span>₹{order.taxPrice?.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span></div>
              <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100">
                <span>Grand Total</span><span>₹{order.totalPrice?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Update Order Status</h2>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select value={statusForm.status} onChange={e => setStatusForm(p => ({ ...p, status: e.target.value }))}
                    className="input-field text-sm">
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tracking Number</label>
                  <input value={statusForm.trackingNumber} onChange={e => setStatusForm(p => ({ ...p, trackingNumber: e.target.value }))}
                    placeholder="e.g. TRACK123ABC" className="input-field text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Custom Message (optional)</label>
                <input value={statusForm.message} onChange={e => setStatusForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Message to customer in status email..." className="input-field text-sm" />
              </div>
              <button type="submit" disabled={updating} className="btn-primary py-2.5 flex items-center gap-2">
                <FiSave size={15} />
                {updating ? 'Updating...' : 'Update & Notify Customer'}
              </button>
            </form>
          </div>

          {/* Tracking History */}
          {order.trackingHistory?.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">Tracking History</h2>
              <div className="space-y-3">
                {[...order.trackingHistory].reverse().map((h, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{h.message}</p>
                      {h.location && <p className="text-xs text-gray-500">📍 {h.location}</p>}
                      <p className="text-xs text-gray-400">{new Date(h.timestamp).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Customer</h2>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-yellow-500 rounded-xl flex items-center justify-center">
                <span className="font-bold text-white">{order.user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{order.user?.name}</p>
                <p className="text-xs text-gray-500">{order.user?.email}</p>
                {order.user?.phone && <p className="text-xs text-gray-500">📞 {order.user.phone}</p>}
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiMapPin size={15} className="text-primary-600" /> Delivery Address
            </h2>
            <div className="text-sm space-y-0.5">
              <p className="font-semibold text-gray-800">{order.shippingAddress?.fullName}</p>
              <p className="text-gray-600">{order.shippingAddress?.street}</p>
              <p className="text-gray-600">{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
              <p className="text-gray-600">Pincode: {order.shippingAddress?.pincode}</p>
              <p className="text-gray-500 mt-1">📞 {order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Payment Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Method</span>
                <span className="font-medium capitalize">{order.paymentInfo?.method === 'cod' ? '💵 Cash on Delivery' : '💳 ' + order.paymentInfo?.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`font-bold ${order.paymentInfo?.status === 'paid' ? 'text-green-600' : order.paymentInfo?.status === 'refunded' ? 'text-purple-600' : 'text-amber-600'}`}>
                  {order.paymentInfo?.status?.toUpperCase()}
                </span>
              </div>
              {order.paymentInfo?.razorpayPaymentId && (
                <div>
                  <p className="text-gray-600 text-xs">Razorpay ID</p>
                  <p className="font-mono text-xs text-gray-700 break-all">{order.paymentInfo.razorpayPaymentId}</p>
                </div>
              )}
              {order.paymentInfo?.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid At</span>
                  <span className="text-xs text-gray-700">{new Date(order.paymentInfo.paidAt).toLocaleDateString('en-IN')}</span>
                </div>
              )}
               {order.paymentInfo?.refundId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Refund ID</span>
                  <span className="font-mono text-xs text-green-700">{order.paymentInfo.refundId}</span>
                </div>
              )}
              {order.paymentInfo?.refundedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Refunded At</span>
                  <span className="text-xs text-gray-700">{new Date(order.paymentInfo.refundedAt).toLocaleDateString('en-IN')}</span>
                </div>
              )}
              {order.paymentInfo?.refundError && (
                <div className="mt-2 p-2 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600 font-medium">Refund Error:</p>
                  <p className="text-xs text-red-500">{order.paymentInfo.refundError}</p>
                  <p className="text-xs text-red-400 mt-1">Process manually via Razorpay Dashboard</p>
                </div>
              )}
              {order.codPaymentCollectedBy && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Collected By</span>
                  <span className="text-xs font-medium text-gray-700">{order.codPaymentCollectedBy}</span>
                </div>
              )}
            </div>

            {/* Mark COD as Paid Button */}
            {order.paymentInfo?.method === 'cod' && order.paymentInfo?.status !== 'paid' && order.orderStatus === 'delivered' && (
              <button
                onClick={handleMarkCODPaid}
                disabled={markingCOD}
                className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FiDollarSign size={16} />
                {markingCOD ? 'Processing...' : 'Mark COD as Paid ✅'}
              </button>
            )}
            {order.paymentInfo?.method === 'cod' && order.paymentInfo?.status === 'paid' && (
              <div className="mt-3 bg-green-50 rounded-xl p-3 flex items-center gap-2">
                <FiCheck className="text-green-600" size={16} />
                <p className="text-sm text-green-700 font-medium">COD Payment Collected</p>
              </div>
            )}
          </div>

          {/* Shipping Info */}
          {order.shiprocketOrderId && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-3">Shiprocket Info</h2>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Order ID</span><span className="font-mono">{order.shiprocketOrderId}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shipment ID</span><span className="font-mono">{order.shiprocketShipmentId}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tracking No</span><span className="font-mono font-bold">{order.trackingNumber}</span></div>
                {order.estimatedDelivery && (
                  <div className="flex justify-between"><span className="text-gray-500">Est. Delivery</span><span>{new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}</span></div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;