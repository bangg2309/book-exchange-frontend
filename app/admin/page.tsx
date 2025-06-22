'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Tag, Users, ShoppingCart, PlusCircle, Settings, ChevronRight } from 'lucide-react';
import DashboardCharts from './components/DashboardCharts';
import { dashboardService } from '@/services/dashboardService';
import { orderService } from '@/services/orderService';
import { toastService } from '@/services/toastService';
import { OrderResponse } from '@/types/order';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hàm lấy dữ liệu thống kê từ API
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch các số liệu thống kê
        const [books, categories, users, orders, recentBooksData] = await Promise.all([
          dashboardService.getTotalBooks(),
          dashboardService.getTotalCategories(),
          dashboardService.getTotalUsers(),
          dashboardService.getTotalOrders(),
          dashboardService.getRecentBooks()
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

      {/* Phê Duyệt Sách */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Phê Duyệt Sách</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-3">Tiêu đề</th>
                <th className="px-6 py-3">Tác giả</th>
                <th className="px-6 py-3">Giá</th>
                <th className="px-6 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">Đang tải...</td>
                </tr>
              ) : (
                recentBooks
                  .filter(book => book.status === 0)
                  .map((book) => (
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
                        <div className="flex space-x-2">
                          <button 
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Phê duyệt
                          </button>
                          <button 
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Từ chối
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
              {!loading && recentBooks.filter(book => book.status === 0).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">Không có sách nào đang chờ phê duyệt</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
