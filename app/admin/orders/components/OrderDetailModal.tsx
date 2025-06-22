'use client';

import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { OrderResponse, OrderStatus, PaymentOrderStatus } from '@/types/order';
import { X, Check, AlertCircle, ChevronDown, User, ShoppingBag, Truck, CreditCard, Calendar } from 'lucide-react';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderResponse;
  onStatusUpdate: (orderId: number, status: number) => Promise<void>;
}

export default function OrderDetailModal({ isOpen, onClose, order, onStatusUpdate }: OrderDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<number>(order.status);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusBadgeColor = (status: number) => {
    // Kiểm tra nếu đây là trạng thái thanh toán
    if (status === PaymentOrderStatus.PAYMENT_ORDER_FAILED) {
      return 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300';
    } else if (status === PaymentOrderStatus.PAYMENT_ORDER_PENDING) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300';
    } else if (status === PaymentOrderStatus.PAYMENT_ORDER_SUCCESS) {
      return 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300';
    } else if (status === PaymentOrderStatus.PAYMENT_ORDER_CANCELED) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    } else if (status === PaymentOrderStatus.PAYMENT_ORDER_REFUNDED) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-300';
    }
    
    // Trạng thái đơn hàng cũ
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300';
      case OrderStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300';
      case OrderStatus.SHIPPED:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800/30 dark:text-indigo-300';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300';
      case OrderStatus.REFUNDED:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: number) => {
    // Kiểm tra nếu đây là trạng thái thanh toán
    if (status === PaymentOrderStatus.PAYMENT_ORDER_FAILED) {
      return 'Thanh toán thất bại';
    } else if (status === PaymentOrderStatus.PAYMENT_ORDER_PENDING) {
      return 'Chờ thanh toán';
    } else if (status === PaymentOrderStatus.PAYMENT_ORDER_SUCCESS) {
      return 'Đã thanh toán';
    } else if (status === PaymentOrderStatus.PAYMENT_ORDER_CANCELED) {
      return 'Thanh toán đã hủy';
    } else if (status === PaymentOrderStatus.PAYMENT_ORDER_REFUNDED) {
      return 'Đã hoàn tiền';
    }
    
    // Trạng thái đơn hàng cũ
    switch (status) {
      case OrderStatus.PENDING:
        return 'Chờ xử lý';
      case OrderStatus.PROCESSING:
        return 'Đang xử lý';
      case OrderStatus.SHIPPED:
        return 'Đang giao hàng';
      case OrderStatus.DELIVERED:
        return 'Đã giao hàng';
      case OrderStatus.CANCELLED:
        return 'Đã hủy';
      case OrderStatus.REFUNDED:
        return 'Đã hoàn tiền';
      default:
        return 'Không xác định';
    }
  };

  const handleUpdateStatus = async () => {
    if (selectedStatus === order.status) return;
    
    try {
      setIsUpdating(true);
      await onStatusUpdate(order.id, selectedStatus);
      onClose();
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getOrderStatusOptions = () => {
    // Nếu là trạng thái thanh toán
    if (
      order.status === PaymentOrderStatus.PAYMENT_ORDER_FAILED ||
      order.status === PaymentOrderStatus.PAYMENT_ORDER_PENDING ||
      order.status === PaymentOrderStatus.PAYMENT_ORDER_SUCCESS ||
      order.status === PaymentOrderStatus.PAYMENT_ORDER_CANCELED ||
      order.status === PaymentOrderStatus.PAYMENT_ORDER_REFUNDED
    ) {
      return [
        { value: PaymentOrderStatus.PAYMENT_ORDER_PENDING, label: 'Chờ thanh toán' },
        { value: PaymentOrderStatus.PAYMENT_ORDER_SUCCESS, label: 'Đã thanh toán' },
        { value: PaymentOrderStatus.PAYMENT_ORDER_FAILED, label: 'Thanh toán thất bại' },
        { value: PaymentOrderStatus.PAYMENT_ORDER_CANCELED, label: 'Thanh toán đã hủy' },
        { value: PaymentOrderStatus.PAYMENT_ORDER_REFUNDED, label: 'Đã hoàn tiền' },
      ];
    }
    
    // Trạng thái đơn hàng thông thường
    return [
      { value: OrderStatus.PENDING, label: 'Chờ xử lý' },
      { value: OrderStatus.PROCESSING, label: 'Đang xử lý' },
      { value: OrderStatus.SHIPPED, label: 'Đang giao hàng' },
      { value: OrderStatus.DELIVERED, label: 'Đã giao hàng' },
      { value: OrderStatus.CANCELLED, label: 'Đã hủy' },
      { value: OrderStatus.REFUNDED, label: 'Đã hoàn tiền' },
    ];
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Chi tiết đơn hàng #{order.id}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-2 space-y-4">
                  {/* Tổng quan đơn hàng */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                      <ShoppingBag size={18} className="mr-2" />
                      Tổng quan đơn hàng
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Mã đơn hàng:</p>
                        <p className="text-gray-900 dark:text-white font-medium">#{order.id}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Ngày đặt:</p>
                        <p className="text-gray-900 dark:text-white">{formatDate(order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Trạng thái:</p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Cập nhật:</p>
                        <p className="text-gray-900 dark:text-white">{formatDate(order.updatedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin thanh toán */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                      <CreditCard size={18} className="mr-2" />
                      Thông tin thanh toán
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Phương thức thanh toán:</p>
                        <p className="text-gray-900 dark:text-white">{order.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Trạng thái thanh toán:</p>
                        <div className="flex items-center">
                          {order.status === PaymentOrderStatus.PAYMENT_ORDER_SUCCESS && (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                              <Check size={16} className="mr-1" />
                              <span>Đã thanh toán</span>
                            </div>
                          )}
                          {order.status === PaymentOrderStatus.PAYMENT_ORDER_PENDING && (
                            <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                              <AlertCircle size={16} className="mr-1" />
                              <span>Chờ thanh toán</span>
                            </div>
                          )}
                          {order.status === PaymentOrderStatus.PAYMENT_ORDER_FAILED && (
                            <div className="flex items-center text-red-600 dark:text-red-400">
                              <X size={16} className="mr-1" />
                              <span>Thanh toán thất bại</span>
                            </div>
                          )}
                          {order.status === PaymentOrderStatus.PAYMENT_ORDER_CANCELED && (
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <X size={16} className="mr-1" />
                              <span>Thanh toán đã hủy</span>
                            </div>
                          )}
                          {order.status === PaymentOrderStatus.PAYMENT_ORDER_REFUNDED && (
                            <div className="flex items-center text-purple-600 dark:text-purple-400">
                              <Check size={16} className="mr-1" />
                              <span>Đã hoàn tiền</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Phương thức vận chuyển:</p>
                        <p className="text-gray-900 dark:text-white">{order.deliveryMethod || 'Tiêu chuẩn'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Mã giảm giá:</p>
                        <p className="text-gray-900 dark:text-white">{order.voucherCode || 'Không áp dụng'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin người mua */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                      <User size={18} className="mr-2" />
                      Thông tin người mua
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Mã khách hàng:</p>
                        <p className="text-gray-900 dark:text-white">#{order.userId}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Họ tên:</p>
                        <p className="text-gray-900 dark:text-white">{order.shippingAddress?.fullName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Số điện thoại:</p>
                        <p className="text-gray-900 dark:text-white">{order.shippingAddress?.phoneNumber}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500 dark:text-gray-400">Địa chỉ giao hàng:</p>
                        <p className="text-gray-900 dark:text-white">
                          {order.shippingAddress?.addressDetail}, {order.shippingAddress?.ward},{' '}
                          {order.shippingAddress?.district}, {order.shippingAddress?.province}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin người bán */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                      <ShoppingBag size={18} className="mr-2" />
                      Thông tin người bán
                    </h4>
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="border-b border-gray-200 dark:border-gray-600 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                          <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Người bán:</p>
                              <p className="text-gray-900 dark:text-white font-medium">{item.sellerName}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Mã người bán:</p>
                              <p className="text-gray-900 dark:text-white">#{item.sellerId}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Trạng thái đơn:</p>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                                  item.status
                                )}`}
                              >
                                {getStatusText(item.status)}
                              </span>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Phí vận chuyển:</p>
                              <p className="text-gray-900 dark:text-white">{formatCurrency(item.shippingFee)}</p>
                            </div>
                          </div>
                          {item.note && (
                            <div className="text-sm mb-2">
                              <p className="text-gray-500 dark:text-gray-400">Ghi chú:</p>
                              <p className="text-gray-900 dark:text-white italic">{item.note}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sản phẩm */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                      <Truck size={18} className="mr-2" />
                      Chi tiết sản phẩm
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Sản phẩm
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Người bán
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Tình trạng
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Giá
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Số lượng
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Thành tiền
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                          {order.items.flatMap((item) =>
                            item.bookItems.map((book) => (
                              <tr key={book.id}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {book.bookTitle}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {item.sellerName}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {book.condition === 0 ? 'Mới' : 'Đã qua sử dụng'}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {formatCurrency(book.price)}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {book.quantity}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                                  {formatCurrency(book.subtotal)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Tổng cộng */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Thông tin thanh toán</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <p className="text-gray-500 dark:text-gray-400">Tạm tính:</p>
                        <p className="text-gray-900 dark:text-white">
                          {formatCurrency(order.totalPrice + order.discount - order.shippingFee)}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-gray-500 dark:text-gray-400">Phí vận chuyển:</p>
                        <p className="text-gray-900 dark:text-white">{formatCurrency(order.shippingFee)}</p>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between">
                          <p className="text-gray-500 dark:text-gray-400">Giảm giá:</p>
                          <p className="text-green-600 dark:text-green-400">-{formatCurrency(order.discount)}</p>
                        </div>
                      )}
                      <div className="flex justify-between font-medium border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                        <p className="text-gray-900 dark:text-white">Tổng cộng:</p>
                        <p className="text-gray-900 dark:text-white">{formatCurrency(order.totalPrice)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Cập nhật trạng thái */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3">Cập nhật trạng thái</h4>
                    <div className="flex flex-col space-y-3">
                      <div className="relative">
                        <button
                          type="button"
                          className="w-full flex items-center justify-between px-4 py-2 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                        >
                          <span>{getStatusText(selectedStatus)}</span>
                          <ChevronDown size={16} />
                        </button>
                        
                        {showStatusDropdown && (
                          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                            {getOrderStatusOptions().map((option) => (
                              <div
                                key={option.value}
                                className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                  selectedStatus === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                                }`}
                                onClick={() => {
                                  setSelectedStatus(option.value as number);
                                  setShowStatusDropdown(false);
                                }}
                              >
                                {option.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <button
                        type="button"
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          selectedStatus === order.status || isUpdating
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        onClick={handleUpdateStatus}
                        disabled={selectedStatus === order.status || isUpdating}
                      >
                        {isUpdating ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                      </button>
                    </div>
                  </div>

                  {/* Nút đóng */}
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-200 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={onClose}
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 