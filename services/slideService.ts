import { Slide } from "@/types/silde";

export const slideService = {
    // Lấy chỉ imageUrl (dùng cho trang Home)
    getSlide: async (): Promise<string[]> => {
        try {
            const response = await fetch('http://localhost:8081/slides');
            const data = await response.json();
            console.log('📦 Dữ liệu trả về từ API:', data);
            const urls = data.result.map((item: { imageUrl: string }) => item.imageUrl);
            return urls;
        } catch (error) {
            console.error('❌ Lỗi khi fetch slide:', error);
            return [];
        }
    },

    // Lấy toàn bộ đối tượng slide (dùng cho trang quản lý slide)
    getSlidesFull: async (): Promise<Slide[]> => {
        try {
            const response = await fetch('http://localhost:8081/slides');
            const data = await response.json();
            console.log('📦 Dữ liệu slide full trả về từ API:', data);
            return data.result as Slide[];
        } catch (error) {
            console.error('❌ Lỗi khi fetch slide full:', error);
            return [];
        }
    },

    // ✅ Thêm hàm xóa slide
    deleteSlide: async (id: string): Promise<void> => {
        try {
            const response = await fetch(`http://localhost:8081/slides/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`Xóa thất bại với mã lỗi ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Lỗi khi xóa slide:', error);
            throw error;
        }
    }
};
