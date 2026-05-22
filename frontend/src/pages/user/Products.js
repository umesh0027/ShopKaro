



import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiChevronDown, FiSearch, FiChevronUp, FiRefreshCw } from 'react-icons/fi';
import { productAPI, categoryAPI } from '../../services/api';
import { getSizesForCategory } from '../../utils/SizeConfig';
import ProductCard from '../../components/common/ProductCard';
import PriceRangeSlider from '../../components/common/PriceRangeSlider';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductCardSkeleton from '../../components/ProductCardSkeleton';

const sortOptions = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price',      label: 'Price: Low to High' },
  { value: '-price',     label: 'Price: High to Low' },
  { value: '-rating',    label: 'Top Rated' },
  { value: '-numReviews',label: 'Most Reviewed' },
];

const ratingOptions = [4, 3, 2, 1];

const PRESET_COLORS = [
  { name: 'Red',    hex: '#ef4444' }, { name: 'Blue',   hex: '#3b82f6' },
  { name: 'Green',  hex: '#22c55e' }, { name: 'Black',  hex: '#171717' },
  { name: 'White',  hex: '#f5f5f5' }, { name: 'Yellow', hex: '#eab308' },
  { name: 'Pink',   hex: '#ec4899' }, { name: 'Purple', hex: '#a855f7' },
  { name: 'Orange', hex: '#f97316' }, { name: 'Grey',   hex: '#9ca3af' },
  { name: 'Brown',  hex: '#92400e' }, { name: 'Navy',   hex: '#1e3a8a' },
];

/* ── Collapsible Section ── */
const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full mb-3 group">
        <span className="font-semibold text-sm text-gray-800 group-hover:text-primary-600 transition-colors">{title}</span>
        {open ? <FiChevronUp size={15} className="text-gray-400"/> : <FiChevronDown size={15} className="text-gray-400"/>}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
};

const ColorSwatch = ({ color, selected, onClick }) => (
  <button onClick={onClick} title={color.name}
    className={`relative w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${selected ? 'border-primary-600 scale-110 shadow-md' : 'border-gray-200 hover:border-gray-400'}`}
    style={{ backgroundColor: color.hex }}>
    {selected && (
      <span className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xs font-bold ${['#f5f5f5','#eab308','#22c55e'].includes(color.hex) ? 'text-gray-800' : 'text-white'}`}>✓</span>
      </span>
    )}
  </button>
);

const SizeBadge = ({ label, selected, onClick }) => (
  <button onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all hover:scale-105 ${selected ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400 hover:text-primary-600'}`}>
    {label}
  </button>
);

/* ── Read filters from URL ── */
const filtersFromParams = (sp) => ({
  search:   sp.get('search')   || '',
  category: sp.get('category') || '',
  minPrice: sp.get('minPrice') ? Number(sp.get('minPrice')) : null,
  maxPrice: sp.get('maxPrice') ? Number(sp.get('maxPrice')) : null,
  rating:   sp.get('rating')   || '',
  sort:     sp.get('sort')     || '-createdAt',
  page:     Number(sp.get('page')) || 1,
  inStock:  sp.get('inStock')  || '',
  featured: sp.get('featured') || '',
  colors:   sp.get('colors')   || '',
  sizes:    sp.get('sizes')    || '',
});

/* ══════════════════════════════════════
   MAIN PRODUCTS PAGE
══════════════════════════════════════ */
const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Single source of truth — filters from URL ──
  const [filters, setFilters] = useState(() => filtersFromParams(searchParams));

  // Products state
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter options (price range, colors, sizes from API)
  const [filterOptions, setFilterOptions]     = useState({ priceRange: { min: 0, max: 10000 }, colors: [], sizes: [] });
  const [optionsLoading, setOptionsLoading]   = useState(false);
  const [currentCategoryObj, setCategoryObj]  = useState(null);
  const [categoryTree, setCategoryTree]       = useState([]);

  // Slider local state (commit debounced to avoid API spam)
  const [sliderVal, setSliderVal]   = useState([0, 10000]);
  const sliderTimer = useRef(null);

  // AbortController to cancel in-flight requests
  const abortRef = useRef(null);

  // ── Sync URL → filters (when browser back/forward or navbar link) ──
  useEffect(() => {
    setFilters(filtersFromParams(searchParams));
  }, [searchParams]);

  // ── Fetch products (cancel previous request first) ──
  const fetchProducts = useCallback(async (f) => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const params = { sort: f.sort, page: f.page, limit: 12 };
      if (f.search)             params.search   = f.search;
      if (f.category)           params.category = f.category;
      if (f.minPrice !== null)  params.minPrice = f.minPrice;
      if (f.maxPrice !== null)  params.maxPrice = f.maxPrice;
      if (f.rating)             params.rating   = f.rating;
      if (f.inStock)            params.inStock  = f.inStock;
      if (f.featured)           params.featured = f.featured;
      if (f.colors)             params.colors   = f.colors;
      if (f.sizes)              params.sizes    = f.sizes;

      const { data } = await productAPI.getAll(params);
      if (!controller.signal.aborted) {
        setProducts(data.products);
        setTotal(data.total);
        setPages(data.pages);
      }
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error('Products fetch error:', err.message);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  // ── Fetch filter options + category object ──
  const fetchOptions = useCallback(async (categorySlug) => {
    setOptionsLoading(true);
    try {
      // Run both requests in parallel — single batch
      const [filterRes, catRes] = await Promise.all([
        productAPI.getFilterOptions({ category: categorySlug || undefined }),
        categoryAPI.getAll({ flat: true }),
      ]);

      const opts = filterRes.data;
      setFilterOptions(opts);

      const allCats = catRes.data.categories || catRes.data.flat || [];
      const catObj  = categorySlug ? allCats.find(c => c.slug === categorySlug) || null : null;
      setCategoryObj(catObj);

      // Reset slider to new price range
      setSliderVal([opts.priceRange.min, opts.priceRange.max]);
    } catch (err) {
      console.error('Options fetch error:', err.message);
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  // ── Load category tree once on mount ──
  useEffect(() => {
    categoryAPI.getAll({ active: true })
      .then(r => setCategoryTree(r.data.categories || []))
      .catch(() => {});
  }, []); // ← only once

  // ── When category changes — reload filter options ──
  // Separate from products fetch to avoid race condition
  const prevCategory = useRef(null);
  useEffect(() => {
    if (filters.category !== prevCategory.current) {
      prevCategory.current = filters.category;
      fetchOptions(filters.category);
    }
  }, [filters.category, fetchOptions]);

  // ── When filters change — fetch products (debounced 300ms) ──
  const fetchTimer = useRef(null);
  useEffect(() => {
    clearTimeout(fetchTimer.current);
    fetchTimer.current = setTimeout(() => fetchProducts(filters), 300);
    return () => clearTimeout(fetchTimer.current);
  }, [filters, fetchProducts]);

  // ── Initial options load ──
  useEffect(() => {
    fetchOptions(filters.category);
  }, []); // ← only once on mount

  // ── Update URL when filters change (debounced to avoid history spam) ──
  const urlTimer = useRef(null);
  useEffect(() => {
    clearTimeout(urlTimer.current);
    urlTimer.current = setTimeout(() => {
      const params = {};
      if (filters.search)            params.search   = filters.search;
      if (filters.category)          params.category = filters.category;
      if (filters.minPrice !== null) params.minPrice = filters.minPrice;
      if (filters.maxPrice !== null) params.maxPrice = filters.maxPrice;
      if (filters.rating)            params.rating   = filters.rating;
      if (filters.sort !== '-createdAt') params.sort = filters.sort;
      if (filters.page > 1)          params.page     = filters.page;
      if (filters.inStock)           params.inStock  = filters.inStock;
      if (filters.colors)            params.colors   = filters.colors;
      if (filters.sizes)             params.sizes    = filters.sizes;
      setSearchParams(params, { replace: true });
    }, 200);
    return () => clearTimeout(urlTimer.current);
  }, [filters]); // ← don't include setSearchParams (stable ref)

  // ── Helpers ──
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, ...(key !== 'page' && { page: 1 }) }));
  }, []);

  const selectedColors = filters.colors ? filters.colors.split(',').filter(Boolean) : [];
  const selectedSizes  = filters.sizes  ? filters.sizes.split(',').filter(Boolean)  : [];

  const toggleColor = useCallback((name) => {
    const next = selectedColors.includes(name)
      ? selectedColors.filter(c => c !== name)
      : [...selectedColors, name];
    updateFilter('colors', next.join(','));
  }, [selectedColors, updateFilter]);

  const toggleSize = useCallback((label) => {
    const next = selectedSizes.includes(label)
      ? selectedSizes.filter(s => s !== label)
      : [...selectedSizes, label];
    updateFilter('sizes', next.join(','));
  }, [selectedSizes, updateFilter]);

  // Slider — only commit to filter after user stops dragging (400ms)
  const handleSliderChange = useCallback((range) => {
    setSliderVal(range);
    clearTimeout(sliderTimer.current);
    sliderTimer.current = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        minPrice: range[0] === filterOptions.priceRange.min ? null : range[0],
        maxPrice: range[1] === filterOptions.priceRange.max ? null : range[1],
        page: 1,
      }));
    }, 400);
  }, [filterOptions.priceRange]);

  const clearAllFilters = useCallback(() => {
    setFilters(prev => ({
      search: '', category: prev.category, minPrice: null, maxPrice: null,
      rating: '', sort: '-createdAt', page: 1, inStock: '', featured: '',
      colors: '', sizes: '',
    }));
    setSliderVal([filterOptions.priceRange.min, filterOptions.priceRange.max]);
  }, [filterOptions.priceRange]);

  const hasActiveFilters = !!(
    filters.minPrice !== null || filters.maxPrice !== null ||
    filters.rating || filters.search || filters.inStock ||
    filters.colors || filters.sizes
  );

  // Merge preset colors + API colors
  const allColors = [...PRESET_COLORS];
  filterOptions.colors.forEach(c => {
    if (!allColors.find(p => p.name.toLowerCase() === c.name.toLowerCase())) allColors.push(c);
  });

  // Dynamic sizes from category sizeType
  const categorySizes = getSizesForCategory(currentCategoryObj);
  const allSizes = filterOptions.sizes.length ? filterOptions.sizes : categorySizes;

  /* ── Filter Panel ── */
  const FilterPanel = () => (
    <div className="space-y-0">
      {/* Search */}
      <FilterSection title="Search">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
          <input type="text" value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            placeholder="Search products..." className="input-field pl-9 text-sm py-2"/>
        </div>
      </FilterSection>

      {/* Category — hierarchical */}
      <FilterSection title="Category">
        <button onClick={() => updateFilter('category', '')}
          className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium mb-1 transition-colors ${!filters.category ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          All Products
        </button>
        {categoryTree.map(parent => (
          <div key={parent._id} className="mb-2">
            <p className="text-xs font-bold text-accent-400 uppercase tracking-wider px-3 py-1">{parent.name}</p>
            {parent.subCategories?.length > 0 ? (
              <div className="space-y-0.5">
                {parent.subCategories.map(child => (
                  <button key={child._id} onClick={() => updateFilter('category', child.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center justify-between group ${filters.category === child.slug ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-accent-400 transition-colors"/>
                      {child.name}
                    </span>
                    <span className="text-xs text-gray-400">{child.productCount || 0}</span>
                  </button>
                ))}
              </div>
            ) : (
              <button onClick={() => updateFilter('category', parent.slug)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex justify-between ${filters.category === parent.slug ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                <span>{parent.name}</span>
                <span className="text-xs text-gray-400">{parent.productCount || 0}</span>
              </button>
            )}
          </div>
        ))}
      </FilterSection>

      {/* Price Range Slider */}
      <FilterSection title="Price Range">
        {optionsLoading ? (
          // <div className="h-10 flex items-center justify-center">
          //   <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin"/>
          // </div>
           <div className="space-y-2">
    <div className="h-3 w-1/2 rounded skeleton"></div>
    <div className="h-3 w-2/3 rounded skeleton"></div>
    <div className="h-3 w-1/3 rounded skeleton"></div>
  </div>
        ) : (
          <PriceRangeSlider
            min={filterOptions.priceRange.min}
            max={filterOptions.priceRange.max}
            value={sliderVal}
            onChange={handleSliderChange}
            step={filterOptions.priceRange.max > 5000 ? 100 : 50}
          />
        )}
      </FilterSection>

      {/* Colors */}
      <FilterSection title="Color">
        <div className="flex flex-wrap gap-2">
          {allColors.map(color => (
            <ColorSwatch key={color.name} color={color}
              selected={selectedColors.includes(color.name)}
              onClick={() => toggleColor(color.name)}/>
          ))}
        </div>
        {selectedColors.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selectedColors.map(c => (
              <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs font-medium border border-primary-200">
                {c}<button onClick={() => toggleColor(c)} className="hover:text-red-500">×</button>
              </span>
            ))}
          </div>
        )}
      </FilterSection>

      {/* Sizes — dynamic from category */}
      <FilterSection title="Size">
        {allSizes.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">
            {!filters.category ? 'Select a category to see sizes' : 'No sizes for this category'}
          </p>
        ) : (
          <>
            {currentCategoryObj?.sizeType && currentCategoryObj.sizeType !== 'none' && (
              <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider">
                {currentCategoryObj.sizeType === 'bottomwear' ? 'Waist (inches)'
                  : currentCategoryObj.sizeType === 'footwear' ? 'UK Size'
                  : currentCategoryObj.sizeType === 'clothing' ? 'Clothing Size' : 'Size'}
              </p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {allSizes.map(size => (
                <SizeBadge key={size} label={size}
                  selected={selectedSizes.includes(size)}
                  onClick={() => toggleSize(size)}/>
              ))}
            </div>
          </>
        )}
        {selectedSizes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selectedSizes.map(s => (
              <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs font-medium border border-primary-200">
                {s}<button onClick={() => toggleSize(s)} className="hover:text-red-500">×</button>
              </span>
            ))}
          </div>
        )}
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Minimum Rating">
        <div className="space-y-1">
          {ratingOptions.map(r => (
            <button key={r} onClick={() => updateFilter('rating', filters.rating == r ? '' : r)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center justify-between ${filters.rating == r ? 'bg-amber-50 text-amber-700 font-semibold border border-amber-200' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span className="text-base">{'★'.repeat(r)}{'☆'.repeat(5 - r)}</span>
              <span className="text-xs text-gray-500">& above</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability" defaultOpen={false}>
        <label className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-gray-50">
          <div className={`w-10 h-5 rounded-full transition-colors relative ${filters.inStock === 'true' ? 'bg-primary-600' : 'bg-gray-300'}`}
            onClick={() => updateFilter('inStock', filters.inStock === 'true' ? '' : 'true')}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.inStock === 'true' ? 'translate-x-5' : 'translate-x-0.5'}`}/>
          </div>
          <span className="text-sm font-medium text-gray-700">In Stock Only</span>
        </label>
      </FilterSection>

      {hasActiveFilters && (
        <button onClick={clearAllFilters}
          className="w-full mt-2 py-2.5 rounded-xl text-sm font-semibold text-red-600 border-2 border-red-100 hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
          <FiRefreshCw size={14}/> Clear All Filters
        </button>
      )}
    </div>
  );

  /* ── Active Chips ── */
  const chips = [];
  if (filters.minPrice !== null || filters.maxPrice !== null)
    chips.push({ label: `₹${(filters.minPrice ?? filterOptions.priceRange.min).toLocaleString()} – ₹${(filters.maxPrice ?? filterOptions.priceRange.max).toLocaleString()}`, clear: () => { updateFilter('minPrice', null); updateFilter('maxPrice', null); setSliderVal([filterOptions.priceRange.min, filterOptions.priceRange.max]); } });
  selectedColors.forEach(c => chips.push({ label: c, clear: () => toggleColor(c) }));
  selectedSizes.forEach(s  => chips.push({ label: `Size: ${s}`, clear: () => toggleSize(s) }));
  if (filters.rating)  chips.push({ label: `${filters.rating}★+`, clear: () => updateFilter('rating','') });
  if (filters.inStock) chips.push({ label: 'In Stock', clear: () => updateFilter('inStock','') });

  return (
    <div className="pt-20 pb-16 bg-gray-50 min-h-screen">
      <div className="page-container py-8">
        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-2 flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">
              {filters.search
                ? `"${filters.search}"`
                : filters.category
                  ? (currentCategoryObj?.name || 'Products')
                  : 'All Products'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? 'Loading...' : `${total} product${total !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}
                className="input-field text-sm py-2 pr-8 appearance-none cursor-pointer min-w-44">
                {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14}/>
            </div>
            <button onClick={() => setFiltersOpen(true)}
              className="lg:hidden btn-secondary py-2 px-4 text-sm flex items-center gap-2">
              <FiFilter size={15}/> Filters
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary-600"/>}
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {chips.map((chip, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold border border-primary-200">
                {chip.label}
                <button onClick={chip.clear} className="hover:text-red-500 text-base leading-none">&times;</button>
              </span>
            ))}
            <button onClick={clearAllFilters} className="text-xs text-red-500 font-semibold px-2 py-1 rounded-full hover:bg-red-50">
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-7">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-gray-900">Filters</h2>
                {hasActiveFilters && (
                  <button onClick={clearAllFilters} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear all</button>
                )}
              </div>
              <FilterPanel/>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              // <div className="flex items-center justify-center h-64"><LoadingSpinner/></div>
               <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
    {[...Array(12)].map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <p className="text-5xl mb-4">🔍</p>
                <h3 className="font-display text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters</p>
                <button onClick={clearAllFilters} className="btn-primary">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {products.map(product => <ProductCard key={product._id} product={product}/>)}
                </div>
                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                    <button onClick={() => updateFilter('page', filters.page - 1)} disabled={filters.page === 1}
                      className="btn-secondary py-2 px-5 text-sm disabled:opacity-50">← Prev</button>
                    {[...Array(Math.min(pages, 7))].map((_, i) => {
                      let p = pages <= 7 ? i + 1 : filters.page <= 4 ? i + 1 : filters.page >= pages - 3 ? pages - 6 + i : filters.page - 3 + i;
                      return (
                        <button key={p} onClick={() => updateFilter('page', p)}
                          className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors ${filters.page === p ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
                          {p}
                        </button>
                      );
                    })}
                    <button onClick={() => updateFilter('page', filters.page + 1)} disabled={filters.page === pages}
                      className="btn-secondary py-2 px-5 text-sm disabled:opacity-50">Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFiltersOpen(false)}/>
          <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-display font-bold text-lg">Filters</h2>
              <button onClick={() => setFiltersOpen(false)} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center">
                <FiX size={18}/>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4"><FilterPanel/></div>
            <div className="px-5 py-4 border-t border-gray-100">
              <button onClick={() => setFiltersOpen(false)} className="btn-primary w-full py-3">
                Show {total} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;