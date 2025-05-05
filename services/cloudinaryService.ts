'use client';

import { toastService } from './toastService';

// Max file size in bytes (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Accepted image types
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

// Log cloudinary configuration on initialization
console.log('Cloudinary Configuration:', {
  CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  secureUrl: string;
}

export const cloudinaryService = {
  /**
   * Validates an image file for size and type constraints
   */
  validateImage: (file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return 'Chỉ chấp nhận các định dạng ảnh: JPG, PNG, WEBP';
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return 'Kích thước ảnh không được vượt quá 5MB';
    }

    return null;
  },
  
  /**
   * Uploads a single image file to Cloudinary
   */
  uploadImage: async (file: File, folder = 'book-exchange/books'): Promise<UploadResult | null> => {
    try {
      const validationError = cloudinaryService.validateImage(file);
      if (validationError) {
        toastService.error(validationError);
        return null;
      }
      
      const uniqueId = `book_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'book_exchange';
      
      if (!cloudName) {
        toastService.error('Cấu hình Cloudinary không hợp lệ. Vui lòng liên hệ quản trị viên.');
        return null;
      }
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', folder);
      formData.append('public_id', uniqueId);
      
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloudinary API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.secure_url) {
        throw new Error('Invalid response from Cloudinary: Missing secure_url');
      }
      
      return {
        url: data.url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format,
        secureUrl: data.secure_url
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      toastService.error('Tải ảnh lên thất bại. Vui lòng thử lại sau.');
      return null;
    }
  },
  
  /**
   * Uploads multiple images to Cloudinary
   */
  uploadImages: async (files: File[], folder = 'book-exchange/books'): Promise<UploadResult[]> => {
    if (!files.length) return [];
    
    try {
      const results: UploadResult[] = [];
      
      for (const file of files) {
        const result = await cloudinaryService.uploadImage(file, folder);
        if (result) results.push(result);
      }
      
      return results;
    } catch (error) {
      console.error('Error in batch upload:', error);
      toastService.error('Có lỗi xảy ra khi tải lên hình ảnh');
      return [];
    }
  },
  
  /**
   * Deletes an image from Cloudinary
   */
  deleteImage: async (publicId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete image');
      }
      
      return true;
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      toastService.error('Xóa ảnh thất bại. Vui lòng thử lại sau.');
      return false;
    }
  },
  
  /**
   * Generates a Cloudinary URL with transformations
   */
  getImageUrl: (publicId: string, options = {}): string => {
    const defaultOptions = {
      width: 500,
      crop: 'fill',
      quality: 'auto',
      fetchFormat: 'auto'
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    const transformations = Object.entries(mergedOptions)
      .map(([key, value]) => `${key}_${value}`)
      .join(',');
    
    return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
  },
  
  /**
   * Extracts the public ID from a Cloudinary URL
   */
  extractPublicIdFromUrl: (url: string): string | null => {
    if (!url) return null;
    
    try {
      const urlWithoutProtocol = url.replace(/^https?:\/\/res.cloudinary.com\/[^\/]+\//, '');
      const withoutImageUpload = urlWithoutProtocol.replace(/^image\/upload\//, '');
      const withoutVersion = withoutImageUpload.replace(/^v\d+\//, '');
      
      return withoutVersion;
    } catch (error) {
      console.error('Error extracting public ID from URL:', error, url);
      return null;
    }
  }
};

export default cloudinaryService; 