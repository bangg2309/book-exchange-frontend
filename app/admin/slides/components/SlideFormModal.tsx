import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Slide } from '@/types/silde';

interface SlideFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Slide>) => void;
    slide?: Slide | null;
    defaultAddedBy?: string;
}

export default function SlideFormModal({ isOpen, onClose, slide, onSave }: SlideFormModalProps) {
    const [formData, setFormData] = useState<Partial<Slide>>({
        event: '',
        createdBy: '',
        image: '',
        status: 1,
        createdAt: new Date().toISOString(),
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isNewSlide = !slide;

    useEffect(() => {
        if (slide) {
            setFormData({
                id: slide.id,
                event: slide.event,
                createdBy: slide.createdBy,
                image: slide.image,
                status: slide.status,
                createdAt: slide.createdAt,
            });
        } else {
            setFormData({
                event: '',
                createdBy: '',
                image: '',
                status: 1,
                createdAt: new Date().toISOString(),
            });
        }
    }, [slide]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'status' ? parseInt(value, 10) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            await onSave(formData);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Không thể lưu thông tin. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl z-50">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {isNewSlide ? 'Thêm slide mới' : 'Chỉnh sửa slide'}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                            <X size={20} />
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-md">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="event" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Sự kiện
                            </label>
                            <input
                                type="text"
                                id="event"
                                name="event"
                                value={formData.event || ''}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <div>
                            <label htmlFor="createdBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Người thêm
                            </label>
                            <input
                                type="text"
                                id="createdBy"
                                name="createdBy"
                                value={formData.createdBy || ''}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <div>
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Ảnh (URL)
                            </label>
                            <input
                                type="text"
                                id="image"
                                name="image"
                                value={formData.image || ''}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Trạng thái
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value={1}>Hiển thị</option>
                                <option value={0}>Ẩn</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="createdAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Ngày thêm
                            </label>
                            <input
                                type="datetime-local"
                                id="createdAt"
                                name="createdAt"
                                value={formData.createdAt?.slice(0, 16) || ''}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                                onClick={onClose}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
