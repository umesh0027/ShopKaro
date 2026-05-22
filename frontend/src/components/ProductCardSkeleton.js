import React from 'react';

const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-3">
      {/* Image */}
      <div className="w-full h-40 rounded-xl mb-3 skeleton"></div>

      {/* Title */}
      <div className="h-4 rounded w-3/4 mb-2 skeleton"></div>

      {/* Price */}
      <div className="h-4 rounded w-1/2 mb-2 skeleton"></div>

      {/* Rating */}
      <div className="h-3 rounded w-1/3 skeleton"></div>
    </div>
  );
};

export default ProductCardSkeleton;