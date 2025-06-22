'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaLaptopCode, FaChartLine, FaCogs, FaSquareRootAlt } from 'react-icons/fa';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  categoryId: number;
}

const categories: Category[] = [
  {
    id: '1',
    name: 'Công nghệ thông tin',
    description: 'Sách về lập trình, mạng máy tính, cơ sở dữ liệu và trí tuệ nhân tạo',
    icon: <FaLaptopCode className="w-12 h-12 text-blue-600" />,
    categoryId: 1
  },
  {
    id: '2',
    name: 'Kinh tế',
    description: 'Sách về quản trị kinh doanh, tài chính, marketing và kinh tế học',
    icon: <FaChartLine className="w-12 h-12 text-green-600" />,
    categoryId: 2
  },
  {
    id: '3',
    name: 'Kỹ thuật',
    description: 'Sách về kỹ thuật điện, điện tử, cơ khí và tự động hóa',
    icon: <FaCogs className="w-12 h-12 text-yellow-600" />,
    categoryId: 4
  },
  {
    id: '4',
    name: 'Toán học',
    description: 'Sách về đại số, giải tích, hình học và thống kê',
    icon: <FaSquareRootAlt className="w-12 h-12 text-purple-600" />,
    categoryId: 5
  }
];

const CategorySection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Danh mục phổ biến</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Khám phá sách giáo trình theo các danh mục phổ biến nhất tại trường đại học
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/books?categoryId=${category.categoryId}`}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              <div className="p-6 flex flex-col items-center text-center">
                <div className="mb-5 transform group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
                <div className="mt-4 inline-flex items-center text-green-600 font-medium">
                  Xem sách
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;