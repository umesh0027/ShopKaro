


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { BsShop } from 'react-icons/bs';
import { HiSparkles } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ─── Reactivation OTP Screen (reused) ───
const ReactivationScreen = ({ userId, onSuccess }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const sendOTP = async () => {
    setLoading(true);
    try {
      await authAPI.requestReactivation({ userId });
      setOtpSent(true);
      toast.success('Reactivation OTP sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.verifyReactivation({ userId, otp });
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Account reactivated! Welcome back 🎉', { duration: 4000 });
        onSuccess(data.user);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-5">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl">🔓</span>
        </div>
        <h3 className="font-display font-bold text-xl text-gray-900">Account Found!</h3>
        <p className="text-sm text-gray-500 mt-1">
          This email has a deactivated ShopKaro account.<br/>Reactivate it instead of creating a new one.
        </p>
      </div>

      {/* Restore info */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-5">
        <p className="text-xs font-semibold text-green-700 mb-2">✅ What gets restored:</p>
        <div className="grid grid-cols-2 gap-1.5">
          {['Previous orders', 'Wishlist items', 'Saved addresses', 'Account profile'].map(item => (
            <div key={item} className="flex items-center gap-1.5 text-xs text-green-600">
              <span className="w-1 h-1 rounded-full bg-green-400 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {!otpSent ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            We'll send an OTP to your email to verify your identity.
          </p>
          <button onClick={sendOTP} disabled={loading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
              : '📧 Send Reactivation OTP'
            }
          </button>
          <Link to="/login" className="block text-sm text-gray-400 hover:text-gray-600 text-center hover:underline">
            Or login with existing credentials →
          </Link>
        </div>
      ) : (
        <form onSubmit={verifyOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              Enter 6-digit OTP from your email
            </label>
            <div className="flex gap-2 justify-center">
              {[0,1,2,3,4,5].map(i => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={otp[i] || ''}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    const arr = otp.split('');
                    arr[i] = val;
                    setOtp(arr.join(''));
                    if (val && e.target.nextSibling) e.target.nextSibling.focus();
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Backspace' && !otp[i] && e.target.previousSibling)
                      e.target.previousSibling.focus();
                  }}
                  className="w-11 h-11 border-2 border-gray-200 rounded-xl text-center text-xl font-bold focus:outline-none focus:border-primary-500 transition-colors"
                />
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading || otp.length !== 6}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Reactivating...</>
              : '🎉 Reactivate & Login'
            }
          </button>
          <button type="button" onClick={sendOTP} disabled={loading}
            className="text-sm text-primary-600 w-full text-center hover:underline">
            Resend OTP
          </button>
        </form>
      )}
    </div>
  );
};

// ─── Main Register Page ───
const Register = () => {
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=form, 2=otp, 3=reactivate
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [deactivatedUserId, setDeactivatedUserId] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      if (data.success) {
        setUserId(data.userId);
        setStep(2);
        toast.success('OTP sent to your email!');
      }
    } catch (err) {
      const res = err.response?.data;
      if (res?.isDeactivated) {
        setDeactivatedUserId(res.userId);
        setStep(3);
      } else {
        toast.error(res?.message || 'Registration failed');
      }
    } finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOTP({ userId, otp });
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleReactivationSuccess = (user) => {
    navigate(user.role === 'admin' ? '/admin' : '/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 to-yellow-500  flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-sm">
              <BsShop className="text-white text-xl" />
            </div>
             <span className="font-display font-bold text-2xl text-gray-900">
              Shop<span className="text-accent-600 text-xl font-bold">Karo</span>
            </span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            {step === 3 ? 'Account Found' : step === 2 ? 'Verify Email' : 'Create Account'}
          </h1>
          <p className="text-gray-800 mt-1">
            {step === 3 ? 'Reactivate your existing account'
              : step === 2 ? `OTP sent to ${form.email}`
              : 'Join thousands of happy shoppers'}
          </p>
        </div>

        <div className="card shadow-hover bg-gradient-to-br from-pink-200 to-yellow-200">
          {/* ── Step 3: Reactivation ── */}
          {step === 3 && deactivatedUserId && (
            <>
              <ReactivationScreen userId={deactivatedUserId} onSuccess={handleReactivationSuccess} />
              <button onClick={() => { setStep(1); setDeactivatedUserId(null); setForm({ name: '', email: '', password: '', phone: '' }); }}
                className="text-sm text-gray-400 hover:text-gray-600 w-full text-center mt-4 hover:underline">
                ← Back to Register
              </button>
            </>
          )}

          {/* ── Step 1: Register Form ── */}
          {step === 1 && (
            <form onSubmit={handleRegister} className="space-y-4 ">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" required value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Your full name" className="input-field pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" required value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com" className="input-field pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="tel" value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="10-digit mobile number" className="input-field pl-10" maxLength={10} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type={showPass ? 'text' : 'password'} required minLength={6}
                    value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Min 6 characters" className="input-field pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                {loading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  : 'Create Account'
                }
              </button>
            </form>
          )}

          {/* ── Step 2: OTP Verify ── */}
          {step === 2 && (
            <form onSubmit={handleVerify} className="space-y-5 animate-fade-in">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">📧</span>
                </div>
                <p className="text-sm text-gray-500">Check your inbox for a 6-digit code</p>
              </div>
              <div className="flex gap-2 justify-center">
                {[0,1,2,3,4,5].map(i => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={otp[i] || ''}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      const newOtp = otp.split('');
                      newOtp[i] = val;
                      setOtp(newOtp.join(''));
                      if (val && e.target.nextSibling) e.target.nextSibling.focus();
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !otp[i] && e.target.previousSibling)
                        e.target.previousSibling.focus();
                    }}
                    className="w-12 h-12 border-2 border-gray-200 rounded-xl text-center text-xl font-bold focus:outline-none focus:border-primary-500 transition-colors"
                  />
                ))}
              </div>
              <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full py-3">
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
              <button type="button" onClick={async () => {
                await authAPI.resendOTP({ userId });
                toast.success('OTP resent!');
              }} className="text-sm text-primary-600 w-full text-center hover:underline">
                Didn't receive? Resend OTP
              </button>
            </form>
          )}

          {step === 1 && (
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;