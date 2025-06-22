"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cartService } from '@/services/cartService';
import { FaShoppingCart } from 'react-icons/fa';

const CartIcon: React.FC = () => {
  const [itemCount, setItemCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const fetchCartCount = async () => {
    try {
      setIsLoading(true);
      const count = await cartService.getCartItemCount();
      setItemCount(count);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCartCount();
    
    // Custom event listener for cart updates within the same tab
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  return (
    <Link href="/cart" className="relative group ml-4">
      <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20">
        <FaShoppingCart className="text-xl text-white group-hover:text-green-200 transition-colors" />
      </div>
      {!isLoading && itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md border border-white/30 transition-transform group-hover:scale-110">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
};

export default CartIcon; 