"use client";

import { apiService } from './api';
import { toastService } from './toastService';
import { authService } from './authService';
import { ApiResponse } from '@/types/apiResponse';
import { OrderCreationRequest, OrderResponse } from '@/types/order';
import axios, { AxiosError } from 'axios';

interface OrderResponseData extends ApiResponse<OrderResponse> {}
interface OrdersListResponse extends ApiResponse<OrderResponse[]> {}

const API_ROUTES = {
  CHECKOUT: '/orders/checkout',
  GET_USER_ORDERS: (userId: number) => `/orders/user/${userId}`,
  GET_SELLER_ORDERS: (sellerId: number) => `/orders/seller/${sellerId}`,
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
  getSellerOrders: async (): Promise<OrderResponse[]> => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        return [];
      }
      
      const sellerId = currentUser.id;
      const response = await apiService.get<OrdersListResponse>(API_ROUTES.GET_SELLER_ORDERS(Number(sellerId)));
      
      if (response.code === 1000) {
        return response.result || [];
      }
      
      toastService.error(response.message || 'Không thể tải danh sách đơn hàng bán');
      return [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        toastService.error(axiosError.response?.data?.message || 'Không thể tải danh sách đơn hàng bán');
      } else {
        toastService.error('Không thể tải danh sách đơn hàng bán');
      }
      return [];
    }
  },
}; 