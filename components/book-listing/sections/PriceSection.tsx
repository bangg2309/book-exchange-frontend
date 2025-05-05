import React from 'react';

interface PriceSectionProps {
  priceNew: string;
  price: string;
  address: string;
  conditionNumber: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: Record<string, string>;
  calculateDiscountPercentage: () => number;
  getConditionLabel: () => string;
  getRecommendedPriceRange: () => string;
}

const PriceSection: React.FC<PriceSectionProps> = ({
  priceNew,
  price,
  address,
  conditionNumber,
  onInputChange,
  errors,
  calculateDiscountPercentage,
  getConditionLabel,
  getRecommendedPriceRange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Giá và địa chỉ</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá bìa (VNĐ) <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₫</span>
              </div>
              <input
                type="number"
                name="priceNew"
                min="0"
                value={priceNew}
                onChange={onInputChange}
                className={`block w-full pl-10 pr-12 py-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.priceNew ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Giá mua mới"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">VNĐ</span>
              </div>
            </div>
            {errors.priceNew && (
              <p className="mt-1 text-sm text-red-500">{errors.priceNew}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Giá bìa gốc của sách khi mua mới
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá bán (VNĐ) <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₫</span>
              </div>
              <input
                type="number"
                name="price"
                min="0"
                value={price}
                onChange={onInputChange}
                className={`block w-full pl-10 pr-12 py-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Giá bạn muốn bán"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">VNĐ</span>
              </div>
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-500">{errors.price}</p>
            )}
            {price && priceNew && (
              <p className="mt-1 text-sm font-medium text-green-600">
                Giảm {calculateDiscountPercentage()}% so với giá gốc
              </p>
            )}
            {conditionNumber && (
              <p className="mt-1 text-xs text-gray-500">
                Với tình trạng {getConditionLabel()}, giá bán đề xuất là {getRecommendedPriceRange()} giá gốc
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Địa chỉ giao dịch <span className="text-red-500">*</span>
          </label>
          <textarea
            name="address"
            value={address}
            onChange={onInputChange}
            rows={2}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Địa chỉ đầy đủ để người mua có thể đến giao dịch trực tiếp"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-500">{errors.address}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Nhập địa chỉ chi tiết để người mua dễ dàng tìm kiếm và giao dịch
          </p>
        </div>
      </div>
    </div>
  );
};

export default PriceSection; 