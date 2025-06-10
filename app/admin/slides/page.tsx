'use client';

import { useEffect, useState } from 'react';
import { slideService } from '@/services/slideService';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Slide } from '@/types/silde';
import SlideFormModal from './components/SlideFormModal';
import toast from "react-hot-toast";

export default function SlidesPage() {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [filteredSlides, setFilteredSlides] = useState<Slide[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchSlidesFull();
    }, []);

    const fetchSlidesFull = async () => {
        try {
            setLoading(true);
            const data = await slideService.getSlidesFull();
            setSlides(data);
            setFilteredSlides(data);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách slide. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) {
            setFilteredSlides(slides);
            return;
        }
        const filtered = slides.filter(
            (slide) =>
                (slide.event?.toLowerCase().includes(q) ?? false) ||
                (slide.addedBy?.toLowerCase().includes(q) ?? false)
        );
        setFilteredSlides(filtered);
    };

    const handleCreateSlide = () => {
        setSelectedSlide(null);
        setIsModalOpen(true);
    };

    const handleEditSlide = (slide: Slide) => {
        setSelectedSlide(slide);
        setIsModalOpen(true);
    };

    const handleDeleteSlide = async (id: string) => {
        if (!id || !confirm('Bạn có chắc muốn xóa slide này không?')) return;

        try {
            await slideService.deleteSlide(id);
            await fetchSlidesFull();
        } catch (err) {
            setError('Không thể xóa slide. Vui lòng thử lại sau.');
        }
    };

    const handleSaveSlide = async (data: Partial<Slide>) => {
        try {
            if (!data.id) {
                throw new Error('Thiếu ID slide để cập nhật');
            }
            await slideService.updateSlide(data.id, data);
            toast.success('Cập nhật slide thành công');
            await fetchSlidesFull();
        } catch (error: any) {
            console.error('Lưu slide thất bại:', error);
            toast.error('Lưu slide thất bại');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="space-y-6 p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Quản lý slide</h1>
                <button
                    onClick={handleCreateSlide}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    <Plus size={16} className="mr-2" />
                    Thêm slide
                </button>
            </div>

            <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search size={18} className="text-gray-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo sự kiện hoặc người thêm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full p-2 pl-10 text-sm border rounded-md"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                    Tìm kiếm
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-md shadow-md overflow-hidden">
                {loading ? (
                    <div className="py-12 text-center">Đang tải...</div>
                ) : error ? (
                    <div className="p-4 text-red-600">{error}</div>
                ) : (
                    <table className="min-w-full divide-y">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-left text-sm text-gray-600 dark:text-gray-200">
                        <tr>
                            <th className="px-6 py-3">Sự kiện</th>
                            <th className="px-6 py-3">Người thêm</th>
                            <th className="px-6 py-3">Ảnh</th>
                            <th className="px-6 py-3">Trạng thái</th>
                            <th className="px-6 py-3">Ngày thêm</th>
                            <th className="px-6 py-3 text-right">Hành động</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y">
                        {filteredSlides.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-4">
                                    Không tìm thấy slide nào.
                                </td>
                            </tr>
                        ) : (
                            filteredSlides.map((slide) => (
                                <tr
                                    key={slide.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <td className="px-6 py-4 max-w-[250px] truncate whitespace-nowrap overflow-hiddennop">{slide.event ?? '-'}</td>
                                    <td className="px-6 py-4">{slide.addedBy ?? '-'}</td>
                                    <td className="px-6 py-4">
                                        {slide.imageUrl && (
                                            <img
                                                src={slide.imageUrl}
                                                alt="Slide"
                                                className="w-16 h-10 object-cover rounded"
                                            />
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                            <span
                                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                    slide.status === 1
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {slide.status === 1 ? 'Hiển thị' : 'Ẩn'}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4">{formatDate(slide.addedAt)}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleEditSlide(slide)}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => slide.id && handleDeleteSlide(slide.id)}
                                            className="text-red-600 hover:text-red-800"
                                            title="Xóa"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                )}
            </div>

            <SlideFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                slide={selectedSlide}
                onSave={handleSaveSlide}
                defaultAddedBy={currentUser.username}
            />
        </div>
    );
}
