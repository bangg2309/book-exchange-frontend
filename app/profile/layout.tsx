'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaMapMarkerAlt, FaInfoCircle, FaShoppingBag, FaStore, FaEdit, FaStar } from 'react-icons/fa';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { User } from '@/types/user';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Fetch user information
  useEffect(() => {
    // Check if logged in
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user profile from API
        const userProfile = await userService.getMyInfo();
        setUser(userProfile);
      } catch (error) {
        console.error('Không thể tải thông tin người dùng:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Helper functions
  const getDisplayName = (user: User | null) => {
    if (!user) return 'N/A';
    return user.fullName || user.username;
  };

  const getAverageRating = () => {
    // In a real app, this would calculate the average rating from reviews
    return 4.5;
  };

  // Check if a link is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar - User info and navigation - fixed position */}
          <div className="lg:w-1/4 lg:sticky lg:top-4 lg:self-start">
            {/* User info card */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto mb-2"></div>
                  <p className="text-sm">Đang tải...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl border-2 border-white shadow overflow-hidden">
                      {user?.avatar ? (
                        <Image src={user.avatar} alt={user.username} width={64} height={64} className="rounded-full" />
                      ) : (
                        <span className="font-medium">{user?.username?.substring(0, 2).toUpperCase() || "AV"}</span>
                      )}
                    </div>
                    <div>
                      <h2 className="font-bold">{getDisplayName(user)}</h2>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <FaEdit className="mr-1 text-xs" />
                        <Link href="/profile" className="hover:text-green-700">Sửa hồ sơ</Link>
                      </div>
                    </div>
                  </div>
                  
                  {/* User stats */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-green-700 font-bold">0</div>
                      <div className="text-xs text-gray-500">Sách bán</div>
                    </div>
                    <div>
                      <div className="text-green-700 font-bold">{getAverageRating()}</div>
                      <div className="text-xs text-gray-500">Đánh giá</div>
                    </div>
                    <div>
                      <div className="text-green-700 font-bold">0</div>
                      <div className="text-xs text-gray-500">Đơn mua</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Navigation menu */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold">Tài khoản của tôi</h3>
              </div>
              <div className="divide-y divide-gray-100">
                <Link
                  href="/profile"
                  className={`w-full text-left flex items-center gap-3 p-4 hover:bg-green-50 hover:text-green-700 ${isActive('/profile') ? 'bg-green-50 text-green-700' : ''}`}
                >
                  <FaUser className={isActive('/profile') ? 'text-green-700' : 'text-gray-400'} />
                  <span>Hồ sơ</span>
                </Link>
                <Link
                  href="/profile/address" 
                  className={`w-full text-left flex items-center gap-3 p-4 hover:bg-green-50 hover:text-green-700 ${isActive('/profile/address') ? 'bg-green-50 text-green-700' : ''}`}
                >
                  <FaMapMarkerAlt className={isActive('/profile/address') ? 'text-green-700' : 'text-gray-400'} />
                  <span>Địa chỉ</span>
                </Link>
                <Link
                  href="/profile/password"
                  className={`w-full text-left flex items-center gap-3 p-4 hover:bg-green-50 hover:text-green-700 ${isActive('/profile/password') ? 'bg-green-50 text-green-700' : ''}`}
                >
                  <FaInfoCircle className={isActive('/profile/password') ? 'text-green-700' : 'text-gray-400'} />
                  <span>Đổi mật khẩu</span>
                </Link>
              </div>
              
              <div className="p-4 border-b border-t border-gray-100 mt-2">
                <h3 className="font-bold">Đơn hàng</h3>
              </div>
              <div className="divide-y divide-gray-100">
                <Link
                  href="/profile/buy-orders"
                  className={`w-full text-left flex items-center gap-3 p-4 hover:bg-green-50 hover:text-green-700 ${isActive('/profile/buy-orders') ? 'bg-green-50 text-green-700' : ''}`}
                >
                  <FaShoppingBag className={isActive('/profile/buy-orders') ? 'text-green-700' : 'text-gray-400'} />
                  <span>Đơn mua</span>
                </Link>
                <Link
                  href="/profile/sell-orders"
                  className={`w-full text-left flex items-center gap-3 p-4 hover:bg-green-50 hover:text-green-700 ${isActive('/profile/sell-orders') ? 'bg-green-50 text-green-700' : ''}`}
                >
                  <FaStore className={isActive('/profile/sell-orders') ? 'text-green-700' : 'text-gray-400'} />
                  <span>Đơn bán</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:w-3/4">
            {children}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}