export interface CartItemResponse {
    id: number;
    bookId: number;
    bookTitle: string;
    thumbnail: string;
    description: string;
    priceNew: number | null;
    price: number;
    quantity: number;
    sellerName: string | null;
    sellerId: number;
    conditionNumber: number;
  }

  export interface CartAdditionRequest {
    userId: number;
    bookId: number;
  }
