'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaBook, FaSearch, FaPlus, FaEdit, FaTrash, FaEye, FaTimesCircle, FaFilter } from 'react-icons/fa';
import { bookService } from '@/services/bookService';
import { formatCurrency } from '@/lib/utils';
import { authService } from '@/services/authService';
import { toastService } from '@/services/toastService';
import ConfirmDialog from '@/components/ConfirmDialog';

// Định nghĩa các trạng thái sách
const BOOK_STATUS = {
  PENDING: 0,     // Chờ phê duyệt
  APPROVED: 1,    // Đã được chấp nhận, đang bán
  SOLD: 2,        // Đã bán
};

interface ListedBook {
  id: number;
  title: string;
  price: number;
  priceNew: number | null;
  conditionNumber: number;
  description: string;
  thumbnail: string;
  schoolName: string;
  status: number;
}

const ListedBookItem = ({ book, onView, onEdit, onDelete }: { 
  book: ListedBook, 
  onView: () => void,
  onEdit: () => void,
  onDelete: () => void
}) => {
  // Xác định trạng thái sách
  const getStatusText = (status: number) => {
    switch (status) {
      case BOOK_STATUS.PENDING:
        return { text: 'Chờ phê duyệt', color: 'text-yellow-600' };
      case BOOK_STATUS.APPROVED:
        return { text: 'Đang bán', color: 'text-green-600' };
      case BOOK_STATUS.SOLD:
        return { text: 'Đã bán', color: 'text-red-600' };
      default:
        return { text: 'Không xác định', color: 'text-gray-600' };
    }
  };

  const statusInfo = getStatusText(book.status);

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
      <div className="flex">
        <div className="relative h-40 w-32 flex-shrink-0 bg-gray-50 border border-gray-100 rounded-md overflow-hidden shadow-sm">
          <Image
            src={book.thumbnail || "/placeholder-book.jpg"}
            alt={book.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="ml-6 flex-grow">
          <h3 className="font-medium text-lg">{book.title}</h3>
          <div className="mt-2 text-sm text-gray-500 inline-flex items-center bg-gray-50 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
            Tình trạng: {book.conditionNumber === 1 ? 'Mới' : 'Đã qua sử dụng'}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {book.schoolName && (
              <span className="inline-block">Trường: {book.schoolName}</span>
            )}
          </div>
          <div className="mt-4 flex justify-between items-end">
            <div className="text-sm text-gray-500">
              Trạng thái: <span className={`font-medium ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
            <div className="text-xl font-semibold text-green-600">
              {formatCurrency(book.price)}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 pt-5 border-t border-gray-100 flex justify-end gap-2">
        <button 
          className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center"
          onClick={onView}
        >
          <FaEye className="mr-2" />
          Xem
        </button>
        
        {/* Chỉ hiển thị nút Sửa khi sách đang chờ phê duyệt */}
        {book.status === BOOK_STATUS.PENDING && (
          <button 
            className="px-4 py-2 rounded-md text-sm font-medium border border-blue-500 text-blue-500 hover:bg-blue-50 flex items-center"
            onClick={onEdit}
          >
            <FaEdit className="mr-2" />
            Sửa
          </button>
        )}
        
        {/* Chỉ hiển thị nút Xóa khi sách chưa được bán */}
        {book.status !== BOOK_STATUS.SOLD && (
          <button 
            className="px-4 py-2 rounded-md text-sm font-medium border border-red-500 text-red-500 hover:bg-red-50 flex items-center"
            onClick={onDelete}
          >
            <FaTrash className="mr-2" />
            Xóa
          </button>
        )}
      </div>
    </div>
  );
};

export default function ListedBooksPage() {
  const router = useRouter();
  const [listedBooks, setListedBooks] = useState<ListedBook[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<ListedBook[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<number | null>(null);

  useEffect(() => {
    const fetchListedBooks = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        const currentUser = authService.getCurrentUser();
        if (!currentUser || !currentUser.id) {
          router.push("/login");
          return;
        }
        
        // Fetch listed books from API
        const response = await bookService.getListedBooksByUser();
        
        if (response && response.result) {
          // Sort books by createdAt date (newest first)
          const sortedBooks = [...response.result].sort((a, b) => 
            new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
          );
          
          setListedBooks(sortedBooks);
          setFilteredBooks(sortedBooks);
        }
      } catch (error) {
        console.error("Error fetching listed books:", error);
        setError("Không thể tải danh sách sách đã đăng bán. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchListedBooks();
  }, [router]);
  
  useEffect(() => {
    let filtered = [...listedBooks];
    
    // Filter by status
    if (selectedStatus !== "all") {
      const statusCode = parseInt(selectedStatus);
      filtered = filtered.filter(book => book.status === statusCode);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(term)
      );
    }
    
    setFilteredBooks(filtered);
  }, [searchTerm, selectedStatus, listedBooks]);
  
  const handleDeleteBook = async (bookId: number) => {
    try {
      // Call API to delete the book
      await bookService.deleteBookListing(bookId.toString());
      
      // Update the local state
      const updatedBooks = listedBooks.filter(book => book.id !== bookId);
      setListedBooks(updatedBooks);
      setFilteredBooks(updatedBooks.filter(book => {
        // Áp dụng lại bộ lọc
        if (selectedStatus !== "all" && book.status !== parseInt(selectedStatus)) {
          return false;
        }
        return searchTerm.trim() === "" || book.title.toLowerCase().includes(searchTerm.toLowerCase().trim());
      }));
      
      toastService.success('Xóa sách thành công!');
    } catch (error) {
      console.error("Error deleting book:", error);
      toastService.error('Không thể xóa sách. Vui lòng thử lại sau.');
    }
  };
  
  const confirmDelete = (bookId: number) => {
    setBookToDelete(bookId);
    setShowConfirmDialog(true);
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Xóa sách"
        message="Bạn có chắc chắn muốn xóa sách này không? Hành động này không thể hoàn tác."
        onConfirm={() => {
          if (bookToDelete) {
            handleDeleteBook(bookToDelete);
          }
          setShowConfirmDialog(false);
        }}
        onCancel={() => setShowConfirmDialog(false)}
        icon="warning"
      />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-800">Sách đã đăng bán</h1>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search and Add New */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-5 border border-gray-200">
          <div className="flex flex-wrap md:flex-nowrap gap-4 items-center mb-4">
            {/* Search input */}
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tìm kiếm sách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Add new book button */}
            <button 
              className="px-5 py-2.5 rounded-md text-sm font-medium text-white flex items-center bg-green-600 hover:bg-green-700 transition-colors"
              onClick={() => router.push("/sell-book")}
            >
              <FaPlus className="mr-2" />
              Đăng bán sách mới
            </button>
          </div>
          
          {/* Status filter tabs */}
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="flex items-center mr-2">
              <FaFilter className="text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">Trạng thái:</span>
            </div>
            <button 
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${selectedStatus === "all" ? "text-white bg-green-600" : "text-gray-700 bg-gray-100 hover:bg-gray-200"}`}
              onClick={() => setSelectedStatus("all")}
            >
              Tất cả
            </button>
            <button 
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${selectedStatus === BOOK_STATUS.PENDING.toString() ? "text-white bg-yellow-500" : "text-gray-700 bg-gray-100 hover:bg-gray-200"}`}
              onClick={() => setSelectedStatus(BOOK_STATUS.PENDING.toString())}
            >
              Chờ phê duyệt
            </button>
            <button 
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${selectedStatus === BOOK_STATUS.APPROVED.toString() ? "text-white bg-green-600" : "text-gray-700 bg-gray-100 hover:bg-gray-200"}`}
              onClick={() => setSelectedStatus(BOOK_STATUS.APPROVED.toString())}
            >
              Đang bán
            </button>
            <button 
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${selectedStatus === BOOK_STATUS.SOLD.toString() ? "text-white bg-red-500" : "text-gray-700 bg-gray-100 hover:bg-gray-200"}`}
              onClick={() => setSelectedStatus(BOOK_STATUS.SOLD.toString())}
            >
              Đã bán
            </button>
          </div>
        </div>
        
        {/* Books list */}
        {isLoading ? (
          // Loading skeletons
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-5 animate-pulse border border-gray-200">
                <div className="flex">
                  <div className="h-40 w-32 bg-gray-200 rounded"></div>
                  <div className="ml-6 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/5 mt-auto"></div>
                  </div>
                </div>
                <div className="mt-5 pt-5 border-t border-gray-100 flex justify-end gap-2">
                  <div className="h-9 bg-gray-200 rounded w-20"></div>
                  <div className="h-9 bg-gray-200 rounded w-20"></div>
                  <div className="h-9 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
            <FaTimesCircle className="text-red-500 text-4xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{error}</h2>
            <p className="text-gray-600 mb-4">Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu lỗi vẫn tiếp tục.</p>
            <button 
              className="px-5 py-2 rounded-md text-sm font-medium text-white transition-colors duration-200 hover:opacity-90 bg-green-600"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </div>
        ) : filteredBooks.length === 0 ? (
          // Empty state
          <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
            <FaBook className="text-gray-400 text-4xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {selectedStatus === "all" 
                ? "Bạn chưa có sách nào đăng bán" 
                : `Không có sách nào ở trạng thái ${
                    selectedStatus === BOOK_STATUS.PENDING.toString() ? "chờ phê duyệt" : 
                    selectedStatus === BOOK_STATUS.APPROVED.toString() ? "đang bán" : "đã bán"
                  }`
              }
            </h2>
            <p className="text-gray-600 mb-4">
              {selectedStatus === "all" 
                ? "Hãy đăng bán sách đầu tiên của bạn ngay bây giờ!" 
                : "Hãy chọn trạng thái khác hoặc đăng bán thêm sách mới."
              }
            </p>
            <button 
              className="px-5 py-2 rounded-md text-sm font-medium text-white transition-colors duration-200 hover:opacity-90 bg-green-600"
              onClick={() => router.push("/sell-book")}
            >
              Đăng bán sách
            </button>
          </div>
        ) : (
          // Books list
          <div className="space-y-5">
            {filteredBooks.map((book) => (
              <ListedBookItem 
                key={book.id} 
                book={book}
                onView={() => router.push(`/books/${book.id}`)}
                onEdit={() => router.push(`/sell-book/edit/${book.id}`)}
                onDelete={() => confirmDelete(book.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}