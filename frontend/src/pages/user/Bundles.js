// pages/user/Bundles.jsx
// Route: /bundles  →  "View All Combo Offers" page

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiTag, FiShoppingBag } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { bundleAPI } from '../../services/api'; // adjust path

/* ── Shimmer skeleton ── */
const BundleSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
    <div className="h-44 bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="flex gap-2">
        <div className="h-5 bg-gray-200 rounded-full w-20" />
        <div className="h-5 bg-gray-200 rounded-full w-20" />
        <div className="h-5 bg-gray-200 rounded-full w-16" />
      </div>
      <div className="h-8 bg-gray-200 rounded-xl w-full mt-2" />
    </div>
  </div>
);

/* ── Single bundle card ── */
const BundleCard = ({ bundle }) => {
  const saving = bundle.savingsAmount || 0;
  const pct    = bundle.savingsPercent || 0;

  return (
    <Link
      to={`/bundles/${bundle._id}`}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border-2 border-transparent hover:border-accent-400 hover:shadow-xl transition-all duration-300 group flex flex-col"
    >
      {/* Image / product grid */}
      <div className="h-44 bg-gray-50 relative overflow-hidden shrink-0">
        {bundle.image?.url ? (
          <img
            src={bundle.image.url}
            alt={bundle.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full grid grid-cols-3 gap-2 p-3">
            {(bundle.products || []).slice(0, 3).map((item, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-white shadow-sm">
                <img
                  src={item.product?.images?.[0]?.url}
                  alt={item.product?.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
            {/* placeholder if less than 3 products */}
            {(bundle.products || []).length < 3 &&
              [...Array(3 - (bundle.products || []).length)].map((_, i) => (
                <div key={`ph-${i}`} className="rounded-xl bg-gray-100 flex items-center justify-center">
                  <FiPackage className="text-gray-300" size={20} />
                </div>
              ))
            }
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 right-2.5 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
          {pct}% OFF
        </div>
        {bundle.isFeatured && (
          <div className="absolute top-2.5 left-2.5 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <HiSparkles size={10} /> Featured
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
          {bundle.name}
        </h3>
        {bundle.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{bundle.description}</p>
        )}

        {/* Product pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(bundle.products || []).map((item, i) => (
            <span
              key={i}
              className="text-xs bg-primary-50 text-primary-700 border border-primary-100 px-2.5 py-0.5 rounded-full font-medium"
            >
              {item.product?.name?.split(' ').slice(0, 5).join(' ')}
              {item.quantity > 1 ? ` ×${item.quantity}` : ''}
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl font-bold text-gray-900">
              ₹{bundle.bundlePrice?.toLocaleString()}
            </span>
            <span className="text-sm text-gray-400 line-through">
              ₹{bundle.originalPrice?.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-green-600 font-semibold mb-3">
            You save ₹{saving.toLocaleString()} on this bundle
          </p>

          <div className="w-full text-center bg-gradient-to-br from-pink-400 to-yellow-500 text-white font-semibold py-2.5 rounded-xl transition-all text-sm">
            View Bundle →
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */
const Bundles = () => {
  const [bundles, setBundles]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter]     = useState('all'); // all | featured

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (filter === 'featured') params.featured = true;

    bundleAPI.getAll(params)
      .then(({ data }) => {
        setBundles(data.bundles || []);
        setTotalPages(data.pages || 1);
      })
      .catch(() => setBundles([]))
      .finally(() => setLoading(false));
  }, [page, filter]);

  const handleFilter = (f) => {
    setFilter(f);
    setPage(1);
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-br from-pink-200 via-red-400 to-yellow-500  text-white py-14">
        <div className="page-container text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <FiPackage size={14} /> COMBO OFFERS
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            🎁 Frequently Bought Together
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Handpicked bundles — buy more, save more. Get the best value deals on our curated combos.
          </p>

          {/* Stats strip */}
          <div className="flex justify-center gap-8 mt-8 text-center">
            {[
              { icon: FiTag,       label: 'Avg Savings',  val: '25%' },
              { icon: FiPackage,   label: 'Active Combos', val: `${bundles.length || '—'}+` },
              { icon: FiShoppingBag, label: 'Happy Buyers', val: '10K+' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-bold">{s.val}</p>
                <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-10">
        <div className="page-container py-3 flex items-center gap-3">
          {[
            { key: 'all',      label: '🛍️ All Bundles' },
            { key: 'featured', label: '⭐ Featured' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => handleFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f.key
                  ? 'bg-gradient-to-br from-pink-400 to-yellow-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
          {!loading && (
            <span className="ml-auto text-xs text-accent-400">
              {bundles.length} bundle{bundles.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="page-container py-10">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <BundleSkeleton key={i} />)}
          </div>
        ) : bundles.length === 0 ? (
          <div className="text-center py-24">
            <FiPackage size={56} className="mx-auto text-gray-200 mb-4" />
            <h2 className="text-xl font-bold text-gray-500 mb-2">No bundles yet</h2>
            <p className="text-gray-400 text-sm mb-6">Check back soon for exciting combo deals!</p>
            <Link to="/products" className="btn-primary px-8 py-3">Browse Products</Link>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {bundles.map(bundle => (
                <BundleCard key={bundle._id} bundle={bundle} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                      page === i + 1
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Bundles;