import Link from 'next/link';
import Image from 'next/image';

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  condition: string;
  conditionPercent: number;
  imageUrl: string;
}

const BookCard = ({
  id,
  title,
  author,
  price,
  originalPrice,
  condition,
  conditionPercent,
  imageUrl,
}: BookCardProps) => {
  const discountPercent = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/books/${id}`}>
        <div className="relative h-48 w-full bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <span>Hình ảnh sách</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/books/${id}`}>
          <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-green-700 min-h-[48px]">
            {title}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm mt-1">{author}</p>
        
        <div className="mt-2 text-sm">
          <span className="font-semibold text-gray-800">{`Tình trạng: ${condition}`}</span>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${conditionPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-4 flex items-baseline">
          <span className="text-lg font-bold text-green-700">{price.toLocaleString('vi-VN')}đ</span>
          {originalPrice && (
            <span className="text-sm text-gray-500 line-through ml-2">
              {originalPrice.toLocaleString('vi-VN')}đ
            </span>
          )}
          {discountPercent > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
              -{discountPercent}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;