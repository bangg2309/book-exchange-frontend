import Link from 'next/link';
import BookCard from './BookCard';

// Dữ liệu mẫu cho sách
const MOCK_BOOKS = [
  {
    id: '1',
    title: 'Lập trình Java Siêu việt pro',
    author: 'Nguyễn Văn A',
    price: 185000,
    originalPrice: 200000,
    condition: 'Mới',
    conditionPercent: 95,
    imageUrl: '/images/book-placeholder.jpg',
  },
  {
    id: '2',
    title: 'Kinh tế học đại cương',
    author: 'Trần Thị B',
    price: 120000,
    originalPrice: 150000,
    condition: 'Tốt',
    conditionPercent: 80,
    imageUrl: '/images/book-placeholder.jpg',
  },
  {
    id: '3',
    title: 'Giải tích 1',
    author: 'Lê Văn C',
    price: 150000,
    condition: 'Mới',
    conditionPercent: 90,
    imageUrl: '/images/book-placeholder.jpg',
  },
  {
    id: '4',
    title: 'Marketing căn bản',
    author: 'Phạm Thị D',
    price: 90000,
    originalPrice: 120000,
    condition: 'Cũ',
    conditionPercent: 70,
    imageUrl: '/images/book-placeholder.jpg',
  },
];

const NewBookSection = () => {
  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-green-700 relative pb-2">
            Sách mới đăng gần đây
            <span className="absolute bottom-0 left-0 w-20 h-1 bg-green-700"></span>
          </h2>
          <Link href="/books" className="text-green-700 hover:text-green-800 font-medium text-sm flex items-center">
            Xem thêm
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {MOCK_BOOKS.map((book) => (
            <BookCard key={book.id} {...book} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewBookSection;