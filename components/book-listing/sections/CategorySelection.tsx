'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import categoryService, { CategoryType } from '@/services/categoryService';

interface CategorySelectionProps {
  selectedCategories: any[];
  onChange: (categories: any[]) => void;
  error?: string;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({
  selectedCategories,
  onChange,
  error
}) => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<CategoryType[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await categoryService.getCategories();
        const enhancedData = categoryService.enhanceCategoriesWithIcons(data);
        setCategories(enhancedData);
        setFilteredCategories(enhancedData);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (!categories.length) return;
    
    if (searchTerm.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase().trim();
      const filtered = categories.filter(category => 
        category.name.toLowerCase().includes(lowercasedTerm)
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleCategory = (categoryId: number) => {
    const categoryObject = categories.find(cat => cat.id === categoryId);
    
    if (!categoryObject) {
      console.error(`Category with ID ${categoryId} not found`);
      return;
    }
    
    const isSelected = selectedCategories.some(cat => 
      (typeof cat === 'object' && cat.id === categoryId) || cat === categoryId
    );
    
    if (isSelected) {
      onChange(selectedCategories.filter(cat => 
        (typeof cat === 'object' && cat.id !== categoryId) || cat !== categoryId
      ));
    } else {
      if (selectedCategories.length < 3) {
        onChange([...selectedCategories, categoryObject]);
      }
    }
  };

  const removeCategory = (categoryId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedCategories.filter(cat => 
      (typeof cat === 'object' && cat.id !== categoryId) || cat !== categoryId
    ));
  };

  const getSelectedCategoryNames = () => {
    return selectedCategories
      .map(cat => {
        if (typeof cat === 'object' && cat.name) {
          return cat.name;
        }
        const foundCat = categories.find(c => c.id === cat);
        return foundCat ? foundCat.name : '';
      })
      .filter(Boolean);
  };

  if (loading) {
    return <div className="py-4 text-center">Đang tải danh mục...</div>;
  }

  const selectedCategoryObjects = selectedCategories.map(cat => {
    if (typeof cat === 'object') return cat;
    return categories.find(c => c.id === cat) || { id: cat, name: `Category ${cat}` };
  });

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Thể loại <span className="text-red-500">*</span>
      </label>
      
      {/* Selected categories display */}
      {selectedCategoryObjects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedCategoryObjects.map(category => (
            <div 
              key={category.id} 
              className="flex items-center bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium shadow-sm"
            >
              {category.icon && (
                <span className="mr-2">{category.icon}</span>
              )}
              {category.name}
              <button 
                onClick={(e) => removeCategory(category.id, e)}
                className="ml-2 text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-full hover:bg-blue-200"
                title="Xóa thể loại"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Dropdown select */}
      <div className="relative" ref={dropdownRef}>
        <div 
          className={`w-full px-4 py-3 border rounded-lg flex items-center justify-between cursor-pointer ${
            error ? 'border-red-500' : 'border-gray-300 hover:border-blue-500'
          } transition-colors`}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span className={selectedCategories.length === 0 ? 'text-gray-500' : 'text-gray-900'}>
            {selectedCategories.length === 0 
              ? 'Chọn thể loại sách' 
              : `Đã chọn ${selectedCategories.length} thể loại`}
          </span>
          <ChevronDown size={20} className={`text-gray-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
        </div>
        
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
            <div className="p-3 border-b sticky top-0 bg-white z-20">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-9 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tìm kiếm thể loại..."
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
            
            <div className="max-h-72 overflow-y-auto p-2">
              {filteredCategories.length === 0 ? (
                <div className="px-4 py-3 text-gray-500 text-center">Không tìm thấy thể loại phù hợp</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {filteredCategories.map(category => (
                    <div
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`
                        px-4 py-3 flex items-center cursor-pointer hover:bg-gray-100 rounded-lg transition-colors
                        ${selectedCategories.some(cat => 
                          (typeof cat === 'object' && cat.id === category.id) || cat === category.id
                        ) ? 'bg-blue-50 border border-blue-200' : ''}
                      `}
                    >
                      <div className="mr-3 flex-shrink-0">
                        {category.icon && (
                          <div className="w-6 h-6 text-blue-600 flex items-center justify-center">{category.icon}</div>
                        )}
                      </div>
                      <span className="flex-1 font-medium text-gray-700">{category.name}</span>
                      {selectedCategories.some(cat => 
                        (typeof cat === 'object' && cat.id === category.id) || cat === category.id
                      ) && (
                        <Check size={18} className="text-blue-600 ml-2 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      
      {/* Hiển thị thông báo khi không có danh mục nào */}
      {categories.length === 0 && !loading && (
        <div className="text-center py-4 text-gray-500">
          Không tìm thấy danh mục nào. Vui lòng thử lại sau.
        </div>
      )}

      {/* Hiển thị thông báo giới hạn khi đã chọn 3 danh mục */}
      {selectedCategories.length >= 3 && (
        <p className="text-sm text-amber-600 mt-1 flex items-center">
          <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-100 text-amber-700 rounded-full mr-2 text-xs font-bold">!</span>
          <span>Bạn chỉ có thể chọn tối đa 3 thể loại sách.</span>
        </p>
      )}
    </div>
  );
};

export default CategorySelection; 