'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, StarHalf, MapPin, Phone } from 'lucide-react';
import { bookService } from '@/services/bookService';
import { toastService } from '@/services/toastService';
import { BookResponse } from '@/types';
import { useRouter } from 'next/navigation';

interface BookDetailProps {
  params: {
    id: string;
  }
}

export default function BookDetailPage({ params }: BookDetailProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('MÔ TẢ');
  const [book, setBook] = useState<BookResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Safely access params.id
  const bookId = params?.id;

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!bookId) return;
      
      try {
        const data = await bookService.getBookById(bookId);
        setBook(data);
        if (data.thumbnail && typeof data.thumbnail === 'string') {
          setActiveImage(data.thumbnail);
        } else if (data.images && data.images.length > 0 && data.images[0].url) {
          setActiveImage(data.images[0].url!);
        }
      } catch (error) {
        toastService.error('Không thể tải thông tin sách. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const calculateDiscount = () => {
    if (book?.priceNew && book?.price) {
      return Math.round(((book.priceNew - book.price) / book.priceNew) * 100);
    }
    return book?.discount || 0;
  };

  const getConditionText = (conditionNumber: number) => {
    switch (conditionNumber) {
      case 5: return 'Mới (100%)';
      case 4: return 'Gần như mới (90%)';
      case 3: return 'Tốt (70-80%)';
      case 2: return 'Khá (50-60%)';
      case 1: return 'Cũ (dưới 50%)';
      default: return `${conditionNumber}/5`;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sách</h2>
          <p className="text-gray-600 mb-4">Sách bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link 
            href="/" 
            className="inline-block bg-green-700 text-white px-6 py-2 rounded-full hover:bg-green-800 transition-colors"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-green-700">Trang chủ</Link></li>
            <li>/</li>
            <li><Link href="/books" className="hover:text-green-700">Sách</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{book.title}</li>
          </ol>
        </nav>

        {/* Book Detail Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Left Column - Image */}
            <div className="space-y-6">
              <div className="aspect-[3/4] relative rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={activeImage || '/images/placeholder-book.jpg'}
                  alt={book.title}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="grid grid-cols-5 gap-4">
                {book.thumbnail && (
                  <div 
                    className={`aspect-square relative rounded-lg overflow-hidden bg-gray-100 cursor-pointer border-2 ${activeImage === book.thumbnail ? 'border-green-700' : 'border-transparent'}`}
                    onClick={() => setActiveImage(book.thumbnail || '')}
                  >
                    <Image
                      src={book.thumbnail}
                      alt={`${book.title} - Ảnh bìa`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {book.images?.map((image) => (
                  <div 
                    key={image.id} 
                    className={`aspect-square relative rounded-lg overflow-hidden bg-gray-100 cursor-pointer border-2 ${activeImage === image.url ? 'border-green-700' : 'border-transparent'}`}
                    onClick={() => setActiveImage(image.url)}
                  >
                    <Image
                      src={image.url}
                      alt={`${book.title} - Ảnh ${image.id}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                <p className="text-xl text-gray-600 mb-4">
                  {book.authors?.map(author => author.name).join(', ')}
                </p>
                
                <div className="flex items-baseline space-x-4 mb-6">
                  <span className="text-3xl font-bold text-green-700">
                    {book.price?.toLocaleString('vi-VN')}đ
                  </span>
                  {book.priceNew && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        {book.priceNew.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">
                        -{calculateDiscount()}%
                      </span>
                    </>
                  )}
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center">
                    <span className="w-32 text-gray-600">Tình trạng:</span>
                    <span className="font-medium text-gray-900">
                      {getConditionText(book.conditionNumber)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-gray-600">Nhà xuất bản:</span>
                    <span className="font-medium text-gray-900">{book.publisher || 'Không có thông tin'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-gray-600">Năm xuất bản:</span>
                    <span className="font-medium text-gray-900">{book.publishYear || 'Không có thông tin'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-gray-600">Số trang:</span>
                    <span className="font-medium text-gray-900">{book.pageCount || 'Không có thông tin'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-gray-600">ISBN:</span>
                    <span className="font-medium text-gray-900">{book.isbn || 'Không có thông tin'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-gray-600">Ngôn ngữ:</span>
                    <span className="font-medium text-gray-900">
                      {book.language === 'vi' ? 'Tiếng Việt' : 
                       book.language === 'en' ? 'Tiếng Anh' : 
                       book.language || 'Không có thông tin'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Seller Information */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Thông tin người bán</h3>
                <div className="flex items-center space-x-3 mb-3">
                  {book.seller?.avatar ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <Image 
                        src={book.seller.avatar} 
                        alt={book.seller.username} 
                        width={40} 
                        height={40} 
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center">
                      <span className="text-white font-medium">{book.seller?.username.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{book.seller?.username}</p>
                    <p className="text-sm text-gray-600">Thành viên từ {formatDate(book.seller?.createdAt)}</p>
                  </div>
                </div>
                {book.seller?.phone && (
                  <div className="flex items-center text-sm mb-2">
                    <Phone size={16} className="mr-2 text-gray-600" />
                    <span>{book.seller.phone}</span>
                  </div>
                )}
                {book.address && (
                  <div className="flex items-center text-sm">
                    <MapPin size={16} className="mr-2 text-gray-600" />
                    <span>{book.address}</span>
                  </div>
                )}
              </div>

              {/* Quantity and Buttons */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <label className="text-gray-700 font-medium">Số lượng:</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex space-x-4">
                  <button className="flex-1 bg-green-700 text-white py-3 px-6 rounded-full font-medium hover:bg-green-800 transition-colors">
                    + Thêm vào giỏ
                  </button>
                  <button className="flex-1 border border-green-700 text-green-700 py-3 px-6 rounded-full font-medium hover:bg-green-50 transition-colors">
                    + Mua ngay
                  </button>
                  <button className="p-3 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                    <Heart className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="border-t border-gray-200">
            <div className="flex border-b border-gray-200">
              {['MÔ TẢ', 'ĐÁNH GIÁ'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-4 text-sm font-medium transition-colors
                    ${activeTab === tab 
                      ? 'text-green-700 border-b-2 border-green-700' 
                      : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {tab} {tab === 'ĐÁNH GIÁ' && book.reviews ? `(${book.reviews.length})` : ''}
                </button>
              ))}
            </div>
            
            <div className="p-8">
              {activeTab === 'MÔ TẢ' && (
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: book.description }} />
                  {book.conditionDescription && (
                    <>
                      <h3 className="text-lg font-bold mt-6 mb-3">Chi tiết tình trạng sách:</h3>
                      <div dangerouslySetInnerHTML={{ __html: book.conditionDescription }} />
                    </>
                  )}
                </div>
              )}
              {activeTab === 'ĐÁNH GIÁ' && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Đánh giá từ người mua</h3>
                  {book.reviews && book.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {book.reviews.map(review => (
                        <div key={review.id} className="border-b border-gray-200 pb-6">
                          <div className="flex items-center mb-2">
                            <div className="flex mr-2">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star 
                                  key={star} 
                                  size={18} 
                                  className={star <= review.rating ? "text-yellow-400" : "text-gray-300"} 
                                  fill={star <= review.rating ? "currentColor" : "none"} 
                                />
                              ))}
                            </div>
                            <span className="font-medium">{review.reviewerName}</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Chưa có đánh giá nào cho sách này.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* School Information */}
        {book.school && (
          <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin trường học</h2>
            <div className="flex items-start">
              <MapPin size={20} className="mr-3 text-green-700 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">{book.school.name}</h3>
                <p className="text-gray-600">{book.school.address}</p>
              </div>
            </div>
          </div>
        )}

        {/* Related Products */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Sách liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Related products would go here */}
          </div>
        </div>
      </div>
    </div>
  );
} 