'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { paymentService } from '@/services/paymentService';
import { CheckCircle2, XCircle } from 'lucide-react';

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Đang xử lý kết quả thanh toán...');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        // Lấy vnp_TxnRef từ query params (format: orderId-timestamp)
        const txnRef = searchParams.get('vnp_TxnRef');
        if (txnRef) {
          const orderId = txnRef.split('-')[0];
          setOrderId(orderId);
        }

        // Xử lý kết quả thanh toán
        const result = await paymentService.processCallback(searchParams);

        if (result.code === '00') {
          setStatus('success');
          setMessage('Thanh toán thành công!');
        } else {
          setStatus('error');
          setMessage(`Thanh toán thất bại: ${result.message}`);
        }
      } catch (error) {
        console.error('Error processing payment result:', error);
        setStatus('error');
        setMessage('Đã xảy ra lỗi khi xử lý kết quả thanh toán.');
      }
    };

    if (searchParams) {
      processPaymentResult();
    }
  }, [searchParams]);

  const handleContinue = () => {
    if (orderId) {
      router.push(`/profile/buy-orders`);
    } else {
      router.push('/profile/buy-orders');
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              <h2 className="text-xl font-semibold">Đang xử lý...</h2>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <h2 className="text-2xl font-bold text-green-500">Thanh toán thành công!</h2>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="h-16 w-16 text-red-500" />
              <h2 className="text-2xl font-bold text-red-500">Thanh toán thất bại</h2>
            </div>
          )}

          <p className="mt-4 text-gray-600">{message}</p>

          {status !== 'loading' && (
            <div className="mt-8">
              <button 
                onClick={handleContinue} 
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                {status === 'success' ? 'Xem chi tiết đơn hàng' : 'Quay lại đơn hàng'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-10">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              <h2 className="text-xl font-semibold">Đang tải...</h2>
            </div>
          </div>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
} 