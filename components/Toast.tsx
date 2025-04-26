"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToastListener, ToastType } from '@/services/toastService';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Thêm toast mới
  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    // Tự động ẩn sau 5 giây
    setTimeout(() => {
      hideToast(id);
    }, 5000);
  }, []);

  // Ẩn toast
  const hideToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Lắng nghe sự kiện toast từ toastService
  useEffect(() => {
    const cleanup = useToastListener((data) => {
      showToast(data.message, data.type);
    });

    return cleanup;
  }, [showToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center justify-between p-4 rounded-md shadow-md min-w-[300px] max-w-md ${getToastStyle(
            toast.type
          )}`}
        >
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => hideToast(toast.id)}
            className="p-1 rounded-full hover:bg-black/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

function getToastStyle(type: ToastType): string {
  switch (type) {
    case 'success':
      return 'bg-green-500 text-white';
    case 'error':
      return 'bg-red-500 text-white';
    case 'warning':
      return 'bg-yellow-500 text-white';
    case 'info':
    default:
      return 'bg-blue-500 text-white';
  }
} 