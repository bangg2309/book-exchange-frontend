"use client";

import { apiService } from './api';
import { toastService } from './toastService';
import { authService } from './authService';
import { ApiResponse } from '@/types/apiResponse';
import { CartItemResponse, CartAdditionRequest } from '@/types/cart';
import axios, { AxiosError } from 'axios';

interface CartResponse extends ApiResponse<CartItemResponse[]> {}
interface BaseResponse extends ApiResponse<any> {}


const API_ROUTES = {
  GET_CART: (userId: number) => `/carts/${userId}`,
  ADD_TO_CART: '/carts',
  REMOVE_FROM_CART: (userId:number, id: number) => `/carts/${userId}/${id}`,
  CLEAR_CART: (userId: number) => `/carts/clear/${userId}`
};

export const cartService = {
  getCart: async (): Promise<CartItemResponse[]> => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        return [];
      }
      const userId = currentUser.id;
      const response = await apiService.get<CartResponse>(API_ROUTES.GET_CART(Number(userId)));
      return response.code === 1000 ? response.result || [] : [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
      }
      return [];
    }
  },

  getCartItemCount: async (): Promise<number> => {
    try {
      const cart = await cartService.getCart();
      return cart.length;
    } catch {
      return 0;
    }
  },


  addToCart: async (bookId: number, quantity: number = 1): Promise<boolean> => {
    try {
      if (!authService.isAuthenticated()) {
        toastService.error('Vui lòng đăng nhập để thêm sách vào giỏ hàng');
        return false;
      }
      
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        toastService.error('Không thể xác định thông tin người dùng');
        return false;
      }

      const cartRequest: CartAdditionRequest = {
        bookId,
        userId: Number(currentUser.id)
      };
      
      const response = await apiService.post<BaseResponse>(API_ROUTES.ADD_TO_CART, cartRequest);
      
      if (response.code === 1000) {
        toastService.success('Đã thêm sách vào giỏ hàng');
        return true;
      }
      toastService.error(response.message || 'Không thể thêm sách vào giỏ hàng');
      return false;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        toastService.error(axiosError.response?.data?.message || 'Không thể thêm sách vào giỏ hàng');
      } else {
        toastService.error('Không thể thêm sách vào giỏ hàng');
      }
      return false;
    }
  },

  removeFromCart: async (id: number): Promise<boolean> => {
    try {
      if (!authService.isAuthenticated()) {
        toastService.error('Vui lòng đăng nhập để xóa sách khỏi giỏ hàng');
        return false;
      }
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        toastService.error('Không thể xác định thông tin người dùng');
        return false;
      }
      
      const response = await apiService.delete<BaseResponse>(API_ROUTES.REMOVE_FROM_CART(Number(currentUser.id), id));
      
      if (response.code === 1000) {
        toastService.success('Đã xóa sách khỏi giỏ hàng');
        return true;
      }
      
      toastService.error(response.message || 'Không thể xóa sách khỏi giỏ hàng');
      return false;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        toastService.error(axiosError.response?.data?.message || 'Không thể xóa sách khỏi giỏ hàng');
      } else {
        toastService.error('Không thể xóa sách khỏi giỏ hàng');
      }
      return false;
    }
  },

  clearCart: async (): Promise<boolean> => {
    try {
      if (!authService.isAuthenticated()) {
        toastService.error('Vui lòng đăng nhập để xóa giỏ hàng');
        return false;
      }
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        toastService.error('Không thể xác định thông tin người dùng');
        return false;
      }
      
      const response = await apiService.delete<BaseResponse>(API_ROUTES.CLEAR_CART(Number(currentUser.id)));
      
      if (response.code === 1000) {
        toastService.success('Đã xóa toàn bộ giỏ hàng');
        return true;
      }
      
      toastService.error(response.message || 'Không thể xóa giỏ hàng');
      return false;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        toastService.error(axiosError.response?.data?.message || 'Không thể xóa giỏ hàng');
      } else {
        toastService.error('Không thể xóa giỏ hàng');
      }
      return false;
    }
  }
}; 