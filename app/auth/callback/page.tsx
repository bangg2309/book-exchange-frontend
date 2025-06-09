'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/authService';
import { toastService } from '@/services/toastService';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Đang xử lý đăng nhập...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the provider and token from URL query params
        const provider = searchParams.get('provider');
        const token = searchParams.get('token');
        
        if (!provider || !token) {
          setMessage('Thiếu thông tin xác thực. Vui lòng thử lại.');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        // Process login with the provider and token
        const authResponse = await authService.loginWithProvider(provider, token);
        
        // Check if we have user info
        if (authResponse.userInfo) {
          // Check admin status
          const isAdmin = authResponse.userInfo.roles?.some(
            (role: any) => role && role.name && role.name.toUpperCase() === 'ADMIN'
          );
          
          // Store admin status
          localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
          
          // Dispatch event to update components
          window.dispatchEvent(new Event('auth-changed'));
          
          // Set up token refresh
          authService.setupTokenRefresh();
          
          // Show success message
          toastService.success('Đăng nhập thành công!');
          
          // Redirect to appropriate page
          setTimeout(() => {
            if (isAdmin) {
              router.push('/admin');
            } else {
              router.push('/profile');
            }
          }, 500);
        } else {
          throw new Error('Không nhận được thông tin người dùng');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setMessage('Đăng nhập thất bại. Vui lòng thử lại.');
        setTimeout(() => router.push('/login'), 2000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full">
        <div className="animate-spin mx-auto mb-4 w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-green-600 rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {message}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Bạn sẽ được chuyển hướng trong giây lát...
        </p>
      </div>
    </div>
  );
} 