




import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMapPin, FiPackage, FiCheck, FiTruck, FiHome, FiX, FiRotateCcw, FiAlertCircle, FiClock } from 'react-icons/fi';
import { orderAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const statusColors = {
  placed:'bg-blue-100 text-blue-700',confirmed:'bg-indigo-100 text-indigo-700',
  processing:'bg-amber-100 text-amber-700',shipped:'bg-purple-100 text-purple-700',
  out_for_delivery:'bg-orange-100 text-orange-700',delivered:'bg-green-100 text-green-700',
  cancelled:'bg-red-100 text-red-700',return_requested:'bg-pink-100 text-pink-700',
  returned:'bg-gray-100 text-gray-700',
};
const returnStatusColors = {
  pending:'bg-amber-100 text-amber-700',approved:'bg-blue-100 text-blue-700',
  rejected:'bg-red-100 text-red-700',picked_up:'bg-purple-100 text-purple-700',
  refunded:'bg-green-100 text-green-700',
};
const statusSteps=['placed','confirmed','processing','shipped','out_for_delivery','delivered'];
const statusLabels=['Placed','Confirmed','Processing','Shipped','Out for Delivery','Delivered'];
const returnReasons=['Product damaged/defective','Wrong item delivered','Item not as described','Size/fit issue','Changed my mind','Better price available','Other'];

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnForm, setReturnForm] = useState({ reason:'', description:'' });
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    orderAPI.getOne(id).then(r=>setOrder(r.data.order)).catch(()=>toast.error('Order not found')).finally(()=>setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await orderAPI.cancel(id, { reason:'Cancelled by customer' });
      setOrder(data.order); toast.success('Order cancelled');
    } catch(err){ toast.error(err.response?.data?.message||'Cannot cancel'); }
    finally { setCancelling(false); }
  };

  const handleReturnRequest = async (e) => {
    e.preventDefault();
    if(!returnForm.reason){ toast.error('Select a reason'); return; }
    setSubmittingReturn(true);
    try {
      const { data } = await orderAPI.requestReturn(id, returnForm);
      setOrder(data.order); setShowReturnForm(false);
      toast.success('Return request submitted! We\'ll review within 24-48 hours.');
    } catch(err){ toast.error(err.response?.data?.message||'Failed'); }
    finally { setSubmittingReturn(false); }
  };

  const isReturnEligible = () => {
    if(!order||order.orderStatus!=='delivered') return false;
    if(order.returnRequest?.requestedAt) return false;
    const days=(Date.now()-new Date(order.deliveredAt||order.updatedAt).getTime())/(1000*60*60*24);
    return days<=7;
  };

  if(loading) return <div className="pt-16"><LoadingSpinner/></div>;
  if(!order) return <div className="pt-20 text-center">Order not found</div>;

  const currentStepIndex=statusSteps.indexOf(order.orderStatus);
  const isCOD=order.paymentInfo?.method==='cod';
  const isCODPaid=isCOD&&order.paymentInfo?.status==='paid';

  return (
    <div className="pt-20 pb-16 bg-gray-50">
      <div className="page-container py-8 max-w-4xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-sm text-gray-500 mt-1 font-mono">#{order.orderNumber}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isCOD && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border ${isCODPaid?'bg-green-50 text-green-700 border-green-200':'bg-amber-50 text-amber-700 border-amber-200'}`}>
                {isCODPaid?<FiCheck size={14}/>:<FiClock size={14}/>}
                COD: {isCODPaid?'Payment Received':'Payment Pending'}
              </div>
            )}
            {['placed','confirmed','processing'].includes(order.orderStatus)&&(
              <button onClick={handleCancel} disabled={cancelling} className="btn-secondary text-sm py-1.5 text-red-500 border-red-200 hover:bg-red-50 flex items-center gap-1.5">
                <FiX size={14}/> {cancelling?'Cancelling...':'Cancel Order'}
              </button>
            )}
            {isReturnEligible()&&(
              <button onClick={()=>setShowReturnForm(true)} className="btn-secondary text-sm py-1.5 text-purple-600 border-purple-200 hover:bg-purple-50 flex items-center gap-1.5">
                <FiRotateCcw size={14}/> Return Order
              </button>
            )}
            <span className={`badge text-sm py-1.5 px-3 ${statusColors[order.orderStatus]||'bg-gray-100 text-gray-700'}`}>
              {order.orderStatus.replace(/_/g,' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Return Status Card */}
        {order.returnRequest?.requestedAt&&(
          <div className={`rounded-2xl p-5 mb-6 border-2 ${order.returnRequest.status==='refunded'?'bg-green-50 border-green-200':order.returnRequest.status==='rejected'?'bg-red-50 border-red-200':'bg-purple-50 border-purple-200'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${order.returnRequest.status==='refunded'?'bg-green-100':order.returnRequest.status==='rejected'?'bg-red-100':'bg-purple-100'}`}>
                  <FiRotateCcw size={18} className={order.returnRequest.status==='refunded'?'text-green-600':order.returnRequest.status==='rejected'?'text-red-600':'text-purple-600'}/>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Return Request</p>
                  <p className="text-sm text-gray-600">{order.returnRequest.reason}</p>
                  {order.returnRequest.description&&<p className="text-xs text-gray-500 mt-0.5">{order.returnRequest.description}</p>}
                </div>
              </div>
              <span className={`badge text-xs ${returnStatusColors[order.returnRequest.status]}`}>{order.returnRequest.status.replace(/_/g,' ').toUpperCase()}</span>
            </div>
            {order.returnRequest.adminNote&&(
              <div className="mt-3 pl-4 border-l-2 border-gray-300 text-sm text-gray-700">
                <span className="font-medium">Admin Note: </span>{order.returnRequest.adminNote}
              </div>
            )}
            {order.returnRequest.status==='refunded'&&order.returnRequest.refundAmount&&(
              <div className="mt-3 bg-white rounded-xl p-3 flex items-center gap-2">
                <FiCheck className="text-green-600" size={16}/>
                <p className="text-sm text-green-700 font-medium">
                  Refund of ₹{order.returnRequest.refundAmount.toLocaleString()} processed on{' '}
                  {new Date(order.returnRequest.refundedAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}
                </p>
              </div>
            )}
            {/* Return steps */}
            <div className="mt-4 flex flex-wrap gap-2">
              {[{key:'pending',label:'Requested'},{key:'approved',label:'Approved'},{key:'picked_up',label:'Picked Up'},{key:'refunded',label:'Refunded'}].map((step,i,arr)=>{
                const order2=['pending','approved','picked_up','refunded'];
                const curIdx=order2.indexOf(order.returnRequest.status);
                const stepIdx=order2.indexOf(step.key);
                const done=curIdx>=stepIdx&&order.returnRequest.status!=='rejected';
                return (<React.Fragment key={step.key}><div className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${done?'bg-purple-600 text-white':'bg-white text-gray-400 border border-gray-200'}`}>{done&&<FiCheck size={10}/>}{step.label}</div>{i<arr.length-1&&<span className="text-gray-300 self-center">→</span>}</React.Fragment>);
              })}
            </div>
          </div>
        )}

        {/* Return eligibility notice */}
        {order.orderStatus==='delivered'&&!order.returnRequest?.requestedAt&&(
          <div className={`rounded-xl px-4 py-3 mb-6 flex items-center gap-2 text-sm border ${isReturnEligible()?'bg-blue-50 border-blue-100 text-blue-700':'bg-gray-50 border-gray-100 text-gray-500'}`}>
            <FiAlertCircle size={16}/>
            <span>{isReturnEligible()?'7-day return window is active. You can return this order.':'Return window (7 days) has expired.'}</span>
          </div>
        )}

        {/* COD banners */}
        {isCOD&&!isCODPaid&&order.orderStatus==='delivered'&&(
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <FiClock size={20} className="text-amber-600 shrink-0 mt-0.5"/>
            <div>
              <p className="font-semibold text-amber-800">COD Payment Pending</p>
              <p className="text-sm text-amber-700 mt-0.5">Your Cash on Delivery payment of <strong>₹{order.totalPrice.toLocaleString()}</strong> is pending. Please keep it ready for collection.</p>
            </div>
          </div>
        )}
        {/* Online Refund Status Banner */}
                {order.paymentInfo?.method==='razorpay'&&order.orderStatus==='cancelled'&&(
                  <div className={`rounded-2xl p-4 mb-6 flex items-start gap-3 border-2 ${order.paymentInfo?.status==='refunded'?'bg-green-50 border-green-200':'bg-amber-50 border-amber-200'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${order.paymentInfo?.status==='refunded'?'bg-green-100':'bg-amber-100'}`}>
                      {order.paymentInfo?.status==='refunded'?<FiCheck size={16} className="text-green-600"/>:<FiClock size={16} className="text-amber-600"/>}
                    </div>
                    <div className="flex-1">
                      {order.paymentInfo?.status==='refunded'?(
                        <>
                          <p className="font-semibold text-green-800">Refund Initiated ✅</p>
                          <p className="text-sm text-green-700 mt-0.5">
                            ₹{order.totalPrice?.toLocaleString()} refund has been initiated to your original payment method.
                            Will be credited within <strong>5-7 business days</strong>.
                          </p>
                          {order.paymentInfo?.refundId&&(
                            <p className="text-xs text-green-600 mt-1 font-mono">Refund ID: {order.paymentInfo.refundId}</p>
                          )}
                          {order.paymentInfo?.refundedAt&&(
                            <p className="text-xs text-green-600 mt-0.5">
                              Initiated: {new Date(order.paymentInfo.refundedAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}
                            </p>
                          )}
                        </>
                      ):(
                        <>
                          <p className="font-semibold text-amber-800">Refund Pending ⏳</p>
                          <p className="text-sm text-amber-700 mt-0.5">
                            Your refund of ₹{order.totalPrice?.toLocaleString()} is being processed.
                            Contact support if not received within 7 days.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
        
        {isCOD&&isCODPaid&&(
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <FiCheck size={20} className="text-green-600 shrink-0 mt-0.5"/>
            <div>
              <p className="font-semibold text-green-800">COD Payment Received ✅</p>
              <p className="text-sm text-green-700 mt-0.5">₹{order.totalPrice.toLocaleString()} collected on {new Date(order.codPaymentCollectedAt||order.paymentInfo.paidAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}.</p>
            </div>
          </div>
        )}

        {/* Tracking */}
        {!['cancelled','return_requested','returned'].includes(order.orderStatus)&&(
          <div className="card mb-6">
            <h2 className="font-display font-semibold mb-5">Order Tracking</h2>
            {order.trackingNumber&&<p className="text-sm text-gray-500 mb-4">Tracking No: <span className="font-mono font-bold text-gray-800">{order.trackingNumber}</span></p>}
            <div className="overflow-x-auto">
              <div className="flex items-center min-w-max pb-2">
                {statusSteps.map((step,i)=>{
                  const done=currentStepIndex>=i; const cur=currentStepIndex===i;
                  const icons=[FiPackage,FiCheck,FiPackage,FiTruck,FiTruck,FiHome]; const Icon=icons[i];
                  return (<React.Fragment key={step}><div className="flex flex-col items-center w-20"><div className={`w-10 h-10 rounded-full flex items-center justify-center ${done?'bg-primary-600 text-white':'bg-gray-100 text-gray-400'} ${cur?'ring-4 ring-primary-100':''}`}><Icon size={16}/></div><span className={`text-xs mt-2 font-medium text-center ${done?'text-primary-600':'text-gray-400'}`}>{statusLabels[i]}</span></div>{i<statusSteps.length-1&&<div className={`w-8 sm:w-12 h-0.5 mb-5 ${currentStepIndex>i?'bg-primary-600':'bg-gray-200'}`}/>}</React.Fragment>);
                })}
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {order.trackingHistory?.length>0&&(
          <div className="card mb-6">
            <h2 className="font-display font-semibold mb-4">Status History</h2>
            <div className="space-y-3">
              {[...order.trackingHistory].reverse().map((h,i)=>(
                <div key={i} className="flex gap-3"><div className="w-2 h-2 rounded-full bg-primary-600 mt-1.5 shrink-0"/><div><p className="text-sm font-medium text-gray-800">{h.message}</p>{h.location&&<p className="text-xs text-gray-500">📍 {h.location}</p>}<p className="text-xs text-gray-400 mt-0.5">{new Date(h.timestamp).toLocaleString('en-IN')}</p></div></div>
              ))}
            </div>
          </div>
        )}

        {/* Items + Billing */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-display font-semibold mb-4">Items Ordered</h2>
            <div className="space-y-3">
             {order.items.map((item,i)=>(
                <div key={i} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-gray-50"/>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">{item.name}</p>
                    {/* {
                    (item.selectedColor||item.selectedSize)&&(<div className="flex gap-1.5 mt-0.5 flex-wrap">{item.selectedColor&&<span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{item.selectedColor}</span>}
                    {item.selectedSize&&<span className="text-xs text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded-full font-medium">Size: {item.selectedSize}</span>}</div>) } */}
                    {(item.selectedColor || item.selectedSize) && (
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {item.selectedColor && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 px-2 py-1 rounded-full">
                          <span className="w-3 h-3 rounded-full border border-gray-300 shrink-0" style={{backgroundColor: item.selectedColorHex || '#ccc'}} />
                          {item.selectedColor}
                        </span>
                      )}
                      {item.selectedSize && (
                        <span className="inline-flex items-center text-xs font-bold text-primary-700 bg-primary-50 border border-primary-200 px-2.5 py-1 rounded-full">
                          Size: {item.selectedSize}
                        </span>
                      )}
                    </div>
                  )}
                    <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                    <p className="text-sm font-bold text-gray-900">₹{(item.price*item.quantity).toLocaleString()}</p></div></div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.itemsPrice?.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-600"><span>GST</span><span>₹{order.taxPrice?.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingPrice===0?'FREE':`₹${order.shippingPrice}`}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100"><span>Total</span><span>₹{order.totalPrice?.toLocaleString()}</span></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="card"><h2 className="font-display font-semibold mb-3 flex items-center gap-2"><FiMapPin size={15} className="text-primary-600"/> Delivery Address</h2><p className="font-semibold text-sm">{order.shippingAddress.fullName}</p><p className="text-sm text-gray-600">{order.shippingAddress.street}</p><p className="text-sm text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p><p className="text-sm text-gray-500">📞 {order.shippingAddress.phone}</p></div>
            <div className="card"><h2 className="font-display font-semibold mb-3">Payment</h2><div className="space-y-1.5 text-sm"><div className="flex justify-between"><span className="text-gray-600">Method</span><span className="font-medium">{isCOD?'💵 Cash on Delivery':'💳 Online'}</span></div><div className="flex justify-between"><span className="text-gray-600">Status</span><span className={`font-bold ${order.paymentInfo?.status==='paid'?'text-green-600':order.paymentInfo?.status==='refunded'?'text-purple-600':'text-amber-600'}`}>{order.paymentInfo?.status?.toUpperCase()}</span></div></div></div>
            {order.estimatedDelivery&&!['delivered','cancelled','returned'].includes(order.orderStatus)&&(
              <div className="card bg-primary-50 border border-primary-100"><p className="text-sm text-primary-700">📦 Expected: <span className="font-bold">{new Date(order.estimatedDelivery).toLocaleDateString('en-IN',{weekday:'long',month:'long',day:'numeric'})}</span></p></div>
            )}
          </div>
        </div>
      </div>

      {/* Return Form Modal */}
      {showReturnForm&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setShowReturnForm(false)}/>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-5">
              <div><h3 className="font-display font-bold text-lg text-gray-900">Request Return</h3><p className="text-sm text-gray-500">Order #{order.orderNumber}</p></div>
              <button onClick={()=>setShowReturnForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><FiX size={18}/></button>
            </div>
            <form onSubmit={handleReturnRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Return Reason *</label>
                <select required value={returnForm.reason} onChange={e=>setReturnForm(p=>({...p,reason:e.target.value}))} className="input-field text-sm">
                  <option value="">Select a reason</option>
                  {returnReasons.map(r=><option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details</label>
                <textarea rows={3} value={returnForm.description} onChange={e=>setReturnForm(p=>({...p,description:e.target.value}))} placeholder="Describe the issue..." className="input-field resize-none text-sm"/>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Items to Return:</p>
                {order.items.map((item,i)=>(
                  <div key={i} className="flex items-center gap-2 py-1"><img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover"/><div><p className="text-xs font-medium text-gray-800">{item.name}</p><p className="text-xs text-gray-500">Qty: {item.quantity}</p></div></div>
                ))}
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700"><strong>Policy:</strong> Items must be unused, in original packaging. Refund within 5-7 business days after pickup.</div>
              <div className="flex gap-3">
                <button type="submit" disabled={submittingReturn} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                  {submittingReturn?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Submitting...</>:<><FiRotateCcw size={15}/>Submit Request</>}
                </button>
                <button type="button" onClick={()=>setShowReturnForm(false)} className="btn-secondary py-3 px-5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
