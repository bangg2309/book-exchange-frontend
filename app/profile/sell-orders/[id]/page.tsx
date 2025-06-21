'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FaArrowLeft,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaTruck,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaClipboard,
  FaSyncAlt
} from 'react-icons/fa';
import { orderService } from '@/services/orderService';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OrderResponse, OrderItemResponse, OrderStatus } from '@/types/order';
import { toastService } from '@/services/toastService';
import { authService } from '@/services/authService';
import ConfirmDialog from '@/components/ConfirmDialog';

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
        bgColor: "#e3f2fd",
      };
    case ORDER_ITEM_CONFIRMED:
      return { 
        text: "Đã xác nhận", 
        color: "#00897b",
        bgColor: "#e0f2f1",
      };
    case ORDER_ITEM_WAITING_FOR_DELIVERY:
      return { 
        text: "Đang giao hàng", 
        color: "#7b1fa2",
        bgColor: "#f3e5f5",
      };
    case ORDER_ITEM_RECEIVED:
      return { 
        text: "Đã nhận hàng", 
        color: "#2e7d32",
        bgColor: "#e8f5e9",
      };
    case ORDER_ITEM_CANCELLED:
      return { 
        text: "Đã hủy", 
        color: "#c62828",
        bgColor: "#ffebee",
      };
    default:
      return { 
        text: "Không xác định", 
        color: "#616161",
        bgColor: "#f5f5f5",
      };
  }
};

const OrderStatusBadge = ({ status }: { status: number }) => {
  const statusInfo = getStatusInfo(status);
  
  return (
    <span 
      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" 
      style={{ 
        backgroundColor: statusInfo.bgColor, 
        color: statusInfo.color 
      }}
    >
      {statusInfo.text}
    </span>
  );
};

