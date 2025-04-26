import Link from 'next/link';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

const categories: Category[] = [
  {
    id: '1',
    name: 'Công nghệ thông tin',
    icon: '/images/categories/it.svg',
    slug: 'cong-nghe-thong-tin'
  },
  {
    id: '2',
    name: 'Kinh tế - Quản trị',
    icon: '/images/categories/business.svg',
    slug: 'kinh-te-quan-tri'
  },
  {
    id: '3',
    name: 'Ngoại ngữ',
    icon: '/images/categories/language.svg',
    slug: 'ngoai-ngu'
  },
  {
    id: '4',
    name: 'Y - Dược',
    icon: '/images/categories/medicine.svg',
    slug: 'y-duoc'
  }
];

const CategorySection = () => {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-green-700 relative pb-2 mb-8">
          Danh mục phổ biến
          <span className="absolute bottom-0 left-0 w-20 h-1 bg-green-700"></span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/category/${category.slug}`}
              className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all bg-white"
            >
              <div className="w-16 h-16 mb-4 relative">
                <Image 
                  src={category.icon || '/images/book-icon.svg'} 
                  alt={category.name}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-lg font-medium text-center text-gray-800">{category.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;