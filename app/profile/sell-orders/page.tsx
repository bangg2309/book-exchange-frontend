'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  FaStore, 
  FaSearch, 
  FaFilter, 
  FaTimesCircle, 
  FaBox,
  FaTruck,
  FaCheck,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { orderService } from '@/services/orderService';
import { formatCurrency, formatDate } from '@/lib/utils';
import { authService } from '@/services/authService';
import { toastService } from '@/services/toastService';
import { OrderResponse, OrderItemResponse, OrderBookItemResponse, OrderStatus } from '@/types/order';

// Constants for order status
const ORDER_ITEM_WAITING_FOR_CONFIRMATION = 1;
const ORDER_ITEM_CONFIRMED = 2;
const ORDER_ITEM_WAITING_FOR_DELIVERY = 3;
const ORDER_ITEM_RECEIVED = 4;
const ORDER_ITEM_CANCELLED = 5;

// Map status codes to human-readable text and colors
const getStatusInfo = (status: number) => {
  switch (status) {
    case ORDER_ITEM_WAITING_FOR_CONFIRMATION:
      return { 
        text: "Chờ xác nhận", 
        color: "#1976d2",
        icon: <FaClock className="mr-1" />,
        bgColor: "#e3f2fd",
        lightColor: "#bbdefb"
      };
    case ORDER_ITEM_CONFIRMED:
      return { 
        text: "Đã xác nhận", 
        color: "#00897b",
        icon: <FaCheck className="mr-1" />,
        bgColor: "#e0f2f1",
        lightColor: "#b2dfdb"
      };
    case ORDER_ITEM_WAITING_FOR_DELIVERY:
      return { 
        text: "Đang giao hàng", 
        color: "#7b1fa2",
        icon: <FaTruck className="mr-1" />,
        bgColor: "#f3e5f5",
        lightColor: "#e1bee7"
      };
    case ORDER_ITEM_RECEIVED:
      return { 
        text: "Đã nhận hàng", 
        color: "#2e7d32",
        icon: <FaCheckCircle className="mr-1" />,
        bgColor: "#e8f5e9",
        lightColor: "#c8e6c9"
      };
    case ORDER_ITEM_CANCELLED:
      return { 
        text: "Đã hủy", 
        color: "#c62828",
        icon: <FaTimesCircle className="mr-1" />,
        bgColor: "#ffebee",
        lightColor: "#ffcdd2"
      };
    default:
      return { 
        text: "Không xác định", 
        color: "#616161",
        icon: <FaClock className="mr-1" />,
        bgColor: "#f5f5f5",
        lightColor: "#eeeeee"
      };
  }
};

const OrderStatusBadge = ({ status }: { status: number }) => {
  const statusInfo = getStatusInfo(status);
  
  return (
    <span 
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
      style={{ 
        backgroundColor: statusInfo.bgColor, 
        color: statusInfo.color 
      }}
    >
      {statusInfo.icon}
      {statusInfo.text}
    </span>
  );
};

