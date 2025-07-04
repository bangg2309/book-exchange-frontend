"use client";

import { apiService } from './api';
import { toastService } from './toastService';
import { authService } from './authService';
import { ApiResponse } from '@/types/apiResponse';
import { OrderCreationRequest, OrderResponse, OrderItemResponse, RevenueStatsResponse } from '@/types/order';
import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from './api';

interface OrderResponseData extends ApiResponse<OrderResponse> {}
interface OrdersListResponse extends ApiResponse<OrderResponse[]> {}
interface OrderItemResponseData extends ApiResponse<OrderItemResponse> {}
interface OrderItemsListResponse extends ApiResponse<OrderItemResponse[]> {}

const API_ROUTES = {
  CHECKOUT: '/orders/checkout',
  GET_USER_ORDERS: (userId: number) => `/orders/user/${userId}`,
  GET_SELLER_ORDERS: (sellerId: number) => `/orders/seller/${sellerId}`,
  GET_CURRENT_SELLER_ORDERS: '/orders/seller/me',
  GET_ORDER: (orderId: number) => `/orders/${orderId}`,
  GET_ORDER_ITEMS_BY_USER: (userId: number) => `/order-items/user/${userId}`,
  GET_ORDER_ITEMS_BY_SELLER: (sellerId: number) => `/order-items/seller/${sellerId}`,
  GET_ORDER_ITEM: (orderItemId: number) => `/order-items/${orderItemId}`,
  UPDATE_ORDER_ITEM_STATUS: (orderItemId: number, status: number) => `/order-items/${orderItemId}/status/${status}`,
  ADMIN_GET_ALL_ORDERS: '/orders/admin',
  ADMIN_UPDATE_ORDER_STATUS: (orderId: number, status: number) => `/orders/admin/${orderId}/status/${status}`,
  ADMIN_DELETE_ORDER: (orderId: number) => `/orders/admin/${orderId}`,
  DASHBOARD: '/dashboard',
};

