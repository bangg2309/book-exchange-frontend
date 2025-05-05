import { Author } from './author';
import { Category } from './category';
import { School } from './school';

/**
 * Book form data for creating or updating books
 */
export interface BookFormData {
  title: string;
  authors: Author[];
  publisher: string;
  publishYear: string;
  language: string;
  description: string;
  pageCount: string;
  conditionNumber: string;
  conditionDescription: string;
  priceNew: string;
  price: string;
  status: number;
  school: string;
  categories: number[];
  address: string;
  isbn: string;
  thumbnail: string;
}

/**
 * Extended book data including optional images
 */
export interface BookData extends BookFormData {
  images?: (File | string)[];
  imagesUrl?: string[];
  categoriesId?: number[];
  schoolId?: number;
}

/**
 * Book object as returned from API
 */
export interface Book {
  id: string;
  title: string;
  authors: Author[];
  publisher?: string;
  publishYear?: number;
  language: string;
  description: string;
  pageCount?: number;
  conditionNumber: number;
  conditionDescription?: string;
  priceNew?: number;
  price: number;
  discount?: number;
  status: BookStatus;
  school?: School;
  categories: Category[];
  address: string;
  isbn?: string;
  thumbnail?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  seller: {
    id: string;
    name: string;
    avatar?: string;
  };
}

/**
 * Book status enum
 */
export enum BookStatus {
  ACTIVE = 1,
  SOLD = 2,
  HIDDEN = 3,
  DELETED = 4
}

/**
 * Book condition options for display
 */
export interface BookCondition {
  value: number;
  label: string;
  description: string;
}

/**
 * API response for book operations
 */
export interface BookResponse {
  id?: string;
  result?: {
    id: string;
  };
  code?: number;
  message?: string;
  data?: Book | Book[];
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
} 