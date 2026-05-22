import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // const addToCart = (product, quantity = 1) => {
  //   setCartItems(prev => {
  //     const existing = prev.find(item => item._id === product._id);
  //     if (existing) {
  //       const newQty = existing.quantity + quantity;
  //       if (newQty > product.stock) {
  //         toast.error('Cannot add more than available stock');
  //         return prev;
  //       }
  //       toast.success('Cart updated');
  //       return prev.map(item => item._id === product._id ? { ...item, quantity: newQty } : item);
  //     }
  //     if (quantity > product.stock) {
  //       toast.error('Not enough stock available');
  //       return prev;
  //     }
  //     toast.success('Added to cart!');
  //     return [...prev, {
  //       _id: product._id,
  //       name: product.name,
  //       price: product.discountPrice || product.price,
  //       originalPrice: product.price,
  //       image: product.images[0]?.url || '',
  //       stock: product.stock,
  //       slug: product.slug,
  //       quantity
  //     }];
  //   });
  // };

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      // Unique key = productId + color + size
      const cartKey = `${product._id}__${product.selectedColor||''}__${product.selectedSize||''}`;
      const existing = prev.find(item => item.cartKey === cartKey);

      // if (existing) {
      //   const newQty = existing.quantity + quantity;
      //   if (newQty > product.stock) {
      //     toast.error('Cannot add more than available stock');
      //     return prev;
      //   }
      //   toast.success('Cart updated');
      //   return prev.map(item => item.cartKey === cartKey ? { ...item, quantity: newQty } : item);
      // }
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          toast.error('Cannot add more than available stock');
          return prev;
        }
        toast.success('Cart updated');
        // Also update image — user may have selected a different photo
        const updatedImage = product.image || existing.image;
        return prev.map(item =>
          item.cartKey === cartKey
            ? { ...item, quantity: newQty, image: updatedImage }
            : item
        );
      }
      if (quantity > product.stock) {
        toast.error('Not enough stock available');
        return prev;
      }
      toast.success('Added to cart!');
      // Get best image — color image first, then product image
      // const image = product.selectedColorImage || product.images?.[0]?.url || product.image || '';

       // Use image passed from ProductDetail (which is the active gallery image)
      // product.image is set in handleAddToCart to the exact image user sees
      const image = product.image || product.images?.[0]?.url || '';

      return [...prev, {
        _id: product._id,
        cartKey,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        image,
        stock: product.stock,
        slug: product.slug,
        selectedColor: product.selectedColor || null,
        selectedColorHex: product.selectedColorHex || null, // ✅ ADD THIS
        selectedSize:  product.selectedSize  || null,
        quantity
      }];
    });
  };
   const removeFromCart = (cartKey) => {
    setCartItems(prev => prev.filter(item => (item.cartKey || item._id) !== cartKey));
    toast.success('Removed from cart');
  };

  const updateQuantity = (cartKey, quantity) => {
    if (quantity < 1) return removeFromCart(cartKey);
    setCartItems(prev => prev.map(item => {
      if ((item.cartKey || item._id) === cartKey) {
        if (quantity > item.stock) { toast.error('Not enough stock'); return item; }
        return { ...item, quantity };
      }
      return item;
    }));
  }

  // const removeFromCart = (productId) => {
  //   setCartItems(prev => prev.filter(item => item._id !== productId));
  //   toast.success('Removed from cart');
  // };

  

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
  const cartSavings = cartSubtotal - cartTotal;

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount, cartTotal, cartSubtotal, cartSavings
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
