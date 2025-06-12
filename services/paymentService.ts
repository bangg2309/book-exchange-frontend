'use client';

import { apiService } from './api';
import { PaymentUrlResponse } from '@/types/payment';

// API routes for payment
const API_ROUTES = {
  CREATE_PAYMENT: '/payment/create-payment',
  PAYMENT_CALLBACK: '/payment/vnpay-callback',
};

export interface VNPayRequest {
  orderId: number;
  orderInfo: string;
  amount: number;
  bankCode?: string;
  language?: string;
  returnUrl?: string;
}

/**
 * Service for handling payment operations
 */
export const paymentService = {
  /**
   * Create a payment URL for VNPay
   * 
   * @param request Payment request data
   * @returns Payment URL response
   */
  createPaymentUrl: async (request: VNPayRequest): Promise<PaymentUrlResponse> => {
    try {
      const response = await apiService.post<PaymentUrlResponse>(
        API_ROUTES.CREATE_PAYMENT, 
        request
      );
      return response;
    } catch (error) {
      console.error('Error creating payment URL:', error);
      throw error;
    }
  },
  
  /**
   * Process payment callback from VNPay
   * 
   * @param queryParams Query parameters from VNPay callback
   * @returns Processing result
   */
  processCallback: async (queryParams: URLSearchParams): Promise<any> => {
    try {
      // Convert URLSearchParams to a query string
      const queryString = queryParams.toString();
      
      // Call the backend to process the callback
      const response = await apiService.get<any>(
        `${API_ROUTES.PAYMENT_CALLBACK}?${queryString}`
      );
      
      return response;
    } catch (error) {
      console.error('Error processing payment callback:', error);
      throw error;
    }
  }
};

export default paymentService; 