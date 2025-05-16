'use client';

import { useEffect, useState } from 'react';
import { categoryService } from '@/services/categoryService'; // Tạo service tương tự như userService
import { Category } from '@/types/category';
import {Edit, Trash2, Search, Plus, ChevronLeft, ChevronRight} from 'lucide-react';
import CategoryFormModal from './components/CategoryFormModal';

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);

  useEffect(() => {
    fetchCategories();
  },[page, size]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategoriesOfPage(page, size);
      setCategories(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi tải danh mục:', err);
      setError('Không thể tải danh sách danh mục. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };


  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };
  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleUpdateCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này không?')) {
      try {
        await categoryService.deleteCategory(id);

        // Tạm thời lấy lại dữ liệu sau khi xóa để cập nhật totalElements
        const dataAfterDelete = await categoryService.getCategoriesOfPage(page, size);
        const newTotalPages = dataAfterDelete.totalPages;

        // Nếu trang hiện tại vượt quá số trang mới thì set lại trang
        if (page >= newTotalPages && page > 0) {
          setPage(page - 1); // Giảm xuống 1 trang
        } else {
          setCategories(dataAfterDelete.content);
          setTotalPages(dataAfterDelete.totalPages);
          setTotalElements(dataAfterDelete.totalElements);
        }
      } catch (err) {
        console.error('Không thể xóa:', err);
        setError('Không thể xóa danh mục. Vui lòng thử lại.');
      }
    }
  };


  const handleSave = async (data: Partial<Category>) => {
    try {
      if (selectedCategory?.id) {
        await categoryService.updateCategory(selectedCategory.id, data);
      } else {
        await categoryService.createCategory(data);
      }
      fetchCategories();
    } catch (err) {
      console.error('Lỗi khi lưu danh mục:', err);
      throw err;
    }
  };

  return (
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý danh mục</h1>
          <button
              onClick={handleCreateCategory}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus size={16} className="mr-2"/>
            Thêm danh mục
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center">
          <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Tên danh mục</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Mô tả</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Hành động</th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {loading ? (
                <tr>
                  <td colSpan={3} className="text-center px-6 py-4 text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
            ) : error ? (
                <tr>
                  <td colSpan={3} className="text-center px-6 py-4 text-red-500">
                    {error}
                  </td>
                </tr>
            ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center px-6 py-4 text-gray-500">
                    Không có danh mục nào.
                  </td>
                </tr>
            ) : (
                categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{category.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {category.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                              onClick={() => handleUpdateCategory(category)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title="Chỉnh sửa"
                          >
                            <Edit size={16}/>
                          </button>
                          <button
                              onClick={() => category.id && handleDeleteCategory(category.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                              disabled={!category.id}
                              title="Xóa"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </div>
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
                Hiển thị <span className="font-medium">{categories.length > 0 ? page * size + 1 : 0}</span> đến{' '}
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
                <ChevronLeft size={16}/>
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
                <ChevronRight size={16}/>
              </button>
            </div>
          </div>
        </div>
        <CategoryFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
            category={selectedCategory}
        />
      </div>
  );
}