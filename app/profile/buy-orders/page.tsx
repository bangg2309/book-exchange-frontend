'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaBook, FaShoppingBag } from 'react-icons/fa';
import { orderService } from '@/services/orderService';
import { OrderStatus, ProfileOrderResponse, ProfileOrderItem } from '@/types/order';

// OrderCard component
const OrderCard = ({ order, onViewDetail }: { order: ProfileOrderResponse, onViewDetail: () => void }) => {
  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + 'đ';
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'Chờ xác nhận';
      case OrderStatus.CONFIRMED: return 'Đã xác nhận';
      case OrderStatus.SHIPPING: return 'Đang giao hàng';
      case OrderStatus.COMPLETED: return 'Đã hoàn thành';
      case OrderStatus.CANCELLED: return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.CONFIRMED: return 'bg-blue-100 text-blue-800';
      case OrderStatus.SHIPPING: return 'bg-purple-100 text-purple-800';
      case OrderStatus.COMPLETED: return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const mainBookItem = order.orderItems?.[0];
  const orderItemsCount = order.orderItems?.length || 0;

  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-4 flex flex-col md:flex-row gap-4">
        {/* Book Image and Basic Info */}
        <div className="flex gap-4 flex-1">
          <div className="w-24 h-32 relative flex-shrink-0 bg-gray-100 rounded overflow-hidden">
            {mainBookItem?.book?.thumbnail ? (
              <Image 
                src={mainBookItem.book.thumbnail} 
                alt={mainBookItem.book.title || 'Book cover'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaBook className="text-gray-400 text-3xl" />
              </div>
            )}
          </div>
          
          <div className="flex flex-col flex-1 justify-between">
            <div>
              <h3 className="font-medium text-gray-900 line-clamp-2">
                {mainBookItem?.book?.title || 'Không có tiêu đề'}
              </h3>
              <div className="mt-1 text-sm text-gray-500">
                <span>Người bán: {order.seller?.username || 'Không xác định'}</span>
              </div>
              <div className="mt-1 text-sm text-gray-500">
                <span>Mã đơn hàng: {order.orderCode}</span>
              </div>
            </div>
            
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Order Details */}
        <div className="flex flex-col justify-between items-end">
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {orderItemsCount > 1 
                ? `${orderItemsCount} sản phẩm` 
                : '1 sản phẩm'}
            </p>
            <p className="text-base font-medium text-gray-900 mt-1">
              {formatCurrency(order.totalPrice)}
            </p>
          </div>
          
          <button
            onClick={onViewDetail}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

export default function BuyOrdersPage() {
  const [buyerOrders, setBuyerOrders] = useState<ProfileOrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Mock data for testing
  const mockBuyerOrders: ProfileOrderResponse[] = [
    {
      id: 1,
      orderCode: 'ORD00001',
      userId: 1,
      buyer: { id: 1, username: 'user123' },
      seller: { id: 2, username: 'seller123' },
      paymentMethod: 'COD',
      shippingFee: 30000,
      discount: 0,
      totalPrice: 180000,
      status: OrderStatus.COMPLETED,
      totalAmount: 150000,
      createdAt: '2023-07-10T10:30:00Z',
      updatedAt: '2023-07-10T10:30:00Z',
      orderItems: [
        {
          id: 1,
          book: {
            id: 4,
            title: 'Tôi Tài Giỏi, Bạn Cũng Thế',
            thumbnail: 'https://res.cloudinary.com/dnbhnj1n9/image/upload/v1749731202/book-exchange/books/book_1749731200242_33.jpg',
            price: 150000
          },
          quantity: 1,
          price: 150000
        }
      ]
    },
    {
      id: 2,
      orderCode: 'ORD00002',
      userId: 1,
      buyer: { id: 1, username: 'user123' },
      seller: { id: 3, username: 'seller456' },
      paymentMethod: 'Banking',
      shippingFee: 30000,
      discount: 0,
      totalPrice: 260000,
      status: OrderStatus.SHIPPING,
      totalAmount: 230000,
      createdAt: '2023-07-15T10:30:00Z',
      updatedAt: '2023-07-15T10:30:00Z',
      orderItems: [
        {
          id: 2,
          book: {
            id: 5,
            title: 'Nhà Giả Kim',
            thumbnail: 'https://res.cloudinary.com/dnbhnj1n9/image/upload/v1749731202/book-exchange/books/book_1749731200242_33.jpg',
            price: 100000
          },
          quantity: 1,
          price: 100000
        },
        {
          id: 3,
          book: {
            id: 6,
            title: 'Cách Nghĩ Để Thành Công',
            thumbnail: 'https://res.cloudinary.com/dnbhnj1n9/image/upload/v1749731202/book-exchange/books/book_1749731200242_33.jpg',
            price: 130000
          },
          quantity: 1,
          price: 130000
        }
      ]
    }
  ];

  useEffect(() => {
    const fetchBuyerOrders = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call when available
        // const orders = await orderService.getBuyerOrders();
        // setBuyerOrders(orders);
        
        // Using mock data for now
        setTimeout(() => {
          setBuyerOrders(mockBuyerOrders);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching buyer orders:', error);
        setIsLoading(false);
      }
    };

    fetchBuyerOrders();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-6">Đơn mua của tôi</h2>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p>Đang tải đơn hàng...</p>
        </div>
      ) : buyerOrders.length === 0 ? (
        <div className="text-center py-8">
          <FaShoppingBag className="mx-auto text-4xl text-gray-300 mb-4" />
          <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
          <Link href="/browse" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Mua sách ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {buyerOrders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order}
              onViewDetail={() => router.push(`/orders/${order.id}`)} 
            />
          ))}
        </div>
      )}
    </div>
  );
} 