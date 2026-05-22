


import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX,
  FiPackage, FiLogOut, FiSettings, FiChevronDown, FiChevronRight, FiMapPin, FiGrid
} from 'react-icons/fi';
import { MdStore } from 'react-icons/md';
import { BsShop } from 'react-icons/bs';
import { HiSparkles } from 'react-icons/hi2';
import { categoryAPI } from '../../services/api';

const Navbar = () => {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled]         = useState(false);
  const [mobileOpen, setMobileOpen]         = useState(false);
  const [userMenuOpen, setUserMenuOpen]     = useState(false);
  const [searchOpen, setSearchOpen]         = useState(false);
  const [searchQuery, setSearchQuery]       = useState('');
  const [categoryTree, setCategoryTree]     = useState([]);

  // Desktop mega menu
  const [megaOpen, setMegaOpen]             = useState(false);
  const [activeParent, setActiveParent]     = useState(null); // parent._id

  // Mobile
  const [mobileExpandedCat, setMobileExpandedCat] = useState(null); // parent._id

  const userMenuRef  = useRef(null);
  const megaRef      = useRef(null);
  const closeTimer   = useRef(null);

  useEffect(() => {
    categoryAPI.getAll({ active: true })
      .then(r => {
        const cats = r.data.categories || [];
        setCategoryTree(cats);
        if (cats.length > 0) setActiveParent(cats[0]._id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const h = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) setMegaOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setMegaOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  // Hover delay handlers — prevent flicker
  const handleMegaMouseEnter = () => {
    clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const handleMegaMouseLeave = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 150);
  };

  const activeCat = categoryTree.find(c => c._id === activeParent);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="page-container">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-pink-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              < BsShop className="text-white text-lg" />
            </div>
            <span className="font-display font-bold text-2xl text-gray-900">
              Shop<span className="text-accent-600 text-xl font-bold">Karo</span>
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden lg:flex items-center gap-1">

            <Link to="/"
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                location.pathname === '/' ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}>
              Home
            </Link>

            <Link to="/products"
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                location.pathname === '/products' && !location.search ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}>
              Products
            </Link>

            {/* ──  Mega Menu trigger ── */}
            <div
              ref={megaRef}
              className="relative"
              onMouseEnter={handleMegaMouseEnter}
              onMouseLeave={handleMegaMouseLeave}
            >
              <button
                onClick={() => setMegaOpen(o => !o)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  megaOpen ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}>
                <FiGrid size={14} />
                Categories
                <FiChevronDown size={12} className={`transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* ── Mega Menu Panel ── */}
              {megaOpen && (
                <div className="absolute left-0 top-full mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 flex overflow-hidden animate-scale-in"
                  style={{ width: '560px', maxHeight: '480px' }}>

                  {/* Left — Parent list */}
                  <div className="w-48 bg-gray-50 border-r border-gray-100 py-2 overflow-y-auto shrink-0">
                    {categoryTree.map(parent => (
                      <button
                        key={parent._id}
                        onMouseEnter={() => setActiveParent(parent._id)}
                        onClick={() => {
                          navigate(`/products?category=${parent.slug}`);
                          setMegaOpen(false);
                        }}
                        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors text-left group ${
                          activeParent === parent._id
                            ? 'bg-white text-primary-600 font-semibold border-r-2 border-primary-500'
                            : 'text-gray-700 hover:bg-white hover:text-primary-600'
                        }`}>
                        <span className="flex items-center gap-2 truncate">
                          {parent.image?.url
                            ? <img src={parent.image.url} alt="" className="w-5 h-5 rounded-md object-cover shrink-0"/>
                            : <span className="text-base shrink-0">🗂️</span>
                          }
                          <span className="truncate">{parent.name}</span>
                        </span>
                        {parent.subCategories?.length > 0 && (
                          <FiChevronRight size={13} className="shrink-0 text-gray-400 group-hover:text-primary-500"/>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Right — Subcategories of active parent */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    {activeCat && (
                      <>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                          <p className="font-bold text-sm text-gray-800 flex items-center gap-2">
                            {activeCat.image?.url
                              ? <img src={activeCat.image.url} alt="" className="w-5 h-5 rounded object-cover"/>
                              : <span>🗂️</span>
                            }
                            {activeCat.name}
                          </p>
                          <Link
                            to={`/products?category=${activeCat.slug}`}
                            onClick={() => setMegaOpen(false)}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                            View All →
                          </Link>
                        </div>

                        {/* Subcategory grid */}
                        {activeCat.subCategories?.length > 0 ? (
                          <div className="grid grid-cols-2 gap-1">
                            {activeCat.subCategories.map(child => (
                              <Link
                                key={child._id}
                                to={`/products?category=${child.slug}`}
                                onClick={() => setMegaOpen(false)}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-colors group">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary-500 shrink-0 transition-colors"/>
                                <span className="truncate">{child.name}</span>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                            <span className="text-3xl mb-2">🛍️</span>
                            <p className="text-sm">No sub-categories</p>
                            <Link
                              to={`/products?category=${activeCat.slug}`}
                              onClick={() => setMegaOpen(false)}
                              className="mt-2 text-xs text-primary-600 font-semibold hover:text-primary-700">
                              Browse {activeCat.name} →
                            </Link>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link to="/about"
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                location.pathname === '/about' ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}>
              About
            </Link>

            <Link to="/contact"
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                location.pathname === '/contact' ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}>
              Contact
            </Link>
          </div>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Search */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="animate-scale-in">
                  <input autoFocus type="text" value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-44 sm:w-64 pl-4 pr-10 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onBlur={() => !searchQuery && setSearchOpen(false)}
                  />
                  <button type="button" onClick={() => setSearchOpen(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiX size={16} />
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600">
                  <FiSearch size={20} />
                </button>
              )}
            </div>

            {/* Wishlist */}
            {isLoggedIn && !isAdmin && (
              <Link to="/wishlist" className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hidden sm:block">
                <FiHeart size={20} />
              </Link>
            )}

            {/* Cart */}
            {!isAdmin && (
              <Link to="/cart" className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 relative">
                <FiShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-400 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-pink-400 to-yellow-500 flex items-center justify-center">
                    {user?.avatar?.url
                      ? <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover"/>
                      : <span className="text-white font-bold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
                    }
                  </div>
                  <FiChevronDown size={14} className={`text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-scale-in z-50">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="font-semibold text-sm text-gray-900">{user?.name}</p>
                      <p className="text-xs text-accent-500 truncate">{user?.email}</p>
                    </div>
                    {[
                      { to: '/profile',     icon: FiUser,    label: 'My Profile' },
                      ...(!isAdmin ? [
                        { to: '/my-orders',   icon: FiPackage, label: 'My Orders' },
                        { to: '/wishlist',    icon: FiHeart,   label: 'Wishlist' },
                        { to: '/track-order', icon: FiMapPin,  label: 'Track Order' },
                      ] : [])
                    ].map(item => (
                      <Link key={item.to} to={item.to}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gradient-to-br from-pink-200 to-yellow-300 transition-colors text-sm text-gray-700">
                        <item.icon size={16} className="text-gray-400"/>
                        {item.label}
                      </Link>
                    ))}
                    {isAdmin && (
                      <Link to="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary-50 text-primary-600 transition-colors text-sm font-medium">
                        <FiSettings size={16}/>
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-gray-50 mt-1">
                      <button onClick={logout}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-500 w-full text-left transition-colors text-sm">
                        <FiLogOut size={16}/>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-secondary py-2 px-4 text-sm">Login</Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm">Sign Up</Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors ml-1">
              {mobileOpen ? <FiX size={20}/> : <FiMenu size={20}/>}
            </button>
          </div>
        </div>

        {/* ══════════════════════════════
            MOBILE MENU
        ══════════════════════════════ */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 py-3 animate-slide-down max-h-[80vh] overflow-y-auto">

            <Link to="/" onClick={() => setMobileOpen(false)}
              className={`flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-colors mb-0.5 ${
                location.pathname === '/' ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'
              }`}>
              Home
            </Link>

            <Link to="/products" onClick={() => setMobileOpen(false)}
              className={`flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-colors mb-0.5 ${
                location.pathname === '/products' && !location.search ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'
              }`}>
              All Products
            </Link>

            {/* ── Mobile Categories — accordion ── */}
            <div className="mb-0.5">
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mt-2">
                Categories
              </div>

              {categoryTree.map(parent => (
                <div key={parent._id} className="mb-0.5">
                  {/* Parent row */}
                  <div className="flex items-center">
                    {/* Click on name → go to parent category */}
                    <Link
                      to={`/products?category=${parent.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-l-xl transition-colors">
                      {parent.image?.url
                        ? <img src={parent.image.url} alt="" className="w-6 h-6 rounded-lg object-cover"/>
                        : <span className="text-lg">🗂️</span>
                      }
                      {parent.name}
                    </Link>

                    {/* Expand arrow — only if has subcategories */}
                    {parent.subCategories?.length > 0 && (
                      <button
                        onClick={() => setMobileExpandedCat(
                          mobileExpandedCat === parent._id ? null : parent._id
                        )}
                        className="px-3 py-3 text-gray-400 hover:text-primary-600 hover:bg-gray-50 rounded-r-xl transition-colors">
                        <FiChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${mobileExpandedCat === parent._id ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Subcategories — slide down */}
                  {mobileExpandedCat === parent._id && parent.subCategories?.length > 0 && (
                    <div className="ml-4 mr-2 mb-1 bg-gray-50 rounded-xl overflow-hidden animate-slide-down">
                      {parent.subCategories.map((child, idx) => (
                        <Link
                          key={child._id}
                          to={`/products?category=${child.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-colors ${
                            idx !== parent.subCategories.length - 1 ? 'border-b border-gray-100' : ''
                          }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0"/>
                          {child.name}
                          {child.sizeType && child.sizeType !== 'none' && (
                            <span className="ml-auto text-xs text-gray-400">
                              {child.sizeType === 'clothing' ? '👕'
                                : child.sizeType === 'bottomwear' ? '👖'
                                : child.sizeType === 'footwear' ? '👟' : '📦'}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-2 pt-2">
              <Link to="/about" onClick={() => setMobileOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-colors mb-0.5 ${
                  location.pathname === '/about' ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'
                }`}>
                About
              </Link>

              <Link to="/contact" onClick={() => setMobileOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                  location.pathname === '/contact' ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'
                }`}>
                Contact
              </Link>
                      <Link
        to="/allcategories"
        onClick={() => setMobileOpen(false)}
        className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        Shop by Categories
      </Link>
            </div>

            {!isLoggedIn && (
              <div className="flex gap-2 pt-3 border-t border-gray-100 mt-2">
                <Link to="/login" className="btn-secondary py-2.5 px-4 text-sm flex-1 text-center">Login</Link>
                <Link to="/register" className="btn-primary py-2.5 px-4 text-sm flex-1 text-center">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;