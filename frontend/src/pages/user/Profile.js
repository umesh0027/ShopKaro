

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUser, FiMail, FiPhone, FiLock, FiMapPin, FiPlus, FiTrash2,
  FiCheck, FiCamera, FiAlertTriangle, FiShield, FiEye, FiEyeOff
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser, fetchMe, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [addressForm, setAddressForm] = useState({ fullName: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Delete account state
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeletePass, setShowDeletePass] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', profileForm.name);
      if (profileForm.phone) fd.append('phone', profileForm.phone);
      const { data } = await userAPI.updateProfile(fd);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setLoading(false); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setAvatarLoading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      fd.append('name', user.name);
      const { data } = await userAPI.updateProfile(fd);
      updateUser(data.user);
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to update avatar');
    } finally { setAvatarLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await userAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setLoading(false); }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await userAPI.addAddress(addressForm);
      await fetchMe();
      setShowAddressForm(false);
      setAddressForm({ fullName: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false });
      toast.success('Address added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await userAPI.deleteAddress(id);
      await fetchMe();
      toast.success('Address deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    if (!deletePassword) {
      toast.error('Please enter your password');
      return;
    }
    setDeletingAccount(true);
    try {
      await userAPI.deleteAccount({ password: deletePassword });
      toast.success('Account deactivated. Goodbye! 👋', { duration: 4000 });
      logout();
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    } finally { setDeletingAccount(false); }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'password', label: 'Password', icon: FiLock },
    { id: 'addresses', label: 'Addresses', icon: FiMapPin },
    { id: 'danger', label: 'Danger Zone', icon: FiAlertTriangle },
  ];

  return (
    <div className="pt-20 pb-16 bg-gray-50 min-h-screen">
      <div className="page-container py-8 max-w-4xl">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">My Account</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            {/* Avatar Card */}
            <div className="card text-center mb-4">
              <div className="relative inline-block mb-4">
                <div className={`w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-400 to-yellow-300 mx-auto ${avatarLoading ? 'opacity-60' : ''}`}>
                  {user?.avatar?.url
                    ? <img src={user.avatar.url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <span className="font-display font-bold text-3xl text-white">{user?.name?.[0]?.toUpperCase()}</span>
                      </div>
                  }
                </div>
                <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-pink-400 to-yellow-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors shadow-sm">
                  {avatarLoading
                    ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <FiCamera size={13} className="text-white" />
                  }
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              {user?.isVerified && (
                <span className="badge bg-green-100 text-green-700 mt-2 text-xs inline-flex items-center gap-1">
                  <FiCheck size={10} /> Verified
                </span>
              )}
            </div>

            {/* Tab nav */}
            <div className="card p-2">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
                    ${tab === t.id
                      ? t.id === 'danger' ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-700'
                      : t.id === 'danger' ? 'text-red-400 hover:bg-red-50 hover:text-red-600' : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Panel */}
          <div className="md:col-span-2">

            {/* ── Profile Tab ── */}
            {tab === 'profile' && (
              <div className="card animate-fade-in">
                <h2 className="font-display font-semibold text-lg mb-6">Personal Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                        className="input-field pl-10" required placeholder="Your full name" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input value={user?.email} disabled
                        className="input-field pl-10 bg-gray-50 text-gray-500 cursor-not-allowed" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                        className="input-field pl-10" placeholder="10-digit mobile number" maxLength={10} />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary py-2.5 flex items-center gap-2">
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiCheck size={15} />}
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* ── Password Tab ── */}
            {tab === 'password' && (
              <div className="card animate-fade-in">
                <h2 className="font-display font-semibold text-lg mb-6">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type={showCurrentPass ? 'text' : 'password'} required
                        value={passwordForm.currentPassword}
                        onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                        className="input-field pl-10 pr-10" placeholder="Enter current password" />
                      <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showCurrentPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type={showNewPass ? 'text' : 'password'} required minLength={6}
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                        className="input-field pl-10 pr-10" placeholder="Min 6 characters" />
                      <button type="button" onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showNewPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    </div>
                    {/* Password strength */}
                    {passwordForm.newPassword && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[1,2,3,4].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                              passwordForm.newPassword.length >= i * 3
                                ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-blue-400' : 'bg-green-500'
                                : 'bg-gray-200'
                            }`} />
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {passwordForm.newPassword.length < 6 ? 'Too short' :
                           passwordForm.newPassword.length < 9 ? 'Weak' :
                           passwordForm.newPassword.length < 12 ? 'Good' : 'Strong'}
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="password" required
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                        className={`input-field pl-10 ${passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword ? 'border-red-300 focus:ring-red-400' : ''}`}
                        placeholder="Repeat new password" />
                    </div>
                    {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary py-2.5">
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </div>
            )}

            {/* ── Addresses Tab ── */}
            {tab === 'addresses' && (
              <div className="animate-fade-in space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="font-display font-semibold text-lg">Saved Addresses</h2>
                  <button onClick={() => setShowAddressForm(!showAddressForm)}
                    className="btn-secondary py-2 px-4 text-sm flex items-center gap-1.5">
                    <FiPlus size={14} /> Add New
                  </button>
                </div>

                {showAddressForm && (
                  <div className="card bg-primary-50 border border-primary-100 animate-slide-down">
                    <h3 className="font-semibold text-sm mb-4">New Address</h3>
                    <form onSubmit={handleAddAddress} className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <input required placeholder="Full Name *" value={addressForm.fullName}
                          onChange={e => setAddressForm(p => ({ ...p, fullName: e.target.value }))}
                          className="input-field text-sm py-2.5" />
                        <input required placeholder="Phone *" value={addressForm.phone}
                          onChange={e => setAddressForm(p => ({ ...p, phone: e.target.value }))}
                          className="input-field text-sm py-2.5" maxLength={10} />
                      </div>
                      <input required placeholder="Street Address *" value={addressForm.street}
                        onChange={e => setAddressForm(p => ({ ...p, street: e.target.value }))}
                        className="input-field text-sm py-2.5 w-full" />
                      <div className="grid sm:grid-cols-3 gap-3">
                        <input required placeholder="City *" value={addressForm.city}
                          onChange={e => setAddressForm(p => ({ ...p, city: e.target.value }))}
                          className="input-field text-sm py-2.5" />
                        <input required placeholder="State *" value={addressForm.state}
                          onChange={e => setAddressForm(p => ({ ...p, state: e.target.value }))}
                          className="input-field text-sm py-2.5" />
                        <input required placeholder="Pincode *" value={addressForm.pincode}
                          onChange={e => setAddressForm(p => ({ ...p, pincode: e.target.value }))}
                          className="input-field text-sm py-2.5" maxLength={6} />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={addressForm.isDefault}
                          onChange={e => setAddressForm(p => ({ ...p, isDefault: e.target.checked }))}
                          className="w-4 h-4 text-primary-600 rounded" />
                        <span className="text-sm text-gray-600">Set as default address</span>
                      </label>
                      <div className="flex gap-3 pt-1">
                        <button type="submit" className="btn-primary py-2 text-sm">Save Address</button>
                        <button type="button" onClick={() => setShowAddressForm(false)} className="btn-secondary py-2 text-sm">Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                {!user?.addresses?.length ? (
                  <div className="card text-center py-12 text-gray-400">
                    <FiMapPin size={36} className="mx-auto mb-3" />
                    <p className="font-medium">No addresses saved yet</p>
                    <p className="text-sm mt-1">Add your delivery address above</p>
                  </div>
                ) : (
                  user.addresses.map(addr => (
                    <div key={addr._id} className={`card border-2 ${addr.isDefault ? 'border-primary-200 bg-primary-50/40' : 'border-transparent'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm text-gray-900">{addr.fullName}</p>
                            {addr.isDefault && (
                              <span className="badge bg-primary-100 text-primary-700 text-xs">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{addr.street}</p>
                          <p className="text-sm text-gray-600">{addr.city}, {addr.state} — {addr.pincode}</p>
                          <p className="text-xs text-gray-500 mt-1">📞 {addr.phone}</p>
                        </div>
                        <button onClick={() => handleDeleteAddress(addr._id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Danger Zone Tab ── */}
            {tab === 'danger' && (
              <div className="animate-fade-in space-y-5">
                {/* Info card */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <FiShield size={18} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-800">Account Security Zone</p>
                    <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                      Actions in this section are sensitive. Deactivating your account will prevent login
                      but your order history and data will be preserved. Contact support to reactivate.
                    </p>
                  </div>
                </div>

                {/* Delete Account Card */}
                <div className="card border-2 border-red-100">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                      <FiAlertTriangle size={18} className="text-red-500" />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-lg text-red-700">Deactivate Account</h2>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        Your account will be deactivated and you will be logged out immediately.
                        Your orders, wishlist, and data are preserved. You can contact support
                        at <span className="font-medium text-primary-600">support@shopkaro.com</span> to reactivate.
                      </p>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-xl p-4 mb-5">
                    <p className="text-sm font-semibold text-red-700 mb-2">What will happen:</p>
                    <ul className="space-y-1.5">
                      {[
                        'You will be logged out immediately',
                        'Account login will be disabled',
                        'Your orders and data are safely preserved',
                        'You can reactivate by contacting support',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-red-600">
                          <span className="mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <form onSubmit={handleDeleteAccount} className="space-y-4">
                    {/* Password confirm */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Enter your password to confirm
                      </label>
                      <div className="relative">
                        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type={showDeletePass ? 'text' : 'password'}
                          value={deletePassword}
                          onChange={e => setDeletePassword(e.target.value)}
                          placeholder="Your current password"
                          className="input-field pl-10 pr-10 border-red-200 focus:ring-red-400"
                          required
                        />
                        <button type="button" onClick={() => setShowDeletePass(!showDeletePass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showDeletePass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* Type DELETE confirm */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Type <span className="font-mono font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">DELETE</span> to confirm
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={e => setDeleteConfirmText(e.target.value.toUpperCase())}
                        placeholder="Type DELETE here"
                        className={`input-field font-mono tracking-widest border-red-200 focus:ring-red-400 ${deleteConfirmText === 'DELETE' ? 'border-red-400 bg-red-50' : ''}`}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={deletingAccount || deleteConfirmText !== 'DELETE' || !deletePassword}
                      className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gradient-to-br from-pink-200 to-yellow-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {deletingAccount ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deactivating...</>
                      ) : (
                        <><FiAlertTriangle size={16} /> Deactivate My Account</>
                      )}
                    </button>

                    <p className="text-xs text-gray-400 text-center">
                      Need help instead? <a href="mailto:support@shopkaro.com" className="text-primary-600 hover:underline">Contact Support</a>
                    </p>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
