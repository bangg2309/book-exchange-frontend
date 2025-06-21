'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaShoppingBag, FaClock, FaCheck, FaTruck, FaTimesCircle, FaSearch, FaAngleRight } from 'react-icons/fa';
import { orderService } from '@/services/orderService';
import { formatCurrency } from '@/lib/utils';
import { OrderItemResponse } from '@/types/order';
import { authService } from '@/services/authService';
import { toastService } from '@/services/toastService';
import ConfirmDialog from '@/components/ConfirmDialog';
import { ReviewDialog } from '@/components/reviews/ReviewDialog';

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
        icon: <FaClock className="mr-2" />,
        bgColor: "#e3f2fd",
        lightColor: "#bbdefb"
      };
    case ORDER_ITEM_CONFIRMED:
      return { 
        text: "Đã xác nhận", 
        color: "#00897b",
        icon: <FaCheck className="mr-2" />,
        bgColor: "#e0f2f1",
        lightColor: "#b2dfdb"
      };
    case ORDER_ITEM_WAITING_FOR_DELIVERY:
      return { 
        text: "Đang giao hàng", 
        color: "#7b1fa2",
        icon: <FaTruck className="mr-2" />,
        bgColor: "#f3e5f5",
        lightColor: "#e1bee7"
      };
    case ORDER_ITEM_RECEIVED:
      return { 
        text: "Đã nhận hàng", 
        color: "#2e7d32",
        icon: <FaCheck className="mr-2" />,
        bgColor: "#e8f5e9",
        lightColor: "#c8e6c9"
      };
    case ORDER_ITEM_CANCELLED:
      return { 
        text: "Đã hủy", 
        color: "#c62828",
        icon: <FaTimesCircle className="mr-2" />,
        bgColor: "#ffebee",
        lightColor: "#ffcdd2"
      };
    default:
      return { 
        text: "Không xác định", 
        color: "#616161",
        icon: <FaClock className="mr-2" />,
        bgColor: "#f5f5f5",
        lightColor: "#eeeeee"
      };
  }
};

