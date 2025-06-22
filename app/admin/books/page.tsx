'use client';

import { useEffect, useState } from 'react';
import { bookService } from '@/services/bookService';
import { Book } from '@/types/book';
import { Author } from '@/types/author';
import { Edit, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
// import BookFormModal from './components/BookFormModal';

export default function BookPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);

  useEffect(() => {
    fetchBooks();
  }, [page, size]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.getBooksOfPage(page, size);
      console.log('API data:', data);
      setBooks(data.content);

      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi tải sách:', err);
      setError('Không thể tải danh sách sách. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      console.log('Fetched books:', books.length);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const handleCreateBook = () => {
    setSelectedBook(null);
    setIsModalOpen(true);
  };

  const handleUpdateBook = (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleDeleteBook = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa sách này không?')) {
      try {
        await bookService.deleteBook(id);
        fetchBooks();
      } catch (err) {
        console.error('Không thể xóa:', err);
        setError('Không thể xóa sách. Vui lòng thử lại.');
      }
    }
  };

  // const handleSave = async (data: Partial<Book>) => {
  //   try {
  //     if (selectedBook?.id) {
  //       await bookService.updateBook(selectedBook.id, data);
  //     } else {
  //       await bookService.createBook(data);
  //     }
  //     fetchBooks();
  //   } catch (err) {
  //     console.error('Lỗi khi lưu sách:', err);
  //     throw err;
  //   }
  // };

  return (
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý sách</h1>
          <button
              onClick={handleCreateBook}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
          >
            <Plus size={16} className="mr-2" />
            Thêm sách
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium">Tiêu đề</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Nhà xuất bản</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Tác giả</th>
              {/*<th className="px-4 py-2 text-left text-sm font-medium">Tình trạng</th>*/}
              <th className="px-4 py-2 text-left text-sm font-medium">Ảnh</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Giá mới</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Giá bán</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Người đăng</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Trường</th>

              <th className="px-4 py-2 text-right text-sm font-medium">Hành động</th>
            </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
                <tr><td colSpan={10} className="text-center py-4 text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : error ? (
                <tr><td colSpan={10} className="text-center py-4 text-red-500">{error}</td></tr>
            ) : books.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-4 text-gray-500">Không có sách nào.</td></tr>
            ) : (

                books.map((book) => (
                    <tr key={book.id}>
                      <td className="px-4 py-2 text-sm">{book.title}</td>
                      <td className="px-4 py-2 text-sm">{book.publisher}</td>
                      <td className="px-4 py-2 text-sm">
                        {Array.isArray(book.author) && book.author.length > 0
                            ? (
                                console.log('book.authors:', book.author),
                                    book.author.map((auth) => (
                                        <span key={auth.name} className="block">{auth.name}</span>
                                    ))
                            )
                            : <span className="text-gray-400 italic">No authors</span>
                        }
                      </td>
                      {/*<td className="px-4 py-2 text-sm">{book.description}</td>*/}
                      <td className="px-4 py-2 text-sm">
                        <img src={book.thumbnail} alt="Thumbnail" className="h-10 w-10 object-cover rounded"/>
                      </td>
                      <td className="px-4 py-2 text-sm line-through text-gray-500">{book.priceNew} ₫</td>
                      <td className="px-4 py-2 text-sm">{book.price} ₫</td>
                      {/*<td className="px-4 py-2 text-sm">{book.conditionNumber}/5</td>*/}
                      <td className="px-4 py-2 text-sm">{book.name}</td>
                      <td className="px-4 py-2 text-sm">{book.school?.name || book.school?.toString() || ''}</td>


                      {/*<td className="px-4 py-2 text-sm">{book.fullName}</td>*/}

                      <td className="px-4 py-2 text-right">
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => handleUpdateBook(book)} className="text-blue-500 hover:text-blue-700">
                            <Edit size={16}/>
                          </button>
                          <button onClick={() => handleDeleteBook(book.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                ))
            )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-2 flex justify-between items-center border-t">
          <div className="text-sm">
            Hiển thị {page * size + 1} đến {Math.min((page + 1) * size, totalElements)} trong tổng {totalElements} sách
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => handlePageChange(page - 1)} disabled={page === 0}>
              <ChevronLeft/>
            </button>
            <span>Trang {page + 1} / {totalPages || 1}</span>
            <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages - 1}>
              <ChevronRight />
            </button>
          </div>
        </div>

        {/*<BookFormModal*/}
        {/*    isOpen={isModalOpen}*/}
        {/*    onClose={() => setIsModalOpen(false)}*/}
        {/*    onSave={handleSave}*/}
        {/*    book={selectedBook}*/}
        {/*/>*/}
      </div>
  );
}
