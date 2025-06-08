'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Book } from '@/services/bookService';

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
  const condition = getConditionInfo(book.conditionNumber);
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/books/${book.id}`}>
        <div className="relative h-48 w-full bg-gray-100">
          {book.thumbnail ? (
            <Image
              src={book.thumbnail}
              alt={book.title}
              fill
              className="object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <Image 
                src="/images/book-placeholder.jpg" 
                alt="Book placeholder"
                fill
                className="object-contain"
              />
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/books/${book.id}`}>
          <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-green-700 min-h-[48px]">
            {book.title}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm mt-1">{book.author || 'Chưa cập nhật tác giả'}</p>
        <p className="text-gray-500 text-sm">{book.schoolName}</p>
        
        <div className="mt-2 text-sm">
          <span className="font-semibold text-gray-800">{`Tình trạng: ${condition.text}`}</span>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${condition.percent}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-4 flex items-baseline">
          <span className="text-lg font-bold text-green-700">{book.price.toLocaleString('vi-VN')}đ</span>
          {book.priceNew && (
            <span className="text-sm text-gray-500 line-through ml-2">
              {book.priceNew.toLocaleString('vi-VN')}đ
            </span>
          )}
          {book.priceNew && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
              -{Math.round(((book.priceNew - book.price) / book.priceNew) * 100)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard; 