// Shopee/Tiki style order item component
const OrderItem = ({ orderItem, onViewDetail }: { orderItem: OrderItemResponse, onViewDetail: () => void }) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showBookSelection, setShowBookSelection] = useState(false);
  const [selectedBook, setSelectedBook] = useState<{
    bookId: number;
    sellerId: number;
    bookTitle: string;
    sellerName: string;
  } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    action: () => void;
    icon: 'warning' | 'success' | 'info' | 'error' | 'none';
  } | null>(null);
  
  const statusInfo = getStatusInfo(orderItem.status);
  const formattedDate = new Date(orderItem.createdAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  // Handle showing confirmation dialog
  const showConfirm = (title: string, message: string, action: () => void, icon: 'warning' | 'success' | 'info' | 'error' | 'none' = 'warning') => {
    setConfirmAction({ title, message, action, icon });
    setShowConfirmDialog(true);
  };

  // Handle order status update (e.g., cancel order or confirm receipt)
  const handleUpdateStatus = async (newStatus: number) => {
    try {
      const updatedOrderItem = await orderService.updateOrderItemStatus(orderItem.id, newStatus);
      if (updatedOrderItem) {
        // Show appropriate message based on status
        if (newStatus === ORDER_ITEM_CANCELLED) {
          toastService.success('Đơn hàng đã được hủy thành công');
        } else if (newStatus === ORDER_ITEM_RECEIVED) {
          toastService.success('Xác nhận đã nhận hàng thành công');
        }
        // Reload the page to refresh the order list
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toastService.error('Không thể cập nhật trạng thái đơn hàng');
    }
  };

  // Handle opening review dialog
  const handleOpenReviewDialog = (bookId: number, sellerId: number, bookTitle: string, sellerName: string) => {
    setSelectedBook({
      bookId,
      sellerId,
      bookTitle,
      sellerName
    });
    setShowReviewDialog(true);
  };
  
  return (
    <>
      {/* Confirmation Dialog */}
      {confirmAction && (
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title={confirmAction.title}
          message={confirmAction.message}
          onConfirm={() => {
            confirmAction.action();
            setShowConfirmDialog(false);
          }}
          onCancel={() => setShowConfirmDialog(false)}
          icon={confirmAction.icon}
        />
      )}

      {/* Review Dialog */}
      {selectedBook && (
        <ReviewDialog
          isOpen={showReviewDialog}
          onClose={() => setShowReviewDialog(false)}
          bookId={selectedBook.bookId}
          sellerId={selectedBook.sellerId}
          bookTitle={selectedBook.bookTitle}
          sellerName={selectedBook.sellerName}
          onReviewSubmitted={() => {
            toastService.success('Cảm ơn bạn đã đánh giá sản phẩm!');
            setShowReviewDialog(false);
          }}
        />
      )}

      {/* Book Selection Modal */}
      {showBookSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Chọn sách để đánh giá</h2>
                <button 
                  onClick={() => setShowBookSelection(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {orderItem.bookItems.map((book) => (
                <div 
                  key={book.id} 
                  className="flex items-center p-3 border rounded-lg mb-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    handleOpenReviewDialog(
                      book.bookId, 
                      orderItem.sellerId, 
                      book.bookTitle, 
                      orderItem.sellerName
                    );
                    setShowBookSelection(false);
                  }}
                >
                  <div className="relative h-16 w-12 flex-shrink-0 bg-gray-100 border rounded overflow-hidden">
                    <Image
                      src={book.thumbnail || "/placeholder-book.jpg"}
                      alt={book.bookTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium">{book.bookTitle}</h3>
                    <p className="text-sm text-gray-500">
                      Tình trạng: {book.condition === 1 ? 'Mới' : 'Đã qua sử dụng'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden border border-gray-200">
        {/* Order header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2">Đơn hàng: #{orderItem.orderId}</span>
            <span className="text-xs text-gray-500">| {formattedDate}</span>
          </div>
          <div 
            className="flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: statusInfo.bgColor, color: statusInfo.color }}
          >
            {statusInfo.icon}
            {statusInfo.text}
          </div>
        </div>
        
        {/* Order seller */}
        <div className="flex items-center px-5 py-2.5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center">
            <FaShoppingBag className="text-gray-500 mr-2" />
            <span className="font-medium">{orderItem.sellerName}</span>
          </div>
        </div>
        
        {/* Order items */}
        <div className="px-5 py-4">
          {orderItem.bookItems.map((book) => (
            <div key={book.id} className="flex py-3 border-b border-gray-100 last:border-b-0">
              <div className="relative h-24 w-20 flex-shrink-0 bg-gray-50 border border-gray-100 rounded overflow-hidden">
                <Image
                  src={book.thumbnail || "/placeholder-book.jpg"}
                  alt={book.bookTitle}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="ml-4 flex-grow">
                <h3 className="text-sm font-medium line-clamp-2">{book.bookTitle}</h3>
                <div className="mt-1.5 text-xs text-gray-500">
                  Tình trạng: {book.condition === 1 ? 'Mới' : 'Đã qua sử dụng'}
                </div>
                <div className="mt-1.5 flex justify-between">
                  <div className="text-sm text-gray-500">
                    x{book.quantity}
                  </div>
                  <div className="text-sm font-medium">
                    {formatCurrency(book.price)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Order summary */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-col">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{orderItem.bookItems.length} sản phẩm</span>
              <span className="text-sm font-medium">{formatCurrency(orderItem.totalAmount - orderItem.shippingFee)}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-gray-500">Phí vận chuyển:</span>
              <span className="text-sm font-medium">{formatCurrency(orderItem.shippingFee)}</span>
            </div>
            {orderItem.discount && orderItem.discount > 0 && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-green-600">Giảm giá:</span>
                <span className="text-sm font-medium text-green-600">-{formatCurrency(orderItem.discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200">
              <span className="font-medium text-gray-700">Tổng tiền:</span>
              <span className="text-lg font-bold" style={{ color: '#4CAF50' }}>{formatCurrency(orderItem.totalAmount)}</span>
            </div>
          </div>
        </div>
        
        {/* Order actions */}
        <div className="flex justify-end items-center px-5 py-3 border-t border-gray-100">
          {orderItem.status === ORDER_ITEM_WAITING_FOR_CONFIRMATION && (
            <button 
              className="px-4 py-2 border rounded-md mr-3 text-sm font-medium transition-colors duration-200 hover:bg-gray-50" 
              style={{ borderColor: '#d32f2f', color: '#d32f2f' }}
              onClick={() => showConfirm(
                'Hủy đơn hàng',
                'Bạn có chắc chắn muốn hủy đơn hàng này không?',
                () => handleUpdateStatus(ORDER_ITEM_CANCELLED),
                'warning'
              )}
            >
              Hủy đơn hàng
            </button>
          )}
          
          {orderItem.status === ORDER_ITEM_WAITING_FOR_DELIVERY && (
            <button 
              className="px-4 py-2 border rounded-md mr-3 text-sm font-medium transition-colors duration-200 hover:bg-gray-50" 
              style={{ borderColor: '#4CAF50', color: '#4CAF50' }}
              onClick={() => showConfirm(
                'Xác nhận đã nhận hàng',
                'Bạn xác nhận đã nhận được hàng từ người bán?',
                () => handleUpdateStatus(ORDER_ITEM_RECEIVED),
                'info'
              )}
            >
              Xác nhận đã nhận hàng
            </button>
          )}
          
          {orderItem.status === ORDER_ITEM_RECEIVED && (
            <button 
              className="px-4 py-2 border rounded-md mr-3 text-sm font-medium transition-colors duration-200 hover:bg-gray-50" 
              style={{ borderColor: '#4CAF50', color: '#4CAF50' }}
              onClick={() => {
                if (orderItem.bookItems.length === 1) {
                  // Nếu chỉ có 1 sách, mở dialog đánh giá luôn
                  handleOpenReviewDialog(
                    orderItem.bookItems[0].bookId,
                    orderItem.sellerId,
                    orderItem.bookItems[0].bookTitle,
                    orderItem.sellerName
                  );
                } else {
                  // Nếu có nhiều sách, hiển thị modal chọn sách
                  setShowBookSelection(true);
                }
              }}
            >
              Đánh giá
            </button>
          )}
          
          <button 
            className="px-5 py-2 rounded-md text-sm font-medium text-white flex items-center transition-colors duration-200 hover:opacity-90"
            style={{ backgroundColor: '#4CAF50' }}
            onClick={onViewDetail}
          >
            Xem chi tiết
            <FaAngleRight className="ml-1" />
          </button>
        </div>
      </div>
    </>
  );
};

export default function BuyOrdersPage() {
  const router = useRouter();
  const [orderItems, setOrderItems] = useState<OrderItemResponse[]>([]);
  const [filteredOrderItems, setFilteredOrderItems] = useState<OrderItemResponse[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        const currentUser = authService.getCurrentUser();
        if (!currentUser || !currentUser.id) {
          router.push("/login");
          return;
        }
        
        // Fetch order items from API
        const userId = currentUser.id;
        const items = await orderService.getOrderItemsByUserId(Number(userId));
        
        // Sort items by createdAt date (newest first)
        const sortedItems = [...items].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setOrderItems(sortedItems);
        setFilteredOrderItems(sortedItems);
      } catch (error) {
        console.error("Error fetching order items:", error);
        setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderItems();
  }, [router]);
  
  useEffect(() => {
    let filtered = [...orderItems];
    
    // Filter by status
    if (selectedStatus !== "all") {
      const statusCode = parseInt(selectedStatus);
      filtered = filtered.filter(item => item.status === statusCode);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.sellerName.toLowerCase().includes(term) ||
        item.bookItems.some(book => book.bookTitle.toLowerCase().includes(term))
      );
    }
    
    setFilteredOrderItems(filtered);
  }, [selectedStatus, searchTerm, orderItems]);
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-800">Đơn mua của tôi</h1>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search and filter */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-5 border border-gray-200">
          {/* Search input */}
          <div className="relative mb-5">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tìm kiếm theo tên sách hoặc người bán..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Status filter tabs */}
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${selectedStatus === "all" ? "text-white" : "text-gray-700 bg-gray-100 hover:bg-gray-200"}`}
              style={{ backgroundColor: selectedStatus === "all" ? '#4CAF50' : '' }}
              onClick={() => setSelectedStatus("all")}
            >
              Tất cả
            </button>
            <button 
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${selectedStatus === ORDER_ITEM_WAITING_FOR_CONFIRMATION.toString() ? "text-white" : "text-gray-700 bg-gray-100 hover:bg-gray-200"}`}
              style={{ backgroundColor: selectedStatus === ORDER_ITEM_WAITING_FOR_CONFIRMATION.toString() ? '#4CAF50' : '' }}
              onClick={() => setSelectedStatus(ORDER_ITEM_WAITING_FOR_CONFIRMATION.toString())}
            >
              Chờ xác nhận
            </button>
            <button 
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${selectedStatus === ORDER_ITEM_CONFIRMED.toString() ? "text-white" : "text-gray-700 bg-gray-100 hover:bg-gray-200"}`}
              style={{ backgroundColor: selectedStatus === ORDER_ITEM_CONFIRMED.toString() ? '#4CAF50' : '' }}
              onClick={() => setSelectedStatus(ORDER_ITEM_CONFIRMED.toString())}
            >
              Đã xác nhận
            </button>
            <button 
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${selectedStatus === ORDER_ITEM_WAITING_FOR_DELIVERY.toString() ? "text-white" : "text-gray-700 bg-gray-100 hover:bg-gray-200"}`}
              style={{ backgroundColor: selectedStatus === ORDER_ITEM_WAITING_FOR_DELIVERY.toString() ? '#4CAF50' : '' }}
              onClick={() => setSelectedStatus(ORDER_ITEM_WAITING_FOR_DELIVERY.toString())}
            >
              Đang giao hàng
            </button>
            <button 
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${selectedStatus === ORDER_ITEM_RECEIVED.toString() ? "text-white" : "text-gray-700 bg-gray-100 hover:bg-gray-200"}`}
              style={{ backgroundColor: selectedStatus === ORDER_ITEM_RECEIVED.toString() ? '#4CAF50' : '' }}
              onClick={() => setSelectedStatus(ORDER_ITEM_RECEIVED.toString())}
            >
              Đã nhận hàng
            </button>
            <button 
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${selectedStatus === ORDER_ITEM_CANCELLED.toString() ? "text-white" : "text-gray-700 bg-gray-100 hover:bg-gray-200"}`}
              style={{ backgroundColor: selectedStatus === ORDER_ITEM_CANCELLED.toString() ? '#4CAF50' : '' }}
              onClick={() => setSelectedStatus(ORDER_ITEM_CANCELLED.toString())}
            >
              Đã hủy
            </button>
          </div>
        </div>
        
        {/* Order list */}
        {isLoading ? (
          // Loading skeletons
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-5 animate-pulse border border-gray-200">
                <div className="flex justify-between mb-4">
                  <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/5"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="flex mb-4">
                  <div className="h-24 w-20 bg-gray-200 rounded"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="flex justify-between mb-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/5"></div>
                </div>
                <div className="flex justify-end">
                  <div className="h-9 bg-gray-200 rounded w-28"></div>
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
              className="px-5 py-2 rounded-md text-sm font-medium text-white transition-colors duration-200 hover:opacity-90"
              style={{ backgroundColor: '#4CAF50' }}
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </div>
        ) : filteredOrderItems.length === 0 ? (
          // Empty state
          <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaShoppingBag className="text-gray-400 text-2xl" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-gray-600 mb-4">Bạn chưa có đơn hàng nào trong danh mục này.</p>
            <button 
              className="px-5 py-2 rounded-md text-sm font-medium text-white transition-colors duration-200 hover:opacity-90"
              style={{ backgroundColor: '#4CAF50' }}
              onClick={() => router.push("/")}
            >
              Mua sắm ngay
            </button>
          </div>
        ) : (
          // Order items list
          <div className="space-y-4">
            {filteredOrderItems.map((orderItem) => (
              <OrderItem 
                key={orderItem.id} 
                orderItem={orderItem} 
                onViewDetail={() => router.push(`/profile/buy-orders/${orderItem.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
