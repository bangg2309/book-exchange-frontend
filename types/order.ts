import { AddressType } from "./address";
import { PaymentMethod } from './payment';

export interface OrderBookItemRequest {
  bookId: number;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderItemRequest {
  sellerId: number;
  shippingFee: number;
  note?: string;
  bookItems: OrderBookItemRequest[];
}

export interface OrderCreationRequest {
  userId: number;
  shippingAddressId: number;
  paymentMethod: PaymentMethod | string;
  deliveryMethod?: 'standard' | 'express';
  note?: string;
  voucherCode?: string;
  shippingFee: number;
  discount?: number;
  totalPrice: number;
  returnUrl?: string;
  items: OrderItemRequest[];
}

// Interface cho trang Profile
export interface ProfileBookItem {
  id: number;
  title: string;
  thumbnail?: string;
  author?: string;
  price: number;
}

export interface ProfileOrderItem {
  id: number;
  book?: ProfileBookItem;
  quantity: number;
  price: number;
}

export interface ProfileOrderResponse {
  id: number;
  orderCode: string;
  userId: number;
  buyer?: {
    id: number;
    username: string;
  };
  seller?: {
    id: number;
    username: string;
  };
  paymentMethod: string;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  totalPrice: number;
  status: OrderStatus;
  orderItems?: ProfileOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderBookItemResponse {
  id: number;
  bookId: number;
  bookTitle: string;
  thumbnail: string;
  condition: number;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderItemResponse {
  id: number;
  orderId: number;
  sellerId: number;
  sellerName: string;
  shippingFee: number;
  totalAmount: number;
  note?: string;
  status: number;
  bookItems: OrderBookItemResponse[];
  createdAt: string;
  updatedAt: string;
  paymentMethod?: string;
  shippingAddress?: string;
  buyerName?: string;
  buyerPhone?: string;
  discount?: number;
}

export interface OrderResponse {
  id: number;
  userId: number;
  shippingAddress: AddressType;
  paymentMethod: string;
  deliveryMethod?: string;
  voucherCode?: string;
  shippingFee: number;
  discount: number;
  totalPrice: number;
  status: number;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export enum OrderStatus {
  PENDING = 1,
  PROCESSING = 2,
  SHIPPED = 3,
  DELIVERED = 4,
  CANCELLED = 5,
  REFUNDED = 6,
  
  // Các trạng thái cho trang Profile
  CONFIRMED = 'CONFIRMED',
  SHIPPING = 'SHIPPING',
  COMPLETED = 'COMPLETED'
}

export enum PaymentOrderStatus {
  PAYMENT_ORDER_FAILED = -1,
  PAYMENT_ORDER_PENDING = 1,
  PAYMENT_ORDER_SUCCESS = 2,
  PAYMENT_ORDER_CANCELED = 3,
  PAYMENT_ORDER_REFUNDED = 4,
}

export interface RevenueStatsResponse {
  labels: string[]; // Nhãn thời gian (ngày, tuần, tháng, năm)
  data: number[]; // Dữ liệu doanh thu (đơn vị: nghìn đồng)
  period: string; // Khoảng thời gian (day, week, month, year)
}