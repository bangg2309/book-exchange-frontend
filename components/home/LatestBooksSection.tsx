'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Book, bookService } from '@/services/bookService';
import BookCard from '@/components/shared/BookCard';

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