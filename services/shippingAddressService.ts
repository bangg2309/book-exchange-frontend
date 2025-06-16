"use client";

import { apiService } from './api';
import { toastService } from './toastService';
import { authService } from './authService';
import { ApiResponse } from '@/types/apiResponse';
import { AddressType } from '@/types/address';
import axios, { AxiosError } from 'axios';

interface ShippingAddressResponseData extends ApiResponse<AddressType> {}
interface ShippingAddressesResponseData extends ApiResponse<AddressType[]> {}

const API_ROUTES = {
  GET_ADDRESSES: (userId: number) => `/shipping-addresses/${userId}`,
  CREATE_ADDRESS: '/shipping-addresses',
  UPDATE_ADDRESS: (id: number) => `/shipping-addresses/${id}`,
  DELETE_ADDRESS: (id: number) => `/shipping-addresses/${id}`,
  SET_DEFAULT: (id: number) => `/shipping-addresses/${id}/default`
};

export const shippingAddressService = {
  /**
   * Get user's shipping addresses
   */
  getAddresses: async (): Promise<AddressType[]> => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        return [];
      }
      
      const userId = currentUser.id;
      const response = await apiService.get<ShippingAddressesResponseData>(API_ROUTES.GET_ADDRESSES(Number(userId)));
      
      if (response.code === 1000) {
        return response.result || [];
      }
      
      return [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        toastService.error(axiosError.response?.data?.message || 'Không thể tải địa chỉ giao hàng');
      } else {
        toastService.error('Không thể tải địa chỉ giao hàng');
      }
      return [];
    }
  },
  
  /**
   * Create a new shipping address
   */
  createAddress: async (addressData: Omit<AddressType, 'id'>): Promise<AddressType | null> => {
    try {
      if (!authService.isAuthenticated()) {
        toastService.error('Vui lòng đăng nhập để thêm địa chỉ');
        return null;
      }
      
      const response = await apiService.post<ShippingAddressResponseData>(API_ROUTES.CREATE_ADDRESS, addressData);
      
      if (response.code === 1000) {
        toastService.success('Thêm địa chỉ mới thành công');
        return response.result;
      }
      
      toastService.error(response.message || 'Không thể thêm địa chỉ mới');
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        toastService.error(axiosError.response?.data?.message || 'Không thể thêm địa chỉ mới');
      } else {
        toastService.error('Không thể thêm địa chỉ mới');
      }
      return null;
    }
  },
  
  /**
   * Update an existing shipping address
   */
  updateAddress: async (id: number, addressData: Partial<AddressType>): Promise<AddressType | null> => {
    try {
      if (!authService.isAuthenticated()) {
        toastService.error('Vui lòng đăng nhập để cập nhật địa chỉ');
        return null;
      }
      
      const response = await apiService.put<ShippingAddressResponseData>(API_ROUTES.UPDATE_ADDRESS(id), addressData);
      
      if (response.code === 1000) {
        toastService.success('Cập nhật địa chỉ thành công');
        return response.result;
      }
      
      toastService.error(response.message || 'Không thể cập nhật địa chỉ');
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        toastService.error(axiosError.response?.data?.message || 'Không thể cập nhật địa chỉ');
      } else {
        toastService.error('Không thể cập nhật địa chỉ');
      }
      return null;
    }
  },
  
  /**
   * Delete a shipping address
   */
  deleteAddress: async (id: number): Promise<boolean> => {
    try {
      if (!authService.isAuthenticated()) {
        toastService.error('Vui lòng đăng nhập để xóa địa chỉ');
        return false;
      }
      
      const response = await apiService.delete<ApiResponse<boolean>>(API_ROUTES.DELETE_ADDRESS(id));
      
      if (response.code === 1000) {
        toastService.success('Xóa địa chỉ thành công');
        return true;
      }
      
      toastService.error(response.message || 'Không thể xóa địa chỉ');
      return false;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        toastService.error(axiosError.response?.data?.message || 'Không thể xóa địa chỉ');
      } else {
        toastService.error('Không thể xóa địa chỉ');
      }
      return false;
    }
  },
  
  /**
   * Set an address as default
   */
  setDefaultAddress: async (id: number): Promise<AddressType | null> => {
    try {
      if (!authService.isAuthenticated()) {
        toastService.error('Vui lòng đăng nhập để đặt địa chỉ mặc định');
        return null;
      }
      
      const response = await apiService.put<ShippingAddressResponseData>(API_ROUTES.SET_DEFAULT(id), {});
      
      if (response.code === 1000) {
        toastService.success('Đã đặt làm địa chỉ mặc định');
        return response.result;
      }
      
      toastService.error(response.message || 'Không thể đặt địa chỉ mặc định');
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        toastService.error(axiosError.response?.data?.message || 'Không thể đặt địa chỉ mặc định');
      } else {
        toastService.error('Không thể đặt địa chỉ mặc định');
      }
      return null;
    }
  }
}; 