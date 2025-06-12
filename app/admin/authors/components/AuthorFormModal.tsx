import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Author } from '@/types/author';

interface AuthorFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Author>) => void;
    author?: Author | null;
}

export default function AuthorFormModal({
                                            isOpen,
                                            onClose,
                                            author,
                                            onSave,
                                        }: AuthorFormModalProps) {
    const [formData, setFormData] = useState<Partial<Author>>({
        name: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (author) {
            setFormData({ id: author.id, name: author.name });
        } else {
            setFormData({ name: '' });
        }
    }, [author]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                            {author ? 'Chỉnh sửa tác giả' : 'Thêm tác giả'}
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
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Tên tác giả
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                onClick={onClose}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
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
