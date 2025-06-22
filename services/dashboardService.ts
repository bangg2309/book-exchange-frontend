import { apiService } from './api';
import { toastService } from './toastService';
import { ApiResponse } from '@/types/apiResponse';

/**
 * Service xử lý các API liên quan đến thống kê dashboard
 */
export const dashboardService = {
  /**
   * Lấy tổng số đơn hàng
   */
  async getTotalOrders(): Promise<number | null> {
    try {
      const response = await apiService.get<ApiResponse<number>>('/dashboard/stats/orders/total');
      return response.result;
    } catch (error) {
      toastService.error('Không thể lấy thông tin tổng số đơn hàng');
      return null;
    }
  },

  /**
   * Lấy tổng số sách
   */
  async getTotalBooks(): Promise<number | null> {
    try {
      const response = await apiService.get<ApiResponse<number>>('/dashboard/stats/books/total');
      return response.result;
    } catch (error) {
      toastService.error('Không thể lấy thông tin tổng số sách');
      return null;
    }
  },

  /**
   * Lấy tổng số danh mục
   */
  async getTotalCategories(): Promise<number | null> {
    try {
      const response = await apiService.get<ApiResponse<number>>('/dashboard/stats/categories/total');
      return response.result;
    } catch (error) {
      toastService.error('Không thể lấy thông tin tổng số danh mục');
      return null;
    }
  },

  /**
   * Lấy tổng số người dùng
   */
  async getTotalUsers(): Promise<number | null> {
    try {
      const response = await apiService.get<ApiResponse<number>>('/dashboard/stats/users/total');
      return response.result;
    } catch (error) {
      toastService.error('Không thể lấy thông tin tổng số người dùng');
      return null;
    }
  },

  /**
   * Lấy danh sách sách mới nhất đã được phê duyệt
   */
  async getRecentBooks(): Promise<any[] | null> {
    try {
      const response = await apiService.get<ApiResponse<any[]>>('/dashboard/recent-books');
      return response.result;
    } catch (error) {
      toastService.error('Không thể lấy thông tin sách gần đây');
      return null;
    }
  }
}; 