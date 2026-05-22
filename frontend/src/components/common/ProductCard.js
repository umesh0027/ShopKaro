// import React from 'react';
// import { Link } from 'react-router-dom';
// import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
// import { HiHeart } from 'react-icons/hi2';
// import { useCart } from '../../context/CartContext';
// import { useAuth } from '../../context/AuthContext';
// import { userAPI } from '../../services/api';
// import toast from 'react-hot-toast';

// const ProductCard = ({ product, onWishlistToggle, isWishlisted = false }) => {
//   const { addToCart } = useCart();

//   const { isLoggedIn,isAdmin } = useAuth();

//   const handleWishlist = async (e) => {
//     e.preventDefault();
//     if (!isLoggedIn) { toast.error('Please login to add to wishlist'); return; }
//     try {
//       await userAPI.toggleWishlist(product._id);
//       onWishlistToggle?.(product._id);
//     } catch (err) {
//       toast.error('Failed to update wishlist');
//     }
//   };

//   const handleAddToCart = (e) => {
//     e.preventDefault();
//      if (isAdmin) {
//     toast.error('Admin cannot add items to cart');
//     return;
//   }
//     if (product.stock === 0) return;
    
//     addToCart(product);
//   };

//   const discount = product.discountPrice
//     ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
//     : 0;

//   return (
//     <Link to={`/products/${product.slug || product._id}`} className="product-card block">
//       {/* Image */}
//       <div className="relative aspect-square overflow-hidden bg-gray-50">
//         <img
//           src={product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image'}
//           alt={product.name}
//           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//           loading="lazy"
//         />
//         {discount > 0 && (
//           <span className="absolute top-3 left-3 badge bg-red-500 text-white">{discount}% OFF</span>
//         )}
//         {product.stock === 0 && (
//           <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
//             <span className="bg-white text-gray-800 font-semibold text-sm px-3 py-1 rounded-full">Out of Stock</span>
//           </div>
//         )}
//         {/* Actions overlay */}
//         {/* <div className=" flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"> */}
//           <button
//             onClick={handleWishlist}
//             className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-red-50 transition-colors"
//           >
//             {isWishlisted
//               ? <HiHeart className="text-red-500" size={16} />
//               : <FiHeart className="text-gray-600" size={14} />
//             }
//           </button>
//           { product.stock > 0 && (
//             <button
//               onClick={handleAddToCart}
//               className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-primary-50 transition-colors"
//             >
//               <FiShoppingCart className="text-primary-600" size={14} />
//             </button>
//           )}
//         </div>
//       {/* </div> */}

//       {/* Info */}
//       <div className="p-4">
//         {product.category && (
//           <p className="text-xs text-primary-600 font-medium mb-1 uppercase tracking-wide">{product.category.name}</p>
//         )}
//         <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors">
//           {product.name}
//         </h3>

//         {/* Rating */}
//         {product.numReviews > 0 && (
//           <div className="flex items-center gap-1 mb-2">
//             <div className="flex">
//               {[1, 2, 3, 4, 5].map(star => (
//                 <FiStar
//                   key={star}
//                   size={12}
//                   className={star <= Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
//                 />
//               ))}
//             </div>
//             <span className="text-xs text-gray-500">({product.numReviews})</span>
//           </div>
//         )}

//         {/* Price */}
//         <div className="flex items-center gap-2">
//           <span className="font-bold text-gray-900">
//             ₹{(product.discountPrice || product.price).toLocaleString()}
//           </span>
//           {product.discountPrice && (
//             <span className="text-sm text-gray-400 line-through">
//               ₹{product.price.toLocaleString()}
//             </span>
//           )}
//         </div>

//         {/* Add to cart button */}
//         <button
//           onClick={handleAddToCart}
//           disabled={product.stock === 0}
//           className="mt-3 w-full py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
//             bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white active:scale-95"
//         >
//           {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
//         </button>
//       </div>
//     </Link>
//   );
// };

// export default ProductCard;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { HiHeart } from 'react-icons/hi2';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ProductCard = ({ product, onWishlistToggle, isWishlisted = false }) => {
  const { addToCart } = useCart();
  const { isLoggedIn, isAdmin } = useAuth();

  // ✅ Local state — instant UI feedback
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error('Please login to add to wishlist');
      return;
    }

    setWishlistLoading(true);
    try {
      await userAPI.toggleWishlist(product._id);
      const newState = !wishlisted;
      setWishlisted(newState);
      toast.success(newState ? 'Added to wishlist!' : 'Removed from wishlist');
      onWishlistToggle?.(product._id);
    } catch (err) {
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdmin) { toast.error('Admin cannot add items to cart'); return; }
    if (product.stock === 0) return;
    addToCart(product);
    // toast.success('Added to cart!');
  };

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <Link to={`/products/${product.slug || product._id}`} className="product-card block">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 badge bg-red-500 text-white">
            {discount}% OFF
          </span>
        )}

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 font-semibold text-sm px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* ✅ Heart button — hamesha visible, top-right */}
        {!isAdmin && (
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 z-10 ${
              wishlisted
                ? 'bg-red-50 border border-red-200'
                : 'bg-white/90 border border-gray-100'
            } ${wishlistLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {wishlistLoading ? (
              <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
            ) : wishlisted ? (
              <HiHeart className="text-red-500" size={17} />
            ) : (
              <FiHeart className="text-gray-500" size={15} />
            )}
          </button>
        )}

        {/* Cart icon — hover pe, bottom-right */}
        {product.stock > 0 && !isAdmin && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary-50 hover:scale-110 active:scale-95 border border-gray-100"
          >
            <FiShoppingCart className="text-primary-600" size={14} />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {product.category && (
          <p className="text-xs text-primary-600 font-medium mb-1 uppercase tracking-wide">
            {product.category.name}
          </p>
        )}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.numReviews > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <FiStar
                  key={star}
                  size={12}
                  className={star <= Math.round(product.rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200 fill-gray-200'}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.numReviews})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">
            ₹{(product.discountPrice || product.price).toLocaleString()}
          </span>
          {product.discountPrice && (
            <span className="text-sm text-gray-400 line-through">
              ₹{product.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to cart button */}
        {/* <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="mt-3 w-full py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-br from-pink-200 to-yellow-500  hover:bg-primary-600 hover:text-white active:scale-95"
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button> */}
      </div>
    </Link>
  );
};

export default ProductCard;