import api from "./api";

export interface ReviewRequest {
  bookId: number;
  sellerId: number;
  rating: number;
  comment?: string;
}

export interface ReviewResponse {
  id: number;
  reviewer: string;
  seller: string;
  bookName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export async function createReview(data: ReviewRequest): Promise<ReviewResponse> {
  const response = await api.post('/reviews', data);
  return response.data.result;
}

export async function getReviewsByBook(bookId: number): Promise<ReviewResponse[]> {
  const response = await api.get(`/reviews/book/${bookId}`);
  return response.data.result;
}

export async function getReviewsBySeller(sellerId: number): Promise<ReviewResponse[]> {
  const response = await api.get(`/reviews/seller/${sellerId}`);
  return response.data.result;
}

export async function updateReview(reviewId: number, data: ReviewRequest): Promise<ReviewResponse> {
  const response = await api.put(`/reviews/${reviewId}`, data);
  return response.data.result;
}

export async function deleteReview(reviewId: number): Promise<void> {
  await api.delete(`/reviews/${reviewId}`);
}

export async function checkReviewExists(bookId: number, userId: number): Promise<ReviewResponse | null> {
  try {
    const response = await api.get(`/reviews/check?bookId=${bookId}&userId=${userId}`);
    return response.data.result;
  } catch (error) {
    return null;
  }
}

export async function getUserReviewForBook(bookId: number): Promise<ReviewResponse | null> {
  try {
    const response = await api.get(`/reviews/user/book/${bookId}`);
    return response.data.result;
  } catch (error) {
    return null;
  }
} 