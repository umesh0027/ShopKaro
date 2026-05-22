


import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiGrid, FiPackage, FiShoppingBag, FiUsers,FiRefreshCw , FiMessageSquare, FiCreditCard, FiStar, FiTag, FiMenu, FiX, FiLogOut, FiChevronRight } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { MdStore } from 'react-icons/md';
import { BsShop } from 'react-icons/bs';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', icon: FiGrid, label: 'Dashboard', exact: true },
  { to: '/admin/products', icon: FiPackage, label: 'Products' },
  { to: '/admin/categories', icon: FiTag, label: 'Categories' },
  { to: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
  { to: '/admin/payments', icon: FiCreditCard, label: 'Payments' },
  { to: '/admin/users', icon: FiUsers, label: 'Users' },
  { to: '/admin/contacts', icon: FiMessageSquare, label: 'Contacts' },
  { to: '/admin/reviews', icon: FiStar, label: 'Reviews' },
  { to: '/admin/returns', icon: FiRefreshCw, label: 'Returns' },
];

const AdminLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700/50">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-yellow-500 rounded-lg flex items-center justify-center">
            <BsShop className="text-white" size={16} />
          </div>
          <div>
            {/* <p className="font-display font-bold text-white text-sm">ShopKaro</p> */}
            <span className="font-display font-bold text-2xl text-white">
              Shop<span className="text-accent-600 text-xl font-bold">Karo</span>
            </span>
            <p className="text-slate-400 text-xs">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              isActive(item.to, item.exact)
                ? 'bg-gradient-to-br from-pink-400 to-yellow-500 text-white shadow-sm'
                : 'text-slate-300 hover:bg-gradient-to-br from-pink-400 to-yellow-200 hover:text-white'
            }`}
          >
            <item.icon size={17} />
            {item.label}
            {isActive(item.to, item.exact) && <FiChevronRight size={14} className="ml-auto" />}
          </Link>
        ))}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-gradient-to-br from-pink-400 to-yellow-500 rounded-xl flex items-center justify-center shrink-0">
            <span className="font-bold text-white text-sm">{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/" className="flex-1 text-center text-xs text-accent-400 hover:text-white py-1.5 rounded-lg hover:bg-pink-400/10 transition-colors">
            View Store
          </Link>
          <button onClick={logout} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 py-1.5 px-3 rounded-lg hover:bg-red-500/10 transition-colors">
            <FiLogOut size={12} /> Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 bg-slate-900 flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-slate-900 animate-slide-up">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <FiMenu size={20} />
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <span className="badge bg-accent-400 text-white text-xs">Admin</span>
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-yellow-500 rounded-xl flex items-center justify-center">
              <span className="font-bold text-white text-sm">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;