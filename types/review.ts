export interface ReviewResponse {
  id: number;
  reviewer: string;
  seller: string;
  bookName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewRequest {
  bookId: number;
  sellerId: number;
  rating: number;
  comment?: string;
} 