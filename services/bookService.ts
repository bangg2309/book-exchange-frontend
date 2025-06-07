"use client";

import api, { API_BASE_URL } from './api';
import { authService } from './authService';
import { toastService } from './toastService';
import { cloudinaryService, UploadResult } from './cloudinaryService';
import type { BookData, BookResponse } from '@/types';
import { apiService } from './api';
import { ApiResponse } from '../types/apiResponse';

// API routes for books
const API_ROUTES = {
  BOOKS: '/books',
  BOOK_BY_ID: (id: string) => `/books/${id}`,
  BOOK_SEARCH: '/books/search',
  LISTED_BOOKS: '/listed-books',
  LISTED_BOOK_BY_ID: (id: string) => `/listed-books/${id}`,
  LATEST_BOOKS: '/listed-books/latest',
};

export interface Book {
  id: number;
  title: string;
  priceNew: number | null;
  price: number;
  conditionNumber: number;
  fullName: string | null;
  schoolName: string;
  author: string | null;
  publisher: string | null;
  description: string;
  thumbnail: string;
}

// Định nghĩa interface cho các tham số lọc
export interface BookFilterParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  title?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  condition?: string;
  schoolId?: string;
}

export const bookService = {
  // Create a new book listing
  createBookListing: async (bookData: BookData, imageFiles?: File[], thumbnailFile?: File): Promise<BookResponse> => {
    try {
      console.log('===== DEBUG: BOOK LISTING CREATION =====');
      console.log('Original bookData:', bookData);
      console.log('Image files:', imageFiles ? `${imageFiles.length} files` : 'none');
      console.log('Thumbnail file:', thumbnailFile ? 'provided' : 'none');
      
      // Create a DEEP copy of the bookData to avoid modifying the original
      const finalBookData: any = JSON.parse(JSON.stringify({...bookData}));
      
      // Ensure we have valid arrays for lists
      if (!Array.isArray(finalBookData.imagesUrl)) {
        console.log('imagesUrl was not an array, initializing empty array');
        finalBookData.imagesUrl = [];
      }
      
      console.log('Initial imagesUrl from form:', finalBookData.imagesUrl);
      
      // Handle thumbnail upload first if provided
      if (thumbnailFile) {
        console.log('Uploading thumbnail to Cloudinary...');
        
        try {
          const uploadedThumbnail = await cloudinaryService.uploadImage(thumbnailFile);
          console.log('Thumbnail upload completed with result:', uploadedThumbnail);
          
          if (uploadedThumbnail && uploadedThumbnail.secureUrl) {
            finalBookData.thumbnail = uploadedThumbnail.secureUrl;
            console.log('Set thumbnail to:', finalBookData.thumbnail);
          } else {
            console.warn('WARNING: Thumbnail upload failed');
          }
        } catch (error) {
          console.error('Error uploading thumbnail:', error);
          toastService.error('Tải ảnh bìa thất bại');
        }
      }
      
      // Handle image upload AFTER thumbnail
      if (imageFiles && imageFiles.length > 0) {
        console.log(`Uploading ${imageFiles.length} images to Cloudinary...`);
        
        try {
          // Wait for image upload to complete
          const uploadedImages = await cloudinaryService.uploadImages(imageFiles);
          console.log('Cloudinary upload completed with results:', uploadedImages);
          
          if (uploadedImages && uploadedImages.length > 0) {
            // Extract secure URLs from the upload results
            const newImageUrls = uploadedImages.map(img => img.secureUrl);
            console.log('New image URLs from upload:', newImageUrls);
            
            // Combine with existing URLs if any
            finalBookData.imagesUrl = [...finalBookData.imagesUrl, ...newImageUrls];
            console.log('Combined imagesUrl array:', finalBookData.imagesUrl);
            
            // Set thumbnail from first image if not already set by thumbnail upload
            if (!finalBookData.thumbnail && finalBookData.imagesUrl[0]) {
              finalBookData.thumbnail = finalBookData.imagesUrl[0];
              console.log('Set thumbnail to first uploaded image:', finalBookData.thumbnail);
            }
          } else {
            console.warn('WARNING: No images were successfully uploaded');
          }
        } catch (error) {
          console.error('Error uploading images:', error);
          toastService.error('Tải ảnh lên thất bại, tiếp tục đăng sách không có ảnh');
        }
      } else {
        console.log('No image files to upload, using existing imagesUrl if any');
      }
      
      // CRITICAL CHECKS
      if (!finalBookData.imagesUrl || !Array.isArray(finalBookData.imagesUrl)) {
        console.warn('WARNING: imagesUrl is not an array after processing, resetting to empty array');
        finalBookData.imagesUrl = [];
      }
      
      // Remove empty strings and nulls
      finalBookData.imagesUrl = finalBookData.imagesUrl.filter((url: any) => url && typeof url === 'string');
      
      if (finalBookData.imagesUrl.length === 0) {
        console.warn('WARNING: imagesUrl is an empty array');
      } else {
        console.log('SUCCESS: imagesUrl contains', finalBookData.imagesUrl.length, 'URLs:', finalBookData.imagesUrl);
      }
      
      // Format authors correctly - extract author names
      if (finalBookData.authors && Array.isArray(finalBookData.authors)) {
        finalBookData.authors = finalBookData.authors.map((author: any) => {
          if (typeof author === 'object' && author !== null) {
            // Prioritize name over id for authors
            return author.name || author.id || "";
          }
          return author || "";
        }).filter(Boolean);
        
        // Log the processed authors to check
        console.log('Processed authors:', finalBookData.authors);
      }
      
      // Check if selectedCategories exists in the original data
      // This handles the case where categories may be provided under a different property name
      let categoryData = finalBookData.categories;
      
      // Log category data for debugging
      console.log('Original category data:', categoryData);
      
      // Handle categories properly - convert to categoriesId array
      if (categoryData && Array.isArray(categoryData)) {
        const categoryIds = categoryData
          .filter((cat: any) => cat !== null && cat !== undefined)
          .map((cat: any) => {
            if (typeof cat === 'object' && cat !== null && cat.id) {
              return parseInt(cat.id, 10); // Convert to number if it's an object with id
            } else if (typeof cat === 'string' || typeof cat === 'number') {
              return parseInt(cat as string, 10); // Convert string/number to number
            }
            return null;
          })
          .filter(Boolean); // Remove any null/undefined values
        
        if (categoryIds.length > 0) {
          finalBookData.categoriesId = categoryIds;
          console.log('Processed category IDs:', categoryIds);
        } else {
          // If no categories were processed but they were provided, log a warning
          console.warn('No valid categories were processed from:', categoryData);
        }
        
        if ('categories' in finalBookData) {
          delete finalBookData.categories;
        }
      } else {
        console.warn('No categories data found in form submission');
      }
      
      // Convert school to schoolId if necessary
      if (finalBookData.school) {
        if (typeof finalBookData.school === 'object' && finalBookData.school !== null && finalBookData.school.id) {
          finalBookData.schoolId = parseInt(finalBookData.school.id, 10);
        } else {
          // If school is a string or number, use it directly
          finalBookData.schoolId = parseInt(finalBookData.school as string, 10) || finalBookData.school;
        }
        
        if ('school' in finalBookData) {
          delete finalBookData.school;
        }
      }
      
      // Convert string numbers to actual numbers
      if (finalBookData.conditionNumber) {
        finalBookData.conditionNumber = parseInt(finalBookData.conditionNumber as string, 10) || 0;
      }
      
      if (finalBookData.price) {
        finalBookData.price = parseInt(finalBookData.price as string, 10) || 0;
      }
      
      if (finalBookData.priceNew) {
        finalBookData.priceNew = parseInt(finalBookData.priceNew as string, 10) || 0;
      }
      
      if (finalBookData.pageCount) {
        finalBookData.pageCount = parseInt(finalBookData.pageCount as string, 10) || 0;
      }
      
      // Clean up categoriesId array - remove any remaining nulls
      if (finalBookData.categoriesId && Array.isArray(finalBookData.categoriesId)) {
        finalBookData.categoriesId = finalBookData.categoriesId.filter(Boolean);
      }
      
      // Final verification before sending
      console.log('Final imagesUrl value:', JSON.stringify(finalBookData.imagesUrl));
      
      // Get auth token
      const token = authService.getToken();
      if (!token) {
        toastService.error('Vui lòng đăng nhập để đăng sách');
        throw new Error('Authentication required');
      }
      
      // Create a clean object for submission
      const submissionData = {
        ...finalBookData
      };
      
      // Log the EXACT payload being sent
      console.log('FINAL PAYLOAD TO API:', JSON.stringify(submissionData, null, 2));
      
      // Send to backend
      const response = await api.post(API_ROUTES.LISTED_BOOKS, submissionData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API response status:', response.status);
      console.log('API response data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('===== ERROR CREATING BOOK LISTING =====');
      console.error('Error object:', error);
      
      // Check response for error details...
      if (error.response) {
        console.error('Server response status:', error.response.status);
        console.error('Server response headers:', error.response.headers);
        // Log the specific data structure to help debug backend issues
        if (error.response.data) {
          console.error('Server error details:', JSON.stringify(error.response.data, null, 2));
        }
      }
      
      toastService.error('Đăng sách thất bại. Vui lòng thử lại sau.');
      throw error;
    }
  },

  // Get book by ID
  getBookById: async (id: string): Promise<BookResponse> => {
    try {
      const response = await api.get(API_ROUTES.BOOK_BY_ID(id));
      return response.data;
    } catch (error) {
      console.error('Error getting book details:', error);
      toastService.error('Không thể tải thông tin sách. Vui lòng thử lại sau.');
      throw error;
    }
  },

  // Get listed book by ID
  getListedBookById: async (id: string | number): Promise<ApiResponse<any>> => {
    try {
      const response = await apiService.get<ApiResponse<any>>(API_ROUTES.LISTED_BOOK_BY_ID(String(id)));
      return response;
    } catch (error) {
      console.error('Error getting listed book details:', error);
      toastService.error('Không thể tải thông tin sách. Vui lòng thử lại sau.');
      throw error;
    }
  },

  // Get all books with pagination
  getBooks: async (page: number = 0, size: number = 10): Promise<BookResponse> => {
    try {
      const response = await api.get(API_ROUTES.BOOKS, { 
        params: { page, size } 
      });
      return response.data;
    } catch (error) {
      console.error('Error getting books:', error);
      toastService.error('Không thể tải danh sách sách. Vui lòng thử lại sau.');
      throw error;
    }
  },

  // Search books
  searchBooks: async (query: string, page: number = 0, size: number = 10): Promise<BookResponse> => {
    try {
      const response = await api.get(API_ROUTES.BOOK_SEARCH, { 
        params: { query, page, size } 
      });
      return response.data;
    } catch (error) {
      console.error('Error searching books:', error);
      toastService.error('Tìm kiếm thất bại. Vui lòng thử lại sau.');
      throw error;
    }
  },

  // Update book listing
  updateBookListing: async (id: string, bookData: Partial<BookData>, newImageFiles?: File[], thumbnailFile?: File): Promise<BookResponse> => {
    try {
      // Create a copy of the bookData to avoid modifying the original
      const dataToUpdate: any = { ...bookData };
      
      // Convert existing images to array of strings, if any
      let imageUrls: string[] = [];
      if (Array.isArray(bookData.images)) {
        imageUrls = bookData.images
          .filter(img => typeof img === 'string' || (img as any).secureUrl)
          .map(img => typeof img === 'string' ? img : (img as any).secureUrl);
      }
      
      // Handle thumbnail upload first if provided
      if (thumbnailFile) {
        try {
          console.log('Uploading new thumbnail...');
          const uploadedThumbnail = await cloudinaryService.uploadImage(thumbnailFile);
          
          if (uploadedThumbnail && uploadedThumbnail.secureUrl) {
            dataToUpdate.thumbnail = uploadedThumbnail.secureUrl;
            console.log('Set new thumbnail:', dataToUpdate.thumbnail);
          }
        } catch (error) {
          console.error('Error uploading new thumbnail:', error);
          toastService.error('Tải ảnh bìa thất bại');
        }
      }
      
      // Format authors correctly - extract only id or name
      if (dataToUpdate.authors && Array.isArray(dataToUpdate.authors)) {
        dataToUpdate.authors = dataToUpdate.authors.map((author: any) => {
          if (typeof author === 'object' && author !== null) {
            return author.id || author.name || "";
          }
          return author || "";
        }).filter(Boolean);
      }
      
      // Handle categories properly - filter out nulls and extract ids
      if (dataToUpdate.categories && Array.isArray(dataToUpdate.categories)) {
        const categoryIds = dataToUpdate.categories
          .filter((cat: any) => cat !== null && cat !== undefined)
          .map((cat: any) => {
            if (typeof cat === 'object' && cat !== null && cat.id) {
              return cat.id;
            }
            return cat || null;
          })
          .filter(Boolean);
        
        if (categoryIds.length > 0) {
          dataToUpdate.categoriesId = categoryIds;
        }
        
        if ('categories' in dataToUpdate) {
          delete dataToUpdate.categories;
        }
      }
      
      // Convert school to schoolId if necessary
      if (dataToUpdate.school) {
        if (typeof dataToUpdate.school === 'object' && dataToUpdate.school !== null && dataToUpdate.school.id) {
          dataToUpdate.schoolId = dataToUpdate.school.id;
        } else {
          // If school is a string or number, use it directly
          dataToUpdate.schoolId = parseInt(dataToUpdate.school as string, 10) || dataToUpdate.school;
        }
        
        if ('school' in dataToUpdate) {
          delete dataToUpdate.school;
        }
      }
      
      // Convert string numbers to actual numbers
      if (dataToUpdate.conditionNumber) {
        dataToUpdate.conditionNumber = parseInt(dataToUpdate.conditionNumber as string, 10) || 0;
      }
      
      if (dataToUpdate.price) {
        dataToUpdate.price = parseInt(dataToUpdate.price as string, 10) || 0;
      }
      
      if (dataToUpdate.priceNew) {
        dataToUpdate.priceNew = parseInt(dataToUpdate.priceNew as string, 10) || 0;
      }
      
      if (dataToUpdate.pageCount) {
        dataToUpdate.pageCount = parseInt(dataToUpdate.pageCount as string, 10) || 0;
      }
      
      // If we have new image files, upload them to Cloudinary
      if (newImageFiles && newImageFiles.length > 0) {
        const uploadedImages = await cloudinaryService.uploadImages(newImageFiles);
        if (uploadedImages.length > 0) {
          // Add new image URLs to existing ones
          imageUrls = [...imageUrls, ...uploadedImages.map(img => img.secureUrl)];
          
          // Update thumbnail if no existing thumbnail
          if (!dataToUpdate.thumbnail && uploadedImages[0]) {
            dataToUpdate.thumbnail = uploadedImages[0].secureUrl;
          }
        }
      }
      
      // Set the images array in the data to update using the correct field name
      dataToUpdate.imagesUrl = imageUrls;
      if ('images' in dataToUpdate) {
        delete dataToUpdate.images; // Remove the images field if it exists
      }
      
      // Clean up categoriesId array - remove any remaining nulls
      if (dataToUpdate.categoriesId && Array.isArray(dataToUpdate.categoriesId)) {
        dataToUpdate.categoriesId = dataToUpdate.categoriesId.filter(Boolean);
      }
      
      // Debug log request data
      console.log('Sending update data to API:', JSON.stringify(dataToUpdate, null, 2));
      
      // Get the auth token
      const token = authService.getToken();
      if (!token) {
        toastService.error('Vui lòng đăng nhập để cập nhật sách');
        throw new Error('Authentication required');
      }
      
      // Update the book listing
      const response = await api.put(API_ROUTES.LISTED_BOOK_BY_ID(id), dataToUpdate, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toastService.success('Cập nhật sách thành công!');
      return response.data;
    } catch (error: any) {
      console.error('Error updating book listing:', error);
      
      // Check if there's a response with error details
      if (error.response && error.response.data) {
        console.error('Server error details:', error.response.data);
        if (error.response.data.message) {
          toastService.error(`Lỗi: ${error.response.data.message}`);
        } else {
          toastService.error('Cập nhật sách thất bại. Vui lòng thử lại sau.');
        }
      } else {
        toastService.error('Cập nhật sách thất bại. Vui lòng thử lại sau.');
      }
      
      throw error;
    }
  },

  // Delete book listing
  deleteBookListing: async (id: string): Promise<boolean> => {
    try {
      // Get the auth token
      const token = authService.getToken();
      if (!token) {
        toastService.error('Vui lòng đăng nhập để xóa sách');
        throw new Error('Authentication required');
      }
      
      await api.delete(API_ROUTES.LISTED_BOOK_BY_ID(id), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toastService.success('Xóa sách thành công!');
      return true;
    } catch (error) {
      console.error('Error deleting book listing:', error);
      toastService.error('Xóa sách thất bại. Vui lòng thử lại sau.');
      return false;
    }
  },

  /**
   * Lấy danh sách sách theo các tham số lọc
   * @param filterParams Các tham số lọc, phân trang và sắp xếp
   * @returns Promise với kết quả từ API
   */
  getFilteredBooks: async (filterParams: BookFilterParams): Promise<ApiResponse<any>> => {
    try {
      // Tạo đối tượng URLSearchParams để xây dựng query string
      const params = new URLSearchParams();
      
      // Thêm các tham số không rỗng vào query
      if (filterParams.page !== undefined) params.append('page', filterParams.page.toString());
      if (filterParams.size !== undefined) params.append('size', filterParams.size.toString());
      if (filterParams.sortBy) params.append('sortBy', filterParams.sortBy);
      if (filterParams.sortDir) params.append('sortDir', filterParams.sortDir);
      if (filterParams.title) params.append('title', filterParams.title);
      if (filterParams.categoryId) params.append('categoryId', filterParams.categoryId);
      if (filterParams.minPrice) params.append('minPrice', filterParams.minPrice);
      if (filterParams.maxPrice) params.append('maxPrice', filterParams.maxPrice);
      if (filterParams.condition) params.append('condition', filterParams.condition);
      if (filterParams.schoolId) params.append('schoolId', filterParams.schoolId);
      
      // Gọi API với tham số đã xây dựng
      const response = await apiService.get<ApiResponse<any>>(`${API_ROUTES.LISTED_BOOKS}?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching filtered books:', error);
      toastService.error('Không thể tải danh sách sách. Vui lòng thử lại sau.');
      throw error;
    }
  },

  /**
   * Lấy danh sách sách mới nhất
   * @returns Promise với danh sách sách mới nhất
   */
  getLatestBooks: async (): Promise<Book[]> => {
    try {
      const response = await apiService.get<ApiResponse<Book[]>>(API_ROUTES.LATEST_BOOKS);
      return response.result;
    } catch (error) {
      console.error('Error fetching latest books:', error);
      return [];
    }
  },
}; 