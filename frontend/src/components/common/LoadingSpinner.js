// LoadingSpinner.js
import React from 'react';
import { HiSparkles } from 'react-icons/hi2';
import { MdStore } from 'react-icons/md';
import { BsShop } from 'react-icons/bs';

const LoadingSpinner = ({ fullScreen = false, size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-yellow-500 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
          <BsShop className="text-white text-2xl" />
        </div>
        <div className="w-8 h-8 border-3 border-accent-200 border-t-accent-600 rounded-full animate-spin"></div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizes[size]} border-2 border-accent-400 border-t-accent-600 rounded-full animate-spin`}></div>
    </div>
  );
};

export default LoadingSpinner;
