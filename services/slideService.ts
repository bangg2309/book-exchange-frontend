import {Slide, SlidePage} from "@/types/silde";
import api, {apiService} from './api';
import {ApiResponse} from "@/types/apiResponse";

const handleApiError = (error: any, defaultMessage: string, context: string = ''): never => {
    if (error.response && error.response.data) {
        const errorData = error.response.data;
        const errorMessage = errorData.message || defaultMessage;

        console.error(`Backend error ${context}:`, errorMessage, 'Code:', errorData.code);
        throw new Error(errorMessage);
    }

    console.error(`Error ${context}:`, error);
    throw error;
};

// Helper for consistent response handling
const processApiResponse = <T>(response: ApiResponse<T> | undefined, errorMessage: string): T => {
    if (!response || !response.result) {
        throw new Error(errorMessage);
    }
    return response.result;
};
export const slideService = {
    /**
     * Lấy danh sách các slide có status = 1 (active)
     */
    getAllSlides: async (): Promise<string[]> => {
        try {
            const response = await apiService.get<{
                result: {
                    content: Slide[];
                    totalPages: number;
                    totalElements: number;
                };
            }>("/slides?page=0&size=100000"); // size rất lớn để lấy tất cả

            return response.result.content
                .filter((item) => item.status === 1)
                .map((item) => item.imageUrl);
        } catch (error) {
            console.error("❌ Lỗi khi fetch tất cả slide:", error);
            return [];
        }
    },

    /**
     * Lấy toàn bộ danh sách slide
     */
    getSlidesFull: async (page: number = 0, size: number = 5): Promise<SlidePage> => {
        try {
            const { data } = await api.get<ApiResponse<SlidePage>>(`/slides?page=${page}&size=${size}`);
            return processApiResponse(data, 'Invalid slides response from server');
        } catch (error: any) {
            return handleApiError(error, 'An error occurred while fetching slides', 'fetching slides');
        }
    },
    /**
     * Xoá một slide theo ID
     */
    deleteSlide: async (id: string): Promise<void> => {
        try {
            await apiService.delete(`/slides/${id}`);
        } catch (error) {
            console.error("❌ Lỗi khi xóa slide:", error);
            throw error;
        }
    },

    /**
     * Cập nhật thông tin của một slide
     */
    updateSlide: async (id: string, updatedData: Partial<Slide>): Promise<Slide> => {
        try {
            const updated = await apiService.put<{ result: Slide }>(`/slides/${id}`, updatedData);
            return updated.result;
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật slide:", error);
            throw error;
        }
    }
};
