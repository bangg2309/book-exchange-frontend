'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import BookCard from '@/components/shared/BookCard';
import { Book, BookFilterParams, bookService } from '@/services/bookService';
import BookFilters from '@/components/books/BookFilters';
import { FaSearch, FaFilter, FaSort, FaArrowUp, FaArrowDown, FaTimes, FaBookOpen, 
  FaMapMarkerAlt, FaUniversity, FaTags, FaListUl, FaThLarge, FaChevronRight, FaBook, FaSchool } from 'react-icons/fa';
import Pagination from '@/components/shared/Pagination';

// Extend Book type to avoid TypeScript errors
interface ExtendedBook extends Book {
  category?: { name: string };
  condition?: string;
  sellerId?: string;
}

function BooksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<ExtendedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const [paramsProcessed, setParamsProcessed] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  
  // Filter states
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filters, setFilters] = useState({
    categoryId: '',
    minPrice: '',
    maxPrice: '', 
    condition: '',
    schoolId: ''
  });

  // Featured categories (mock data, could be fetched from API)
  const featuredCategories = [
    { id: 'cat1', name: 'Sách giáo trình', count: 245 },
    { id: 'cat2', name: 'Sách tham khảo', count: 189 },
    { id: 'cat3', name: 'Sách chuyên ngành', count: 132 },
    { id: 'cat4', name: 'Tài liệu học tập', count: 97 },
    { id: 'cat5', name: 'Sách ngoại ngữ', count: 75 },
  ];

  // Featured schools (mock data, could be fetched from API)
  const featuredSchools = [
    { id: 'school1', name: 'Đại học Quốc gia Hà Nội' },
    { id: 'school2', name: 'Đại học Bách Khoa Hà Nội' },
    { id: 'school3', name: 'Đại học Kinh tế Quốc dân' },
    { id: 'school4', name: 'Đại học Y Hà Nội' },
    { id: 'school5', name: 'Đại học Ngoại thương' },
  ];

  // Load initial params from URL
  useEffect(() => {
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) - 1 : 0;
    const title = searchParams.get('title') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortDir = searchParams.get('sortDir') || 'desc';
    const categoryId = searchParams.get('categoryId') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const condition = searchParams.get('condition') || '';
    const schoolId = searchParams.get('schoolId') || '';
    
    setCurrentPage(page);
    setSearchQuery(title);
    setSortOption(sortBy);
    setSortDirection(sortDir);
    setFilters({
      categoryId,
      minPrice,
      maxPrice,
      condition,
      schoolId
    });
    setParamsProcessed(true);
  }, [searchParams]);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current && 
        isMobileSidebarOpen && 
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileSidebarOpen]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileSidebarOpen]);

  // Fetch books based on current filters and pagination
  useEffect(() => {
    // Chỉ gọi API khi tham số đã được xử lý
    if (!paramsProcessed) return;
    
    const fetchBooks = async () => {
      try {
        setLoading(true);
        
        // Xây dựng các tham số lọc
        const filterParams: BookFilterParams = {
          page: currentPage,
          size: 12,
          sortBy: sortOption,
          sortDir: sortDirection,
          title: searchQuery,
          categoryId: filters.categoryId,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          condition: filters.condition,
          schoolId: filters.schoolId
        };
        
        // Gọi service để lấy dữ liệu
        const data = await bookService.getFilteredBooks(filterParams);
        
        if (data.code === 200 && data.result) {
          setBooks(data.result.content);
          setTotalItems(data.result.totalElements);
          setTotalPages(data.result.totalPages);
        } else {
          setBooks([]);
          setTotalItems(0);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Error fetching books:', error);
        setBooks([]);
      } finally {
        setLoading(false);
        // Đánh dấu đã hoàn thành lần tải đầu tiên
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      }
    };

    // Nếu là lần đầu tải hoặc các tham số thay đổi, thực hiện fetch
    fetchBooks();
  }, [currentPage, searchQuery, sortOption, sortDirection, filters, paramsProcessed]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0); // Reset to first page on new search
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(0); // Reset to first page when filters change
    setIsMobileSidebarOpen(false); // Close mobile sidebar after applying filter
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top of results
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleSortChange = (option: string) => {
    if (sortOption === option) {
      toggleSortDirection();
    } else {
      setSortOption(option);
      setSortDirection('desc');
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      categoryId
    }));
    setCurrentPage(0);
    setIsMobileSidebarOpen(false);
  };

  const handleSchoolSelect = (schoolId: string) => {
    setFilters(prev => ({
      ...prev,
      schoolId
    }));
    setCurrentPage(0);
    setIsMobileSidebarOpen(false);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilters({
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      schoolId: ''
    });
    setSortOption('createdAt');
    setSortDirection('desc');
  };

  const hasActiveFilters = () => {
    return filters.categoryId !== '' ||
      filters.minPrice !== '' ||
      filters.maxPrice !== '' ||
      filters.condition !== '' ||
      filters.schoolId !== '' ||
      searchQuery !== '';
  };

  const getSortLabel = () => {
    switch (sortOption) {
      case 'createdAt': return 'Mới nhất';
      case 'price': return 'Giá';
      case 'conditionNumber': return 'Tình trạng';
      case 'title': return 'Tên sách (A-Z)';
      default: return 'Sắp xếp';
    }
  };

  // Sidebar component to reduce duplication
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      <div className={`${isMobile ? '' : ''}`}>
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Bộ lọc</h2>
          <p className="text-sm text-slate-500 mt-1">Tìm sách phù hợp với bạn</p>
        </div>
        
        <div className="px-5 py-4">
          <div className="flex items-center mb-4">
            <FaFilter className="text-green-600 mr-2" />
            <h3 className="font-semibold text-slate-800">Tùy chọn lọc</h3>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4 shadow-inner">
            <BookFilters 
              filters={filters} 
              onFilterChange={handleFilterChange} 
            />
          </div>
          
          {/* Reset Filters */}
          {hasActiveFilters() && (
            <div className="mt-5 px-1">
              <button
                onClick={clearAllFilters}
                className="w-full px-4 py-3 bg-white hover:bg-red-50 text-red-600 rounded-lg flex items-center justify-center transition-all border border-red-200 shadow-sm font-medium"
              >
                <FaTimes className="mr-2" />
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container max-w-screen-xl mx-auto px-4 py-4">
          <div className="flex items-center text-sm">
            <Link href="/" className="text-slate-500 hover:text-slate-700">Trang chủ</Link>
            <FaChevronRight className="mx-2 text-slate-400 text-xs" />
            <span className="font-medium text-slate-800">Mua Sách</span>
          </div>
        </div>
      </div>
      
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center space-x-2 text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-all"
          >
            <FaFilter />
            <span className="font-medium">Bộ lọc</span>
            {hasActiveFilters() && (
              <span className="bg-green-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                {Object.values(filters).filter(Boolean).length + (searchQuery ? 1 : 0)}
              </span>
            )}
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveView('grid')}
              className={`p-2 rounded-lg ${activeView === 'grid' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
              aria-label="Grid view"
            >
              <FaThLarge size={16} />
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`p-2 rounded-lg ${activeView === 'list' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
              aria-label="List view"
            >
              <FaListUl size={16} />
            </button>
            
            <div className="relative">
              <button
                onClick={toggleSortDirection}
                className="flex items-center space-x-2 text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-all"
              >
                <FaSort size={14} />
                <span>{getSortLabel()}</span>
                {sortDirection === 'asc' ? <FaArrowUp size={12} className="ml-1" /> : <FaArrowDown size={12} className="ml-1" />}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-grow container mx-auto px-4 py-6 max-w-screen-xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-4 self-start">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <SidebarContent />
            </div>
          </aside>
          
          {/* Mobile Sidebar */}
          {isMobileSidebarOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex lg:hidden">
              <div 
                ref={sidebarRef}
                className="w-full max-w-md bg-white h-full overflow-y-auto transition-transform animate-slide-in ml-auto"
              >
                <div className="sticky top-0 bg-white z-10 border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm">
                  <h2 className="font-bold text-lg text-slate-800 flex items-center">
                    <FaFilter className="text-green-600 mr-2" />
                    Bộ lọc
                  </h2>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100"
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <div className="p-4">
                  <SidebarContent isMobile={true} />
                  
                  <div className="sticky bottom-0 pt-4 border-t border-slate-200 bg-white pb-5 mt-6">
                    <button 
                      onClick={() => {
                        handleSearchSubmit(new Event('submit') as any);
                        setIsMobileSidebarOpen(false);
                      }}
                      className="w-full px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center font-medium transition-all shadow-md"
                    >
                      Áp dụng bộ lọc
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Main Content */}
          <main ref={mainRef} className="flex-grow">
            {/* Results info and sorting - Desktop */}
            <div className="hidden lg:flex justify-between items-center mb-6 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="border-r border-slate-200 pr-3 flex items-center">
                  <button
                    onClick={() => setActiveView('grid')}
                    className={`p-2 rounded-lg ${activeView === 'grid' ? 'bg-green-50 text-green-600' : 'text-slate-500 hover:bg-slate-100'}`}
                    aria-label="Grid view"
                  >
                    <FaThLarge size={16} />
                  </button>
                  <button
                    onClick={() => setActiveView('list')}
                    className={`p-2 rounded-lg ml-1 ${activeView === 'list' ? 'bg-green-50 text-green-600' : 'text-slate-500 hover:bg-slate-100'}`}
                    aria-label="List view"
                  >
                    <FaListUl size={16} />
                  </button>
                </div>
                
                <div className="text-sm text-slate-500">Sắp xếp theo:</div>
                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="createdAt">Mới nhất</option>
                    <option value="price">Giá</option>
                    <option value="conditionNumber">Tình trạng</option>
                    <option value="title">Tên sách (A-Z)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    {sortDirection === 'desc' ? <FaArrowDown size={12} /> : <FaArrowUp size={12} />}
                  </div>
                </div>
                
                <button
                  onClick={toggleSortDirection}
                  className="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                  title={sortDirection === 'desc' ? 'Chuyển sang sắp xếp tăng dần' : 'Chuyển sang sắp xếp giảm dần'}
                >
                  {sortDirection === 'desc' ? <FaArrowDown size={14} /> : <FaArrowUp size={14} />}
                </button>
              </div>
              
              {hasActiveFilters() && (
                <button
                  onClick={clearAllFilters}
                  className="ml-4 text-sm text-red-600 hover:text-red-800 flex items-center font-medium"
                >
                  <FaTimes className="mr-1" size={12} />
                  Xóa bộ lọc
                </button>
              )}
            </div>
            
            {/* Books Display */}
            {loading ? (
              <div className="flex flex-col justify-center items-center min-h-[400px] bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-green-600 mb-4"></div>
                <p className="text-slate-500">Đang tải sách...</p>
              </div>
            ) : books.length > 0 ? (
              <>
                {activeView === 'grid' ? (
                  // Grid View
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.map((book) => (
                      <div key={book.id} className="animate-fade-in">
                        <BookCard book={book} />
                      </div>
                    ))}
                  </div>
                ) : (
                  // List View
                  <div className="space-y-4">
                    {books.map((book) => (
                      <div 
                        key={book.id}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 overflow-hidden animate-fade-in"
                      >
                        <div className="flex flex-col sm:flex-row">
                          <div className="sm:w-48 h-48 sm:h-auto bg-slate-100 flex items-center justify-center flex-shrink-0 p-4">
                            <div className="w-28 h-36 bg-white rounded shadow-sm flex items-center justify-center">
                              <FaBookOpen className="text-slate-300" size={32} />
                            </div>
                          </div>
                          
                          <div className="p-5 flex-grow">
                            <div className="flex flex-col h-full">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="text-sm text-slate-500">
                                    {book.category?.name || 'Chưa phân loại'}
                                  </div>
                                  {book.condition && (
                                    <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                      {book.condition}
                                    </div>
                                  )}
                                </div>
                                
                                <h3 className="font-semibold text-lg text-slate-800 mb-2">
                                  <Link href={`/books/${book.id}`} className="hover:text-green-600 transition-colors line-clamp-1">
                                    {book.title}
                                  </Link>
                                </h3>
                                
                                <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                                  {book.description || 'Không có mô tả chi tiết.'}
                                </p>
                              </div>
                              
                              <div className="mt-auto">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <div className="font-bold text-xl text-green-600">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price)}
                                  </div>
                                  
                                  <div className="flex space-x-2">
                                    <Link 
                                      href={`/books/${book.id}`}
                                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium flex items-center transition-all"
                                    >
                                      Chi tiết
                                    </Link>
                                    
                                    <Link 
                                      href={`/chat/${book.sellerId || '#'}`}
                                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all"
                                    >
                                      Liên hệ mua
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Pagination */}
                <div className="mt-8 flex justify-end items-center">
                  <div className="flex items-center bg-white rounded-lg shadow-md border border-slate-200 p-3">
                    <div className="mr-5 pl-2 text-sm border-r border-slate-200 pr-5">
                      <div className="text-slate-500 mb-0.5">Hiển thị</div>
                      <div className="font-semibold text-slate-800">{Math.min(currentPage * 12 + 1, totalItems)}-{Math.min((currentPage + 1) * 12, totalItems)} / {totalItems} sách</div>
                    </div>
                    <Pagination 
                      currentPage={currentPage} 
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                <div className="mx-auto max-w-md p-6">
                  <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <FaBookOpen className="text-slate-300" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Không tìm thấy kết quả</h3>
                  <p className="text-slate-600 mb-6">
                    Không tìm thấy sách phù hợp với tìm kiếm của bạn. Hãy thử lại với từ khóa khác hoặc điều chỉnh bộ lọc.
                  </p>
                  <button 
                    onClick={clearAllFilters}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg inline-flex items-center transition-all"
                  >
                    <FaTimes className="mr-2" />
                    Xóa bộ lọc
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      
      <Footer />
      
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        @keyframes pulse-light {
          0% { opacity: 0.1; }
          50% { opacity: 0.3; }
          100% { opacity: 0.1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
        
        .animate-pulse-light {
          animation: pulse-light 2s ease-in-out infinite;
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        /* Line clamp utilities */
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Custom scrollbar for sidebar */
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
        }
        
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
        }
        
        /* Custom styles for form elements in filter */
        .filter-select {
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E");
        }
        
        input[type="text"],
        input[type="number"],
        select {
          transition: all 0.2s;
        }
        
        input[type="text"]:focus,
        input[type="number"]:focus,
        select:focus {
          border-color: #10B981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
      `}</style>
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <span className="ml-3 text-gray-600">Đang tải...</span>
        </div>
        <Footer />
      </div>
    }>
      <BooksContent />
    </Suspense>
  );
} 