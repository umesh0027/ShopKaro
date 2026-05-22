

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { MdStore } from 'react-icons/md';
import { BsShop } from 'react-icons/bs';
import { HiSparkles } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ─── Reactivation OTP Screen ───
const ReactivationScreen = ({ userId, onSuccess }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { login: ctxLogin } = useAuth();

  const sendOTP = async () => {
    setLoading(true);
    try {
      await authAPI.requestReactivation({ userId });
      setOtpSent(true);
      toast.success('Reactivation OTP sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.verifyReactivation({ userId, otp });
      if (data.success) {
        // Save token + user
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
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl">🔓</span>
        </div>
        <h3 className="font-display font-bold text-lg text-gray-900">Reactivate Account</h3>
        <p className="text-sm text-gray-500 mt-1">Your account was deactivated. Reactivate to continue.</p>
      </div>

      {/* What gets restored */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-5">
        <p className="text-xs font-semibold text-green-700 mb-2">✅ What gets restored:</p>
        <ul className="space-y-1">
          {['All your previous orders', 'Wishlist items', 'Saved addresses', 'Account data & profile'].map(item => (
            <li key={item} className="text-xs text-green-600 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-green-400 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {!otpSent ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 text-center">We'll send a 6-digit OTP to your registered email to verify it's you.</p>
          <button onClick={sendOTP} disabled={loading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
              : '📧 Send Reactivation OTP'
            }
          </button>
        </div>
      ) : (
        <form onSubmit={verifyOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              Enter the 6-digit OTP sent to your email
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
                    if (e.key === 'Backspace' && !otp[i] && e.target.previousSibling) {
                      e.target.previousSibling.focus();
                    }
                  }}
                  className="w-11 h-11 border-2 border-gray-200 rounded-xl text-center text-xl font-bold focus:outline-none focus:border-primary-500 transition-colors"
                />
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading || otp.length !== 6}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
              : '🎉 Reactivate My Account'
            }
          </button>
          <button type="button" onClick={sendOTP} disabled={loading}
            className="text-sm text-primary-600 w-full text-center hover:underline">
            Didn't receive? Resend OTP
          </button>
        </form>
      )}
    </div>
  );
};

// ─── Main Login Page ───
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP verification for unverified accounts
  const [otpState, setOtpState] = useState(null);
  const [otp, setOtp] = useState('');

  // Deactivated account reactivation
  const [deactivatedUserId, setDeactivatedUserId] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form);
      if (data.user?.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      const res = err.response?.data;
      if (res?.requiresVerification) {
        setOtpState({ userId: res.userId });
        toast.error('Please verify your email first.');
      } else if (res?.isDeactivated) {
        setDeactivatedUserId(res.userId);
        toast.error('Your account is deactivated. Reactivate below.');
      } else {
        toast.error(res?.message || 'Login failed');
      }
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.verifyOTP({ userId: otpState.userId, otp });
      if (data.success) navigate('/');
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
            {/* <span className="font-display font-bold text-2xl text-gray-900">
              Shop<span className="text-primary-600">Karo</span>
            </span> */}
             <span className="font-display font-bold text-2xl text-gray-900">
              Shop<span className="text-accent-600 text-xl font-bold">Karo</span>
            </span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            {deactivatedUserId ? 'Reactivate Account' : 'Welcome back'}
          </h1>
          <p className="text-gray-800 mt-1">
            {deactivatedUserId ? 'Your data is waiting for you!' : 'Sign in to your account'}
          </p>
        </div>

        <div className="card shadow-hover bg-gradient-to-br from-pink-200 to-yellow-200">
          {/* ── Reactivation Flow ── */}
          {deactivatedUserId ? (
            <>
              <ReactivationScreen userId={deactivatedUserId} onSuccess={handleReactivationSuccess} />
              <button
                onClick={() => setDeactivatedUserId(null)}
                className="text-sm text-gray-400 hover:text-gray-600 w-full text-center mt-4 hover:underline"
              >
                ← Back to Login
              </button>
            </>
          ) : !otpState ? (
            // ── Normal Login Form ──
            <form onSubmit={handleLogin} className="space-y-5 ">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email" required value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com" className="input-field pl-10"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPass ? 'text' : 'password'} required value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••" className="input-field pl-10 pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto " />
                  : 'Sign In'
                }
              </button>
            </form>
          ) : (
            // ── Email Verification OTP (unverified account) ──
            <form onSubmit={handleVerifyOTP} className="space-y-5 animate-fade-in">
              <div className="text-center mb-2">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📧</span>
                </div>
                <h3 className="font-semibold text-gray-900">Verify Email</h3>
                <p className="text-sm text-gray-500 mt-1">Enter the 6-digit OTP sent to your email</p>
              </div>
              <input
                type="text" maxLength="6" value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit OTP"
                className="input-field text-center text-2xl tracking-widest font-bold" required
              />
              <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full py-3">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button type="button" onClick={async () => {
                await authAPI.resendOTP({ userId: otpState.userId });
                toast.success('OTP resent!');
              }} className="text-sm text-primary-600 hover:underline w-full text-center">
                Resend OTP
              </button>
            </form>
          )}

          {!deactivatedUserId && (
            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">Sign up</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;