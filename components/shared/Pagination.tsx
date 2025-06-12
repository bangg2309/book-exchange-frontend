'use client';

import React from 'react';
import { FaChevronLeft, FaChevronRight, FaEllipsisH } from 'react-icons/fa';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Không render pagination nếu chỉ có 1 trang
  if (totalPages <= 1) return null;

  // Tạo mảng các trang để hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    // Trường hợp ít trang
    if (totalPages <= maxPagesToShow) {
      // Hiển thị tất cả các trang
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Luôn hiển thị trang đầu
      pages.push(0);
      
      // Nếu không ở gần trang đầu, thêm dấu ...
      if (currentPage > 2) {
        pages.push(-1); // -1 đại diện cho dấu ...
      }
      
      // Trang hiện tại và các trang xung quanh
      const startPage = Math.max(1, Math.min(currentPage - 1, totalPages - 4));
      const endPage = Math.min(startPage + 2, totalPages - 2);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Nếu không ở gần trang cuối, thêm dấu ...
      if (currentPage < totalPages - 3) {
        pages.push(-2); // -2 đại diện cho dấu ... (để khác với -1)
      }
      
      // Luôn hiển thị trang cuối
      pages.push(totalPages - 1);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center space-x-1.5">
      {/* Nút Trang trước */}
      <button
        onClick={() => currentPage > 0 && onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={`flex items-center justify-center w-9 h-9 rounded-md transition-all duration-200 ${
          currentPage === 0
            ? 'text-slate-300 cursor-not-allowed bg-slate-50'
            : 'text-slate-700 hover:bg-green-50 hover:text-green-600'
        }`}
        aria-label="Previous page"
      >
        <FaChevronLeft className="w-3.5 h-3.5" />
      </button>

      {/* Các nút số trang */}
      {pageNumbers.map((pageNumber, index) => (
        pageNumber < 0 ? (
          // Hiển thị dấu ...
          <span key={`ellipsis-${index}`} className="w-9 h-9 flex items-center justify-center text-slate-400">
            <FaEllipsisH className="w-3 h-3" />
          </span>
        ) : (
          <button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            className={`relative flex items-center justify-center w-9 h-9 text-sm rounded-md transition-all duration-200 ${
              currentPage === pageNumber
                ? 'bg-green-600 text-white font-medium shadow-sm z-10'
                : 'text-slate-700 hover:bg-green-50 hover:text-green-600'
            }`}
          >
            {pageNumber + 1}
            {currentPage === pageNumber && (
              <span className="absolute inset-0 rounded-md animate-pulse-light" />
            )}
          </button>
        )
      ))}

      {/* Nút Trang tiếp */}
      <button
        onClick={() => currentPage < totalPages - 1 && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className={`flex items-center justify-center w-9 h-9 rounded-md transition-all duration-200 ${
          currentPage === totalPages - 1
            ? 'text-slate-300 cursor-not-allowed bg-slate-50'
            : 'text-slate-700 hover:bg-green-50 hover:text-green-600'
        }`}
        aria-label="Next page"
      >
        <FaChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default Pagination; 