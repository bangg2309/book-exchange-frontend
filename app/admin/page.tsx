'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Tag, Users, ShoppingCart, PlusCircle, Settings, ChevronRight, Check, X, Eye } from 'lucide-react';
import DashboardCharts from './components/DashboardCharts';
import { dashboardService } from '@/services/dashboardService';
import { orderService } from '@/services/orderService';
import { toastService } from '@/services/toastService';
import { OrderResponse } from '@/types/order';
import { bookService } from '@/services/bookService';
import { useRouter } from 'next/navigation';

// Format số tiền
const formatCurrency = (amount: number) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + 'đ';
};

// Dạng dữ liệu sách
interface Book {
  id: number;
  title: string;
  author?: string; // Tác giả từ API có thể là undefined
  price: number;
  status: number;
  category?: string; // Danh mục từ API có thể là undefined
  createdAt?: string; // Thêm trường thời gian tạo
}

export default function AdminDashboard() {
  const [dashboardStats, setDashboardStats] = useState({
    totalBooks: 0,
    totalCategories: 0, 
    totalUsers: 0,
    totalOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<OrderResponse[]>([]);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]); 
  const [pendingBooks, setPendingBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveLoading, setApproveLoading] = useState<{ [key: string]: boolean }>({});
  const [showDetailId, setShowDetailId] = useState<number | null>(null);
  const [bookDetail, setBookDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const router = useRouter();

  useEffect(() => {
    // Hàm lấy dữ liệu thống kê từ API
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch các số liệu thống kê
        const [books, categories, users, orders, recentBooksData, pendingBooksData] = await Promise.all([
          dashboardService.getTotalBooks(),
          dashboardService.getTotalCategories(),
          dashboardService.getTotalUsers(),
          dashboardService.getTotalOrders(),
          dashboardService.getRecentBooks(),
          dashboardService.getPendingBooks(5)
        ]);

        setDashboardStats({
          totalBooks: books || 0,
          totalCategories: categories || 0,
          totalUsers: users || 0,
          totalOrders: orders || 0
        });

        // Xử lý dữ liệu sách mới nhất
        if (recentBooksData && recentBooksData.length > 0) {
          setRecentBooks(recentBooksData.map(book => ({
            id: book.id,
            title: book.title,
            author: book.author || 'Không có tác giả',
            category: book.categories?.length > 0 ? book.categories[0].name : 'Chưa phân loại',
            price: book.price,
            status: book.status
          })));
        }

        // Xử lý dữ liệu sách đang chờ duyệt
        if (pendingBooksData && pendingBooksData.length > 0) {
          setPendingBooks(pendingBooksData.map((book: any) => ({
            id: book.id,
            title: book.title,
            author: Array.isArray(book.author) ? book.author.map((a: any) => a.name).join(', ') : book.author,
            price: book.price,
            status: 0,
            createdAt: book.createdAt
          })));
        }

        // Fetch đơn hàng gần đây
        const ordersResponse = await orderService.adminGetAllOrders(
          0,                  // page
          3,                  // size
          undefined,          // search
          'createdAt',        // sort
          'DESC'              // direction - sắp xếp từ mới nhất đến cũ nhất
        );
        if (ordersResponse && ordersResponse.result) {
          setRecentOrders(ordersResponse.result.content);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toastService.error('Không thể tải dữ liệu bảng điều khiển');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Mảng các thẻ thống kê
  const stats = [
    { 
      name: 'Tổng số sách', 
      value: dashboardStats.totalBooks, 
      icon: BookOpen, 
      color: 'bg-green-700' 
    },
    { 
      name: 'Danh mục', 
      value: dashboardStats.totalCategories, 
      icon: Tag, 
      color: 'bg-emerald-600' 
    },
    { 
      name: 'Người dùng', 
      value: dashboardStats.totalUsers, 
      icon: Users, 
      color: 'bg-teal-600' 
    },
    { 
      name: 'Đơn hàng', 
      value: dashboardStats.totalOrders, 
      icon: ShoppingCart, 
      color: 'bg-green-600' 
    },
  ];

  // Hàm lấy trạng thái đơn hàng
  const getOrderStatusText = (status: number) => {
    switch (status) {
      case 1: return 'Đang xử lý';
      case 2: return 'Đã thanh toán';
      case 3: return 'Hoàn thành';
      case 4: return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  // Hàm xác định màu sắc cho trạng thái
  const getOrderStatusClass = (status: number) => {
    switch (status) {
      case 1: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 2: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 3: return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 4: return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Hàm lấy trạng thái sách
  const getBookStatusText = (status: number) => {
    switch (status) {
      case 0: return 'Chờ duyệt';
      case 1: return 'Đang bán';
      case 2: return 'Đã bán';
      case 3: return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  // Hàm xác định màu sắc cho trạng thái sách
  const getBookStatusClass = (status: number) => {
    switch (status) {
      case 0: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 1: return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 2: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'; 
      case 3: return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Hàm phê duyệt sách
  const handleApproveBook = async (id: number) => {
    try {
      setApproveLoading(prev => ({ ...prev, [id]: true }));
      await bookService.approveBook(id.toString());
      toastService.success('Phê duyệt sách thành công!');
      
      // Cập nhật lại danh sách sách chờ duyệt
      const updatedPendingBooks = pendingBooks.filter(book => book.id !== id);
      setPendingBooks(updatedPendingBooks);
    } catch (error) {
      console.error('Lỗi khi phê duyệt sách:', error);
      toastService.error('Không thể phê duyệt sách. Vui lòng thử lại.');
    } finally {
      setApproveLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Hàm từ chối sách
  const handleRejectBook = async (id: number) => {
    try {
      setApproveLoading(prev => ({ ...prev, [id]: true }));
      await bookService.rejectBook(id.toString(), rejectionReason);
      toastService.success('Từ chối sách thành công!');
      
      // Cập nhật lại danh sách sách chờ duyệt
      const updatedPendingBooks = pendingBooks.filter(book => book.id !== id);
      setPendingBooks(updatedPendingBooks);
      
      // Đóng dialog chi tiết nếu đang mở
      setShowDetailId(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Lỗi khi từ chối sách:', error);
      toastService.error('Không thể từ chối sách. Vui lòng thử lại.');
    } finally {
      setApproveLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Hàm xem chi tiết sách
  const handleViewDetail = async (id: number) => {
    try {
      setDetailLoading(true);
      setShowDetailId(id);
      const detail = await bookService.getListedBookById(id.toString());
      setBookDetail(detail.result);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết sách:', error);
      toastService.error('Không thể tải chi tiết sách. Vui lòng thử lại.');
    } finally {
      setDetailLoading(false);
    }
  };

  // Hàm đóng dialog chi tiết
  const closeDetail = () => {
    setShowDetailId(null);
    setBookDetail(null);
    setRejectionReason('');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bảng Điều Khiển</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Tổng quan về hoạt động của BookExchange</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</h3>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {loading ? '...' : stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Thao Tác Nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/admin/books/new"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:border-green-600 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            <span>Quản Lý Sách</span>
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:border-green-600 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            <Tag className="h-5 w-5 mr-2" />
            <span>Quản Lý Danh Mục</span>
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:border-green-600 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            <span>Quản Lý Đơn Hàng</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:border-green-600 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            <Users className="h-5 w-5 mr-2" />
            <span>Quản Lý Người Dùng</span>
          </Link>
        </div>
      </div>

      {/* Phê Duyệt Sách */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Phê Duyệt Sách (Mới nhất)</h2>
          <Link
            href="/admin/books"
            className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-500 flex items-center"
          >
            Quản lý sách <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-3">Tiêu đề</th>
                <th className="px-6 py-3">Tác giả</th>
                <th className="px-6 py-3">Giá</th>
                <th className="px-6 py-3">Ngày tạo</th>
                <th className="px-6 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">Đang tải...</td>
                </tr>
              ) : (
                pendingBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{book.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{book.author}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">{formatCurrency(book.price)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {book.createdAt ? new Date(book.createdAt).toLocaleString('vi-VN', {
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetail(book.id)} 
                          className="p-1 rounded hover:bg-gray-100 text-blue-500"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleApproveBook(book.id)}
                          disabled={approveLoading[book.id]}
                          className="p-1 rounded hover:bg-gray-100 text-green-500"
                          title="Phê duyệt"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => handleViewDetail(book.id)}
                          disabled={approveLoading[book.id]}
                          className="p-1 rounded hover:bg-gray-100 text-red-500"
                          title="Từ chối"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && pendingBooks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">Không có sách nào đang chờ phê duyệt</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Books */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Sách Gần Đây</h2>
            <Link
              href="/admin/books"
              className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-500 flex items-center"
            >
              Xem tất cả <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Tiêu đề</th>
                  <th className="px-6 py-3">Danh mục</th>
                  <th className="px-6 py-3">Giá</th>
                  <th className="px-6 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">Đang tải...</td>
                  </tr>
                ) : recentBooks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">Không có sách nào</td>
                  </tr>
                ) : (
                  recentBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{book.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{book.author}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{book.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">{formatCurrency(book.price)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getBookStatusClass(book.status)}`}
                        >
                          {getBookStatusText(book.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Đơn Hàng Gần Đây</h2>
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-500 flex items-center"
            >
              Xem tất cả <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Mã đơn</th>
                  <th className="px-6 py-3">Khách hàng</th>
                  <th className="px-6 py-3">Tổng tiền</th>
                  <th className="px-6 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">Đang tải...</td>
                  </tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">Không có đơn hàng nào</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">#{order.id}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{order.createdAt?.toString().slice(0, 10)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {order.shippingAddress ? order.shippingAddress.fullName : 'Khách hàng'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{order.items?.length || 0} sách</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">{formatCurrency(order.totalPrice || 0)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getOrderStatusClass(order.status || 0)}`}
                        >
                          {getOrderStatusText(order.status || 0)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Charts */}
      <DashboardCharts />

      {/* Book Detail Modal */}
      {showDetailId && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeDetail}></div>
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="relative bg-white dark:bg-gray-800 w-full max-w-3xl rounded-lg shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Chi tiết sách
                </h3>
                <button 
                  onClick={closeDetail}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6">
                {detailLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
                  </div>
                ) : bookDetail ? (
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-1/3">
                        <img 
                          src={bookDetail.thumbnail} 
                          alt={bookDetail.title}
                          className="w-full h-auto rounded-lg object-cover"
                        />
                      </div>
                      <div className="w-full md:w-2/3 space-y-4">
                        <div>
                          <h2 className="text-xl font-semibold">{bookDetail.title}</h2>
                          <p className="text-gray-600">
                            Tác giả: {Array.isArray(bookDetail.authors) ? 
                              bookDetail.authors.map((a: any) => a.name).join(', ') : 
                              (bookDetail.author || 'Không có thông tin')}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-500">Nhà xuất bản</p>
                            <p>{bookDetail.publisher || 'Không có thông tin'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Tình trạng</p>
                            <p>{bookDetail.conditionNumber}/5</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Giá mới</p>
                            <p className="line-through">{bookDetail.priceNew?.toLocaleString()} ₫</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Giá bán</p>
                            <p className="font-semibold text-green-600">{bookDetail.price?.toLocaleString()} ₫</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-gray-500">Mô tả</p>
                          <div 
                            className="text-gray-700"
                            dangerouslySetInnerHTML={{ __html: bookDetail.description || 'Không có mô tả' }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-md font-medium mb-2">Từ chối sách</h4>
                      <textarea
                        className="w-full border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600"
                        rows={3}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Nhập lý do từ chối (tùy chọn)"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        onClick={closeDetail}
                        className="px-4 py-2 border text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => handleRejectBook(showDetailId)}
                        disabled={approveLoading[showDetailId]}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        {approveLoading[showDetailId] ? 'Đang xử lý...' : 'Từ chối sách'}
                      </button>
                      <button
                        onClick={() => handleApproveBook(showDetailId)}
                        disabled={approveLoading[showDetailId]}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        {approveLoading[showDetailId] ? 'Đang xử lý...' : 'Phê duyệt sách'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">Không thể tải thông tin sách</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
