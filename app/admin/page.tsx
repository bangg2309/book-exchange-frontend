'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Tag, Users, Eye, BookMarked, PlusCircle, ShoppingCart, Settings, ChevronRight } from 'lucide-react';
import DashboardCharts from './components/DashboardCharts';

// Mock data - thay thế bằng API calls khi triển khai thực tế
const stats = [
  { name: 'Tổng số sách', value: 245, icon: BookOpen, color: 'bg-green-700' },
  { name: 'Danh mục', value: 12, icon: Tag, color: 'bg-emerald-600' },
  { name: 'Người dùng', value: 153, icon: Users, color: 'bg-teal-600' },
  { name: 'Lượt xem', value: '15.7K', icon: Eye, color: 'bg-green-600' },
];

const recentBooks = [
  { 
    id: 1, 
    title: 'Lập Trình Python Cơ Bản', 
    author: 'Nguyễn Văn A',
    category: 'CNTT', 
    price: 150000,
    date: '15/08/2023', 
    status: 'Đang bán' 
  },
  { 
    id: 2, 
    title: 'Tiếng Anh Chuyên Ngành Kinh Tế', 
    author: 'Trần Thị B',
    category: 'Ngoại ngữ', 
    price: 120000,
    date: '08/07/2023', 
    status: 'Đã bán' 
  },
  { 
    id: 3, 
    title: 'Giải Tích 1', 
    author: 'Lê Văn C',
    category: 'Toán học', 
    price: 85000,
    date: '22/06/2023', 
    status: 'Đang bán' 
  },
];

const recentOrders = [
  { 
    id: '1',
    customer: 'Đặng Minh D',
    date: '18/08/2023',
    books: 2,
    total: 235000,
    status: 'Hoàn thành'
  },
  { 
    id: '2',
    customer: 'Lê Thị E',
    date: '15/08/2023',
    books: 1,
    total: 120000,
    status: 'Đang giao'
  },
  { 
    id: '3',
    customer: 'Phạm Văn F',
    date: '10/08/2023',
    books: 3,
    total: 320000,
    status: 'Chờ xác nhận'
  },
];

// Format số tiền
const formatCurrency = (amount: number) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + 'đ';
};

export default function AdminDashboard() {
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
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
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
            <span>Quản lý sách</span>
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
            href="/admin/settings"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:border-green-600 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            <Settings className="h-5 w-5 mr-2" />
            <span>Cài Đặt Hệ Thống</span>
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
                {recentBooks.map((book) => (
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
                        className={`px-2 py-1 text-xs rounded-full ${
                          book.status === 'Đang bán'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {book.status}
                      </span>
                    </td>
                  </tr>
                ))}
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
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">#{order.id}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{order.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{order.customer}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{order.books} sách</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">{formatCurrency(order.total)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'Hoàn thành'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : order.status === 'Đang giao'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

            {/* Charts */}
            <DashboardCharts />

      {/* System Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tình Trạng Hệ Thống</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tỉ Lệ Hoàn Thành</h3>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mr-2">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">85%</span>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tỉ Lệ Bán Thành Công</h3>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mr-2">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">92%</span>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Đánh Giá Trung Bình</h3>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mr-2">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '78%' }}></div>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">4.7/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
