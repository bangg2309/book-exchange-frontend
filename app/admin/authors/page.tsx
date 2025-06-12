'use client';

import { useEffect, useState } from 'react';
import { authorService } from '@/services/authorService';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Author } from '@/types/author';
import AuthorFormModal from './components/AuthorFormModal';
import toast from "react-hot-toast";

export default function AuthorsPage() {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [filteredAuthors, setFilteredAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchAuthors(page);
    }, [page]);

    const fetchAuthors = async (pageNumber: number = 0) => {
        try {
            setLoading(true);
            const data = await authorService.getAuthors(pageNumber, pageSize);
            setAuthors(data.content);
            setFilteredAuthors(data.content);
            setTotalPages(data.totalPages);
            setError(null);
        } catch {
            setError('Không thể tải danh sách tác giả.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) {
            setFilteredAuthors(authors);
            return;
        }
        const filtered = authors.filter((author) =>
            author.name?.toLowerCase().includes(q)
        );
        setFilteredAuthors(filtered);
    };

    const handleCreateAuthor = () => {
        setSelectedAuthor(null);
        setIsModalOpen(true);
    };

    const handleEditAuthor = (author: Author) => {
        setSelectedAuthor(author);
        setIsModalOpen(true);
    };

    const handleDeleteAuthor = async (id: string) => {
        if (!id || !confirm('Bạn có chắc muốn xóa tác giả này không?')) return;
        try {
            await authorService.deleteAuthor(id);
            await fetchAuthors(page);
            toast.success('Xóa tác giả thành công');
        } catch {
            toast.error('Không thể xóa tác giả.');
        }
    };

    const handleSaveAuthor = async (data: Partial<Author>) => {
        try {
            if (data.id) {
                await authorService.updateAuthor(data.id, data);
                toast.success('Cập nhật tác giả thành công');
            } else {
                await authorService.createAuthor(data);
                toast.success('Thêm tác giả thành công');
            }
            await fetchAuthors(page);
        } catch {
            toast.error('Lưu tác giả thất bại');
        }
    };

    return (
        <div className="space-y-6 p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Quản lý tác giả</h1>
                <button
                    onClick={handleCreateAuthor}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    <Plus size={16} className="mr-2" />
                    Thêm tác giả
                </button>
            </div>

            <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search size={18} className="text-gray-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên..."
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
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Tên</th>
                            <th className="px-6 py-3 text-right">Hành động</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y">
                        {filteredAuthors.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="text-center py-4">
                                    Không tìm thấy tác giả nào.
                                </td>
                            </tr>
                        ) : (
                            filteredAuthors.map((author) => (
                                <tr key={author.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4">{author.id}</td>
                                    <td className="px-6 py-4">{author.name}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleEditAuthor(author)}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAuthor(author.id!)}
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

            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-1 mt-6 text-sm">
                    <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                        disabled={page === 0}
                        className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                    >
                        Trước
                    </button>

                    {page > 1 && (
                        <>
                            <button
                                onClick={() => setPage(0)}
                                className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100"
                            >
                                1
                            </button>
                            {page > 2 && <span className="px-2">...</span>}
                        </>
                    )}

                    {[
                        page - 1,
                        page,
                        page + 1
                    ].filter(p => p >= 0 && p < totalPages).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`px-3 py-1 rounded-md border ${
                                p === page
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                            }`}
                        >
                            {p + 1}
                        </button>
                    ))}

                    {page < totalPages - 2 && (
                        <>
                            {page < totalPages - 3 && <span className="px-2">...</span>}
                            <button
                                onClick={() => setPage(totalPages - 1)}
                                className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                        disabled={page + 1 >= totalPages}
                        className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                    >
                        Sau
                    </button>
                </div>
            )}
            <AuthorFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                author={selectedAuthor}
                onSave={handleSaveAuthor}
            />
        </div>
    );
}
