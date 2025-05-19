export const slideService = {
    getSlide: async (): Promise<string[]> => {
        try {
            const response = await fetch('http://localhost:8081/slides');
            const data = await response.json();
            console.log('📦 Dữ liệu trả về từ API:', data);

            // Truy cập đúng vào mảng result
            const urls = data.result.map((item: { imageUrl: string }) => item.imageUrl);
            return urls;
        } catch (error) {
            console.error('❌ Lỗi khi fetch slide:', error);
            return [];
        }
    },
};
