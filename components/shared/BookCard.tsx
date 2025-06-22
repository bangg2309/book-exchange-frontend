'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaShoppingCart, FaEye } from 'react-icons/fa';
import { Book } from '@/services/bookService';
import { cartService } from '@/services/cartService';
import { toastService } from '@/services/toastService';

// Convert condition number to readable text and percentage
const getConditionInfo = (conditionNumber: number) => {
  const conditions: Record<number, string> = {
    1: 'Kém',
    2: 'Trung bình',
    3: 'Khá',
    4: 'Tốt',
    5: 'Mới'
  };
  
  const conditionText = conditions[conditionNumber] || 'Không xác định';
  const conditionPercent = (conditionNumber / 5) * 100;
  
  return { text: conditionText, percent: conditionPercent };
};

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const condition = getConditionInfo(book.conditionNumber);
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to book detail
    
    setIsAddingToCart(true);
    try {
      const success = await cartService.addToCart(book.id, 1);
      if (success) {
        // Update the cart icon counter
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 h-[370px] flex flex-col"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative">
        <Link href={`/books/${book.id}`}>
          <div className="relative h-48 w-full bg-gray-100">
            {book.thumbnail ? (
              <Image
                src={book.thumbnail}
                alt={book.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                className="object-contain transition-transform duration-300"
                style={{ transform: isHovering ? 'scale(1.05)' : 'scale(1)' }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <Image 
                  src="/images/book-placeholder.jpg" 
                  alt="Book placeholder"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-contain"
                />
              </div>
            )}
          </div>
        </Link>
        
        {/* Discount badge */}
        {book.priceNew && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            -{Math.round(((book.priceNew - book.price) / book.priceNew) * 100)}%
          </div>
        )}
        
        {/* Quick action buttons */}
        <div className={`absolute right-2 top-2 flex flex-col space-y-2 transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
          <Link 
            href={`/books/${book.id}`}
            className="bg-white p-2 rounded-full shadow-md hover:bg-green-50 text-gray-700 hover:text-green-600 transition-colors"
          >
            <FaEye size={16} />
          </Link>
          <button 
            onClick={handleAddToCart} 
            disabled={isAddingToCart}
            className="bg-white p-2 rounded-full shadow-md hover:bg-green-500 text-gray-700 hover:text-white transition-colors disabled:bg-gray-200 disabled:text-gray-400"
          >
            <FaShoppingCart size={16} className={isAddingToCart ? 'animate-pulse' : ''} />
          </button>
        </div>
      </div>

      <div className="p-2 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-xs text-gray-500 truncate">
            {book.schoolName}
          </p>
          
          <Link href={`/books/${book.id}`}>
            <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-green-700 h-10 transition-colors">
              {book.title}
            </h3>
          </Link>
          
          <p className="text-gray-600 text-sm line-clamp-1 -mt-1">
            {book.author ? book.author : 'Chưa cập nhật tác giả'}
          </p>
        </div>
        
        <div>
          <div className="text-xs text-gray-500 mb-1">
            Tình trạng: <span className="text-green-700 font-medium">{condition.text}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
            <div 
              className="bg-green-600 h-1.5 rounded-full" 
              style={{ width: `${condition.percent}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-baseline">
                <span className="text-lg font-bold text-green-700">{book.price.toLocaleString('vi-VN')}đ</span>
                {book.priceNew && (
                  <span className="text-xs text-gray-400 line-through ml-1">
                    {book.priceNew.toLocaleString('vi-VN')}đ
                  </span>
                )}
              </div>
            </div>
            
            <button 
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2 transition-colors disabled:bg-gray-300"
            >
              <FaShoppingCart size={16} className={isAddingToCart ? 'animate-pulse' : ''} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;