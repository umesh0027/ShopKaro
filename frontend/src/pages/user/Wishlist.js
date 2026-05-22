import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart,FiX} from 'react-icons/fi';

import { userAPI } from '../../services/api';
import ProductCard from '../../components/common/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getWishlist().then(r => setWishlist(r.data.wishlist)).finally(() => setLoading(false));
  }, []);

  const handleToggle = (productId) => { // Remove from wishlist
    setWishlist(prev => prev.filter(p => p._id !== productId));
  };

  return (
    <div className="pt-20 pb-16 bg-gray-50 min-h-screen">
      <div className="page-container py-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">My Wishlist ({wishlist.length})</h1>
        {loading ? <LoadingSpinner /> : wishlist.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiHeart size={36} className="text-red-300" />
            </div>
            <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Wishlist is empty</h3>
            <p className="text-gray-500 mb-6">Save items you love to your wishlist</p>
            <Link to="/products" className="btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* {wishlist.map(product => (
              <ProductCard key={product._id} product={product} isWishlisted={true} onWishlistToggle={handleToggle} />
              
                      
    
            ))} */}


            {wishlist.map(product => (
  <div key={product._id} className="relative">
    
    {/* ❌ Remove Button */}
    {/* <button
      onClick={async () => {
        try {
          await userAPI.toggleWishlist(product._id); // backend se bhi remove
          handleToggle(product._id); // UI update
        } catch (err) {
          console.error(err);
        }
      }}
      className="absolute top-2 right-2 z-10 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50 transition"
    >
      <FiX className="text-gray-600 hover:text-red-500" />
    </button> */}

    <ProductCard
      product={product}
      isWishlisted={true}
      onWishlistToggle={handleToggle}
    />
  </div>
))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
