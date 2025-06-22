'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/authService';
import { toastService } from '@/services/toastService';

export default function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function handleCallback() {
      try {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        
        if (!token || !refreshToken) {
          toastService.error('Không nhận được token xác thực');
          router.push('/login');
          return;
        }

        console.log('Đã nhận được token sau khi OAuth:', token.substring(0, 20) + '...');
        
        // Lưu token vào localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Lấy thông tin người dùng
        const userInfo = await authService.getUserInfo();
        
        if (userInfo) {
          // Kiểm tra vai trò admin
          const isAdmin = userInfo.roles?.some(
            (role: any) => role.name && role.name.toUpperCase() === 'ADMIN'
          );
          
          // Lưu trạng thái admin vào localStorage
          localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
          
          // Thiết lập refresh token
          authService.setupTokenRefresh();
          
          // Thông báo đăng nhập thành công
          toastService.success('Đăng nhập thành công!');
          
          // Chuyển hướng dựa trên vai trò (ngay lập tức)
          router.push(isAdmin ? '/admin' : '/profile');
        } else {
          throw new Error('Không lấy được thông tin người dùng');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        toastService.error('Đăng nhập thất bại. Vui lòng thử lại.');
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }
    
    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="flex flex-col items-center">
          <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-blue-500"></div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Đang xử lý đăng nhập...
          </h2>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
            Vui lòng chờ trong giây lát
          </p>
        </div>
      </div>
    </div>
  );
} 