export const orderService = {
  /**
   * Process checkout and create an order
   */
  checkout: async (orderData: OrderCreationRequest): Promise<OrderResponse | null> => {
    try {
      if (!authService.isAuthenticated()) {
        toastService.error('Vui lòng đăng nhập để thanh toán');
        return null;
      }
      
      const response = await apiService.post<OrderResponseData>(API_ROUTES.CHECKOUT, orderData);
      
      if (response.code === 1000) {
        toastService.success('Đặt hàng thành công!');
        return response.result;
      }
      
      toastService.error(response.message || 'Không thể xử lý đơn hàng');
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        toastService.error(axiosError.response?.data?.message || 'Không thể xử lý đơn hàng');
      } else {
        toastService.error('Không thể xử lý đơn hàng');
      }
      return null;
    }
  },
  
  /**
   * Create an order (alias for checkout)
   */
  createOrder: async (orderData: OrderCreationRequest): Promise<OrderResponse> => {
    const result = await orderService.checkout(orderData);
    if (!result) {
      throw new Error('Không thể tạo đơn hàng');
    }
    return result;
  },
  
  /**
   * Get order by ID (with seller-specific details if applicable)
   */
  getOrder: async (orderId: number): Promise<OrderResponse | null> => {
    try {
      if (!authService.isAuthenticated()) {
        console.error('[DEBUG] User not authenticated when calling getOrder');
        toastService.error('Vui lòng đăng nhập để xem đơn hàng');
        return null;
      }
      
      const token = authService.getToken();
      console.log('[DEBUG] Fetching order details for ID:', orderId, 'Auth token exists:', !!token);
      
      // Sử dụng axios trực tiếp để có thể truy cập thông tin lỗi chi tiết hơn
      const response = await axios.get(`${API_BASE_URL}${API_ROUTES.GET_ORDER(orderId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('[DEBUG] Order API response status:', response.status);
      
      if (response.data && response.data.code === 1000) {
        console.log('[DEBUG] Order details fetched successfully');
        return response.data.result;
      }
      
      console.error('[DEBUG] API returned error code:', response.data?.code, 'Message:', response.data?.message);
      toastService.error(response.data?.message || 'Không thể tải thông tin đơn hàng');
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        console.error('[DEBUG] Error response from getOrder API:', axiosError.response?.status, axiosError.response?.data);
        console.error('[DEBUG] Error request config:', axiosError.config);
        
        if (axiosError.response?.status === 403) {
          toastService.error('Bạn không có quyền xem đơn hàng này');
        } else if (axiosError.response?.status === 404) {
          toastService.error('Không tìm thấy đơn hàng');
        } else {
          toastService.error(axiosError.response?.data?.message || 'Không thể tải thông tin đơn hàng');
        }
      } else {
        console.error('[DEBUG] Non-Axios error in getOrder:', error);
        toastService.error('Không thể tải thông tin đơn hàng');
      }
      return null;
    }
  },
  
  /**
   * Get seller-specific order details by ID
   */
  getSellerOrderById: async (orderId: number): Promise<OrderResponse | null> => {
    try {
      if (!authService.isAuthenticated()) {
        toastService.error('Vui lòng đăng nhập để xem đơn bán');
        return null;
      }
      
      // Reuse the same endpoint but the backend will filter data based on authenticated user
      const response = await apiService.get<OrderResponseData>(API_ROUTES.GET_ORDER(orderId));
      
      if (response.code === 1000) {
        return response.result;
      }
      
      toastService.error(response.message || 'Không thể tải thông tin đơn bán');
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        toastService.error(axiosError.response?.data?.message || 'Không thể tải thông tin đơn bán');
      } else {
        toastService.error('Không thể tải thông tin đơn bán');
      }
      return null;
    }
  },
  
  /**
   * Get orders for the current user
   */
  getUserOrders: async (): Promise<OrderResponse[]> => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        return [];
      }
      
      const userId = currentUser.id;
      const response = await apiService.get<OrdersListResponse>(API_ROUTES.GET_USER_ORDERS(Number(userId)));
      
      if (response.code === 1000) {
        return response.result || [];
      }
      
      toastService.error(response.message || 'Không thể tải danh sách đơn hàng');
      return [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        toastService.error(axiosError.response?.data?.message || 'Không thể tải danh sách đơn hàng');
      } else {
        toastService.error('Không thể tải danh sách đơn hàng');
      }
      return [];
    }
  },
  
  /**
   * Get orders for the current user as a seller
   */
  getSellerOrders: async (): Promise<ApiResponse<OrderResponse[]>> => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        return { code: 1001, message: 'Người dùng chưa đăng nhập', result: [] };
      }
      
      const sellerId = currentUser.id;
      const response = await apiService.get<OrdersListResponse>(API_ROUTES.GET_SELLER_ORDERS(Number(sellerId)));
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        toastService.error(axiosError.response?.data?.message || 'Không thể tải danh sách đơn hàng bán');
      } else {
        toastService.error('Không thể tải danh sách đơn hàng bán');
      }
      return { code: 1001, message: 'Lỗi khi tải đơn hàng', result: [] };
    }
  },
  
  /**
   * Get orders for the current user as a seller using the /me endpoint
   */
  getCurrentSellerOrders: async (): Promise<ApiResponse<OrderResponse[]>> => {
    try {
      if (!authService.isAuthenticated()) {
        toastService.error('Vui lòng đăng nhập để xem đơn bán');
        return { code: 1001, message: 'Người dùng chưa đăng nhập', result: [] };
      }
      
      console.log('[DEBUG] Calling getCurrentSellerOrders API');
      const response = await apiService.get<OrdersListResponse>(API_ROUTES.GET_CURRENT_SELLER_ORDERS);
      console.log('[DEBUG] getCurrentSellerOrders response:', response);
      
      // In ra chi tiết về trạng thái của từng đơn hàng
      if (response && response.result) {
        console.log('[DEBUG] Order statuses:', response.result.map(order => ({
          orderId: order.id,
          status: order.status,
          items: order.items.map(item => ({
            itemId: item.id,
            status: item.status
          }))
        })));
      }
      
      return response;
    } catch (error) {
      console.error('[DEBUG] Error in getCurrentSellerOrders:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        console.log('[DEBUG] Error response data:', axiosError.response?.data);
        toastService.error(axiosError.response?.data?.message || 'Không thể tải danh sách đơn hàng bán');
      } else {
        toastService.error('Không thể tải danh sách đơn hàng bán');
      }
      return { code: 1001, message: 'Lỗi khi tải đơn hàng', result: [] };
    }
  },
  
  /**
   * Get order items by user ID
   */
  getOrderItemsByUserId: async (userId: number): Promise<OrderItemResponse[]> => {
    try {
      if (!authService.isAuthenticated()) {
        toastService.error('Vui lòng đăng nhập để xem đơn hàng');
        return [];
      }
      
      const response = await apiService.get<OrderItemsListResponse>(API_ROUTES.GET_ORDER_ITEMS_BY_USER(userId));
      
      if (response.code === 1000) {
        return response.result || [];
      }
      
      toastService.error(response.message || 'Không thể tải danh sách đơn hàng');
      return [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        toastService.error(axiosError.response?.data?.message || 'Không thể tải danh sách đơn hàng');
      } else {
        toastService.error('Không thể tải danh sách đơn hàng');
      }
      return [];
    }
  },
  
  /**
   * Get order items by seller ID
   */
  getOrderItemsBySellerId: async (sellerId: number): Promise<OrderItemResponse[]> => {
    try {
      if (!authService.isAuthenticated()) {
        toastService.error('Vui lòng đăng nhập để xem đơn hàng');
        return [];
      }
      
      const response = await apiService.get<OrderItemsListResponse>(API_ROUTES.GET_ORDER_ITEMS_BY_SELLER(sellerId));
      
      if (response.code === 1000) {
        return response.result || [];
      }
      
      toastService.error(response.message || 'Không thể tải danh sách đơn hàng');
      return [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        toastService.error(axiosError.response?.data?.message || 'Không thể tải danh sách đơn hàng');
      } else {
        toastService.error('Không thể tải danh sách đơn hàng');
      }
      return [];
    }
  },
  
  /**
   * Get order item by ID
   */
  getOrderItemById: async (orderItemId: number): Promise<OrderItemResponse | null> => {
    try {
      if (!authService.isAuthenticated()) {
        toastService.error('Vui lòng đăng nhập để xem đơn hàng');
        return null;
      }
      
      const response = await apiService.get<OrderItemResponseData>(API_ROUTES.GET_ORDER_ITEM(orderItemId));
      
      if (response.code === 1000) {
        return response.result;
      }
      
      toastService.error(response.message || 'Không thể tải thông tin đơn hàng');
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        toastService.error(axiosError.response?.data?.message || 'Không thể tải thông tin đơn hàng');
      } else {
        toastService.error('Không thể tải thông tin đơn hàng');
      }
      return null;
    }
  },
  
  /**
   * Update order item status
   */
  updateOrderItemStatus: async (orderItemId: number, status: number): Promise<OrderItemResponse | null> => {
    try {
      if (!authService.isAuthenticated()) {
        toastService.error('Vui lòng đăng nhập để cập nhật đơn hàng');
        return null;
      }
      
      const response = await apiService.patch<OrderItemResponseData>(API_ROUTES.UPDATE_ORDER_ITEM_STATUS(orderItemId, status));
      
      if (response.code === 1000) {
        // toastService.success('Cập nhật trạng thái đơn hàng thành công');
        return response.result;
      }
      
      toastService.error(response.message || 'Không thể cập nhật trạng thái đơn hàng');
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        toastService.error(axiosError.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng');
      } else {
        toastService.error('Không thể cập nhật trạng thái đơn hàng');
      }
      return null;
    }
  },

  /**
   * Admin: Get all orders
   */
  adminGetAllOrders: async (page: number = 0, size: number = 10, search?: string, sort: string = 'createdAt', direction: string = 'DESC'): Promise<ApiResponse<any>> => {
    try {
      if (!authService.isAuthenticated() || !authService.isAdmin()) {
        return { code: 1001, message: 'Không có quyền truy cập', result: { content: [], totalPages: 0, totalElements: 0 } };
      }

      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('size', size.toString());
      queryParams.append('sort', sort);
      queryParams.append('direction', direction);
      
      if (search && search.trim()) {
        queryParams.append('search', search.trim());
      }

      console.log('[DEBUG] Calling adminGetAllOrders API');
      const response = await apiService.get<ApiResponse<any>>(`${API_ROUTES.ADMIN_GET_ALL_ORDERS}?${queryParams.toString()}`);
      console.log('[DEBUG] adminGetAllOrders response:', response);
      
      return response;
    } catch (error) {
      console.error('[DEBUG] Error in adminGetAllOrders:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        console.log('[DEBUG] Error response data:', axiosError.response?.data);
        toastService.error(axiosError.response?.data?.message || 'Không thể tải danh sách đơn hàng');
      } else {
        toastService.error('Không thể tải danh sách đơn hàng');
      }
      return { code: 1001, message: 'Lỗi khi tải đơn hàng', result: { content: [], totalPages: 0, totalElements: 0 } };
    }
  },
  
  /**
   * Admin: Update order status
   */
  adminUpdateOrderStatus: async (orderId: number, status: number): Promise<ApiResponse<OrderResponse | null>> => {
    try {
      if (!authService.isAuthenticated() || !authService.isAdmin()) {
        toastService.error('Bạn không có quyền thực hiện thao tác này');
        return { code: 1001, message: 'Không có quyền truy cập', result: null };
      }
      
      console.log('[DEBUG] Calling adminUpdateOrderStatus API', orderId, status);
      const response = await apiService.patch<ApiResponse<OrderResponse>>(API_ROUTES.ADMIN_UPDATE_ORDER_STATUS(orderId, status));
      console.log('[DEBUG] adminUpdateOrderStatus response:', response);
      
      if (response.code === 1000) {
        toastService.success('Cập nhật trạng thái đơn hàng thành công');
      } else {
        toastService.error(response.message || 'Không thể cập nhật trạng thái đơn hàng');
      }
      
      return response;
    } catch (error) {
      console.error('[DEBUG] Error in adminUpdateOrderStatus:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        console.log('[DEBUG] Error response data:', axiosError.response?.data);
        toastService.error(axiosError.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng');
      } else {
        toastService.error('Không thể cập nhật trạng thái đơn hàng');
      }
      return { code: 1001, message: 'Lỗi khi cập nhật đơn hàng', result: null };
    }
  },
  
  /**
   * Admin: Delete order
   */
  adminDeleteOrder: async (orderId: number): Promise<ApiResponse<boolean>> => {
    try {
      if (!authService.isAuthenticated() || !authService.isAdmin()) {
        toastService.error('Bạn không có quyền thực hiện thao tác này');
        return { code: 1001, message: 'Không có quyền truy cập', result: false };
      }
      
      console.log('[DEBUG] Calling adminDeleteOrder API', orderId);
      const response = await apiService.delete<ApiResponse<boolean>>(API_ROUTES.ADMIN_DELETE_ORDER(orderId));
      console.log('[DEBUG] adminDeleteOrder response:', response);
      
      if (response.code === 1000) {
        toastService.success('Xóa đơn hàng thành công');
      } else {
        toastService.error(response.message || 'Không thể xóa đơn hàng');
      }
      
      return response;
    } catch (error) {
      console.error('[DEBUG] Error in adminDeleteOrder:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        console.log('[DEBUG] Error response data:', axiosError.response?.data);
        toastService.error(axiosError.response?.data?.message || 'Không thể xóa đơn hàng');
      } else {
        toastService.error('Không thể xóa đơn hàng');
      }
      return { code: 1001, message: 'Lỗi khi xóa đơn hàng', result: false };
    }
  },

  /**
   * Admin: Lấy thống kê doanh thu theo khoảng thời gian
   */
  adminGetRevenueStats: async (period: string = 'day'): Promise<ApiResponse<RevenueStatsResponse | null>> => {
    try {
      if (!authService.isAuthenticated() || !authService.isAdmin()) {
        toastService.error('Bạn không có quyền thực hiện thao tác này');
        return { code: 1001, message: 'Không có quyền truy cập', result: null };
      }
      
      console.log('[DEBUG] Calling adminGetRevenueStats API', period);
      const response = await apiService.get<ApiResponse<RevenueStatsResponse>>(
        `${API_ROUTES.DASHBOARD}/stats/revenue?period=${period}`
      );
      console.log('[DEBUG] adminGetRevenueStats response:', response);
      
      return response;
    } catch (error) {
      console.error('[DEBUG] Error in adminGetRevenueStats:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        console.log('[DEBUG] Error response data:', axiosError.response?.data);
        toastService.error(axiosError.response?.data?.message || 'Không thể lấy dữ liệu thống kê doanh thu');
      } else {
        toastService.error('Không thể lấy dữ liệu thống kê doanh thu');
      }
      return { code: 1001, message: 'Lỗi khi lấy thống kê doanh thu', result: null };
    }
  },
}; 