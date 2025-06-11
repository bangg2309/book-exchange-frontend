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
  CREATE_ADDRESS: '/shipping-addresses'
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
        toastService.success('Đã thêm địa chỉ mới');
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
  }
}; 