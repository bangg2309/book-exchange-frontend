'use client';

import { useState, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

interface Category {
  id: number;
  name: string;
}

interface School {
  id: number;
  name: string;
}

interface BookFiltersProps {
  filters: {
    categoryId: string;
    minPrice: string;
    maxPrice: string;
    condition: string;
    schoolId: string;
  };
  onFilterChange: (filters: any) => void;
}

const BookFilters: React.FC<BookFiltersProps> = ({ filters, onFilterChange }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  // Điều kiện sách
  const conditions = [
    { value: '1', label: 'Kém' },
    { value: '2', label: 'Trung bình' },
    { value: '3', label: 'Khá' },
    { value: '4', label: 'Tốt' },
    { value: '5', label: 'Mới' },
  ];

  useEffect(() => {
    // Fetch categories and schools
    const fetchFiltersData = async () => {
      setLoading(true);
      try {
        const [categoriesRes, schoolsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081'}/categories`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081'}/schools`)
        ]);

        const categoriesData = await categoriesRes.json();
        const schoolsData = await schoolsRes.json();

        if (categoriesData.code === 1000 && categoriesData.result) {
          setCategories(categoriesData.result);
        }

        if (schoolsData.code === 1000 && schoolsData.result) {
          setSchools(schoolsData.result);
        }
      } catch (error) {
        console.error('Error fetching filter data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiltersData();
  }, []);

  const handleFilterChange = (name: string, value: string) => {
    const newFilters = { ...filters, [name]: value };
    onFilterChange(newFilters);
  };

  const handlePriceChange = (min: string, max: string) => {
    const newFilters = { ...filters, minPrice: min, maxPrice: max };
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    onFilterChange({
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      schoolId: ''
    });
  };

  // Predefined price ranges
  const priceRanges = [
    { label: 'Dưới 50.000đ', min: '0', max: '50000' },
    { label: '50.000đ - 100.000đ', min: '50000', max: '100000' },
    { label: '100.000đ - 200.000đ', min: '100000', max: '200000' },
    { label: '200.000đ - 300.000đ', min: '200000', max: '300000' },
    { label: 'Trên 300.000đ', min: '300000', max: '' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {/* Loại sách */}
        <div className="w-full sm:w-auto flex-grow min-w-[160px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Loại sách</label>
          <div className="relative">
            <select
              value={filters.categoryId}
              onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 rounded-md bg-white"
            >
              <option value="">Tất cả loại sách</option>
              {loading ? (
                <option disabled>Đang tải...</option>
              ) : (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <FaChevronDown className="h-3 w-3" />
            </div>
          </div>
        </div>

        {/* Giá */}
        <div className="w-full sm:w-auto flex-grow min-w-[160px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng giá</label>
          <div className="relative">
            <select
              value={`${filters.minPrice}-${filters.maxPrice}`}
              onChange={(e) => {
                const [min, max] = e.target.value.split('-');
                handlePriceChange(min, max);
              }}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 rounded-md bg-white"
            >
              <option value="-">Tất cả mức giá</option>
              {priceRanges.map((range, index) => (
                <option key={index} value={`${range.min}-${range.max}`}>
                  {range.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <FaChevronDown className="h-3 w-3" />
            </div>
          </div>
        </div>

        {/* Tình trạng */}
        <div className="w-full sm:w-auto flex-grow min-w-[160px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng sách</label>
          <div className="relative">
            <select
              value={filters.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 rounded-md bg-white"
            >
              <option value="">Tất cả tình trạng</option>
              {conditions.map((condition) => (
                <option key={condition.value} value={condition.value}>
                  {condition.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <FaChevronDown className="h-3 w-3" />
            </div>
          </div>
        </div>

        {/* Trường */}
        <div className="w-full sm:w-auto flex-grow min-w-[160px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Trường học</label>
          <div className="relative">
            <select
              value={filters.schoolId}
              onChange={(e) => handleFilterChange('schoolId', e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 rounded-md bg-white"
            >
              <option value="">Tất cả trường</option>
              {loading ? (
                <option disabled>Đang tải...</option>
              ) : (
                schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <FaChevronDown className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Nút reset */}
      <div className="flex justify-end mt-2">
        <button
          onClick={resetFilters}
          className="px-3 py-1.5 text-xs text-red-600 hover:text-red-800 underline flex items-center"
        >
          Xóa bộ lọc
        </button>
      </div>
    </div>
  );
};

export default BookFilters; 