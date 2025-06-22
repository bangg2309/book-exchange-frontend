'use client';

import { useState, useEffect } from 'react';
import { orderService } from '@/services/orderService';
import { OrderResponse, OrderStatus, PaymentOrderStatus } from '@/types/order';
import { ChevronLeft, ChevronRight, Edit, Trash2, Search, Package, Eye, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import OrderDetailModal from './components/OrderDetailModal';

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<string>('DESC');

  useEffect(() => {
    fetchOrders();
  }, [page, size, sortBy, sortDir]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Sử dụng phương thức admin mới để lấy tất cả đơn hàng với sắp xếp
      const response = await orderService.adminGetAllOrders(page, size, searchQuery, sortBy, sortDir);
      if (response.code === 1000) {
        setOrders(response.result?.content || []);
        setTotalPages(response.result?.totalPages || 0);
        setTotalElements(response.result?.totalElements || 0);
        setError(null);
      } else {
        setError(response.message || 'Không thể tải danh sách đơn hàng');
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Nếu đang sắp xếp theo field này rồi thì đảo chiều sắp xếp
      setSortDir(sortDir === 'ASC' ? 'DESC' : 'ASC');
    } else {
      // Nếu chưa sắp xếp theo field này thì mặc định sắp xếp giảm dần (DESC)
      setSortBy(field);
      setSortDir('DESC');
    }
    setPage(0); // Reset về trang đầu tiên
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const handleViewOrder = (order: OrderResponse) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId: number, status: number) => {
    try {
      // Sử dụng phương thức admin mới để cập nhật trạng thái đơn hàng
      const response = await orderService.adminUpdateOrderStatus(orderId, status);
      if (response.code === 1000) {
        fetchOrders(); // Refresh the list
      }
    } catch (err) {
      console.error('Failed to update order:', err);
      setError('Không thể cập nhật đơn hàng. Vui lòng thử lại sau.');
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!orderId || confirm('Bạn có chắc chắn muốn xóa đơn hàng này không?') === false) {
      return;
    }

    try {
      // Sử dụng phương thức admin mới để xóa đơn hàng
      const response = await orderService.adminDeleteOrder(orderId);
      if (response.code === 1000) {
        fetchOrders(); // Refresh the list
      }
    } catch (err) {
      console.error('Failed to delete order:', err);
      setError('Không thể xóa đơn hàng. Vui lòng thử lại sau.');
    }
  };

  const handleSearch = () => {
    // Reset to first page when searching
    setPage(0);
    fetchOrders();
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý đơn hàng</h1>
      </div>

      {/* Search and filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="Tìm kiếm đơn hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Tìm kiếm
        </button>
      </div>

      {/* Orders table */}
      <div className="bg-white dark:bg-gray-800 shadow-md overflow-hidden rounded-lg">
        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-600 dark:text-red-400">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Mã đơn hàng
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Khách hàng
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Phương thức thanh toán
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Tổng tiền
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Trạng thái
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        Ngày đặt
                        <ArrowUpDown size={14} className="ml-1" />
                        {sortBy === 'createdAt' && (
                          <span className="ml-1 text-xs">
                            {sortDir === 'DESC' ? '↓' : '↑'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        Không tìm thấy đơn hàng nào
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">#{order.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {order.shippingAddress?.fullName || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {order.shippingAddress?.phoneNumber || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{order.paymentMethod}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(order.totalPrice)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                              order.status
                            )}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{formatDate(order.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Hiển thị <span className="font-medium">{orders.length > 0 ? page * size + 1 : 0}</span> đến{' '}
                    <span className="font-medium">
                      {Math.min((page + 1) * size, totalElements)}
                    </span>{' '}
                    trong số <span className="font-medium">{totalElements}</span> kết quả
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                    className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                      page === 0
                        ? 'border-gray-300 bg-white text-gray-300 cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-500'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Trang {page + 1} / {totalPages || 1}
                  </div>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages - 1 || totalPages === 0}
                    className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                      page === totalPages - 1 || totalPages === 0
                        ? 'border-gray-300 bg-white text-gray-300 cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-500'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {isDetailModalOpen && selectedOrder && (
        <OrderDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          order={selectedOrder}
          onStatusUpdate={handleUpdateOrderStatus}
        />
      )}
    </div>
  );
} 