const OrderCard = ({ order, onViewDetails }: { order: OrderResponse, onViewDetails: (orderId: number) => void }) => {
  // Tính tổng số sách trong đơn hàng
  const totalBooks = order.items.reduce((total: number, item: OrderItemResponse) => {
    return total + item.bookItems.reduce((sum: number, book: OrderBookItemResponse) => sum + book.quantity, 0);
  }, 0);
  
  // Lấy trạng thái của OrderItem đầu tiên để hiển thị
  // Thông thường, một đơn hàng chỉ có một OrderItem cho một người bán
  const itemStatus = order.items.length > 0 ? order.items[0].status : order.status;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
        <div>
          <div className="text-sm text-gray-500">Mã đơn hàng: <span className="font-medium text-gray-700">#{order.id}</span></div>
          <div className="text-sm text-gray-500">Ngày đặt: {formatDate(new Date(order.createdAt))}</div>
        </div>
        <OrderStatusBadge status={itemStatus} />
      </div>
      
      <div className="space-y-4">
        {order.items.map((item: OrderItemResponse) => (
          <div key={item.id} className="border-b border-gray-100 pb-4 last:border-0">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium">Người mua: {item.sellerName}</div>
              <div className="text-sm text-gray-500">Phí vận chuyển: {formatCurrency(item.shippingFee)}</div>
            </div>
            
            <div className="space-y-3 mt-3">
              {item.bookItems.map((book: OrderBookItemResponse) => (
                <div key={book.id} className="flex items-center">
                  <div className="relative h-16 w-12 flex-shrink-0 bg-gray-50 border border-gray-100 rounded-md overflow-hidden">
                    <Image
                      src={book.thumbnail || "/placeholder-book.jpg"}
                      alt={book.bookTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className="text-sm font-medium">{book.bookTitle}</div>
                    <div className="text-xs text-gray-500">
                      Tình trạng: {book.condition === 1 ? 'Mới' : 'Đã qua sử dụng'}
                    </div>
                    <div className="mt-1 flex justify-between">
                      <div className="text-xs text-gray-500">SL: {book.quantity}</div>
                      <div className="text-sm font-medium text-green-600">{formatCurrency(book.price)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-500">Tổng cộng: </span>
          <span className="text-lg font-semibold text-green-600 ml-1">{formatCurrency(order.totalPrice)}</span>
          <span className="text-xs text-gray-500 ml-2">({totalBooks} sách)</span>
        </div>
        <button
          className="px-4 py-2 rounded-md text-sm font-medium border border-green-500 text-green-600 hover:bg-green-50"
          onClick={() => onViewDetails(order.id)}
        >
          Xem chi tiết và quản lý
        </button>
      </div>
    </div>
  );
};

export default function SellOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        
        // Kiểm tra đăng nhập
        const currentUser = authService.getCurrentUser();
        if (!currentUser || !currentUser.id) {
          router.push("/login");
          return;
        }
        
        // Gọi API để lấy danh sách đơn bán
        const response = await orderService.getCurrentSellerOrders();
        
        if (response && response.code === 1000 && response.result) {
          // Sắp xếp đơn hàng theo thời gian (mới nhất lên đầu)
          const sortedOrders = [...response.result].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          });
          
          setOrders(sortedOrders);
          setFilteredOrders(sortedOrders);
        } else {
          setError(response?.message || "Không thể tải danh sách đơn bán");
        }
      } catch (error) {
        setError("Không thể tải danh sách đơn bán. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [router]);
  
  useEffect(() => {
    let filtered = [...orders];
    
    // Lọc theo trạng thái
    if (selectedStatus !== "all") {
      const statusCode = parseInt(selectedStatus);
      filtered = filtered.filter(order => 
        // Kiểm tra trạng thái của OrderItem thay vì Order
        order.items.some(item => item.status === statusCode)
      );
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(order => 
        // Tìm kiếm theo mã đơn hàng
        order.id.toString().includes(term) ||
        // Tìm kiếm theo tên sách
        order.items.some(item => 
          item.bookItems.some(book => 
            book.bookTitle.toLowerCase().includes(term)
          )
        )
      );
    }
    
    setFilteredOrders(filtered);
  }, [searchTerm, selectedStatus, orders]);
  
  const handleViewOrderDetails = (orderId: number) => {
    console.log('[DEBUG] Navigating to order detail page for ID:', orderId);
    router.push(`/profile/sell-orders/${orderId}`);
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-800">Đơn bán của tôi</h1>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-5 border border-gray-200">
          {/* Search input */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Status filter tabs */}
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="flex items-center mr-2">
              <FaFilter className="text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">Trạng thái:</span>
            </div>
            <button 
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${selectedStatus === "all" ? "text-white bg-green-600" : "text-gray-700 bg-gray-100 hover:bg-gray-200"}`}
              onClick={() => setSelectedStatus("all")}
            >
              Tất cả
            </button>
            <button 
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedStatus === ORDER_ITEM_WAITING_FOR_CONFIRMATION.toString() ? 
                "text-white" : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              }`}
              style={{
                backgroundColor: selectedStatus === ORDER_ITEM_WAITING_FOR_CONFIRMATION.toString() ? 
                  getStatusInfo(ORDER_ITEM_WAITING_FOR_CONFIRMATION).color : undefined
              }}
              onClick={() => setSelectedStatus(ORDER_ITEM_WAITING_FOR_CONFIRMATION.toString())}
            >
              Chờ xác nhận
            </button>
            <button 
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedStatus === ORDER_ITEM_CONFIRMED.toString() ? 
                "text-white" : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              }`}
              style={{
                backgroundColor: selectedStatus === ORDER_ITEM_CONFIRMED.toString() ? 
                  getStatusInfo(ORDER_ITEM_CONFIRMED).color : undefined
              }}
              onClick={() => setSelectedStatus(ORDER_ITEM_CONFIRMED.toString())}
            >
              Đã xác nhận
            </button>
            <button 
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedStatus === ORDER_ITEM_WAITING_FOR_DELIVERY.toString() ? 
                "text-white" : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              }`}
              style={{
                backgroundColor: selectedStatus === ORDER_ITEM_WAITING_FOR_DELIVERY.toString() ? 
                  getStatusInfo(ORDER_ITEM_WAITING_FOR_DELIVERY).color : undefined
              }}
              onClick={() => setSelectedStatus(ORDER_ITEM_WAITING_FOR_DELIVERY.toString())}
            >
              Đang giao hàng
            </button>
            <button 
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedStatus === ORDER_ITEM_RECEIVED.toString() ? 
                "text-white" : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              }`}
              style={{
                backgroundColor: selectedStatus === ORDER_ITEM_RECEIVED.toString() ? 
                  getStatusInfo(ORDER_ITEM_RECEIVED).color : undefined
              }}
              onClick={() => setSelectedStatus(ORDER_ITEM_RECEIVED.toString())}
            >
              Đã nhận hàng
            </button>
            <button 
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedStatus === ORDER_ITEM_CANCELLED.toString() ? 
                "text-white" : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              }`}
              style={{
                backgroundColor: selectedStatus === ORDER_ITEM_CANCELLED.toString() ? 
                  getStatusInfo(ORDER_ITEM_CANCELLED).color : undefined
              }}
              onClick={() => setSelectedStatus(ORDER_ITEM_CANCELLED.toString())}
            >
              Đã hủy
            </button>
          </div>
        </div>
        
        {/* Orders list */}
        {isLoading ? (
          // Loading skeletons
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-5 animate-pulse border border-gray-200">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
            <FaTimesCircle className="text-red-500 text-4xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{error}</h2>
            <p className="text-gray-600 mb-4">Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu lỗi vẫn tiếp tục.</p>
            <button 
              className="px-5 py-2 rounded-md text-sm font-medium text-white transition-colors duration-200 hover:opacity-90 bg-green-600"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          // Empty state
          <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
            <FaStore className="text-gray-400 text-4xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {selectedStatus === "all" 
                ? "Bạn chưa có đơn bán nào" 
                : `Không có đơn bán nào ở trạng thái ${getStatusInfo(parseInt(selectedStatus)).text}`
              }
            </h2>
            <p className="text-gray-600 mb-4">
              {selectedStatus === "all" 
                ? "Khi có người mua sách của bạn, đơn hàng sẽ xuất hiện ở đây." 
                : "Hãy chọn trạng thái khác để xem các đơn hàng."
              }
            </p>
          </div>
        ) : (
          // Orders list
          <div className="space-y-5">
            {filteredOrders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order}
                onViewDetails={handleViewOrderDetails}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 