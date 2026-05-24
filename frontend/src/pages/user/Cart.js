// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight, FiTag } from 'react-icons/fi';
// import { useCart } from '../../context/CartContext';
// import { useAuth } from '../../context/AuthContext';

// const Cart = () => {
//   const { cartItems, removeFromCart, updateQuantity, cartTotal, cartSubtotal, cartSavings, cartCount } = useCart();
//   const { isLoggedIn } = useAuth();
//   const navigate = useNavigate();

//   const tax = Math.round(cartTotal * 0.18);
//   const shipping = cartTotal > 499 ? 0 : 49;
//   const grandTotal = cartTotal + tax + shipping;

//   if (cartItems.length === 0) {
//     return (
//       <div className="pt-20 min-h-screen flex items-center justify-center">
//         <div className="text-center animate-fade-in">
//           <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
//             <FiShoppingBag size={40} className="text-white" />
//           </div>
//           <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
//           <p className="text-gray-500 mb-8">Looks like you haven't added anything yet</p>
//           <Link to="/products" className="btn-primary inline-flex items-center gap-2">
//             Start Shopping <FiArrowRight />
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="pt-20 pb-16">
//       <div className="page-container py-8">
//         <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">
//           Shopping Cart <span className="text-primary-600">({cartCount})</span>
//         </h1>

//         <div className="grid lg:grid-cols-3 gap-8">
//           {/* Cart Items */}
//           <div className="lg:col-span-2 space-y-4">
//             {cartItems.map(item => (
//               <div key={item._id} className="card flex gap-4 animate-fade-in">
                

                 
//                   <Link to={`/products/${item.slug || item._id}`} className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                 
//                   <img
//                     src={
//                       // item.image is set from ProductDetail's cartImage (active gallery image)
//                       typeof item.image === 'string' ? item.image
//                       : item.image?.url
//                       || 'https://via.placeholder.com/100x100?text=Product'
//                     }
//                     alt={item.name}
//                     className="w-full h-full object-cover hover:scale-105 transition-transform"
//                     onError={e => { e.target.src = 'https://via.placeholder.com/100x100?text=Product'; }}
//                   />

//                 </Link>


//                 <div className="flex-1 min-w-0">
//                   <Link to={`/products/${item.slug || item._id}`}>
//                     <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 text-sm sm:text-base">{item.name}</h3>
//                   </Link>

//                   {/* Color + Size badges */}
//                   {(item.selectedColor || item.selectedSize) && (
//                     <div className="flex gap-2 mt-1 flex-wrap">
//                       {item.selectedColor && (
//                         <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
//                           <span className="w-2.5 h-2.5 rounded-full border border-gray-300" style={{backgroundColor: item.selectedColorHex || '#ccc'}} />
//                           {item.selectedColor}
//                         </span>
//                       )}
//                       {item.selectedSize && (
//                         <span className="inline-flex items-center text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
//                           Size: {item.selectedSize}
//                         </span>
//                       )}
//                     </div>
//                   )}

//                   <div className="flex items-center gap-2 mt-1.5">
//                     <span className="font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
//                     {item.originalPrice > item.price && (
//                       <span className="text-sm text-gray-400 line-through">₹{item.originalPrice.toLocaleString()}</span>
//                     )}
//                   </div>

//                   <div className="flex items-center justify-between mt-3">
//                     <div className="flex items-center border border-gray-200 rounded-xl">
//                       <button onClick={() => updateQuantity(item.cartKey || item._id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-l-xl transition-colors text-gray-600">
//                         <FiMinus size={14} />
//                       </button>
//                       <span className="w-10 text-center font-semibold text-sm">{item.quantity}</span>
//                       <button onClick={() => updateQuantity(item.cartKey || item._id, item.quantity + 1)} disabled={item.quantity >= item.stock} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-r-xl transition-colors text-gray-600 disabled:opacity-40">
//                         <FiPlus size={14} />
//                       </button>
//                     </div>

//                     <div className="flex items-center gap-3">
//                       <span className="font-bold text-primary-600">₹{(item.price * item.quantity).toLocaleString()}</span>
//                       <button onClick={() => removeFromCart(item.cartKey || item._id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
//                         <FiTrash2 size={16} />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Order Summary */}
//           <div className="lg:col-span-1">
//             <div className="card sticky top-24">
//               <h2 className="font-display font-bold text-lg text-gray-900 mb-6">Order Summary</h2>

//               <div className="space-y-3 text-sm">
//                 <div className="flex justify-between text-gray-600">
//                   <span>Subtotal ({cartCount} items)</span>
//                   <span>₹{cartSubtotal.toLocaleString()}</span>
//                 </div>
//                 {cartSavings > 0 && (
//                   <div className="flex justify-between text-green-600">
//                     <span>Discount Savings</span>
//                     <span>-₹{cartSavings.toLocaleString()}</span>
//                   </div>
//                 )}
//                 <div className="flex justify-between text-gray-600">
//                   <span>GST (18%)</span>
//                   <span>₹{tax.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-gray-600">
//                   <span>Shipping</span>
//                   {shipping === 0
//                     ? <span className="text-green-600 font-medium">FREE</span>
//                     : <span>₹{shipping}</span>
//                   }
//                 </div>
//                 {shipping > 0 && (
//                   <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
//                     Add ₹{(499 - cartTotal).toLocaleString()} more for free shipping
//                   </p>
//                 )}
//                 <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base text-gray-900">
//                   <span>Total</span>
//                   <span>₹{grandTotal.toLocaleString()}</span>
//                 </div>
//               </div>

