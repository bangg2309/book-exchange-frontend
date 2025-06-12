'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import BookPlaceholder from '@/components/book-listing/BookPlaceholder';
import { bookService } from '@/services/bookService';
import { cartService } from '@/services/cartService';
import { Book } from '@/types/book';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

// Book type definition based on the API response
interface BookDetail {
  id: number | string;
  title: string;
  authors?: string[];
  categories?: string[];
  reviews?: any;
  isbn?: string;
  language?: string;
  publishYear?: string;
  conditionDescription?: string;
  pageCount?: string | number;
  sellerName?: string | null;
  address?: string | null;
  priceNew: number | null;
  price: number;
  conditionNumber: number;
  schoolName: string;
  publisher: string | null;
  description: string;
  thumbnail: string;
  images?: string[];
  imagesUrl?: string[];
  fullName?: string;
  createdAt?: string;
  [key: string]: any;
}

export default function BookDetailPage() {
  const params = useParams();
  const bookId = params.id as string;
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'reviews'>('description');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        
        const response = await bookService.getListedBookById(bookId);
        if (response && response.code === 1000 && response.result) {
          const bookData = response.result;
          setBook(bookData as BookDetail);
          
          // Use images from API
          const bookImages = bookData.images || [];
          setImages(bookImages);
          setSelectedImage(bookData.thumbnail || (bookImages.length > 0 ? bookImages[0] : null));
          setCurrentImageIndex(0);
        } else {
          setError('Không tìm thấy sách với ID này');
        }
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Không thể tải thông tin sách. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookDetails();
  }, [bookId]);

  // Convert condition number to readable text
  const getConditionText = (conditionNumber: number) => {
    const conditions: Record<number, string> = {
      1: 'Kém',
      2: 'Trung bình',
      3: 'Khá',
      4: 'Tốt',
      5: 'Mới'
    };
    
    return conditions[conditionNumber] || 'Không xác định';
  };

  // Handle image error
  const handleImageError = (imageUrl: string) => {
    setImageError(prev => ({ ...prev, [imageUrl]: true }));
  };

  // Calculate discount percentage if both prices are available
  const calculateDiscountPercentage = (originalPrice: number, salePrice: number) => {
    if (!originalPrice || !salePrice || originalPrice <= salePrice) return null;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };


  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = async () => {
    if (book) {
      const success = await cartService.addToCart(Number(book.id));
      if (success) {
        // Dispatch custom event to update cart icon
        window.dispatchEvent(new Event('cartUpdated'));
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="pt-24 pb-16">
          <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="pt-24 pb-16">
          <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center py-10">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                {error || 'Không tìm thấy sách'}
              </h1>
              <Link 
                href="/books"
                className="inline-flex items-center px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition-colors"
              >
                Quay lại danh sách sách
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discountPercentage = book.priceNew ? calculateDiscountPercentage(book.priceNew, book.price) : null;
  const authors = book.authors ? (Array.isArray(book.authors) ? book.authors.join(', ') : book.authors) : book.author;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm bg-white shadow-sm p-4 rounded-lg">
            <ol className="flex flex-wrap items-center space-x-2">
              <li>
                <Link href="/" className="text-gray-500 hover:text-green-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </Link>
              </li>
              <li>
                <span className="text-gray-500">/</span>
              </li>
              <li>
                <Link href="/books" className="text-gray-500 hover:text-green-700">Sách</Link>
              </li>
              <li>
                <span className="text-gray-500">/</span>
              </li>
              <li className="text-green-700 truncate max-w-xs font-medium">
                {book.title}
              </li>
            </ol>
          </nav>
          
          {/* Book Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            {/* Image Gallery - Left Column */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
                {images.length > 0 ? (
                  <div className="image-gallery relative">
                    {/* Main Swiper */}
                    <Swiper
                      spaceBetween={10}
                      navigation={true}
                      thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                      modules={[FreeMode, Navigation, Thumbs]}
                      className="main-swiper rounded-t-lg"
                      onSlideChange={(swiper: SwiperType) => setCurrentImageIndex(swiper.activeIndex)}
                    >
                      {images.map((image, index) => (
                        <SwiperSlide key={index}>
                          <div className="relative h-96 md:h-[500px] w-full bg-gray-50">
                            {!imageError[image] ? (
                              <Image
                                src={image}
                                alt={`${book?.title || 'Hình sách'} - ảnh ${index + 1}`}
                                fill
                                className="object-contain"
                                onError={() => handleImageError(image)}
                              />
                            ) : (
                              <BookPlaceholder />
                            )}
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    {/* Thumbs Swiper */}
                    <Swiper
                      onSwiper={(swiper: SwiperType) => setThumbsSwiper(swiper)}
                      spaceBetween={10}
                      slidesPerView="auto"
                      freeMode={true}
                      watchSlidesProgress={true}
                      modules={[FreeMode, Navigation, Thumbs]}
                      className="thumbs-swiper p-4 border-t"
                    >
                      {images.map((image, index) => (
                        <SwiperSlide key={index} style={{ width: 'auto' }}>
                          <button className={`relative h-20 w-20 cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            currentImageIndex === index ? 'border-green-500 ring-2 ring-green-500 scale-105' : 'border-gray-200 hover:border-green-300'
                          }`}>
                            {!imageError[image] ? (
                              <Image
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                                onError={() => handleImageError(image)}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <span className="text-xs text-gray-400">Lỗi</span>
                              </div>
                            )}
                          </button>
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 z-10">
                      <span className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {currentImageIndex + 1} / {images.length}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-96 md:h-[500px] w-full bg-gray-50">
                    <BookPlaceholder />
                  </div>
                )}
              </div>
            </div>
            
            {/* Book Info - Right Column */}
            <div className="lg:col-span-7">
              {/* Book Header */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                {/* Category & School - REMOVING LANGUAGE AND SCHOOL */}
                <div className="flex flex-wrap items-center text-sm mb-3 gap-2">
                  {book.createdAt && (
                    <span className="text-gray-600">
                      Đăng ngày: {formatDate(book.createdAt)}
                    </span>
                  )}
                </div>
                
                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {book.categories && book.categories.length > 0 ? (
                    book.categories.map((category, index) => (
                      <a key={index} href="#" className="text-sm px-3 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors">{category}</a>
                    ))
                  ) : (
                    <>
                      <a href="#" className="text-sm px-3 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors">Sách giáo khoa</a>
                      <a href="#" className="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors">Đại học</a>
                      <a href="#" className="text-sm px-3 py-1 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors">{book.schoolName}</a>
                    </>
                  )}
                </div>
                
                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                
                {/* Author & Publisher */}
                <div className="space-y-1 mb-4">
                  {authors && (
                    <p className="text-gray-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium">Tác giả:</span> <span className="text-blue-600 ml-1">{authors}</span>
                    </p>
                  )}
                  
                  {book.publisher && (
                    <p className="text-gray-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="font-medium">Nhà xuất bản:</span> <span className="ml-1">{book.publisher}</span>
                    </p>
                  )}
                  
                  {book.publishYear && (
                    <p className="text-gray-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Năm xuất bản:</span> <span className="ml-1">{book.publishYear}</span>
                    </p>
                  )}
                </div>
                
                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>
                
                {/* Pricing */}
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-green-700">{book.price.toLocaleString('vi-VN')}đ</span>
                  {book.priceNew && book.priceNew > book.price && (
                    <>
                      <span className="text-lg text-gray-500 line-through ml-3">
                        {book.priceNew.toLocaleString('vi-VN')}đ
                      </span>
                      {discountPercentage && (
                        <span className="ml-2 px-2 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">
                          -{discountPercentage}%
                        </span>
                      )}
                    </>
                  )}
                </div>
                
                {/* Condition */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-gray-700">Tình trạng: {getConditionText(book.conditionNumber)}</span>
                    </div>
                    <span className="text-sm text-gray-500">{book.conditionNumber}/5</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600" 
                      style={{ width: `${(book.conditionNumber / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Seller Info */}
                <div className="flex items-center p-4 bg-gray-50 rounded-lg mb-6">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Người bán: {book.sellerName || book.fullName || 'Người dùng ẩn danh'}</p>
              
                    {(book.address) && (
                      <p className="text-sm text-gray-500">Địa chỉ giao hàng: {book.address}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons - Moved to the bottom */}
                <div className="flex mt-8">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-green-600 text-green-600 font-medium rounded-lg hover:bg-green-50 transition-colors mr-4"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Thêm vào giỏ hàng
                  </button>
                  <Link
                    href="/cart"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Mua ngay
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'description' 
                      ? 'border-green-500 text-green-600' 
                      : 'border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Mô tả tình trạng sách
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'details' 
                      ? 'border-green-500 text-green-600' 
                      : 'border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Thông tin chi tiết
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'reviews' 
                      ? 'border-green-500 text-green-600' 
                      : 'border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Đánh giá người bán
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              {activeTab === 'description' && (
                <div className="prose prose-green max-w-none">
                  <h3 className="text-xl font-bold mb-4">Mô tả tình trạng sách</h3>
                  {book.conditionDescription ? (
                    <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {book.conditionDescription}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">Không có mô tả về tình trạng sách.</p>
                  )}
                </div>
              )}
              
              {activeTab === 'details' && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Thông tin chi tiết</h3>
                  
                  {/* Book Description */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold mb-3">Mô tả sách</h4>
                    {book.description.startsWith('<p>') ? (
                      <div className="prose prose-green max-w-none" dangerouslySetInnerHTML={{ __html: book.description }} />
                    ) : (
                      <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                        {book.description || 'Không có mô tả.'}
                      </p>
                    )}
                  </div>

                  {/* Book Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                    <div className="border-b pb-3 border-gray-200">
                      <p className="text-sm text-gray-500">Tác giả</p>
                      <p className="font-medium">{authors || 'Chưa cập nhật'}</p>
                    </div>
                    {book.categories && book.categories.length > 0 && (
                      <div className="border-b pb-3 border-gray-200">
                        <p className="text-sm text-gray-500">Thể loại</p>
                        <p className="font-medium">{book.categories.join(', ')}</p>
                      </div>
                    )}
                    <div className="border-b pb-3 border-gray-200">
                      <p className="text-sm text-gray-500">Nhà xuất bản</p>
                      <p className="font-medium">{book.publisher || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="border-b pb-3 border-gray-200">
                      <p className="text-sm text-gray-500">Năm xuất bản</p>
                      <p className="font-medium">{book.publishYear || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="border-b pb-3 border-gray-200">
                      <p className="text-sm text-gray-500">Tình trạng sách</p>
                      <p className="font-medium">{getConditionText(book.conditionNumber)}</p>
                    </div>
                    <div className="border-b pb-3 border-gray-200">
                      <p className="text-sm text-gray-500">Giá niêm yết</p>
                      <p className="font-medium">{book.priceNew ? `${book.priceNew.toLocaleString('vi-VN')}đ` : 'Chưa cập nhật'}</p>
                    </div>
                    <div className="border-b pb-3 border-gray-200">
                      <p className="text-sm text-gray-500">Giá bán</p>
                      <p className="font-medium text-green-700">{book.price.toLocaleString('vi-VN')}đ</p>
                    </div>
                    {book.createdAt && (
                      <div className="border-b pb-3 border-gray-200">
                        <p className="text-sm text-gray-500">Ngày đăng</p>
                        <p className="font-medium">{formatDate(book.createdAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Đánh giá người bán</h3>
                  
                  {book.reviews && book.reviews.length > 0 ? (
                    <>
                      <div className="flex items-center mb-6">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-xl font-medium text-gray-700">5.0</span>
                        <span className="ml-2 text-gray-500">({book.reviews.length} đánh giá)</span>
                      </div>

                      {/* Hiển thị các đánh giá từ API */}
                      <div className="space-y-6">
                        {book.reviews.map((review: any, index: number) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-start">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4 flex-shrink-0">
                                <span className="font-medium">{review.reviewer?.substring(0, 2) || 'NN'}</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <span className="font-medium text-gray-800 mr-2">{review.reviewer || 'Người dùng ẩn danh'}</span>
                                  {/* Hiển thị số sao */}
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                </div>
                                <p className="text-gray-600">{review.comment}</p>
                                <p className="text-gray-400 text-sm mt-2">{review.createdAt ? formatDate(review.createdAt) : ''}</p>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="mt-6 text-center">
                          <button className="text-green-600 hover:text-green-700 font-medium">
                            Xem tất cả đánh giá
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <h4 className="text-lg font-medium text-gray-600 mb-2">Chưa có đánh giá nào</h4>
                      <p className="text-gray-500">Người bán này chưa nhận được đánh giá từ người mua. Hãy là người đầu tiên mua sách và đánh giá!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Related Books (Placeholder) */}
          <section>
            <h2 className="text-2xl font-bold mb-6 relative text-gray-900">
              Sách liên quan
              <span className="absolute bottom-0 left-0 w-20 h-1 bg-green-600"></span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gray-100">
                    <BookPlaceholder />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[48px]">
                      Sách liên quan {i + 1}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Tác giả mẫu</p>
                    <div className="mt-4">
                      <span className="font-bold text-green-700">85.000đ</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 