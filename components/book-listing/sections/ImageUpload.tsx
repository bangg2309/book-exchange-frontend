'use client';

import React, { useRef, useState } from 'react';
import { Camera, X, AlertCircle, Loader2 } from 'lucide-react';
import { toastService } from '@/services/toastService';
import cloudinaryService, { 
  MAX_FILE_SIZE, 
  ACCEPTED_IMAGE_TYPES,
  UploadResult 
} from '@/services/cloudinaryService';

interface ImageUploadProps {
  previewImages: string[];
  setPreviewImages: React.Dispatch<React.SetStateAction<string[]>>;
  images: (File | string | any)[];
  setImages: React.Dispatch<React.SetStateAction<(File | string | any)[]>>;
  error?: string;
}

// Constants
const MAX_IMAGES = 10;

const ImageUpload: React.FC<ImageUploadProps> = ({
  previewImages,
  setPreviewImages,
  images,
  setImages,
  error
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadError(null);
    
    if (images.length + files.length > MAX_IMAGES) {
      setUploadError(`Bạn chỉ có thể tải lên tối đa ${MAX_IMAGES} ảnh.`);
      setIsUploading(false);
      return;
    }
    
    const filesToUpload: File[] = [];
    
    Array.from(files).forEach(file => {
      const error = cloudinaryService.validateImage(file);
      if (error) {
        setUploadError(error);
        return;
      }
      
      filesToUpload.push(file);
    });

    try {
      filesToUpload.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setPreviewImages(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      });
      
      const uploadedImages = await cloudinaryService.uploadImages(filesToUpload);
      
      setImages(prev => {
        const newImages = [...prev, ...uploadedImages];
        return newImages;
      });
      
      if (uploadedImages.length > 0) {
        toastService.success(`Đã tải lên ${uploadedImages.length} ảnh`);
      } else if (uploadedImages.length < filesToUpload.length) {
        toastService.warning(`Một số ảnh không thể tải lên. Vui lòng thử lại.`);
      }
    } catch (error) {
      toastService.error('Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại sau.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageToRemove = images[index];
    
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
    
    if (typeof imageToRemove !== 'string' && !(imageToRemove instanceof File) && imageToRemove.publicId) {
      try {
        await cloudinaryService.deleteImage(imageToRemove.publicId);
      } catch (error) {
        // Không hiển thị lỗi cho người dùng vì UI đã được cập nhật
      }
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Hình ảnh sách</h2>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        multiple
        className="hidden"
        disabled={isUploading}
      />
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Image preview grid */}
        {previewImages.map((preview, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-300 group">
            <img
              src={preview}
              alt={`Ảnh sách ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200"></div>
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md transition-transform hover:scale-110"
              title="Xóa ảnh"
            >
              <X size={16} className="text-red-500" />
            </button>
            {index === 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs font-medium py-1 px-2 text-center">
                Ảnh chính
              </div>
            )}
          </div>
        ))}
        
        {/* Upload button - only show if under limit */}
        {images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={triggerImageUpload}
            disabled={isUploading}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-blue-500 transition-colors p-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
            ) : (
              <Camera className="mb-2 text-gray-400" size={36} />
            )}
            <span className="text-sm text-gray-500">
              {isUploading ? 'Đang tải lên...' : 'Thêm ảnh'}
            </span>
          </button>
        )}
      </div>
      
      {(error || uploadError) && (
        <div className="mt-2 flex items-start text-sm text-red-500">
          <AlertCircle size={16} className="mr-1 flex-shrink-0 mt-0.5" />
          <p>{error || uploadError}</p>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="font-medium text-blue-800 mb-2 text-sm">Hướng dẫn tải ảnh sách</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-700 rounded-full mr-2 text-xs font-bold flex-shrink-0">1</span>
            <p>Ảnh đầu tiên sẽ được sử dụng làm ảnh chính hiển thị trên trang kết quả tìm kiếm nếu không chọn ảnh bìa.</p>
          </div>
          <div className="flex items-start">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-700 rounded-full mr-2 text-xs font-bold flex-shrink-0">2</span>
            <p>Chụp ảnh với ánh sáng tốt và nền trắng/sáng để sách hiển thị rõ ràng nhất.</p>
          </div>
          <div className="flex items-start">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-700 rounded-full mr-2 text-xs font-bold flex-shrink-0">3</span>
            <p>Chụp đủ các mặt của sách: bìa trước, bìa sau, gáy sách và các trang quan trọng.</p>
          </div>
          <div className="flex items-start">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-700 rounded-full mr-2 text-xs font-bold flex-shrink-0">4</span>
            <p>Thể hiện rõ tình trạng của sách trong hình ảnh: các vết bẩn, rách, hoặc đánh dấu nếu có.</p>
          </div>
          <div className="flex items-start text-xs text-gray-500 mt-2">
            <p>Giới hạn: tối đa {MAX_IMAGES} ảnh, mỗi ảnh không quá 5MB. Định dạng hỗ trợ: JPG, PNG, WEBP.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload; 