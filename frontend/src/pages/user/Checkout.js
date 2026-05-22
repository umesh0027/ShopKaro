import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiPlus, FiCreditCard, FiShield, FiCheck } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderAPI, paymentAPI, userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.png';
const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, fetchMe } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: address, 2: payment
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ fullName: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false });

  const tax = Math.round(cartTotal * 0.18);
  const shipping = cartTotal > 499 ? 0 : 49;
  const grandTotal = cartTotal + tax + shipping;

  useEffect(() => {
    const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
    if (defaultAddr) setSelectedAddress(defaultAddr._id);
  }, [addresses]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await userAPI.addAddress(newAddress);
      setAddresses(data.addresses);
      setShowAddressForm(false);
      setNewAddress({ fullName: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false });
      toast.success('Address added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
    const address = addresses.find(a => a._id === selectedAddress);
    if (!address) { toast.error('Invalid address selected'); return; }

    setLoading(true);
    try {
    
        const orderItems = cartItems.map(item => ({
        product: item._id,
        quantity: item.quantity,
        selectedColor: item.selectedColor || undefined,
               selectedColorHex: item.selectedColorHex || undefined,
        selectedSize:  item.selectedSize  || undefined,
      }));


      // Create order in DB
      const { data: orderData } = await orderAPI.create({
        items: orderItems,
        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          street: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        },
        paymentMethod
      });

      if (paymentMethod === 'cod') {
        clearCart();
        navigate(`/order-success/${orderData.order._id}`);
        return;
      }

      // Razorpay flow
      const isLoaded = await loadRazorpay();
      if (!isLoaded) { toast.error('Payment gateway failed to load'); setLoading(false); return; }

      const { data: rzpData } = await paymentAPI.createOrder({ orderId: orderData.order._id });

      const options = {
        key: rzpData.key,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: 'ShopKaro',
        image: logo,
        description: `Order #${rzpData.orderNumber}`,
        order_id: rzpData.razorpayOrder.id,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || address.phone,
        },
        theme: { color: '#6366f1' },
        handler: async (response) => {
          try {
            await paymentAPI.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderData.order._id
            });
            clearCart();
            navigate(`/order-success/${orderData.order._id}`);
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => { toast.error('Payment failed'); setLoading(false); });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="pt-20 pb-16 bg-gray-50">
      <div className="page-container py-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-3 mb-8">
          {[{ n: 1, label: 'Delivery Address' }, { n: 2, label: 'Payment' }].map(s => (
            <React.Fragment key={s.n}>
              <div className={`flex items-center gap-2 ${step >= s.n ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s.n ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {step > s.n ? <FiCheck size={14} /> : s.n}
                </div>
                <span className="font-medium text-sm hidden sm:block">{s.label}</span>
              </div>
              {s.n < 2 && <div className={`flex-1 h-0.5 ${step > s.n ? 'bg-primary-600' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Address */}
            {step === 1 && (
              <div className="card animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                    <FiMapPin className="text-primary-600" /> Delivery Address
                  </h2>
                  <button onClick={() => setShowAddressForm(!showAddressForm)} className="btn-secondary py-1.5 px-4 text-sm flex items-center gap-1.5">
                    <FiPlus size={14} /> Add New
                  </button>
                </div>

                {showAddressForm && (
                  <form onSubmit={handleAddAddress} className="bg-primary-50 rounded-2xl p-5 mb-6 space-y-3 animate-slide-down">
                    <h3 className="font-semibold text-sm text-gray-800 mb-3">New Address</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { key: 'fullName', placeholder: 'Full Name', required: true },
                        { key: 'phone', placeholder: 'Phone Number', required: true },
                      ].map(f => (
                        <input key={f.key} required={f.required} placeholder={f.placeholder} value={newAddress[f.key]}
                          onChange={e => setNewAddress(p => ({ ...p, [f.key]: e.target.value }))}
                          className="input-field text-sm py-2.5" />
                      ))}
                    </div>
                    <input required placeholder="Street Address" value={newAddress.street}
                      onChange={e => setNewAddress(p => ({ ...p, street: e.target.value }))}
                      className="input-field text-sm py-2.5 w-full" />
                    <div className="grid sm:grid-cols-3 gap-3">
                      {[
                        { key: 'city', placeholder: 'City' },
                        { key: 'state', placeholder: 'State' },
                        { key: 'pincode', placeholder: 'Pincode' },
                      ].map(f => (
                        <input key={f.key} required placeholder={f.placeholder} value={newAddress[f.key]}
                          onChange={e => setNewAddress(p => ({ ...p, [f.key]: e.target.value }))}
                          className="input-field text-sm py-2.5" />
                      ))}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={newAddress.isDefault}
                        onChange={e => setNewAddress(p => ({ ...p, isDefault: e.target.checked }))}
                        className="w-4 h-4 text-primary-600 rounded" />
                      <span className="text-sm text-gray-600">Set as default address</span>
                    </label>
                    <div className="flex gap-3 pt-1">
                      <button type="submit" className="btn-primary py-2 text-sm">Save Address</button>
                      <button type="button" onClick={() => setShowAddressForm(false)} className="btn-secondary py-2 text-sm">Cancel</button>
                    </div>
                  </form>
                )}

                {addresses.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">No addresses found. Add one above.</p>
                ) : (
                  <div className="space-y-3">
                    {addresses.map(addr => (
                      <label key={addr._id} className={`flex gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${selectedAddress === addr._id ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}>
                        <input type="radio" name="address" value={addr._id} checked={selectedAddress === addr._id}
                          onChange={() => setSelectedAddress(addr._id)} className="mt-1 text-primary-600" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{addr.fullName}</p>
                            {addr.isDefault && <span className="badge bg-primary-100 text-primary-700 text-xs">Default</span>}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="text-sm text-gray-500">📞 {addr.phone}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                <button onClick={() => { if (!selectedAddress) { toast.error('Select an address'); return; } setStep(2); }}
                  className="btn-primary w-full mt-6 py-3">
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="card animate-fade-in">
                <h2 className="font-display font-semibold text-lg flex items-center gap-2 mb-6">
                  <FiCreditCard className="text-primary-600" /> Payment Method
                </h2>

                <div className="space-y-3">
                  {[
                    { value: 'razorpay', label: 'Pay Online', desc: 'Credit/Debit Card, UPI, Net Banking, Wallets', icon: '💳' },
                    { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵' },
                  ].map(opt => (
                    <label key={opt.value} className={`flex gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${paymentMethod === opt.value ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}>
                      <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value}
                        onChange={() => setPaymentMethod(opt.value)} className="mt-1 text-primary-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{opt.icon}</span>
                          <p className="font-semibold text-sm">{opt.label}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3 text-sm">← Back</button>
                  <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                    {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</> : `Place Order ₹${grandTotal.toLocaleString()}`}
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 justify-center">
                  <FiShield size={12} className="text-green-500" />
                  <span>Secured by Razorpay. Your payment info is safe.</span>
                </div>
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="card h-fit sticky top-24">
            <h3 className="font-display font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              {/* {cartItems.map(item => (
                <div key={item._id} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-50" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-xs font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))} */}

              
           {cartItems.map(item => (
                <div key={item.cartKey || item._id} className="flex gap-3">
                  {/* <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-50" /> */}
                          <img
                    src={item.image?.url || item.image || 'https://via.placeholder.com/50'}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-50"
                    onError={e => { e.target.src = 'https://via.placeholder.com/50'; }}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                    
                      {(item.selectedColor || item.selectedSize) && (
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        {item.selectedColor && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                            <span className="w-2.5 h-2.5 rounded-full border border-gray-300 shrink-0" style={{backgroundColor: item.selectedColorHex || '#ccc'}} />
                            {item.selectedColor}
                          </span>
                        )}
                        {item.selectedColor && item.selectedSize && <span className="text-xs text-gray-300 self-center">·</span>}
                        {item.selectedSize && (
                          <span className="text-xs font-semibold text-primary-700">Size: {item.selectedSize}</span>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-xs font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}

            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-600"><span>GST (18%)</span><span>₹{tax.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100"><span>Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
