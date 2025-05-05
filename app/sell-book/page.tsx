'use client';

import React from 'react';
import BookListingForm from '@/components/book-listing/BookListingForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const SellBookPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-blue-600 mb-4 hover:text-blue-800 transition-colors">
            <ArrowLeft size={20} />
            <span>Quay lại trang chủ</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Đăng bán sách</h1>
          <p className="text-gray-600 mt-2">Điền thông tin để đăng bán sách của bạn</p>
        </div>
        
        {/* Form */}
        <BookListingForm />
      </div>
    </div>
  );
};

export default SellBookPage; 