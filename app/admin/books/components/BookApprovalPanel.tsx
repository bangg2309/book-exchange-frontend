'use client';

import { useEffect, useState } from 'react';
import { bookService } from '@/services/bookService';
import { toast } from 'react-toastify';

interface Book {
    id: number;
    title: string;
    author: string;
    thumbnail: string;
    schoolName: string;
}

export default function BookApprovalPanel() {
    const [showModal, setShowModal] = useState(false);
    const [pendingBooks, setPendingBooks] = useState<Book[]>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchPendingBooks = async () => {
        try {
            setLoading(true);
            const res = await bookService.getPendingBooks(0, 50);
            const books = res?.result?.content || [];
            setPendingBooks(books);
            setCount(books.length);
        } catch (error) {
            toast.error('Lỗi tải sách chờ duyệt');
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        fetchPendingBooks();
    }, []);

    const approveBook = async (id: number) => {
        try {
            await bookService.updateBookListing(String(id), { status: 1 });
            toast.success('Đã duyệt sách');
            setPendingBooks(prev => prev.filter(book => book.id !== id));
            setCount(prev => prev - 1);
        } catch (err) {
            toast.error('Lỗi phê duyệt sách');
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowModal(true)}
                className="relative bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
                Phê duyệt
                {count > 0 && (
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full">
            {count}
          </span>
                )}
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="bg-white w-[600px] max-h-[80vh] overflow-y-auto rounded-lg p-4 relative shadow">
                        <button className="absolute top-2 right-3 text-gray-600" onClick={() => setShowModal(false)}>✖</button>
                        <h2 className="text-lg font-bold mb-4">Sách cần phê duyệt</h2>
                        {loading ? (
                            <p>Đang tải...</p>
                        ) : pendingBooks.length === 0 ? (
                            <p>Không có sách nào chờ duyệt.</p>
                        ) : (
                            <ul className="space-y-3">
                                {pendingBooks.map(book => (
                                    <li key={book.id} className="flex items-center justify-between border p-2 rounded">
                                        <div className="flex items-center space-x-3">
                                            <img src={book.thumbnail} alt={book.title} className="w-10 h-14 object-cover rounded" />
                                            <div>
                                                <p className="font-semibold">{book.title}</p>
                                                <p className="text-xs text-gray-500">{book.author} - {book.schoolName}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => approveBook(book.id)}
                                            className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                        >
                                            Duyệt
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
