"use client";

// Lưu ý: Đây là một global service để hiển thị toast từ bất kỳ đâu trong ứng dụng
// Chúng ta sẽ dùng Event system để giao tiếp giữa service và Toast component

// Các loại toast
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Dữ liệu của toast
interface ToastData {
  message: string;
  type: ToastType;
}

// Event đặc biệt cho toast
const TOAST_EVENT_NAME = 'app:toast';

// Tạo event toast
export function createToastEvent(data: ToastData): CustomEvent<ToastData> {
  return new CustomEvent(TOAST_EVENT_NAME, { detail: data });
}

// Service để hiển thị toast
export const toastService = {
  /**
   * Hiển thị toast thành công
   */
  success: (message: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(createToastEvent({ message, type: 'success' }));
    }
  },

  /**
   * Hiển thị toast lỗi
   */
  error: (message: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(createToastEvent({ message, type: 'error' }));
    }
  },

  /**
   * Hiển thị toast thông tin
   */
  info: (message: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(createToastEvent({ message, type: 'info' }));
    }
  },

  /**
   * Hiển thị toast cảnh báo
   */
  warning: (message: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(createToastEvent({ message, type: 'warning' }));
    }
  }
};

// Hook để lắng nghe sự kiện toast cho component Toast
export function useToastListener(callback: (data: ToastData) => void) {
  if (typeof window === 'undefined') return;
  
  const handleToastEvent = (event: Event) => {
    const toastEvent = event as CustomEvent<ToastData>;
    callback(toastEvent.detail);
  };

  // Đăng ký lắng nghe sự kiện
  window.addEventListener(TOAST_EVENT_NAME, handleToastEvent);
  
  // Hàm cleanup
  return () => {
    window.removeEventListener(TOAST_EVENT_NAME, handleToastEvent);
  };
} 