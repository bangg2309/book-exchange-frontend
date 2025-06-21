import React, { useState, useEffect } from 'react';
import { Rating } from '@/components/shared/rating';
import { toast } from 'sonner';
import { createReview, updateReview, getUserReviewForBook, ReviewResponse } from '@/services/reviewService';
import { authService } from '@/services/authService';
import { FaPencilAlt } from 'react-icons/fa';

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: number;
  sellerId: number;
  bookTitle: string;
  sellerName: string;
  onReviewSubmitted?: () => void;
  existingReview?: ReviewResponse | null;
}

export function ReviewDialog({
  isOpen,
  onClose,
  bookId,
  sellerId,
  bookTitle,
  sellerName,
  onReviewSubmitted,
  existingReview
}: ReviewDialogProps) {
  const [rating, setRating] = useState<number>(existingReview?.rating || 5);
  const [comment, setComment] = useState<string>(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [reviewId, setReviewId] = useState<number | null>(existingReview?.id || null);
  const [isLoading, setIsLoading] = useState<boolean>(!existingReview);
  const [isEditing, setIsEditing] = useState<boolean>(!existingReview);

  // Tải đánh giá hiện có nếu chưa được truyền vào
  useEffect(() => {
    const fetchExistingReview = async () => {
      if (!existingReview && isOpen) {
        setIsLoading(true);
        try {
          const review = await getUserReviewForBook(bookId);
          if (review) {
            setRating(review.rating);
            setComment(review.comment);
            setReviewId(review.id);
            setIsEditing(false);
          } else {
            setIsEditing(true);
          }
        } catch (error) {
          console.error('Error fetching existing review:', error);
          setIsEditing(true);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchExistingReview();
  }, [bookId, existingReview, isOpen]);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
      setReviewId(existingReview.id);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, [existingReview]);

  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error('Vui lòng đánh giá từ 1-5 sao');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (reviewId) {
        // Cập nhật đánh giá đã tồn tại
        await updateReview(reviewId, {
          bookId,
          sellerId,
          rating,
          comment,
        });
        toast.success('Cập nhật đánh giá thành công!');
        setIsEditing(false);
      } else {
        // Tạo đánh giá mới
        const response = await createReview({
          bookId,
          sellerId,
          rating,
          comment,
        });
        setReviewId(response.id);
        toast.success('Đánh giá thành công!');
        setIsEditing(false);
      }
      
      onReviewSubmitted?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(existingReview?.rating || 5);
    setComment(existingReview?.comment || '');
    setIsEditing(!existingReview);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Dialog Header */}
        <div className="p-4 border-b">
          <h2 className="text-center text-xl font-semibold">
            {reviewId ? (isEditing ? 'Cập nhật đánh giá' : 'Đánh giá của bạn') : 'Đánh giá sản phẩm'}
          </h2>
        </div>
        
        {/* Dialog Content */}
        <div className="p-6 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h3 className="font-medium text-lg">{bookTitle}</h3>
                <p className="text-gray-500 text-sm">Người bán: {sellerName}</p>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium">Chất lượng sản phẩm</p>
                <Rating 
                  value={rating} 
                  onChange={isEditing ? setRating : undefined} 
                  size="large" 
                  readonly={!isEditing}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="comment" className="text-sm font-medium block">
                  Nhận xét của bạn
                </label>
                <textarea
                  id="comment"
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  value={comment}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-green-500' : 'bg-gray-50'}`}
                  readOnly={!isEditing}
                />
              </div>
            </>
          )}
        </div>
        
        {/* Dialog Footer */}
        <div className="p-4 border-t flex justify-center gap-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            onClick={handleClose}
            disabled={isSubmitting || isLoading}
          >
            {isEditing ? 'Hủy' : 'Đóng'}
          </button>
          
          {reviewId && !isEditing ? (
            <button 
              type="button"
              className="px-4 py-2 bg-amber-500 text-white rounded-md font-medium hover:bg-amber-600 transition-colors flex items-center"
              onClick={() => setIsEditing(true)}
            >
              <FaPencilAlt className="mr-2" />
              Thay đổi
            </button>
          ) : (
            <button 
              type="button"
              className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? 'Đang gửi...' : reviewId ? 'Cập nhật' : 'Gửi đánh giá'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 