//               {cartSavings > 0 && (
//                 <div className="mt-4 flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-xl text-sm">
//                   <FiTag size={14} />
//                   <span>You save ₹{cartSavings.toLocaleString()} on this order!</span>
//                 </div>
//               )}

//               <button
//                 onClick={() => isLoggedIn ? navigate('/checkout') : navigate('/login')}
//                 className="btn-primary w-full mt-6 flex items-center justify-center gap-2 py-3.5"
//               >
//                 {isLoggedIn ? 'Proceed to Checkout' : 'Login to Checkout'}
//                 <FiArrowRight />
//               </button>

//               <Link to="/products" className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-3 font-medium">
//                 ← Continue Shopping
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Cart;



import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight, FiTag } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartSubtotal, cartSavings, cartCount } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const tax = Math.round(cartTotal * 0.18);
  const shipping = cartTotal > 499 ? 0 : 49;
  const grandTotal = cartTotal + tax + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiShoppingBag size={40} className="text-white" />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything yet</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            Start Shopping <FiArrowRight />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16">
      <div className="page-container py-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">
          Shopping Cart <span className="text-primary-600">({cartCount})</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
           



            {
              cartItems.map(item=>(
                item.type === 'bundle' ? (

    // 🔥 BUNDLE CARD
    <div key={item.cartKey} className="card p-4 space-y-3 border-2 border-primary-100">

      <h3 className="font-bold text-lg text-gray-900">
        🎁 {item.name}
      </h3>

      {/* bundle products */}
      <div className="space-y-2">
        {item.products.map(p => (
          <div key={`${p._id}_${p.selectedColor || ''}_${p.selectedSize || ''}`} className="flex items-center gap-3 text-sm">

            <img src={p.image} className="w-10 h-10 rounded-lg object-cover" />

            <div className="flex-1">
              <p className="font-medium">{p.name}</p>

            {(p.selectedColor || p.selectedSize) && (
  <div className="flex gap-2 mt-1 flex-wrap">

    {/* ✅ COLOR BADGE WITH BACKGROUND DOT */}
    {p.selectedColor && (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
        <span
          className="w-2.5 h-2.5 rounded-full border border-gray-300"
          style={{ backgroundColor: p.selectedColorHex || '#ccc' }}
        />
        {p.selectedColor}
      </span>
    )}

    {/* ✅ SIZE BADGE */}
    {p.selectedSize && (
      <span className="inline-flex items-center text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
        Size: {p.selectedSize}
      </span>
    )}

  </div>
)}
            </div>

            <span>×{p.quantity}</span>
          </div>
        ))}
      </div>

      {/* bundle total */}
      <div className="flex justify-between items-center border-t pt-2">
        <span className="font-bold text-primary-600">
          ₹{item.price.toLocaleString()}
        </span>

        <button
          onClick={() => removeFromCart(item.cartKey)}
          className="text-red-400"
        >
          <FiTrash2 />
        </button>
      </div>
    </div>

  ) : ( <div key={item.cartKey || item._id} className="card flex gap-4 animate-fade-in">
                

                 
                  <Link to={`/products/${item.slug || item._id}`} className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                 
                  <img
                    src={
                      // item.image is set from ProductDetail's cartImage (active gallery image)
                      typeof item.image === 'string' ? item.image
                      : item.image?.url
                      || 'https://via.placeholder.com/100x100?text=Product'
                    }
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                    onError={e => { e.target.src = 'https://via.placeholder.com/100x100?text=Product'; }}
                  />

                </Link>


                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.slug || item._id}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 text-sm sm:text-base">{item.name}</h3>
                  </Link>

                  {/* Color + Size badges */}
                  {(item.selectedColor || item.selectedSize) && (
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {item.selectedColor && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                          <span className="w-2.5 h-2.5 rounded-full border border-gray-300" style={{backgroundColor: item.selectedColorHex || '#ccc'}} />
                          {item.selectedColor}
                        </span>
                      )}
                      {item.selectedSize && (
                        <span className="inline-flex items-center text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
                          Size: {item.selectedSize}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
                    {item.originalPrice > item.price && (
                      <span className="text-sm text-gray-400 line-through">₹{item.originalPrice.toLocaleString()}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-xl">
                      <button onClick={() => updateQuantity(item.cartKey || item._id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-l-xl transition-colors text-gray-600">
                        <FiMinus size={14} />
                      </button>
                      <span className="w-10 text-center font-semibold text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartKey || item._id, item.quantity + 1)} disabled={item.quantity >= item.stock} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-r-xl transition-colors text-gray-600 disabled:opacity-40">
                        <FiPlus size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary-600">₹{(item.price * item.quantity).toLocaleString()}</span>
                      <button onClick={() => removeFromCart(item.cartKey || item._id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>)
              ))
            }
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="font-display font-bold text-lg text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>₹{cartSubtotal.toLocaleString()}</span>
                </div>
                {cartSavings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount Savings</span>
                    <span>-₹{cartSavings.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  {shipping === 0
                    ? <span className="text-green-600 font-medium">FREE</span>
                    : <span>₹{shipping}</span>
                  }
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    Add ₹{(499 - cartTotal).toLocaleString()} more for free shipping
                  </p>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base text-gray-900">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {cartSavings > 0 && (
                <div className="mt-4 flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-xl text-sm">
                  <FiTag size={14} />
                  <span>You save ₹{cartSavings.toLocaleString()} on this order!</span>
                </div>
              )}

              <button
                onClick={() => isLoggedIn ? navigate('/checkout') : navigate('/login')}
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2 py-3.5"
              >
                {isLoggedIn ? 'Proceed to Checkout' : 'Login to Checkout'}
                <FiArrowRight />
              </button>

              <Link to="/products" className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-3 font-medium">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

