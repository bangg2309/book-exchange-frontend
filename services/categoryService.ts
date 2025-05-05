import axios from 'axios';
import api from './api';
// Define the shape of a category returned from the API
export interface CategoryType {
  id: number;
  name: string;
  slug?: string;
  icon?: string;
}

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
const categoryService = {
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
  }
};

export default categoryService; 