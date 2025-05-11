import type { Author } from './author';
import type { Category } from './category';
import type { School } from './school';
import type { BookData, BookFormData } from './book';

export type {
  Author,
  Category,
  School,
  BookData,
  BookFormData
};

export interface BookResponse {
  id: number;
  title: string;
  description: string;
  conditionDescription?: string;
  conditionNumber: number;
  price: number;
  priceNew?: number;
  discount?: number;
  inPerson?: number;
  language?: string;
  pageCount?: number;
  publishYear?: string;
  publisher?: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  schoolId?: number;
  school?: {
    id: number;
    name: string;
    address: string;
  };
  sellerId?: number;
  seller?: {
    id: number;
    username: string;
    email?: string;
    avatar?: string;
    phone?: string;
    status?: number;
    roles?: Array<{
      name: string;
      description: string;
      permissions: Array<{
        name: string;
        description: string;
      }>;
    }>;
    createdAt?: string;
    updatedAt?: string;
  };
  thumbnail?: string;
  address?: string;
  isbn?: string;
  authors?: Array<{
    id: number;
    name: string;
  }>;
  images?: Array<{
    id: number;
    url: string;
    bookId: number;
  }>;
  reviews?: Array<{
    id: number;
    reviewerId: number;
    reviewerName: string;
    sellerId: number;
    sellerName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
} 