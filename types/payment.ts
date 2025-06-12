/**
 * Response khi tạo URL thanh toán
 */
export interface PaymentUrlResponse {
  code: string;
  message: string;
  paymentUrl: string;
}

/**
 * Response khi xử lý callback từ VNPay
 */
export interface PaymentCallbackResponse {
  code: string;
  message: string;
}

/**
 * Phương thức thanh toán
 */
export enum PaymentMethod {
  COD = 'cod',
  VNPAY = 'vnpay',
  BANKING = 'banking'
} 