import React, { useEffect, useState } from 'react';
import { categoryAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  FiShoppingCart, FiHeart
} from 'react-icons/fi';

const UserCategories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryAPI.getAll({ active: true })
      .then(res => setCategories(res.data.categories))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="pt-4 pb-16 bg-gray-50 min-h-screen">
      <div className="page-container">
        
        <div className='flex justify-between items-center mb-6'> 
            <p className=" font-semibold ">Shop by Categories</p>
          <div className="flex items-center ">
            {[
                          
                              { to: '/wishlist', icon: FiHeart, label: 'Wishlist' },
                              { to: '/cart', icon:  FiShoppingCart, label: 'Cart' },
                            ].map(item => (
                              <Link key={item.to} to={item.to} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm text-gray-700">
                                <item.icon size={20} className="text-gray-600 font-semibold" />
                                {/* {item.label} */}
                              </Link>
                            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map(cat => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.slug}`}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-center"
            >
              <div className="w-full h-32 mb-3 rounded-xl overflow-hidden bg-gray-100">
                {cat.image?.url ? (
                  <img
                    src={cat.image.url}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-3xl">🛍️</span>
                  </div>
                )}
              </div>

              <p className="font-semibold text-sm text-gray-800">
                {cat.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserCategories;