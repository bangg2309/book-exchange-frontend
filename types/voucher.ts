export interface VoucherResponse {
    id: number;
    code: string;
    description: string;
    discountAmount: number | null;
    discountPercentage: number | null;
    minOrderValue: number;
    maxDiscount: number | null;
    startsAt: string;
    expiresAt: string;
    maxUses: number | null;
    currentUses: number;
    sellerId: number | null;
    sellerName: string | null;
    isPlatformVoucher: boolean;
    createdAt: string;
} 