'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authService } from '@/services/authService';
import { toastService } from '@/services/toastService';
import { FaEdit, FaStar, FaUser, FaBook, FaInfoCircle } from 'react-icons/fa';

interface Book {
  id: number;
  title: string;
  author: string;
  publishYear: number;
  price: number;
  category: string;
  imageUrl: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Demo data cho sách đang bán
  const [sellingBooks, setSellingBooks] = useState<Book[]>([
    {
      id: 1,
      title: 'Lập trình Java Siêu vip pro',
      author: 'Nguyễn Văn A',
      publishYear: 2022,
      price: 185000,
      category: 'Công nghệ thông tin',
      imageUrl: '/images/book-placeholder.jpg',
    },
    {
      id: 2,
      title: 'Kinh tế học đại cương',
      author: 'Trần Thị B',
      publishYear: 2021,
      price: 120000,
      category: 'Kinh tế',
      imageUrl: '/images/book-placeholder.jpg',
    },
    {
      id: 3,
      title: 'Giải tích 1',
      author: 'Lê Văn C',
      publishYear: 2023,
      price: 150000,
      category: 'Toán học',
      imageUrl: '/images/book-placeholder.jpg',
    },
    {
      id: 4,
      title: 'Marketing căn bản',
      author: 'Phạm Thị D',
      publishYear: 2019,
      price: 90000,
      category: 'Marketing',
      imageUrl: '/images/book-placeholder.jpg',
    },
  ]);

  // Demo data cho đánh giá
  const [reviews, setReviews] = useState([
    {
      id: 1,
      user: 'Nguyễn Thị B',
      rating: 5,
      content: 'Sách rất tốt, giao dịch nhanh chóng!',
    },
    {
      id: 2,
      user: 'Trần Văn C',
      rating: 4,
      content: 'Sách chất lượng, đóng gói cẩn thận. Rất hài lòng!',
    },
    {
      id: 3,
      user: 'Lê Thị D',
      rating: 5,
      content: 'Sách nội dung hay nhưng vẫn còn vài chỗ nhăn.',
    },
    {
      id: 4,
      user: 'Lý Quách E',
      rating: 5,
      content: 'Uy tín, phản hồi nhanh, chốt giá cả hợp lý.',
    },
  ]);

  // Lấy thông tin người dùng
  useEffect(() => {
    // Kiểm tra đăng nhập
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchUserInfo = async () => {
      try {
        // Thử lấy từ localStorage
        let userInfo = authService.getCurrentUser();
        
        // Nếu không có, lấy từ API
        if (!userInfo) {
          userInfo = await authService.getUserInfo();
        }
        
        setUser(userInfo);
      } catch (error) {
        console.error('Không thể tải thông tin người dùng:', error);
        toastService.error('Không thể tải thông tin người dùng');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [router]);

  // Hàm xử lý đăng xuất
  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  // Hiển thị sao đánh giá
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <FaStar 
        key={index} 
        className={`w-4 h-4 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  // Định dạng số tiền theo tiền tệ Việt Nam
  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + 'đ';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header / Banner */}
      <div className="bg-green-700 h-28 relative">
        {/* Phần banner cố định */}
      </div>

      {/* Thông tin profile và số liệu */}
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg mb-6 p-6 mt-6">
          {/* Thông tin người dùng */}
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl border-4 border-white shadow">
                {user?.avatar ? (
                  <Image src={user.avatar} alt={user?.username || "AV"} width={80} height={80} className="rounded-full" />
                ) : (
                  user?.username?.substring(0, 2).toUpperCase() || "AV"
                )}
              </div>
            </div>

            {/* Thông tin cá nhân */}
            <div className="flex-1">
              <h1 className="text-xl font-bold">{user?.fullName || "Nguyễn Văn A"}</h1>
              <p className="text-gray-500 text-sm mb-2">{user?.email || "nguyenvana@example.com"}</p>
              <p className="text-gray-700 text-sm mb-4">{user?.bio || "Xin chào! Tôi là một sinh viên đam mê đọc sách và chia sẻ kiến thức. Hãy kết nối với tôi nhé!"}</p>
              
              {/* Số liệu */}
              <div className="flex gap-10 mt-3">
                <div className="text-center">
                  <p className="text-xl font-bold text-green-700">{sellingBooks.length}</p>
                  <p className="text-xs text-gray-500">Sách đã bán</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-amber-500">4.8</p>
                  <p className="text-xs text-gray-500">Đánh giá</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-blue-600">120</p>
                  <p className="text-xs text-gray-500">Người theo dõi</p>
                </div>
              </div>
            </div>

            {/* Nút chỉnh sửa và đăng xuất */}
            <div className="flex flex-col gap-2 md:flex-row">
              <button 
                className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition"
                onClick={() => router.push('/profile/edit')}
              >
                Chỉnh sửa profile
              </button>
              <button 
                className="px-4 py-2 border border-green-700 text-green-700 rounded hover:bg-green-50 transition"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {/* Sách đang bán */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4 border-b-2 border-green-700 pb-2">Sách đang bán</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sellingBooks.map(book => (
              <div key={book.id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
                <div className="h-40 bg-gray-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <span>Hình ảnh sách</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-md mb-1">{book.title}</h3>
                  <p className="text-sm text-gray-600">
                    {book.author} • <span className="text-gray-500">Năm xuất bản: {book.publishYear}</span>
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-500">{book.category}</p>
                  </div>
                  <p className="text-green-700 font-bold mt-2">{formatCurrency(book.price)}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-6">
            <button className="px-6 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition">
              Xem tất cả
            </button>
          </div>
        </div>

        {/* Đánh giá */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4 border-b-2 border-green-700 pb-2">Đánh giá</h2>
          
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-white rounded-lg shadow p-4 border border-gray-100">
                <div className="flex justify-between">
                  <h3 className="font-bold">{review.user}</h3>
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <p className="text-gray-700 mt-2">{review.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-green-800 text-white py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Liên kết</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:underline">Trang chủ</Link></li>
              <li><Link href="/danh-muc-sach" className="hover:underline">Danh mục sách</Link></li>
              <li><Link href="/ban-sach" className="hover:underline">Bán sách</Link></li>
              <li><Link href="/ve-chung-toi" className="hover:underline">Về chúng tôi</Link></li>
              <li><Link href="/blog" className="hover:underline">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Chính sách</h3>
            <ul className="space-y-2">
              <li><Link href="/dieu-khoan-su-dung" className="hover:underline">Điều khoản sử dụng</Link></li>
              <li><Link href="/chinh-sach-bao-mat" className="hover:underline">Chính sách bảo mật</Link></li>
              <li><Link href="/quy-dinh-giao-dich" className="hover:underline">Quy định giao dịch</Link></li>
              <li><Link href="/cau-hoi-thuong-gap" className="hover:underline">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Liên hệ</h3>
            <p className="mb-2">Email: contact@bookexchange.vn</p>
            <p className="mb-2">Hotline: 0123 456 789</p>
            <p className="mb-2">Địa chỉ: Đại học Nông Lâm TP.HCM</p>
            <p>Khu phố 6, P.Linh Trung, Q.Thủ Đức, TP.HCM</p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 mt-8 pt-8 border-t border-green-700">
          <p className="text-center text-sm">© 2023 BookExchange. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
} 