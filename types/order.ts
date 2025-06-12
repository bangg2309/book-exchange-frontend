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
  REFUNDED = 6
} 