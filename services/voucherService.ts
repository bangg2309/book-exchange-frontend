import { apiService } from './api';
import { toastService } from './toastService';
import { VoucherResponse } from '@/types/voucher';

class VoucherService {
    /**
     * Get all platform vouchers
     */
    async getPlatformVouchers(): Promise<VoucherResponse[]> {
        try {
            return await apiService.get<VoucherResponse[]>('/api/vouchers/platform');
        } catch (error) {
            console.error('Error fetching platform vouchers:', error);
            return [];
        }
    }

    /**
     * Verify voucher code and return discount amount
     * @param code Voucher code
     * @param orderValue Order subtotal
     */
    async validateVoucher(code: string, orderValue: number): Promise<{ valid: boolean; discount: number } | null> {
        try {
            return await apiService.post<{ valid: boolean; discount: number }>(
                `/api/vouchers/${code}/validate`, null, { params: { orderValue } }
            );
        } catch (error: any) {
            if (error.response) {
                switch (error.response.data.code) {
                    case 1036:
                        toastService.error('Mã voucher không tồn tại');
                        break;
                    case 1037:
                        toastService.error('Voucher đã hết hạn');
                        break;
                    case 1044:
                        toastService.error('Voucher đã hết lượt sử dụng');
                        break;
                    case 1045:
                        toastService.error('Giá trị đơn hàng không đủ để áp dụng voucher');
                        break;
                    default:
                        toastService.error('Không thể áp dụng voucher này');
                }
            } else {
                toastService.error('Có lỗi xảy ra khi kiểm tra voucher');
            }
            return null;
        }
    }

    /**
     * Initialize demo voucher
     */
    async initializeDemoVoucher(): Promise<void> {
        try {
            await apiService.post('/api/vouchers/initialize-demo');
            console.log('Demo voucher initialized');
        } catch (error) {
            console.error('Error initializing demo voucher:', error);
        }
    }
}

export const voucherService = new VoucherService(); 