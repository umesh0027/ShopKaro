// pages/admin/Bundles.jsx
import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiToggleLeft, FiToggleRight, FiPackage, FiSearch } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { bundleAPI } from '../../services/api';   // adjust path
import { productAPI } from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', description: '', bundlePrice: '',
  isFeatured: false, tags: ''
};

const AdminBundles = () => {
  const [bundles, setBundles]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving]       = useState(false);

  const [form, setForm]           = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Product search for adding to bundle
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  // selectedProducts = [{ product: {...full product obj}, quantity: 1 }]

  // Live total shown in form
  const originalTotal = selectedProducts.reduce((sum, item) => {
    const p = item.product;
    const price = p.discountPrice > 0 ? p.discountPrice : p.price;
    return sum + price * item.quantity;
  }, 0);
  const savings = originalTotal - Number(form.bundlePrice || 0);
  const savingsPct = originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 0;

  /* ── fetch ── */
  const fetchBundles = async () => {
    setLoading(true);
    try {
      const { data } = await bundleAPI.getAdmin();
      setBundles(data.bundles || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchBundles(); }, []);

  /* ── product search ── */
  useEffect(() => {
    if (!productSearch.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const { data } = await productAPI.getAll({ search: productSearch, limit: 8 });
        setSearchResults(data.products || []);
      } catch { setSearchResults([]); }
    }, 400);
    return () => clearTimeout(t);
  }, [productSearch]);

  const addProduct = (product) => {
    if (selectedProducts.find(i => i.product._id === product._id)) {
      toast('Already added!'); return;
    }
    setSelectedProducts(p => [...p, { product, quantity: 1 }]);
    setProductSearch('');
    setSearchResults([]);
  };

  const removeProduct = (id) => setSelectedProducts(p => p.filter(i => i.product._id !== id));
  const updateQty = (id, qty) =>
    setSelectedProducts(p => p.map(i => i.product._id === id ? { ...i, quantity: Math.max(1, qty) } : i));

  /* ── image ── */
  const handleImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  /* ── reset ── */
  const resetForm = () => {
    setForm(EMPTY_FORM); setImageFile(null); setImagePreview('');
    setSelectedProducts([]); setEditingId(null); setShowForm(false);
    setProductSearch(''); setSearchResults([]);
  };

  /* ── edit ── */
  const handleEdit = (bundle) => {
    setForm({
      name: bundle.name,
      description: bundle.description || '',
      bundlePrice: bundle.bundlePrice,
      isFeatured: bundle.isFeatured,
      tags: (bundle.tags || []).join(', ')
    });
    setImagePreview(bundle.image?.url || '');
    setSelectedProducts(
      (bundle.products || []).map(item => ({
        product: item.product,
        quantity: item.quantity || 1
      }))
    );
    setEditingId(bundle._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedProducts.length < 2) {
      toast.error('Add at least 2 products to a bundle'); return;
    }
    if (!form.bundlePrice || Number(form.bundlePrice) <= 0) {
      toast.error('Set a valid bundle price'); return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('bundlePrice', form.bundlePrice);
      fd.append('isFeatured', form.isFeatured);
      fd.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
      fd.append('products', JSON.stringify(
        selectedProducts.map(i => ({ product: i.product._id, quantity: i.quantity }))
      ));
      if (imageFile) fd.append('image', imageFile);

      if (editingId) {
        await bundleAPI.update(editingId, fd);
        toast.success('Bundle updated!');
      } else {
        await bundleAPI.create(fd);
        toast.success('Bundle created!');
      }
      resetForm();
      fetchBundles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete bundle "${name}"?`)) return;
    try {
      await bundleAPI.delete(id);
      toast.success('Bundle deleted');
      fetchBundles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleToggle = async (id) => {
    try { await bundleAPI.toggle(id); fetchBundles(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiPackage className="text-primary-600" /> Bundles & Combos
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {bundles.length} bundle{bundles.length !== 1 ? 's' : ''} · "Frequently Bought Together" style offers
          </p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5">
          <FiPlus size={16} /> New Bundle
        </button>
      </div>

      {/* ── Form ── */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border-2 border-primary-100">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-semibold text-gray-900 text-lg">
              {editingId ? 'Edit Bundle' : 'Create Bundle'}
            </h2>
            <button onClick={resetForm} className="p-1.5 hover:bg-gray-100 rounded-lg"><FiX size={16} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bundle Name *</label>
                  <input required value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder='e.g. "Complete Summer Look", "Gaming Starter Pack"'
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea rows={2} value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="What makes this bundle special..."
                    className="input-field resize-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma separated)</label>
                  <input value={form.tags}
                    onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                    placeholder="summer, fashion, combo"
                    className="input-field text-sm" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors">
                  <input type="checkbox" checked={form.isFeatured}
                    onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 rounded" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Featured Bundle</p>
                    <p className="text-xs text-gray-400">Show on homepage</p>
                  </div>
                </label>

                {/* Bundle image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bundle Image (optional)</label>
                  <label className="block border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary-300 transition-colors overflow-hidden">
                    {imagePreview ? (
                      <div className="relative h-32">
                        <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white text-sm font-medium">Change</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-32 flex flex-col items-center justify-center gap-1.5">
                        <FiUpload size={20} className="text-gray-400" />
                        <p className="text-sm text-gray-500">Upload bundle image</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Right — Products + Pricing */}
              <div className="space-y-4">
                {/* Product search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Add Products * (min 2)
                  </label>
                  <div className="relative">
                    <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      placeholder="Search product by name..."
                      className="input-field pl-9 text-sm"
                    />
                    {/* Dropdown results */}
                    {searchResults.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                        {searchResults.map(p => (
                          <button
                            key={p._id}
                            type="button"
                            onClick={() => addProduct(p)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary-50 transition-colors text-left"
                          >
                            <img src={p.images?.[0]?.url} alt={p.name}
                              className="w-9 h-9 rounded-lg object-cover shrink-0 bg-gray-100" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                              <p className="text-xs text-gray-400">
                                ₹{(p.discountPrice > 0 ? p.discountPrice : p.price).toLocaleString()}
                              </p>
                            </div>
                            <FiPlus size={14} className="text-primary-600 shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected products */}
                {selectedProducts.length > 0 ? (
                  <div className="space-y-2">
                    {selectedProducts.map((item) => {
                      const p = item.product;
                      const price = p.discountPrice > 0 ? p.discountPrice : p.price;
                      return (
                        <div key={p._id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <img src={p.images?.[0]?.url} alt={p.name}
                            className="w-11 h-11 rounded-xl object-cover bg-white shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                            <p className="text-xs text-gray-500">
                              ₹{price.toLocaleString()} × {item.quantity} = ₹{(price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                              <button type="button"
                                onClick={() => updateQty(p._id, item.quantity - 1)}
                                className="px-2 py-1 text-gray-500 hover:bg-gray-50 text-sm font-bold">−</button>
                              <span className="px-2 text-sm font-semibold">{item.quantity}</span>
                              <button type="button"
                                onClick={() => updateQty(p._id, item.quantity + 1)}
                                className="px-2 py-1 text-gray-500 hover:bg-gray-50 text-sm font-bold">+</button>
                            </div>
                            <button type="button" onClick={() => removeProduct(p._id)}
                              className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                              <FiX size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400">
                    <FiPackage size={28} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Search and add products above</p>
                  </div>
                )}

                {/* Bundle Price + Live savings */}
                <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-4 border border-primary-100">
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-0.5">Original Total</p>
                      <p className="text-lg font-bold text-gray-400 line-through">
                        ₹{originalTotal.toLocaleString()}
                      </p>
                    </div>
                    {savingsPct > 0 && (
                      <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        {savingsPct}% OFF
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                      Bundle Price (₹) *
                    </label>
                    <input
                      required type="number" min="1"
                      value={form.bundlePrice}
                      onChange={e => setForm(p => ({ ...p, bundlePrice: e.target.value }))}
                      placeholder="Set bundle price lower than total"
                      className="input-field font-bold text-lg"
                    />
                  </div>
                  {savings > 0 && (
                    <p className="text-green-700 font-semibold text-sm mt-2 flex items-center gap-1.5">
                      <HiSparkles /> Customer saves ₹{savings.toLocaleString()} ({savingsPct}% off)
                    </p>
                  )}
                  {form.bundlePrice && Number(form.bundlePrice) >= originalTotal && originalTotal > 0 && (
                    <p className="text-amber-600 text-xs mt-1.5 bg-amber-50 px-3 py-1.5 rounded-lg">
                      ⚠️ Bundle price should be lower than original total for customers to see savings
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button type="submit" disabled={saving} className="btn-primary py-2.5 px-8">
                {saving ? 'Saving...' : editingId ? 'Update Bundle' : 'Create Bundle'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary py-2.5 px-6">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Bundle list ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : bundles.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FiPackage size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-gray-500">No bundles yet</p>
          <p className="text-sm mt-1">Create your first "Frequently Bought Together" bundle</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {bundles.map(bundle => (
            <div key={bundle._id}
              className={`bg-white rounded-2xl overflow-hidden shadow-sm border-2 transition-all ${bundle.isActive ? 'border-transparent' : 'border-gray-100 opacity-70'}`}>
              {/* Image or product grid */}
              <div className="h-36 bg-gray-50 overflow-hidden relative">
                {bundle.image?.url ? (
                  <img src={bundle.image.url} alt={bundle.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid grid-cols-3 gap-1 p-2">
                    {(bundle.products || []).slice(0, 3).map((item, i) => (
                      <div key={i} className="rounded-lg overflow-hidden bg-white">
                        <img src={item.product?.images?.[0]?.url} alt=""
                          className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                {bundle.isFeatured && (
                  <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <HiSparkles size={10} /> Featured
                  </span>
                )}
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {bundle.savingsPercent}% OFF
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1 truncate">{bundle.name}</h3>
                {bundle.description && (
                  <p className="text-xs text-gray-400 mb-2 line-clamp-1">{bundle.description}</p>
                )}

                {/* Products list */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {(bundle.products || []).map((item, i) => (
                    <span key={i}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                      {item.product?.name?.split(' ').slice(0, 5).join(' ')}
                      {item.quantity > 1 ? ` ×${item.quantity}` : ''}
                    </span>
                  ))}
                </div>

                {/* Pricing */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-lg font-bold text-gray-900">₹{bundle.bundlePrice?.toLocaleString()}</span>
                  <span className="text-sm text-gray-400 line-through">₹{bundle.originalPrice?.toLocaleString()}</span>
                  <span className="text-xs text-green-600 font-bold">Save ₹{bundle.savingsAmount?.toLocaleString()}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(bundle)}
                    className="flex-1 btn-secondary py-1.5 text-xs flex items-center justify-center gap-1">
                    <FiEdit2 size={11} /> Edit
                  </button>
                  <button onClick={() => handleToggle(bundle._id)}
                    className={`p-2 rounded-xl transition-colors ${bundle.isActive ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100'}`}>
                    {bundle.isActive ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                  </button>
                  <button onClick={() => handleDelete(bundle._id, bundle.name)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBundles;