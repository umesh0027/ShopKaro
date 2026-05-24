// // pages/user/BundleDetail.jsx
// // Route: /bundles/:id  →  single bundle detail page

// import React, { useState, useEffect, useContext } from 'react';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import {
//   FiShoppingCart, FiPackage, FiChevronRight,
//   FiTruck, FiShield, FiRefreshCw, FiCheck, FiArrowLeft
// } from 'react-icons/fi';
// import { HiSparkles } from 'react-icons/hi2';
// import { bundleAPI } from '../../services/api'; // adjust path
// import { useCart } from '../../context/CartContext';
// import { useAuth } from '../../context/AuthContext';
// import LoadingSpinner from '../../components/common/LoadingSpinner';
// import toast from 'react-hot-toast';

// /* ── Shimmer ── */
// const Shimmer = ({ className }) => (
//   <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
// );

// const BundleDetailSkeleton = () => (
//   <div className="pt-16 min-h-screen bg-gray-50">
//     <div className="page-container py-10">
//       <div className="grid lg:grid-cols-2 gap-10">
//         {/* Left */}
//         <div className="space-y-3">
//           <Shimmer className="w-full h-80 rounded-2xl" />
//           <div className="grid grid-cols-3 gap-2">
//             {[...Array(3)].map((_, i) => <Shimmer key={i} className="h-24 rounded-xl" />)}
//           </div>
//         </div>
//         {/* Right */}
//         <div className="space-y-4">
//           <Shimmer className="h-6 w-24 rounded-full" />
//           <Shimmer className="h-8 w-3/4" />
//           <Shimmer className="h-4 w-full" />
//           <Shimmer className="h-4 w-2/3" />
//           <Shimmer className="h-20 w-full rounded-2xl" />
//           <Shimmer className="h-14 w-full rounded-2xl" />
//         </div>
//       </div>
//     </div>
//   </div>
// );

// /* ── Product row in bundle ── */
// const ProductRow = ({ item }) => {
//   const p     = item.product;
//   const price = p.discountPrice > 0 ? p.discountPrice : p.price;

//   return (
//     <Link
//       to={`/products/${p.slug || p._id}`}
//       className="flex items-center gap-4 p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-primary-200 hover:shadow-md transition-all group"
//     >
//       {/* Image */}
//       <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0">
//         <img
//           src={p.images?.[0]?.url}
//           alt={p.name}
//           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//         />
//       </div>

//       {/* Info */}
//       <div className="flex-1 min-w-0">
//         <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-primary-600 transition-colors">
//           {p.name}
//         </p>
//         <div className="flex items-center gap-2 mt-0.5">
//           <span className="text-sm font-bold text-gray-800">₹{price.toLocaleString()}</span>
//           {p.discountPrice > 0 && (
//             <span className="text-xs text-gray-400 line-through">₹{p.price.toLocaleString()}</span>
//           )}
//           {item.quantity > 1 && (
//             <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
//               ×{item.quantity}
//             </span>
//           )}
//         </div>
//         {p.discountPercent > 0 && (
//           <span className="text-xs text-green-600 font-semibold">{p.discountPercent}% off</span>
//         )}
//       </div>

//       <FiChevronRight size={16} className="text-gray-300 group-hover:text-primary-400 shrink-0 transition-colors" />
//     </Link>
//   );
// };

// /* ══════════════════════════════════════
//    MAIN COMPONENT
// ══════════════════════════════════════ */
// const BundleDetail = () => {
//   const { id }       = useParams();
//   const navigate     = useNavigate();
//   const { addToCart } = useCart();
//   const { isLoggedIn } = useAuth();

//   const [bundle, setBundle]   = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [adding, setAdding]   = useState(false);
//   const [added, setAdded]     = useState(false);

//   useEffect(() => {
//     setLoading(true);
//     bundleAPI.getOne(id)
//       .then(({ data }) => setBundle(data.bundle))
//       .catch(() => navigate('/bundles', { replace: true }))
//       .finally(() => setLoading(false));
//   }, [id]);

//   if (loading) return <BundleDetailSkeleton />;
//   if (!bundle) return null;

//   const { name, description, products = [], bundlePrice, originalPrice, savingsAmount, savingsPercent, image, tags = [] } = bundle;

//   /* ── Add all bundle products to cart ── */
//   const handleAddBundle = async () => {
//     if (!isLoggedIn) {
//       toast.error('Please login to add to cart');
//       navigate('/login');
//       return;
//     }
//     setAdding(true);
//     try {
//       for (const item of products) {
//         addToCart(item.product, item.quantity);
//         // small delay so cart state updates properly
//         await new Promise(r => setTimeout(r, 80));
//       }
//       setAdded(true);
//       toast.success(`🛍️ ${products.length} items added to cart!`);
//       setTimeout(() => setAdded(false), 3000);
//     } catch {
//       toast.error('Failed to add bundle to cart');
//     } finally {
//       setAdding(false);
//     }
//   };

//   return (
//     <div className="pt-16 min-h-screen bg-gray-50">
//       {/* Breadcrumb */}
//       <div className="bg-white border-b border-gray-100">
//         <div className="page-container py-3 flex items-center gap-2 text-sm text-gray-500">
//           <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
//           <FiChevronRight size={13} />
//           <Link to="/bundles" className="hover:text-primary-600 transition-colors">Combo Offers</Link>
//           <FiChevronRight size={13} />
//           <span className="text-gray-800 font-medium truncate max-w-xs">{name}</span>
//         </div>
//       </div>

//       <div className="page-container py-10">
//         <div className="grid lg:grid-cols-2 gap-10 items-start">

//           {/* ── LEFT — Images ── */}
//           <div className="space-y-3">
//             {/* Main image / product collage */}
//             {image?.url ? (
//               <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-white shadow-sm">
//                 <img src={image.url} alt={name} className="w-full h-full object-cover" />
//               </div>
//             ) : (
//               <div className="rounded-2xl overflow-hidden bg-white shadow-sm p-3 aspect-[4/3]">
//                 <div className={`grid h-full gap-2 ${products.length === 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'}`}>
//                   {products.slice(0, 4).map((item, i) => (
//                     <div
//                       key={i}
//                       className={`rounded-xl overflow-hidden bg-gray-50 ${i === 0 && products.length >= 3 ? 'row-span-2' : ''}`}
//                     >
//                       <img
//                         src={item.product?.images?.[0]?.url}
//                         alt={item.product?.name}
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Individual product thumbnails */}
//             {products.length > 1 && (
//               <div className={`grid gap-2 ${products.length <= 4 ? `grid-cols-${products.length}` : 'grid-cols-4'}`}>
//                 {products.slice(0, 4).map((item, i) => (
//                   <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
//                     <img
//                       src={item.product?.images?.[0]?.url}
//                       alt={item.product?.name}
//                       className="w-full h-full object-cover"
//                     />
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* ── RIGHT — Info ── */}
//           <div className="space-y-5">
//             {/* Badge row */}
//             <div className="flex flex-wrap gap-2">
//               <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
//                 <FiPackage size={11} /> COMBO OFFER
//               </span>
//               {bundle.isFeatured && (
//                 <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
//                   <HiSparkles size={11} /> Featured
//                 </span>
//               )}
//               <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
//                 {savingsPercent}% OFF
//               </span>
//             </div>

//             {/* Title */}
//             <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
//               {name}
//             </h1>
//             {description && (
//               <p className="text-gray-500 leading-relaxed">{description}</p>
//             )}

//             {/* Savings highlight box */}
//             <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
//               <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">
//                 🎉 Bundle Savings
//               </p>
//               <div className="flex items-end gap-3">
//                 <span className="text-3xl font-bold text-gray-900">₹{bundlePrice?.toLocaleString()}</span>
//                 <span className="text-lg text-gray-400 line-through pb-0.5">₹{originalPrice?.toLocaleString()}</span>
//               </div>
//               <p className="text-green-700 font-semibold text-sm mt-1">
//                 You save ₹{savingsAmount?.toLocaleString()} ({savingsPercent}% off) on this bundle!
//               </p>
//             </div>

//             {/* Products in bundle */}
//             <div>
//               <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//                 <FiPackage size={16} className="text-primary-600" />
//                 What's in this bundle ({products.length} items)
//               </h3>
//               <div className="space-y-2">
//                 {products.map((item, i) => (
//                   <ProductRow key={i} item={item} />
//                 ))}
//               </div>
//             </div>

//             {/* Tags */}
//             {tags.length > 0 && (
//               <div className="flex flex-wrap gap-2">
//                 {tags.map(t => (
//                   <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">{t}</span>
//                 ))}
//               </div>
//             )}

//             {/* Add to cart button */}
//             <button
//               onClick={handleAddBundle}
//               disabled={adding || added}
//               className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base transition-all active:scale-95 shadow-sm ${
//                 added
//                   ? 'bg-green-500 text-white shadow-green-200'
//                   : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-primary-200'
//               }`}
//             >
//               {adding ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                   Adding {products.length} items...
//                 </>
//               ) : added ? (
//                 <>
//                   <FiCheck size={20} />
//                   {products.length} Items Added to Cart!
//                 </>
//               ) : (
//                 <>
//                   <FiShoppingCart size={20} />
//                   Add Bundle to Cart — ₹{bundlePrice?.toLocaleString()}
//                 </>
//               )}
//             </button>

//             {/* Trust signals */}
//             <div className="grid grid-cols-3 gap-3">
//               {[
//                 { icon: FiTruck,      label: 'Free Delivery', sub: 'Above ₹499' },
//                 { icon: FiShield,     label: 'Secure Payment', sub: '100% Safe' },
//                 { icon: FiRefreshCw,  label: 'Easy Returns', sub: '7 Days' },
//               ].map(t => (
//                 <div key={t.label} className="flex flex-col items-center text-center p-3 bg-white rounded-xl border border-gray-100">
//                   <t.icon size={18} className="text-primary-600 mb-1" />
//                   <p className="text-xs font-semibold text-gray-800">{t.label}</p>
//                   <p className="text-xs text-gray-400">{t.sub}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* ── Back link ── */}
//         <div className="mt-10 pt-6 border-t border-gray-200">
//           <Link to="/bundles"
//             className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors font-medium group">
//             <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
//             Back to all Combo Offers
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BundleDetail;



