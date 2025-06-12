'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaTrash, FaArrowLeft, FaCreditCard } from 'react-icons/fa';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import { toastService } from '@/services/toastService';
import {CartItemResponse} from "@/types/cart";
import { cartService } from '@/services/cartService';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemResponse[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);

  const fetchCartData = async () => {
    try {
      setIsLoading(true);
      const items = await cartService.getCart();
      setCartItems(items);
      // Mặc định chọn tất cả các item
      setSelectedItems(items.map(item => item.id));
      calculateTotal(items, items.map(item => item.id));
    } catch (error) {
      console.error('Error fetching cart data:', error);
      toastService.error('Không thể tải dữ liệu giỏ hàng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  const handleRemoveItem = async (id: number) => {
    const success = await cartService.removeFromCart(id);
    
    if (success) {
      fetchCartData();
      // Update cart icon
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const handleClearCart = async () => {
    const success = await cartService.clearCart();
    
    if (success) {
      setCartItems([]);
      setSelectedItems([]);
      setTotalPrice(0);
      // Update cart icon
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toastService.error('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }
    
    // Chuyển hướng đến trang thanh toán sử dụng router của Next.js
    router.push('/checkout');
  };

  // Xử lý chọn/bỏ chọn item
  const toggleSelectItem = (id: number) => {
    setSelectedItems(prev => {
      const newSelected = prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id];
      
      calculateTotal(cartItems, newSelected);
      return newSelected;
    });
  };

  // Xử lý chọn/bỏ chọn tất cả
  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
      setTotalPrice(0);
    } else {
      const allIds = cartItems.map(item => item.id);
      setSelectedItems(allIds);
      calculateTotal(cartItems, allIds);
    }
  };

  // Tính tổng tiền dựa trên các item đã chọn
  const calculateTotal = (items: CartItemResponse[], selectedIds: number[]) => {
    const total = items
      .filter(item => selectedIds.includes(item.id))
      .reduce((sum, item) => sum + item.price, 0);
    setTotalPrice(total);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-screen-xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Giỏ hàng của tôi</h1>
          <Link 
            href="/books" 
            className="flex items-center text-green-600 hover:text-green-800 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            <span>Tiếp tục mua sắm</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-6 p-6 bg-gray-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Giỏ hàng của bạn đang trống</h2>
              <p className="text-gray-500 mb-6">Khám phá các cuốn sách và thêm vào giỏ hàng của bạn</p>
              <Link 
                href="/books" 
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Khám phá sách
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="select-all"
                      checked={selectedItems.length === cartItems.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="select-all" className="ml-2 font-semibold text-lg text-gray-800">
                      Chọn tất cả ({cartItems.length} sách)
                    </label>
                  </div>
                  <button 
                    onClick={handleClearCart}
                    className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center"
                  >
                    <FaTrash className="mr-1" size={14} />
                    <span>Xóa tất cả</span>
                  </button>
                </div>
                
                <ul className="divide-y divide-gray-100">
                  {cartItems.map((item) => (
                    <li key={item.id} className="p-5 flex flex-col sm:flex-row">
                      <div className="flex items-center mr-4">
                        <input
                          type="checkbox"
                          id={`item-${item.id}`}
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                      </div>
                      <div className="flex-shrink-0 w-full sm:w-32 h-32 mb-4 sm:mb-0 bg-gray-50 rounded flex items-center justify-center overflow-hidden relative">
                        {item.thumbnail ? (
                          <Image
                            src={item.thumbnail}
                            alt={item.bookTitle}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="text-gray-400">No image</div>
                        )}
                      </div>
                      
                      <div className="flex-grow sm:ml-6 flex flex-col">
                        <div className="flex flex-col sm:flex-row justify-between mb-2">
                          <Link href={`/books/${item.bookId}`} className="font-medium text-gray-800 hover:text-green-600 transition-colors">
                            {item.bookTitle}
                          </Link>
                          <div className="mt-1 sm:mt-0">
                            {item.priceNew && item.priceNew > item.price ? (
                              <div className="flex flex-col items-end">
                                <span className="text-sm line-through text-gray-400">
                                  {item.priceNew.toLocaleString('vi-VN')}đ
                                </span>
                                <span className="text-lg font-bold text-green-700">
                                  {item.price.toLocaleString('vi-VN')}đ
                                </span>
                              </div>
                            ) : (
                              <div className="text-lg font-bold text-green-700">
                                {item.price.toLocaleString('vi-VN')}đ
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-500 mb-1">
                          Người bán: {item.sellerName || 'Người bán chưa cập nhật'}
                        </div>
                        
                        <div className="text-sm mb-1 flex items-center">
                          <span className="mr-1">Tình trạng:</span>
                          <span className="font-medium">
                            {item.conditionNumber}/5
                          </span>
                        </div>
                        
                        <div className="mt-auto pt-2 flex justify-end">
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-sm p-5 sticky top-20">
                <h2 className="font-semibold text-lg text-gray-800 mb-4">Tổng giỏ hàng</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sản phẩm đã chọn</span>
                    <span className="font-medium">{selectedItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng tiền hàng</span>
                    <span className="font-medium">{totalPrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="font-medium">Miễn phí</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between">
                    <span className="font-semibold">Tổng thanh toán</span>
                    <span className="font-bold text-green-700 text-xl">{totalPrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center ${
                    selectedItems.length > 0 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={selectedItems.length === 0}
                >
                  <FaCreditCard className="mr-2" />
                  <span className="font-medium">Thanh toán ngay</span>
                </button>
                
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
                  <h3 className="text-sm font-medium text-green-800 mb-2">Chính sách mua hàng</h3>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• Miễn phí vận chuyển trong nội thành</li>
                    <li>• Đổi trả trong vòng 3 ngày nếu sách không đúng mô tả</li>
                    <li>• Hỗ trợ đổi trả với các trường hợp sách bị hư hại</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
} 