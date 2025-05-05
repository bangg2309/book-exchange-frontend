'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { useRouter } from 'next/navigation';
import { bookService } from '@/services/bookService';
import { toastService } from '@/services/toastService';
import { BookData } from '@/types';
import useBookForm from '@/hooks/useBookForm';
import AuthorSection from './sections/AuthorSection';
import CategorySelection from './sections/CategorySelection';
import SchoolSelection from './sections/SchoolSelection';
import PriceSection from './sections/PriceSection';
import DescriptionEditor from './sections/DescriptionEditor';
import ImageUpload from './sections/ImageUpload';
import { cloudinaryService, ACCEPTED_IMAGE_TYPES } from '@/services/cloudinaryService';
import { X } from 'lucide-react';

// Constants for form elements
const CONDITION_OPTIONS = [
  { value: 5, label: 'Mới (100%)', description: 'Sách hoàn toàn mới, chưa qua sử dụng' },
  { value: 4, label: 'Gần như mới (90%)', description: 'Sách có dấu hiệu sử dụng nhẹ, không có vết viết hoặc đánh dấu' },
  { value: 3, label: 'Tốt (70-80%)', description: 'Sách có dấu hiệu sử dụng rõ ràng nhưng không ảnh hưởng đến nội dung' },
  { value: 2, label: 'Khá (50-60%)', description: 'Sách có dấu hiệu sử dụng nhiều, có thể có vết đánh dấu hoặc ghi chú nhẹ' },
  { value: 1, label: 'Cũ (dưới 50%)', description: 'Sách đã qua sử dụng nhiều, có thể có trang bị rách nhẹ hoặc vết ố' },
];

const LANGUAGE_OPTIONS = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'Tiếng Anh' },
  { value: 'fr', label: 'Tiếng Pháp' },
  { value: 'de', label: 'Tiếng Đức' },
  { value: 'zh', label: 'Tiếng Trung' },
  { value: 'ja', label: 'Tiếng Nhật' },
  { value: 'ko', label: 'Tiếng Hàn' },
  { value: 'other', label: 'Khác' },
];