import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiShoppingCart, FiPackage, FiChevronRight,
  FiTruck, FiShield, FiRefreshCw, FiCheck, FiArrowLeft
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { bundleAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

/* ══════════════════════════════════════
   VARIANT SELECTOR — per product
══════════════════════════════════════ */
const VariantSelector = ({ product, selection, onChange }) => {
  const { variantType, colors = [], sizes = [] } = product;

  // Available sizes — depends on selected color (for 'both') or global sizes
  const availableSizes =
    variantType === 'both' && selection.color?.sizes?.length
      ? selection.color.sizes
      : sizes;

  if (variantType === 'none') return null;

  return (
    <div className="mt-3 space-y-3 bg-indigo-50 border border-indigo-100 rounded-xl p-3">

      {/* Color picker */}
      {(variantType === 'color' || variantType === 'both') && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">
            Color
            {selection.color && (
              <span className="ml-1 text-indigo-600">— {selection.color.name}</span>
            )}
            <span className="text-red-500 ml-0.5">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map(color => (
              <button
                key={color.name}
                title={color.name}
                onClick={() =>
                  onChange({
                    ...selection,
                    color,
                    size: null   // reset size when color changes
                  })
                }
                className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                  selection.color?.name === color.name
                    ? 'border-indigo-600 scale-110 shadow-md'
                    : 'border-white shadow-sm'
                }`}
                style={{ backgroundColor: color.hex || '#ccc' }}
              >
                {selection.color?.name === color.name && (
                  <span className="flex items-center justify-center w-full h-full text-xs font-bold text-white">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size picker */}
      {(variantType === 'size' || variantType === 'both') && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">
            Size
            {selection.size && (
              <span className="ml-1 text-indigo-600">— {selection.size}</span>
            )}
            <span className="text-red-500 ml-0.5">*</span>
          </p>
          {availableSizes.length === 0 && variantType === 'both' && !selection.color ? (
            <p className="text-xs text-amber-600">Select a color first to see sizes</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map(s => {
                const label = s.label ?? s;
                const outOfStock = (s.stock ?? 999) === 0;
                return (
                  <button
                    key={label}
                    disabled={outOfStock}
                    onClick={() => onChange({ ...selection, size: label })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border-2 transition-all ${
                      outOfStock
                        ? 'border-gray-100 text-gray-300 cursor-not-allowed line-through'
                        : selection.size === label
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════
   PRODUCT ROW — with inline variant selector
══════════════════════════════════════ */
const ProductRow = ({ item, selection, onSelectionChange }) => {
  const p = item.product;
  const price = p.discountPrice > 0 ? p.discountPrice : p.price;
  const needsVariant = p.variantType !== 'none';

  // Validation indicator
  const isValid = (() => {
    if (!needsVariant) return true;
    if ((p.variantType === 'color' || p.variantType === 'both') && !selection?.color) return false;
    if ((p.variantType === 'size'  || p.variantType === 'both') && !selection?.size)  return false;
    return true;
  })();

  return (
    <div className={`border-2 rounded-2xl overflow-hidden transition-all ${
      needsVariant && !isValid
        ? 'border-amber-200 bg-amber-50/30'
        : isValid && needsVariant
        ? 'border-green-200 bg-green-50/20'
        : 'border-gray-100 bg-white'
    }`}>
      {/* Product info row */}
      <div className="flex items-center gap-3 p-4">
        <Link to={`/products/${p.slug || p._id}`} className="shrink-0">
          <img
            src={
              selection?.color?.images?.[0]?.url ||
              p.images?.[0]?.url || ''
            }
            alt={p.name}
            className="w-14 h-14 rounded-xl object-cover bg-gray-100 hover:scale-105 transition-transform"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/products/${p.slug || p._id}`}
            className="font-semibold text-gray-900 text-sm truncate hover:text-primary-600 transition-colors block">
            {p.name}
          </Link>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-bold text-gray-800">₹{price.toLocaleString()}</span>
            {p.discountPrice > 0 && (
              <span className="text-xs text-gray-400 line-through">₹{p.price.toLocaleString()}</span>
            )}
            {item.quantity > 1 && (
              <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                ×{item.quantity}
              </span>
            )}
          </div>

          {/* Variant summary */}
          {needsVariant && (
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {selection?.color && (
                <span className="inline-flex items-center gap-1 text-xs bg-white border border-gray-200 rounded-full px-2 py-0.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: selection.color.hex || '#ccc' }} />
                  {selection.color.name}
                </span>
              )}
              {selection?.size && (
                <span className="text-xs bg-white border border-gray-200 rounded-full px-2 py-0.5">
                  Size: {selection.size}
                </span>
              )}
              {isValid ? (
                <span className="text-xs text-green-600 font-semibold flex items-center gap-0.5">
                  <FiCheck size={10} /> Selected
                </span>
              ) : (
                <span className="text-xs text-amber-600 font-semibold">
                  ⚠ Select variant
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Variant selector — inline */}
      {needsVariant && (
        <div className="px-4 pb-4">
          <VariantSelector
            product={p}
            selection={selection || {}}
            onChange={onSelectionChange}
          />
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════
   SKELETON
══════════════════════════════════════ */
const Shimmer = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);
const Skeleton = () => (
  <div className="pt-16 min-h-screen bg-gray-50">
    <div className="page-container py-10">
      <div className="grid lg:grid-cols-2 gap-10">
        <div className="space-y-3">
          <Shimmer className="w-full h-80 rounded-2xl" />
          <div className="grid grid-cols-3 gap-2">
            {[...Array(3)].map((_, i) => <Shimmer key={i} className="h-24 rounded-xl" />)}
          </div>
        </div>
        <div className="space-y-4">
          <Shimmer className="h-6 w-24 rounded-full" />
          <Shimmer className="h-8 w-3/4" />
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-32 w-full rounded-2xl" />
          <Shimmer className="h-14 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */
const BundleDetail = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();

  const [bundle, setBundle]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);
  const [added,   setAdded]   = useState(false);

  // selections[productId] = { color: colorObj | null, size: string | null }
  const [selections, setSelections] = useState({});

  useEffect(() => {
    setLoading(true);
    bundleAPI.getOne(id)
      .then(({ data }) => {
        // console.log("daata",data.bundle);
        setBundle(data.bundle);
         
        // Init selections for each product
        const init = {};
        (data.bundle?.products || []).forEach(item => {
            // console.log("PRODUCT:", item.product); 
          init[item.product._id] = { color: null, size: null };
        });
        setSelections(init);
      })
      .catch(() => navigate('/bundles', { replace: true }))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Skeleton />;
  if (!bundle)  return null;

  const { name, description, products = [], bundlePrice, originalPrice, savingsAmount, savingsPercent, image, tags = [] } = bundle;

  /* ── Validate all selections before add ── */
  const validateAll = () => {
    for (const item of products) {
      const p   = item.product;
      const sel = selections[p._id] || {};
      if (p.variantType === 'color' || p.variantType === 'both') {
        if (!sel.color) {
          toast.error(`Select a color for "${p.name.split(' ').slice(0, 3).join(' ')}"`);
          return false;
        }
      }
      if (p.variantType === 'size' || p.variantType === 'both') {
        if (!sel.size) {
          toast.error(`Select a size for "${p.name.split(' ').slice(0, 3).join(' ')}"`);
          return false;
        }
      }
    }
    return true;
  };

  /* ── Add bundle to cart ── */
  // const handleAddBundle = () => {
  //   // if (!isLoggedIn) { toast.error('Please login to add to cart'); navigate('/login'); return; }
  //   if (!validateAll()) return;

  //   setAdding(true);
  //   try {
  //     for (const item of products) {
  //       const p   = item.product;
  //       const sel = selections[p._id] || {};

  //       // Get price — size override or color+size override first, else discountPrice or price
  //       let finalPrice = p.discountPrice > 0 ? p.discountPrice : p.price;
  //       if (sel.size && p.variantType !== 'none') {
  //         // check size price override from selectedColor.sizes or global sizes
  //         const sizesArr = sel.color?.sizes?.length ? sel.color.sizes : p.sizes;
  //         const sizeObj  = sizesArr?.find(s => (s.label ?? s) === sel.size);
  //         if (sizeObj?.price) finalPrice = sizeObj.price;
  //       }

  //       // Stock
  //       let stock = p.stock;
  //       if (sel.size) {
  //         const sizesArr = sel.color?.sizes?.length ? sel.color.sizes : p.sizes;
  //         const sizeObj  = sizesArr?.find(s => (s.label ?? s) === sel.size);
  //         if (sizeObj?.stock !== undefined) stock = sizeObj.stock;
  //       } else if (sel.color) {
  //         stock = sel.color.stock ?? p.stock;
  //       }

  //       // Image — color image first
  //       const cartImage =
  //         sel.color?.images?.[0]?.url ||
  //         p.images?.[0]?.url || '';

  //       addToCart({
  //         ...p,
  //         price:            finalPrice,
  //         originalPrice:    p.price,
  //         selectedColor:    sel.color?.name   || null,
  //         selectedColorHex: sel.color?.hex    || null,
  //         selectedSize:     sel.size          || null,
  //         stock,
  //         image:            cartImage,
  //       }, item.quantity);
  //     }

  //     setAdded(true);
  //     toast.success(`🛍️ ${products.length} items added to cart!`);
  //     setTimeout(() => setAdded(false), 3000);
  //   } catch {
  //     toast.error('Something went wrong');
  //   } finally {
  //     setAdding(false);
  //   }
  // };


  const handleAddBundle = () => {
  if (!validateAll()) return;

  setAdding(true);
  try {
    const bundleItem = {
      _id: bundle._id,
      cartKey: `bundle__${bundle._id}_${Date.now()}`, // unique
      type: 'bundle', // 🔥 IMPORTANT
      name: bundle.name,
      price: bundle.bundlePrice,
      originalPrice: bundle.originalPrice,
      image: bundle.image?.url || products[0]?.product?.images?.[0]?.url,

      quantity: 1,

      products: products.map(item => {
        const p = item.product;
        const sel = selections[p._id] || {};

        return {
          _id: p._id,
          name: p.name,
          price: p.discountPrice > 0 ? p.discountPrice : p.price,
          quantity: item.quantity,

          selectedColor: sel.color?.name || null,
          selectedColorHex: sel.color?.hex || null,
          selectedSize: sel.size || null,

          image: sel.color?.images?.[0]?.url || p.images?.[0]?.url
        };
      })
    };

    addToCart(bundleItem, 1); // 🔥 SINGLE ADD

    toast.success('🎁 Bundle added to cart!');
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);

  } catch {
    toast.error('Something went wrong');
  } finally {
    setAdding(false);
  }
};
  /* ── Check if all variants selected ── */
  const allSelected = products.every(item => {
    const p   = item.product;
    const sel = selections[p._id] || {};
    if ((p.variantType === 'color' || p.variantType === 'both') && !sel.color) return false;
    if ((p.variantType === 'size'  || p.variantType === 'both') && !sel.size)  return false;
    return true;
  });

  const needsAnyVariant = products.some(i => i.product.variantType !== 'none');

  return (
    <div className="pt-16 min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="page-container py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <FiChevronRight size={13} />
          <Link to="/bundles" className="hover:text-primary-600 transition-colors">Combo Offers</Link>
          <FiChevronRight size={13} />
          <span className="text-gray-800 font-medium truncate max-w-xs">{name}</span>
        </div>
      </div>

      <div className="page-container py-10">
        <div className="grid lg:grid-cols-2 gap-10 items-start">

          {/* ── LEFT — Image collage ── */}
          <div className="space-y-3">
            {image?.url ? (
              <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-white shadow-sm">
                <img src={image.url} alt={name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden bg-white shadow-sm p-3 aspect-[4/3]">
                <div className={`grid h-full gap-2 ${products.length === 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'}`}>
                  {products.slice(0, 4).map((item, i) => {
                    const sel = selections[item.product._id] || {};
                    const img = sel.color?.images?.[0]?.url || item.product?.images?.[0]?.url;
                    return (
                      <div key={i}
                        className={`rounded-xl overflow-hidden bg-gray-50 ${i === 0 && products.length >= 3 ? 'row-span-2' : ''}`}>
                        <img src={img} alt={item.product?.name} className="w-full h-full object-cover" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Thumbnails */}
            {products.length > 1 && (
              <div className={`grid gap-2 grid-cols-${Math.min(products.length, 4)}`}>
                {products.slice(0, 4).map((item, i) => {
                  const sel = selections[item.product._id] || {};
                  const img = sel.color?.images?.[0]?.url || item.product?.images?.[0]?.url;
                  return (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
                      <img src={img} alt={item.product?.name} className="w-full h-full object-cover" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── RIGHT — Info + Variant selectors ── */}
          <div className="space-y-5">

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                <FiPackage size={11} /> COMBO OFFER
              </span>
              {bundle.isFeatured && (
                <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
                  <HiSparkles size={11} /> Featured
                </span>
              )}
              <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                {savingsPercent}% OFF
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{name}</h1>
            {description && <p className="text-gray-500 leading-relaxed">{description}</p>}

            {/* Savings box */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">🎉 Bundle Savings</p>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-gray-900">₹{bundlePrice?.toLocaleString()}</span>
                <span className="text-lg text-gray-400 line-through pb-0.5">₹{originalPrice?.toLocaleString()}</span>
              </div>
              <p className="text-green-700 font-semibold text-sm mt-1">
                You save ₹{savingsAmount?.toLocaleString()} ({savingsPercent}% off) on this bundle!
              </p>
            </div>

            {/* Products + variant selectors */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FiPackage size={16} className="text-primary-600" />
                {products.length} items in this bundle
                {needsAnyVariant && (
                  <span className="text-xs text-gray-400 font-normal ml-1">
                    — select size/color for each
                  </span>
                )}
              </h3>

              <div className="space-y-3">
                {products.map((item) => (
                  <ProductRow
                    key={item.product._id}
                    item={item}
                    selection={selections[item.product._id] || {}}
                    onSelectionChange={(sel) =>
                      setSelections(prev => ({ ...prev, [item.product._id]: sel }))
                    }
                  />
                ))}
              </div>
            </div>

            {/* All selected indicator */}
            {needsAnyVariant && (
              <div className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all ${
                allSelected
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {allSelected
                  ? <><FiCheck size={15} /> All variants selected — ready to add!</>
                  : <>⚠️ Please select color/size for all products above</>
                }
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(t => (
                  <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">{t}</span>
                ))}
              </div>
            )}

            {/* CTA button */}
            <button
              onClick={handleAddBundle}
              disabled={adding}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base transition-all active:scale-95 shadow-sm ${
                added
                  ? 'bg-green-500 text-white shadow-green-200'
                  : !allSelected && needsAnyVariant
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-br from-pink-400 to-yellow-500  text-white shadow-primary-200'
              }`}
            >
              {adding ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding {products.length} items...
                </>
              ) : added ? (
                <><FiCheck size={20} /> {products.length} Items Added to Cart!</>
              ) : (
                <><FiShoppingCart size={20} /> Add Bundle to Cart — ₹{bundlePrice?.toLocaleString()}</>
              )}
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: FiTruck,     label: 'Free Delivery', sub: 'Above ₹499' },
                { icon: FiShield,    label: 'Secure Payment', sub: '100% Safe' },
                { icon: FiRefreshCw, label: 'Easy Returns',  sub: '7 Days' },
              ].map(t => (
                <div key={t.label} className="flex flex-col items-center text-center p-3 bg-white rounded-xl border border-gray-100">
                  <t.icon size={18} className="text-primary-600 mb-1" />
                  <p className="text-xs font-semibold text-gray-800">{t.label}</p>
                  <p className="text-xs text-gray-400">{t.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <Link to="/bundles"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors font-medium group">
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Back to all Combo Offers
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BundleDetail;