'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  FaArrowLeft, FaBox, FaCheck, FaExclamationTriangle, 
  FaInfoCircle, FaMoneyBillWave, FaPhoneAlt, FaReceipt, FaShippingFast, 
  FaShoppingBag, FaStar, FaTimesCircle, FaTruck, FaUser, FaMapMarkerAlt, 
  FaPencilAlt, FaClock
} from 'react-icons/fa';
import { formatCurrency } from '@/lib/utils';
import { OrderItemResponse } from '@/types/order';
import { orderService } from '@/services/orderService';
import { authService } from '@/services/authService';
import { toastService } from '@/services/toastService';
import ConfirmDialog from '@/components/ConfirmDialog';
import { ReviewDialog } from '@/components/reviews/ReviewDialog';
import * as reviewService from '@/services/reviewService';
import { ReviewResponse } from '@/services/reviewService';

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

// Status timeline component
const OrderStatusTimeline = ({ status }: { status: number }) => {
  const steps = [
    { id: ORDER_ITEM_WAITING_FOR_CONFIRMATION, label: "Chờ xác nhận", icon: <FaClock />, date: "15/08/2023" },
    { id: ORDER_ITEM_CONFIRMED, label: "Đã xác nhận", icon: <FaCheck />, date: "16/08/2023" },
    { id: ORDER_ITEM_WAITING_FOR_DELIVERY, label: "Đang giao hàng", icon: <FaTruck />, date: "17/08/2023" },
    { id: ORDER_ITEM_RECEIVED, label: "Đã nhận hàng", icon: <FaCheck />, date: "18/08/2023" }
  ];

  // Get current status info
  const statusInfo = getStatusInfo(status);
  
  // Find current step index
  let currentStepIndex = steps.findIndex(step => step.id === status);
  if (currentStepIndex === -1) {
    currentStepIndex = status > ORDER_ITEM_RECEIVED ? 3 : 0;
  }

  if (status === ORDER_ITEM_CANCELLED) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center p-5 rounded-md" style={{ backgroundColor: statusInfo.bgColor }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: statusInfo.color, color: 'white' }}>
            {statusInfo.icon}
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-lg" style={{ color: statusInfo.color }}>Đơn hàng đã bị hủy</h3>
            <p className="text-sm text-gray-500 mt-1">Đơn hàng đã bị hủy vào ngày 15/08/2023</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-6 text-lg flex items-center">
        <FaInfoCircle className="mr-2 text-gray-500" />
        Trạng thái đơn hàng
      </h3>
      <div className="flex justify-between relative">
        {/* Progress bar background */}
        <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 rounded-full"></div>
        
        {/* Active progress bar */}
        <div 
          className="absolute top-6 left-0 h-1 rounded-full" 
          style={{ 
            backgroundColor: statusInfo.color,
            width: `${(currentStepIndex / (steps.length - 1)) * 100}%`
          }}
        ></div>
        
        {steps.map((step, index) => {
          const isActive = index <= currentStepIndex;
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.id} className="flex flex-col items-center relative z-10 w-1/4">
              <div 
                className={`w-14 h-14 rounded-full flex items-center justify-center border-4 ${isActive ? 'text-white shadow-md' : 'bg-white text-gray-400 border-gray-200'}`}
                style={{ 
                  backgroundColor: isActive ? statusInfo.color : undefined,
                  borderColor: isActive ? statusInfo.lightColor : undefined
                }}
              >
                {step.icon}
              </div>
              <p className={`font-medium mt-3 text-center ${isActive ? '' : 'text-gray-500'}`}>{step.label}</p>
              <p className="text-xs text-gray-500 mt-1 text-center">
                {index <= currentStepIndex ? step.date : '-'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function OrderItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [orderItem, setOrderItem] = useState<OrderItemResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState<{
    bookId: number;
    sellerId: number;
    bookTitle: string;
    sellerName: string;
    existingReview?: ReviewResponse | null;
  } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    action: () => void;
    icon: 'warning' | 'success' | 'info' | 'error' | 'none';
  } | null>(null);
  const [showBookSelection, setShowBookSelection] = useState(false);
  const [bookReviewStatus, setBookReviewStatus] = useState<Record<number, ReviewResponse | null>>({});
  const [checkingReviews, setCheckingReviews] = useState(true);

  useEffect(() => {
    const fetchOrderItem = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          router.push('/login');
          return;
        }
        
        // Fetch order item data from API
        const orderItemId = parseInt(id);
        const orderItemData = await orderService.getOrderItemById(orderItemId);
        
        if (orderItemData) {
          setOrderItem(orderItemData);
        } else {
          setError('Không thể tải thông tin đơn hàng');
        }
      } catch (error) {
        console.error("Error fetching order item:", error);
        setError("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderItem();
  }, [id, router]);

  // Check if reviews exist for each book in the order
  useEffect(() => {
    const checkReviews = async () => {
      if (!orderItem || !orderItem.bookItems || orderItem.bookItems.length === 0) {
        setCheckingReviews(false);
        return;
      }

      try {
        const reviewStatusMap: Record<number, ReviewResponse | null> = {};
        
        // Check each book for existing reviews
        for (const book of orderItem.bookItems) {
          const existingReview = await reviewService.getUserReviewForBook(book.bookId);
          reviewStatusMap[book.bookId] = existingReview;
        }
        
        setBookReviewStatus(reviewStatusMap);
      } catch (error) {
        console.error("Error checking review status:", error);
      } finally {
        setCheckingReviews(false);
      }
    };

    if (orderItem && orderItem.status === ORDER_ITEM_RECEIVED) {
      checkReviews();
    } else {
      setCheckingReviews(false);
    }
  }, [orderItem]);

  // Handle order status update (e.g., cancel order or confirm receipt)
  const handleUpdateStatus = async (newStatus: number) => {
    try {
      const updatedOrderItem = await orderService.updateOrderItemStatus(parseInt(id), newStatus);
      if (updatedOrderItem) {
        // Show appropriate message based on status
        if (newStatus === ORDER_ITEM_CANCELLED) {
          toastService.success('Đơn hàng đã được hủy thành công');
        } else if (newStatus === ORDER_ITEM_RECEIVED) {
          toastService.success('Xác nhận đã nhận hàng thành công');
        }
        
        // Update local state
        setOrderItem(updatedOrderItem);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toastService.error('Không thể cập nhật trạng thái đơn hàng');
    }
  };

  // Handle showing confirmation dialog
  const showConfirm = (title: string, message: string, action: () => void, icon: 'warning' | 'success' | 'info' | 'error' | 'none' = 'warning') => {
    setConfirmAction({ title, message, action, icon });
    setShowConfirmDialog(true);
  };

  // Handle opening review dialog
  const handleOpenReviewDialog = async (bookId: number, bookTitle: string) => {
    if (!orderItem) return;
    
    // Check if there's an existing review
    const existingReview = bookReviewStatus[bookId] || null;
    
    setSelectedBook({
      bookId,
      sellerId: orderItem.sellerId,
      bookTitle,
      sellerName: orderItem.sellerName,
      existingReview
    });
    setShowReviewDialog(true);
  };
  
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !orderItem) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center border border-gray-200">
            <FaTimesCircle className="text-red-500 text-4xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{error || 'Không tìm thấy đơn hàng'}</h2>
            <p className="text-gray-600 mb-4">Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu lỗi vẫn tiếp tục.</p>
            <button 
              className="px-5 py-2 rounded-md text-sm font-medium text-white transition-colors duration-200 hover:opacity-90"
              style={{ backgroundColor: '#4CAF50' }}
              onClick={() => router.push('/profile/buy-orders')}
            >
              Quay lại danh sách đơn hàng
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const statusInfo = getStatusInfo(orderItem.status);
  const formattedDate = new Date(orderItem.createdAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // Render different action buttons based on order status
  const renderActionButtons = () => {
    switch (orderItem.status) {
      case ORDER_ITEM_WAITING_FOR_CONFIRMATION:
        return (
          <>
            <button 
              className="w-full px-5 py-3 border rounded-md text-sm font-medium transition-colors duration-200 hover:bg-gray-50 flex justify-center items-center shadow-sm"
              style={{ borderColor: '#d32f2f', color: '#d32f2f' }}
              onClick={() => showConfirm(
                'Hủy đơn hàng',
                'Bạn có chắc chắn muốn hủy đơn hàng này không?',
                () => handleUpdateStatus(ORDER_ITEM_CANCELLED),
                'warning'
              )}
            >
              <FaTimesCircle className="mr-2" />
              Hủy đơn hàng
            </button>
          </>
        );
      
      case ORDER_ITEM_CONFIRMED:
        return (
          <>
            <div className="p-4 bg-blue-50 rounded-md mb-4 flex items-start">
              <FaInfoCircle className="text-blue-500 mt-1 mr-3" />
              <p className="text-sm text-blue-700">Đơn hàng của bạn đã được xác nhận và đang chuẩn bị giao hàng.</p>
            </div>
          </>
        );
      
      case ORDER_ITEM_WAITING_FOR_DELIVERY:
        return (
          <>
            <div className="p-4 bg-purple-50 rounded-md mb-4 flex items-start">
              <FaTruck className="text-purple-500 mt-1 mr-3" />
              <p className="text-sm text-purple-700">Đơn hàng của bạn đang được giao. Dự kiến giao hàng trong 1-3 ngày tới.</p>
            </div>
            <button 
              className="w-full px-5 py-3 rounded-md text-sm font-medium text-white transition-colors duration-200 hover:opacity-90 flex justify-center items-center shadow-sm"
              style={{ backgroundColor: '#4CAF50' }}
              onClick={() => showConfirm(
                'Xác nhận đã nhận hàng',
                'Bạn xác nhận đã nhận được hàng từ người bán?',
                () => handleUpdateStatus(ORDER_ITEM_RECEIVED),
                'info'
              )}
            >
              <FaCheck className="mr-2" />
              Xác nhận đã nhận hàng
            </button>
          </>
        );
      
      case ORDER_ITEM_RECEIVED:
        return (
          <>
            <div className="p-4 bg-green-50 rounded-md mb-4 flex items-start">
              <FaCheck className="text-green-500 mt-1 mr-3" />
              <p className="text-sm text-green-700">Bạn đã nhận hàng thành công. Hãy đánh giá sản phẩm để giúp người bán cải thiện dịch vụ.</p>
            </div>
            <button 
              className="w-full px-5 py-3 rounded-md text-sm font-medium text-white transition-colors duration-200 hover:opacity-90 flex justify-center items-center shadow-sm"
              style={{ backgroundColor: '#4CAF50' }}
              onClick={() => {
                if (orderItem.bookItems.length === 1) {
                  // Nếu chỉ có 1 sách, mở dialog đánh giá luôn
                  handleOpenReviewDialog(
                    orderItem.bookItems[0].bookId,
                    orderItem.bookItems[0].bookTitle
                  );
                } else {
                  // Nếu có nhiều sách, hiển thị modal chọn sách
                  setShowBookSelection(true);
                }
              }}
            >
              <FaStar className="mr-2" />
              {checkingReviews ? 'Đang kiểm tra...' : 'Đánh giá sản phẩm'}
            </button>
          </>
        );
      
      case ORDER_ITEM_CANCELLED:
        return (
          <div className="p-4 bg-red-50 rounded-md flex items-start">
            <FaExclamationTriangle className="text-red-500 mt-1 mr-3" />
            <div>
              <p className="text-sm text-red-700 mb-2">Đơn hàng này đã bị hủy.</p>
              <p className="text-xs text-red-600">Nếu bạn vẫn muốn mua sản phẩm này, vui lòng đặt hàng lại.</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-gray-50 min-h-screen py-8">
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
          existingReview={selectedBook.existingReview}
          onReviewSubmitted={() => {
            // Update the review status after submission
            const updatedReviewStatus = { ...bookReviewStatus };
            
            // If we're updating, we need to refresh the review data
            if (selectedBook.existingReview) {
              reviewService.getUserReviewForBook(selectedBook.bookId)
                .then((updatedReview: ReviewResponse | null) => {
                  if (updatedReview) {
                    updatedReviewStatus[selectedBook.bookId] = updatedReview;
                    setBookReviewStatus(updatedReviewStatus);
                  }
                });
              toastService.success('Cảm ơn bạn đã cập nhật đánh giá!');
            } else {
              // For new reviews, we can just use the submitted data
              reviewService.getUserReviewForBook(selectedBook.bookId)
                .then((newReview: ReviewResponse | null) => {
                  if (newReview) {
                    updatedReviewStatus[selectedBook.bookId] = newReview;
                    setBookReviewStatus(updatedReviewStatus);
                  }
                });
              toastService.success('Cảm ơn bạn đã đánh giá sản phẩm!');
            }
            
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
              {orderItem.bookItems.map((book) => {
                const hasReview = bookReviewStatus[book.bookId] !== null && bookReviewStatus[book.bookId] !== undefined;
                
                return (
                  <div 
                    key={book.id} 
                    className="flex items-center p-3 border rounded-lg mb-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      handleOpenReviewDialog(book.bookId, book.bookTitle);
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
                    <div className="ml-3 flex-grow">
                      <h3 className="font-medium">{book.bookTitle}</h3>
                      <p className="text-sm text-gray-500">
                        Tình trạng: {book.condition === 1 ? 'Mới' : 'Đã qua sử dụng'}
                      </p>
                    </div>
                    {!checkingReviews && (
                      <div className="ml-auto">
                        {hasReview ? (
                          <div className="flex items-center text-amber-500">
                            <FaPencilAlt className="mr-1" />
                            <span className="text-sm">Cập nhật</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-green-500">
                            <FaStar className="mr-1" />
                            <span className="text-sm">Đánh giá</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Back button */}
        <button 
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
          onClick={() => router.push("/profile/buy-orders")}
        >
          <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-3 shadow-sm group-hover:border-gray-300 transition-colors">
            <FaArrowLeft className="text-sm" />
          </div>
          <span className="font-medium">Quay lại lịch sử mua hàng</span>
        </button>
        
        {/* Page title */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mr-3">
              <FaReceipt className="text-green-600" />
            </div>
            Chi tiết đơn hàng #{orderItem.orderId}
          </h1>
          <div 
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-sm"
            style={{ backgroundColor: statusInfo.bgColor, color: statusInfo.color }}
          >
            {statusInfo.icon}
            {statusInfo.text}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* Order header */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-gray-500">Ngày đặt hàng: {formattedDate}</p>
                  {orderItem.paymentMethod && (
                    <p className="text-gray-500 mt-1">Phương thức thanh toán: {orderItem.paymentMethod}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center p-5 rounded-md bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                  <FaShoppingBag className="text-gray-500" />
                </div>
                <div className="ml-4">
                  <p className="font-medium">Người bán: {orderItem.sellerName}</p>
                  <p className="text-sm text-gray-500 mt-1">ID: {orderItem.sellerId}</p>
                </div>
              </div>
            </div>
            
            {/* Order status timeline */}
            <OrderStatusTimeline status={orderItem.status} />
            
            {/* Order items */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                  <FaBox className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-lg">Sản phẩm đã mua</h3>
              </div>
              
              {orderItem.bookItems.map((book) => (
                <div key={book.id} className="flex py-5 border-b border-gray-100 last:border-b-0">
                  <div className="relative h-40 w-32 flex-shrink-0 bg-gray-50 border border-gray-100 rounded-md overflow-hidden shadow-sm">
                    <Image
                      src={book.thumbnail || "/placeholder-book.jpg"}
                      alt={book.bookTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-6 flex-grow">
                    <h3 className="font-medium text-lg">{book.bookTitle}</h3>
                    <div className="mt-2 text-sm text-gray-500 inline-flex items-center bg-gray-50 px-3 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                      Tình trạng: {book.condition === 1 ? 'Mới' : 'Đã qua sử dụng'}
                    </div>
                    <div className="mt-6 flex justify-between items-end">
                      <div className="text-sm text-gray-500">
                        Số lượng: <span className="font-medium">{book.quantity}</span>
                      </div>
                      <div className="text-xl font-semibold" style={{ color: '#4CAF50' }}>
                        {formatCurrency(book.price)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-4 space-y-8">
            {/* Order summary */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm sticky top-8">
              <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mr-3">
                  <FaMoneyBillWave className="text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-lg">Tổng quan đơn hàng</h3>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <span className="text-gray-600">Tổng tiền sản phẩm:</span>
                  <span className="font-medium">{formatCurrency(orderItem.totalAmount - orderItem.shippingFee)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-medium">{formatCurrency(orderItem.shippingFee)}</span>
                </div>
                <div className="flex justify-between items-center p-4 mt-2 bg-green-50 rounded-md">
                  <span className="font-medium text-gray-800">Tổng thanh toán:</span>
                  <span className="text-xl font-semibold" style={{ color: '#4CAF50' }}>{formatCurrency(orderItem.totalAmount)}</span>
                </div>
              </div>
              
              {/* Shipping info */}
              <div className="mb-6 pt-4 border-t border-gray-100">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <FaShippingFast className="text-gray-500 mr-2" />
                  Thông tin giao hàng
                </h4>
                <div className="space-y-3 text-sm">
                  {orderItem.buyerName && (
                    <div className="flex items-start">
                      <FaUser className="text-gray-400 mt-1 mr-2 w-4" />
                      <span>{orderItem.buyerName}</span>
                    </div>
                  )}
                  {orderItem.buyerPhone && (
                    <div className="flex items-start">
                      <FaPhoneAlt className="text-gray-400 mt-1 mr-2 w-4" />
                      <span>{orderItem.buyerPhone}</span>
                    </div>
                  )}
                  {orderItem.shippingAddress && (
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="text-gray-400 mt-1 mr-2 w-4" />
                      <span>{orderItem.shippingAddress}</span>
                    </div>
                  )}
                  {/* Fallback if the new fields are not available */}
                  {!orderItem.shippingAddress && !orderItem.buyerName && !orderItem.buyerPhone && (
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="text-gray-400 mt-1 mr-2 w-4" />
                      <span>123 Đường Nguyễn Văn Linh, Phường Tân Phong, Quận 7, TP.HCM</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Note */}
              {orderItem.note && (
                <div className="mb-6 pt-4 border-t border-gray-100">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                    <FaInfoCircle className="text-gray-500 mr-2" />
                    Ghi chú
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                    <p className="text-gray-700 text-sm italic">{orderItem.note}</p>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="pt-4 border-t border-gray-100">
                {renderActionButtons()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 