export default function SellOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogProps, setDialogProps] = useState({
    title: '',
    message: '',
    confirmText: 'Xác nhận',
    confirmButtonColor: '#4CAF50',
    icon: 'warning' as 'warning' | 'success' | 'info' | 'error' | 'none',
    actionType: '',
    orderItemId: 0
  });
  
  // Sử dụng React.useEffect để truy cập params.id an toàn
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Đảm bảo params.id là một chuỗi hợp lệ
        if (!params || !params.id) {
          console.error('[DEBUG] Invalid params:', params);
          setError("ID đơn hàng không hợp lệ");
          setIsLoading(false);
          return;
        }
        
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
          console.error('[DEBUG] Invalid order ID:', params.id);
          setError("ID đơn hàng không hợp lệ");
          setIsLoading(false);
          return;
        }
        
        setOrderId(id);
        setIsLoading(true);
        console.log('[DEBUG] Fetching order details for ID:', id);
        
        // Thử lấy danh sách tất cả đơn bán và lọc ra đơn hàng cần xem
        try {
          console.log('[DEBUG] Using getCurrentSellerOrders and filtering');
          const sellersOrdersResponse = await orderService.getCurrentSellerOrders();
          
          if (sellersOrdersResponse && sellersOrdersResponse.code === 1000 && sellersOrdersResponse.result) {
            console.log('[DEBUG] Got sellers orders:', sellersOrdersResponse.result.length);
            
            // Tìm đơn hàng theo ID
            const orderDetail = sellersOrdersResponse.result.find(order => order.id === id);
            
            if (orderDetail) {
              console.log('[DEBUG] Found matching order:', orderDetail);
              setOrder(orderDetail);
              setError(null);
              setIsLoading(false);
              return;
            } else {
              console.error('[DEBUG] Order not found in sellers orders');
              setError("Không tìm thấy đơn hàng với ID này trong danh sách đơn bán của bạn");
              setIsLoading(false);
              return;
            }
          }
          
          console.log('[DEBUG] Could not find order in sellers orders, trying direct API call');
        } catch (filterError) {
          console.error('[DEBUG] Error filtering orders:', filterError);
          // Tiếp tục với cách gọi API trực tiếp
        }
        
        // Nếu không tìm thấy trong danh sách đơn bán, thử gọi API trực tiếp
        try {
          const token = authService.getToken();
          const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081'}/orders/${id}`;
          
          console.log('[DEBUG] API URL:', apiUrl);
          console.log('[DEBUG] Token exists:', !!token);
          
          const response = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('[DEBUG] Response status:', response.status);
          console.log('[DEBUG] Response headers:', Object.fromEntries(response.headers.entries()));
          
          const data = await response.json();
          console.log('[DEBUG] Response data:', data);
          
          if (response.ok && data && data.code === 1000 && data.result) {
            console.log('[DEBUG] Order details received:', data.result);
            setOrder(data.result);
            setError(null);
          } else {
            console.error('[DEBUG] Failed to get order details:', data);
            setError(data?.message || "Không thể tải thông tin đơn hàng");
          }
        } catch (apiError) {
          console.error("[DEBUG] API Error:", apiError);
          setError("Đã xảy ra lỗi khi tải thông tin đơn hàng. Vui lòng thử lại sau.");
        } finally {
          setIsLoading(false);
        }
      } catch (outerError) {
        console.error("[DEBUG] Outer error:", outerError);
        setError("Đã xảy ra lỗi khi tải thông tin đơn hàng. Vui lòng thử lại sau.");
        setIsLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [params]);
  
  const handleUpdateStatus = async (orderItemId: number, newStatus: number) => {
    try {
      setIsUpdating(true);
      
      // Lấy thông tin trạng thái hiện tại và mới
      const currentStatus = order?.items.find(item => item.id === orderItemId)?.status;
      const currentStatusText = currentStatus ? getStatusInfo(currentStatus).text : '';
      const newStatusText = getStatusInfo(newStatus).text;
      
      let dialogTitle = 'Cập nhật trạng thái';
      let dialogMessage = `Bạn có chắc muốn chuyển trạng thái đơn hàng từ "${currentStatusText}" sang "${newStatusText}"?`;
      let confirmText = 'Xác nhận';
      let confirmColor = '#4CAF50';
      let iconType: 'warning' | 'success' | 'info' | 'error' | 'none' = 'warning';
      
      // Hiển thị thông báo xác nhận dựa trên trạng thái mới
      if (newStatus === ORDER_ITEM_CANCELLED) {
        dialogTitle = 'Từ chối đơn hàng';
        dialogMessage = "Bạn có chắc muốn từ chối đơn hàng này?";
        confirmText = 'Từ chối';
        confirmColor = '#f44336';
        iconType = 'error';
      } else if (newStatus === ORDER_ITEM_CONFIRMED) {
        dialogTitle = 'Xác nhận đơn hàng';
        dialogMessage = "Bạn có chắc muốn xác nhận đơn hàng này?";
        confirmText = 'Xác nhận';
        confirmColor = '#4CAF50';
        iconType = 'success';
      } else if (newStatus === ORDER_ITEM_WAITING_FOR_DELIVERY) {
        dialogTitle = 'Chuyển trạng thái';
        dialogMessage = "Bạn có chắc muốn chuyển trạng thái đơn hàng sang đang giao hàng?";
        confirmText = 'Chuyển';
        confirmColor = '#9c27b0'; // Purple
        iconType = 'info';
      }
      
      // Mở dialog xác nhận với các thông số đã thiết lập
      setDialogProps({
        title: dialogTitle,
        message: dialogMessage,
        confirmText,
        confirmButtonColor: confirmColor,
        icon: iconType,
        actionType: 'UPDATE_STATUS',
        orderItemId: orderItemId
      });
      
      setDialogOpen(true);
      setIsUpdating(false);
      
    } catch (error) {
      console.error("Error preparing update dialog:", error);
      toastService.error("Đã xảy ra lỗi khi chuẩn bị cập nhật trạng thái");
      setIsUpdating(false);
    }
  };
  
  // Xử lý khi người dùng xác nhận thực hiện hành động
  const handleDialogConfirm = async () => {
    setIsUpdating(true);
    setDialogOpen(false);
    
    try {
      if (dialogProps.actionType === 'UPDATE_STATUS') {
        let newStatus = ORDER_ITEM_CONFIRMED; // Default
        
        if (dialogProps.confirmText === 'Từ chối') {
          newStatus = ORDER_ITEM_CANCELLED;
        } else if (dialogProps.confirmText === 'Xác nhận') {
          newStatus = ORDER_ITEM_CONFIRMED;
        } else if (dialogProps.confirmText === 'Chuyển') {
          newStatus = ORDER_ITEM_WAITING_FOR_DELIVERY;
        }
        
        const updatedOrderItem = await orderService.updateOrderItemStatus(dialogProps.orderItemId, newStatus);
        
        if (updatedOrderItem) {
          // Cập nhật lại trạng thái đơn hàng trong state
          setOrder(prevOrder => {
            if (!prevOrder) return null;
            
            const updatedItems = prevOrder.items.map(item => 
              item.id === dialogProps.orderItemId ? { ...item, status: newStatus } : item
            );
            
            return { ...prevOrder, items: updatedItems };
          });
          
          let successMessage = "Cập nhật trạng thái đơn hàng thành công";
          if (newStatus === ORDER_ITEM_CANCELLED) {
            successMessage = "Đã từ chối đơn hàng thành công";
          } else if (newStatus === ORDER_ITEM_CONFIRMED) {
            successMessage = "Đã xác nhận đơn hàng thành công";
          } else if (newStatus === ORDER_ITEM_WAITING_FOR_DELIVERY) {
            successMessage = "Đã chuyển trạng thái sang đang giao hàng";
          }
          
          toastService.success(successMessage);
        } else {
          toastService.error("Không thể cập nhật trạng thái đơn hàng");
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toastService.error("Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng");
    } finally {
      setIsUpdating(false);
    }
  };

  // Xử lý khi người dùng hủy hành động
  const handleDialogCancel = () => {
    setDialogOpen(false);
  };
  
  const handleConfirmOrder = (orderItemId: number) => {
    handleUpdateStatus(orderItemId, ORDER_ITEM_CONFIRMED);
  };
  
  const handleRejectOrder = (orderItemId: number) => {
    handleUpdateStatus(orderItemId, ORDER_ITEM_CANCELLED);
  };
  
  const handleShipOrder = (orderItemId: number) => {
    handleUpdateStatus(orderItemId, ORDER_ITEM_WAITING_FOR_DELIVERY);
  };
  
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-8"></div>
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="bg-gray-50 min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <FaTimesCircle className="text-red-500 text-5xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{error || "Không tìm thấy đơn hàng"}</h2>
            <p className="text-gray-600 mb-6">Có thể đơn hàng đã bị xóa hoặc bạn không có quyền truy cập.</p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => router.back()}
            >
              <FaArrowLeft className="inline-block mr-2" />
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button 
              className="mr-3 p-2 rounded-full hover:bg-gray-100"
              onClick={() => router.back()}
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Chi tiết đơn bán #{orderId}</h1>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto p-4 mt-6 space-y-6">
        {/* Order Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-start mb-5">
            <div>
              <div className="text-sm text-gray-500">Mã đơn hàng: <span className="font-medium text-gray-700">#{order.id}</span></div>
              <div className="text-sm text-gray-500">Ngày đặt: {formatDate(new Date(order.createdAt))}</div>
            </div>
          </div>
          
          {/* Shipping Address */}
          <div className="border-t border-gray-100 pt-4 mb-4">
            <h3 className="font-medium text-gray-800 mb-2 flex items-center">
              <FaMapMarkerAlt className="text-green-500 mr-2" />
              Địa chỉ nhận hàng
            </h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center text-gray-800 mb-1">
                <FaUser className="mr-2 text-gray-600" />
                <span className="font-medium">{order.shippingAddress.fullName}</span>
              </div>
              <div className="flex items-center text-gray-600 mb-1">
                <FaPhone className="mr-2" />
                <span>{order.shippingAddress.phoneNumber}</span>
              </div>
              <div className="flex text-gray-600 mt-1">
                <FaMapMarkerAlt className="mr-2 mt-1 flex-shrink-0" />
                <span>
                  {order.shippingAddress.addressDetail}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
                </span>
              </div>
            </div>
          </div>
          
          {/* Order Items */}
          <h3 className="font-medium text-gray-800 mb-3 flex items-center border-t border-gray-100 pt-4">
            <FaClipboard className="text-blue-500 mr-2" />
            Thông tin sản phẩm
          </h3>
          
          {order.items.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg mb-5">
              {/* Order Item Header */}
              <div className="bg-gray-50 p-4 flex justify-between items-center rounded-t-lg">
                <div>
                  <h4 className="font-medium">Người mua: {item.buyerName || "Khách hàng"}</h4>
                  <div className="text-sm text-gray-500">Mã phụ: #{item.id}</div>
                </div>
                <OrderStatusBadge status={item.status} />
              </div>
              
              {/* Product List */}
              <div className="p-4">
                <div className="space-y-4">
                  {item.bookItems.map((book) => (
                    <div key={book.id} className="flex">
                      <div className="relative h-20 w-16 flex-shrink-0 bg-gray-50 border border-gray-100 rounded-md overflow-hidden">
                        <Image
                          src={book.thumbnail || "/placeholder-book.jpg"}
                          alt={book.bookTitle}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-grow">
                        <div className="font-medium">{book.bookTitle}</div>
                        <div className="text-sm text-gray-500">
                          Tình trạng: {book.condition === 1 ? 'Mới' : 'Đã qua sử dụng'}
                        </div>
                        <div className="mt-1 flex justify-between">
                          <div className="text-sm text-gray-500">Số lượng: {book.quantity}</div>
                          <div className="font-medium text-green-600">{formatCurrency(book.price)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Price Summary */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tổng tiền hàng:</span>
                    <span>{formatCurrency(item.totalAmount - item.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm my-2">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span>{formatCurrency(item.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg mt-2">
                    <span>Thành tiền:</span>
                    <span className="text-green-600">{formatCurrency(item.totalAmount)}</span>
                  </div>
                </div>
                
                {/* Action Buttons based on status */}
                <div className="mt-5 flex flex-wrap gap-3 justify-end">
                  {item.status === ORDER_ITEM_WAITING_FOR_CONFIRMATION && (
                    <>
                      <button
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-md font-medium hover:bg-red-200 transition-colors"
                        onClick={() => handleRejectOrder(item.id)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? 
                          <><FaSyncAlt className="animate-spin inline-block mr-2" /> Đang xử lý...</> :
                          <><FaTimesCircle className="inline-block mr-2" /> Từ chối đơn</>
                        }
                      </button>
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
                        onClick={() => handleConfirmOrder(item.id)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? 
                          <><FaSyncAlt className="animate-spin inline-block mr-2" /> Đang xử lý...</> :
                          <><FaCheckCircle className="inline-block mr-2" /> Xác nhận đơn</>
                        }
                      </button>
                    </>
                  )}
                  
                  {item.status === ORDER_ITEM_CONFIRMED && (
                    <button
                      className="px-4 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors"
                      onClick={() => handleShipOrder(item.id)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? 
                        <><FaSyncAlt className="animate-spin inline-block mr-2" /> Đang xử lý...</> :
                        <><FaTruck className="inline-block mr-2" /> Chuyển sang đang giao</>
                      }
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Payment Info */}
          <div className="border-t border-gray-100 pt-4 mb-4">
            <h3 className="font-medium text-gray-800 mb-2">Phương thức thanh toán</h3>
            <div className="bg-gray-50 p-3 rounded-md text-gray-700">
              {order.paymentMethod === 'CASH' && 'Thanh toán khi nhận hàng (COD)'}
              {order.paymentMethod === 'CREDIT_CARD' && 'Thẻ tín dụng/Ghi nợ'}
              {order.paymentMethod === 'BANK_TRANSFER' && 'Chuyển khoản ngân hàng'}
              {order.paymentMethod === 'EWALLET' && 'Ví điện tử'}
              {!['CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'EWALLET'].includes(order.paymentMethod) && order.paymentMethod}
            </div>
          </div>
          
          {/* Notes */}
          {order.items.some(item => item.note) && (
            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-medium text-gray-800 mb-2">Ghi chú</h3>
              <div className="bg-yellow-50 p-3 rounded-md text-gray-700">
                {order.items.map(item => 
                  item.note ? (
                    <div key={`note-${item.id}`}>
                      <span className="text-sm text-gray-500">Mã phụ #{item.id}:</span> {item.note}
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Dialog xác nhận */}
      <ConfirmDialog
        isOpen={dialogOpen}
        title={dialogProps.title}
        message={dialogProps.message}
        confirmText={dialogProps.confirmText}
        confirmButtonColor={dialogProps.confirmButtonColor}
        icon={dialogProps.icon}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />
    </div>
  );
} 