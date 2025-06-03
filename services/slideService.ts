import { Slide } from "@/types/silde";

export const slideService = {
    getSlide: async (): Promise<string[]> => {
        try {
            const response = await fetch('http://localhost:8081/slides');
            const data = await response.json();
            const urls = data.result
                .filter((item: { status: number }) => item.status === 1) // lọc status === 1
                .map((item: { imageUrl: string }) => item.imageUrl); // lấy imageUrl
            return urls;
        } catch (error) {
            console.error('❌ Lỗi khi fetch slide:', error);
            return [];
        }
    },

    getSlidesFull: async (): Promise<Slide[]> => {
        try {
            const response = await fetch('http://localhost:8081/slides');
            const data = await response.json();
            return data.result as Slide[];
        } catch (error) {
            console.error('❌ Lỗi khi fetch slide full:', error);
            return [];
        }
    },

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
    },

    updateSlide: async (id: string, updatedData: Partial<Slide>): Promise<Slide> => {
        try {
            const response = await fetch(`http://localhost:8081/slides/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) {
                throw new Error(`Cập nhật thất bại với mã lỗi ${response.status}`);
            }
            const data = await response.json();
            return data.result as Slide;
        } catch (error) {
            console.error('❌ Lỗi khi cập nhật slide:', error);
            throw error;
        }
    }
};
