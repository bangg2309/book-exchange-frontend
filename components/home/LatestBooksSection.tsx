'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Book, bookService } from '@/services/bookService';

const BookCard = ({ book }: { book: Book }) => {
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

const LatestBooksSection = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestBooks = async () => {
      try {
        setLoading(true);
        const data = await bookService.getLatestBooks();
        setBooks(data);
      } catch (error) {
        console.error('Failed to fetch latest books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestBooks();
  }, []);

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-green-700 relative pb-2">
            Sách mới đăng gần đây
            <span className="absolute bottom-0 left-0 w-20 h-1 bg-green-700"></span>
          </h2>
          <Link href="/books" className="text-green-700 hover:text-green-800 font-medium text-sm flex items-center">
            Xem thêm
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.length > 0 ? (
              books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500">Không có sách mới được đăng gần đây</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestBooksSection; 