const BookListingForm = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  const {
    formData,
    setFormData,
    images,
    setImages,
    previewImages,
    setPreviewImages,
    selectedCategories,
    setSelectedCategories,
    errors,
    setErrors,
    validateForm,
    isSubmitting,
    setIsSubmitting,
    conditionDescriptionChanged,
    setConditionDescriptionChanged,
    handleInputChange
  } = useBookForm();

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: formData.description,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none w-full min-h-[250px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => handleDescriptionChange(editor.getHTML()),
  });
  
  const conditionEditor = useEditor({
    extensions: [StarterKit, Underline],
    content: formData.conditionDescription,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none w-full min-h-[200px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => handleConditionDescriptionChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== formData.description) {
      editor.commands.setContent(formData.description);
    }
    if (conditionEditor && conditionEditor.getHTML() !== formData.conditionDescription) {
      conditionEditor.commands.setContent(formData.conditionDescription);
    }
  }, [formData.description, editor, formData.conditionDescription, conditionEditor]);

  const handleDescriptionChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      description: content,
    }));
    
    if (errors.description) {
      setErrors(prev => ({
        ...prev,
        description: '',
      }));
    }
  };

  const handleConditionDescriptionChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      conditionDescription: content,
    }));
    
    setConditionDescriptionChanged(true);
  };

  const triggerImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const triggerThumbnailUpload = () => {
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.click();
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    const error = cloudinaryService.validateImage(file);
    if (error) {
      toastService.error(error);
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setThumbnailPreview(result);
    };
    reader.readAsDataURL(file);
    
    try {
      const uploadedThumbnail = await cloudinaryService.uploadImage(file);
      
      if (uploadedThumbnail && uploadedThumbnail.secureUrl) {
        setFormData(prev => ({
          ...prev,
          thumbnail: uploadedThumbnail.secureUrl
        }));
        
        setThumbnailFile(null);
        toastService.success('Tải ảnh bìa lên thành công');
      } else {
        setThumbnailFile(file);
      }
    } catch (error) {
      toastService.error('Tải ảnh bìa thất bại, sẽ thử lại khi đăng sách');
      setThumbnailFile(file);
    }
  };

  const removeThumbnail = async () => {
    const thumbnailUrl = formData.thumbnail;
    const thumbnailPublicId = thumbnailUrl ? cloudinaryService.extractPublicIdFromUrl(thumbnailUrl) : null;

    setThumbnailFile(null);
    setThumbnailPreview(null);
    setFormData(prev => ({
      ...prev,
      thumbnail: ''
    }));

    if (thumbnailPublicId) {
      try {
        await cloudinaryService.deleteImage(thumbnailPublicId);
      } catch (error) {
        // Không hiển thị lỗi cho người dùng vì UI đã được cập nhật
      }
    }
  };

  const calculateDiscountPercentage = () => {
    if (!formData.priceNew || !formData.price) return 0;
    return Math.round((1 - Number(formData.price) / Number(formData.priceNew)) * 100);
  };

  const getConditionLabel = () => {
    const condition = CONDITION_OPTIONS.find(option => option.value.toString() === formData.conditionNumber);
    return condition ? condition.label : '';
  };

  const getRecommendedPriceRange = () => {
    const condition = CONDITION_OPTIONS.find(option => option.value.toString() === formData.conditionNumber);
    if (!condition) return '';
    
    const minPercentage = condition.value * 20 - 10;
    const maxPercentage = condition.value * 20;
    
    return `${minPercentage}% - ${maxPercentage}%`;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSubmitError(null);

    try {
      const newErrors: Record<string, string> = {};

      if (!formData.title.trim()) {
        newErrors.title = 'Tiêu đề là bắt buộc';
      }

      if (!formData.authors || formData.authors.length === 0) {
        newErrors.authors = 'Vui lòng thêm ít nhất một tác giả';
      }

      if (!selectedCategories || selectedCategories.length === 0) {
        newErrors.categories = 'Vui lòng chọn ít nhất một thể loại';
      }

      if (!formData.description.trim()) {
        newErrors.description = 'Mô tả là bắt buộc';
      }

      if (!formData.price) {
        newErrors.price = 'Giá bán là bắt buộc';
      } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
        newErrors.price = 'Giá bán phải là số dương';
      }
 
      if (!formData.priceNew) {
        newErrors.priceNew = 'Giá bìa là bắt buộc';
      } else if (isNaN(Number(formData.priceNew)) || Number(formData.priceNew) < 0) {
        newErrors.priceNew = 'Giá bìa phải là số dương';
      }

      if (!formData.address.trim()) {
        newErrors.address = 'Địa chỉ là bắt buộc';
      }
 
      if (!thumbnailPreview && !formData.thumbnail) {
        newErrors.thumbnail = 'Ảnh bìa là bắt buộc';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsSubmitting(false);
        const firstErrorField = Object.keys(newErrors)[0];
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      const bookData: BookData = {
        ...formData,
        authors: formData.authors.map((author: any) => ({ 
          id: author.id, 
          name: author.name 
        })),
        categoriesId: selectedCategories.map((category: any) => {
          if (typeof category === 'object' && category !== null && category.id) {
            return Number(category.id);
          }
          return Number(category);
        }).filter(Boolean),
      };
      
      if ('categories' in bookData) {
        // @ts-ignore
        delete bookData.categories;
      }
      
      const imageFiles = images.filter(img => img instanceof File) as File[];
      const cloudinaryUrls: string[] = [];
      
      images.forEach(img => {
        if (typeof img === 'string') {
          cloudinaryUrls.push(img);
        } else if (img && typeof img === 'object' && !(img instanceof File)) {
          const imgObj = img as any;
          
          if ('secureUrl' in imgObj) {
            cloudinaryUrls.push(imgObj.secureUrl);
          } else if ('url' in imgObj) {
            cloudinaryUrls.push(imgObj.url);
          }
        }
      });
      
      bookData.imagesUrl = cloudinaryUrls;
      
      if (formData.thumbnail && !thumbnailFile) {
        await bookService.createBookListing(bookData, imageFiles);
      } else {
        await bookService.createBookListing(bookData, imageFiles, thumbnailFile || undefined);
      }

      toastService.success('Đăng sách thành công!');
      router.push('/');
    } catch (error) {
      setSubmitError('Có lỗi xảy ra khi đăng sách. Vui lòng thử lại sau.');
      toastService.error('Có lỗi xảy ra khi đăng sách. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Thông tin cơ bản</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên sách <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập tên sách"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhà xuất bản
                </label>
                <input
                  type="text"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập tên NXB"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Năm xuất bản
                </label>
                <input
                  type="number"
                  name="publishYear"
                  value={formData.publishYear}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Năm XB"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngôn ngữ
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Chọn ngôn ngữ</option>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số trang
                </label>
                <input
                  type="number"
                  name="pageCount"
                  value={formData.pageCount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Số trang"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ISBN
                </label>
                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập mã ISBN"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Mã số sách quốc tế, thường in ở bìa sau
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ảnh bìa <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col space-y-3">
                  {thumbnailPreview ? (
                    <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-gray-300">
                      <img
                        src={thumbnailPreview}
                        alt="Ảnh bìa"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeThumbnail}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md transition-transform hover:scale-110"
                        title="Xóa ảnh"
                      >
                        <X size={16} className="text-red-500" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={triggerThumbnailUpload}
                      className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center w-40 h-40"
                    >
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        Tải lên ảnh bìa
                      </div>
                    </button>
                  )}
                  {errors.thumbnail && (
                    <p className="mt-1 text-sm text-red-500">{errors.thumbnail}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Tải lên ảnh bìa sách. Ảnh này sẽ là ảnh hiển thị chính.
                  </p>
                </div>
              </div>
            </div>

            <AuthorSection 
              authors={formData.authors}
              onAuthorsChange={(authors) => setFormData((prev) => ({...prev, authors}))}
              error={errors.authors}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CategorySelection 
                selectedCategories={selectedCategories}
                onChange={setSelectedCategories}
                error={errors.categories}
              />
              
              <SchoolSelection
                selectedSchool={formData.school}
                onChange={(school) => setFormData((prev) => ({...prev, school}))}
              />
            </div>
          </div>
        </div>

        <DescriptionEditor
          editor={editor}
          value={formData.description}
          onChange={handleDescriptionChange}
          error={errors.description}
        />

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Tình trạng sách</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tình trạng <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {CONDITION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        conditionNumber: option.value.toString(),
                        ...(conditionDescriptionChanged ? {} : { conditionDescription: option.description }),
                      }));
                      
                      if (!conditionDescriptionChanged && conditionEditor) {
                        conditionEditor.commands.setContent(option.description);
                      }
                      
                      if (errors.conditionNumber) {
                        setErrors((prev) => ({
                          ...prev,
                          conditionNumber: '',
                        }));
                      }
                    }}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      formData.conditionNumber === option.value.toString()
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                  </button>
                ))}
              </div>
              {errors.conditionNumber && (
                <p className="mt-1 text-sm text-red-500">{errors.conditionNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả tình trạng sách
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                {conditionEditor && (
                  <DescriptionEditor
                    editor={conditionEditor}
                    value={formData.conditionDescription}
                    onChange={handleConditionDescriptionChange}
                    error=""
                  />
                )}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <p>Mô tả chi tiết giúp người mua có thông tin chính xác về tình trạng sách.</p>
              </div>
            </div>
          </div>
        </div>

        <PriceSection
          priceNew={formData.priceNew}
          price={formData.price}
          address={formData.address}
          conditionNumber={formData.conditionNumber}
          onInputChange={handleInputChange}
          errors={errors}
          calculateDiscountPercentage={calculateDiscountPercentage}
          getConditionLabel={getConditionLabel}
          getRecommendedPriceRange={getRecommendedPriceRange}
        />

        <ImageUpload
          previewImages={previewImages}
          setPreviewImages={setPreviewImages}
          images={images}
          setImages={setImages}
          error={errors.images}
        />

        <input
          type="file"
          ref={thumbnailInputRef}
          onChange={handleThumbnailUpload}
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          className="hidden"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang đăng...' : 'Đăng bài'}
          </button>
        </div>
      </form>
    </>
  );
};

export default BookListingForm;
