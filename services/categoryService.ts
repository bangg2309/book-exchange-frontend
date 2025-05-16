import axios from 'axios';
import api from './api';
import {ApiResponse} from "@/types/apiResponse";
import {Category, CategoryPage} from "@/types/category";
// Define the shape of a category returned from the API
export interface CategoryType {
  id: number;
  name: string;
  slug?: string;
  icon?: string;
}

// Xử lý lỗi từ API
const handleApiError = (error: any, defaultMessage: string, context: string = ''): never => {
  if (error.response?.data) {
    const msg = error.response.data.message || defaultMessage;
    console.error(`Backend error ${context}:`, msg, 'Code:', error.response.data.code);
    throw new Error(msg);
  }
  console.error(`Error ${context}:`, error);
  throw error;
};

// Xử lý phản hồi API
const processApiResponse = <T>(response: ApiResponse<T> | undefined, errorMessage: string): T => {
  if (!response || !response.result) {
    throw new Error(errorMessage);
  }
  return response.result;
};
// Mapping of category names to corresponding icons (can be emoji or icon class)
const categoryIcons: Record<string, string> = {
  'Sách giáo khoa': '📚',
  'Sách đại học': '🎓',
  'Sách ngoại ngữ': '🌍',
  'Sách tham khảo': '📖',
  'Sách kinh tế': '📊',
  'Sách văn học': '📝',
  'Sách thiếu nhi': '🧸',
  'Sách kỹ năng sống': '🌱',
  'Sách nghệ thuật': '🎭',
  'Truyện tranh': '🗯️',
  'Báo - Tạp chí': '📰',
  'Khác': '📦'
};

// Mock data cho các danh mục khi API không hoạt động
const mockCategories: CategoryType[] = [
  { id: 1, name: 'Sách giáo khoa' },
  { id: 2, name: 'Sách đại học' },
  { id: 3, name: 'Sách ngoại ngữ' },
  { id: 4, name: 'Sách tham khảo' },
  { id: 5, name: 'Sách kinh tế' },
  { id: 6, name: 'Sách văn học' },
  { id: 7, name: 'Sách thiếu nhi' },
  { id: 8, name: 'Sách kỹ năng sống' },
  { id: 9, name: 'Sách nghệ thuật' },
  { id: 10, name: 'Truyện tranh' },
  { id: 11, name: 'Báo - Tạp chí' },
  { id: 12, name: 'Khác' }
];

// Flag để quyết định có sử dụng mock data không
const USE_MOCK_DATA = false;

/**
 * Service for handling category-related operations
 */
export const categoryService = {
  /**
   * Fetches all categories from the API
   * @returns {Promise<CategoryType[]>} Promise that resolves to an array of categories
   */
  getCategories: async (): Promise<CategoryType[]> => {
    if (USE_MOCK_DATA) {
      return mockCategories;
    }

    try {
      const response = await axios.get('http://localhost:8081/categories');

      if (response.data.result) {
        return response.data.result || [];
      } else if (response.data.data) {
        return response.data.data || [];
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.code === 1000 && response.data.result) {
        return response.data.result;
      }

      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  /**
   * Enhances categories with icons based on their names
   * @param {CategoryType[]} categories - The categories to enhance
   * @returns {CategoryType[]} Categories with icons added
   */
  enhanceCategoriesWithIcons: (categories: CategoryType[]): CategoryType[] => {
    return categories.map(category => ({
      ...category,
      icon: categoryIcons[category.name] || '📘' // Default icon if no mapping found
    }));
  },

  // Get a category by ID
  getCategoryById: async (id: number): Promise<CategoryType | null> => {
    if (USE_MOCK_DATA) {
      const category = mockCategories.find(c => c.id === id);
      return category || null;
    }

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`);
      return response.data.data || null;
    } catch (error) {
      console.error(`Error fetching category ID ${id}:`, error);
      return null;
    }
  },

  // Get categories by IDs
  getCategoriesByIds: async (ids: number[]): Promise<CategoryType[]> => {
    if (!ids.length) return [];

    if (USE_MOCK_DATA) {
      return mockCategories.filter(category => ids.includes(category.id));
    }

    try {
      const categories = await categoryService.getCategories();
      return categories.filter(category => ids.includes(category.id));
    } catch (error) {
      console.error('Error fetching categories by IDs:', error);
      return [];
    }
  },

  getCategoriesOfPage: async (page: number = 0, size: number = 5): Promise<CategoryPage> => {
    try {
      const { data } = await api.get<ApiResponse<CategoryPage>>(`/categories/all?page=${page}&size=${size}`);
      return processApiResponse(data, 'Invalid categories response from server');
    } catch (error: any) {
      return handleApiError(error, 'An error occurred while fetching categories', 'fetching categories');
    }
  },

  createCategory: async (categoryData: Partial<Category>): Promise<Category> => {
    try {
      // Đảm bảo dữ liệu gửi đi đúng định dạng mà API yêu cầu
      const formattedData: any = {
        name: categoryData.name || null,
        icon: categoryData.icon || ""
      };

      console.log(`[createCategory] Calling POST to /categories with data:`, formattedData);

      // Gọi API POST để tạo thể loại mới
      const { data } = await api.post<ApiResponse<Category>>(`/categories`, formattedData);

      console.log(`[createCategory] Response:`, data);

      // Xử lý phản hồi từ API
      return processApiResponse(data, `Invalid response when creating category`);
    } catch (error: any) {
      console.error(`[createCategory] Error:`, error.response?.data || error.message);
      return handleApiError(error, `An error occurred while creating category`, `creating category`);
    }
  },

  updateCategory: async (id: string, categoryData: Partial<Category>): Promise<Category> => {
    try {
      // Đảm bảo dữ liệu gửi đi đúng định dạng mà API yêu cầu
      const formattedData: any = {
        name: categoryData.name || null,
        description: categoryData.description || ""
      };

      console.log(`[updateCategory] Calling PUT to /categories/${id} with data:`, formattedData);

      // Gọi API PUT để cập nhật thể loại
      const { data } = await api.put<ApiResponse<Category>>(`/categories/${id}`, formattedData);

      console.log(`[updateCategory] Response:`, data);

      // Xử lý phản hồi từ API
      return processApiResponse(data, `Invalid response when updating category ${id}`);
    } catch (error: any) {
      console.error(`[updateCategory] Error:`, error.response?.data || error.message);
      return handleApiError(error, `An error occurred while updating category ${id}`, `updating category ${id}`);
    }
  },

  deleteCategory: async (id: String): Promise<void> => {
    try {
      await api.delete(`/categories/${id}`);
    } catch (error) {
      return handleApiError(error, 'Lỗi khi xóa danh mục', 'deleteCategory');
    }
  },
};

export default categoryService; 