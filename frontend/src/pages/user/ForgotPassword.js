import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiSparkles } from 'react-icons/hi2';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { BsShop } from 'react-icons/bs';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.forgotPassword({ email });
      setUserId(data.userId);
      setStep(2);
      toast.success('OTP sent!');
    } catch (err) { toast.error(err.response?.data?.message || 'Email not found'); }
    finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.resetPassword({ userId, otp, newPassword });
      setStep(3);
      toast.success('Password reset successfully!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to reset'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 to-yellow-500 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-yellow-500 rounded-xl flex items-center justify-center">
              <BsShop className="text-white text-xl" />
            </div>
            <span className="font-display font-bold text-2xl text-gray-900">Shop<span className="text-accent-600 text-xl font-bold">Karo</span></span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-gray-900">Reset Password</h1>
        </div>
        <div className="card shadow-hover">
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <p className="text-sm text-gray-600">Enter your registered email to receive an OTP</p>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="input-field" />
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'Sending...' : 'Send OTP'}</button>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handleReset} className="space-y-4">
              <input type="text" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))} placeholder="Enter 6-digit OTP" className="input-field text-center text-2xl tracking-widest font-bold" required />
              <input type="password" minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password (min 6 chars)" className="input-field" required />
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'Resetting...' : 'Reset Password'}</button>
            </form>
          )}
          {step === 3 && (
            <div className="text-center py-4">
              <p className="text-5xl mb-4">✅</p>
              <p className="font-semibold text-gray-900 mb-2">Password Reset!</p>
              <Link to="/login" className="btn-primary inline-block">Go to Login</Link>
            </div>
          )}
          <p className="text-center text-sm mt-4"><Link to="/login" className="text-primary-600 hover:underline">← Back to Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
