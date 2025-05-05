'use client';

import { useState } from 'react';
import { BookData, BookFormData } from '@/types';

// Book status enum
export enum BookStatus {
  ACTIVE = 1,
  SOLD = 2,
  HIDDEN = 3,
  DELETED = 4
}

// Initial state for the form
export const INITIAL_BOOK_FORM_STATE: BookFormData = {
  title: '',
  authors: [{ id: '', name: '' }],
  publisher: '',
  publishYear: '',
  language: '',
  description: '',
  pageCount: '',
  conditionNumber: '',
  conditionDescription: '',
  priceNew: '',
  price: '',
  status: BookStatus.ACTIVE,
  school: '',
  categories: [],
  address: '',
  isbn: '',
  thumbnail: '',
};

export interface UseBookFormProps {
  initialData?: Partial<BookFormData>;
}

export interface UseBookFormReturn {
  formData: BookFormData;
  setFormData: React.Dispatch<React.SetStateAction<BookFormData>>;
  images: (File | string)[];
  setImages: React.Dispatch<React.SetStateAction<(File | string)[]>>;
  previewImages: string[];
  setPreviewImages: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCategories: number[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<number[]>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  formTouched: boolean;
  setFormTouched: React.Dispatch<React.SetStateAction<boolean>>;
  validateForm: () => Record<string, string>;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  conditionDescriptionChanged: boolean;
  setConditionDescriptionChanged: React.Dispatch<React.SetStateAction<boolean>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  getBookData: () => BookData;
}

const useBookForm = ({ initialData = {} }: UseBookFormProps = {}): UseBookFormReturn => {
  // Combine initial state with any passed data
  const initialFormState = {
    ...INITIAL_BOOK_FORM_STATE,
    ...initialData
  };

  // Form state
  const [formData, setFormData] = useState<BookFormData>(initialFormState);
  const [images, setImages] = useState<(File | string)[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>(initialFormState.categories || []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formTouched, setFormTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conditionDescriptionChanged, setConditionDescriptionChanged] = useState(false);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (name === 'conditionDescription') {
      setConditionDescriptionChanged(true);
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    
    setFormTouched(true);
  };

  // Form validation
  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tên sách';
    }
    
    if (!formData.authors[0].name.trim()) {
      newErrors.authors = 'Vui lòng nhập tác giả';
    }
    
    if (selectedCategories.length === 0) {
      newErrors.categories = 'Vui lòng chọn ít nhất một danh mục';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả sách';
    }
    
    if (!formData.conditionNumber) {
      newErrors.conditionNumber = 'Vui lòng chọn tình trạng sách';
    }
    
    if (!formData.price) {
      newErrors.price = 'Vui lòng nhập giá bán';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ đầy đủ';
    }
    
    return newErrors;
  };

  // Get complete book data
  const getBookData = (): BookData => ({
    ...formData,
    categories: selectedCategories,
    images
  });

  return {
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
    formTouched,
    setFormTouched,
    validateForm,
    isSubmitting,
    setIsSubmitting,
    conditionDescriptionChanged,
    setConditionDescriptionChanged,
    handleInputChange,
    getBookData
  };
};

export default useBookForm; 