import React, { useState, useEffect, useRef } from 'react';
import { bookService } from '@/services/bookService';

interface Book {
    id: number;
    title: string;
    priceNew: number;
    price: number;
    conditionNumber: number;
    description: string;
    thumbnail: string;
    publisher: string;
    schoolName: string;
    fullName: string;
    author: string;
    status: number;
}

interface SearchResponse {
    code: number;
    result: Book[];
}

interface BookSearchProps {
    onBookSelect: (bookId: number) => void;
    onViewAll: (query: string) => void;
    placeholder?: string;
}

const BookSearch: React.FC<BookSearchProps> = ({
                                                   onBookSelect,
                                                   onViewAll,
                                                   placeholder = "Tìm kiếm sách..."
                                               }) => {
    const [query, setQuery] = useState<string>('');
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query.trim()) {
                searchBooks(query);
            } else {
                setBooks([]);
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchBooks = async (searchQuery: string) => {
        try {
            setIsLoading(true);
            setError('');

            const encodedQuery = encodeURIComponent(searchQuery);
            const response = await fetch(`http://localhost:8081/listed-books/search?query=${encodedQuery}`);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data: SearchResponse = await response.json();

            if (data.code === 1000) {
                setBooks(data.result);
                setShowDropdown(true);
            } else {
                setError('Có lỗi xảy ra khi tìm kiếm');
                setBooks([]);
                setShowDropdown(false);
            }
        } catch (err) {
            setError('Không thể kết nối đến server');
            setBooks([]);
            setShowDropdown(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const handleBookClick = (bookId: number) => {
        setShowDropdown(false);
        setQuery('');
        onBookSelect(bookId);
    };

    const handleViewAllClick = () => {
        setShowDropdown(false);
        onViewAll(query);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const highlightText = (text: string, highlight: string) => {
        if (!highlight.trim()) return text;

        const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) =>
            regex.test(part) ?
                <span key={index} className="bg-yellow-200 font-semibold">{part}</span> :
                part
        );
    };

    return (
        <div ref={searchRef} className="relative w-full max-w-md">
            {/* Search Input */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {/* Loading Spinner */}
                {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </div>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto z-50">
                    {error ? (
                        <div className="p-4 text-red-500 text-center">
                            {error}
                        </div>
                    ) : books.length > 0 ? (
                        <>
                            {/* Book Results */}
                            {books.map((book) => (
                                <div
                                    key={book.id}
                                    onClick={() => handleBookClick(book.id)}
                                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                    {/* Book Thumbnail */}
                                    <img
                                        src={book.thumbnail}
                                        alt={book.title}
                                        className="w-12 h-16 object-cover rounded mr-3 flex-shrink-0"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/placeholder-book.png';
                                        }}
                                    />

                                    {/* Book Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 truncate">
                                            {highlightText(book.title, query)}
                                        </h3>
                                        <p className="text-sm text-gray-600 truncate">
                                            {book.author}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-semibold text-red-600">
                        {formatPrice(book.price)}
                      </span>
                                            {book.priceNew !== book.price && (
                                                <span className="text-xs text-gray-500 line-through">
                          {formatPrice(book.priceNew)}
                        </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate mt-1">
                                            {book.schoolName}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* View All Button */}
                            <div
                                onClick={handleViewAllClick}
                                className="p-3 text-center text-blue-600 hover:bg-blue-50 cursor-pointer font-medium border-t border-gray-200"
                            >
                                Xem thêm kết quả cho "{query}"
                            </div>
                        </>
                    ) : query.trim() && !isLoading ? (
                        <div className="p-4 text-gray-500 text-center">
                            Không tìm thấy sách nào
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default BookSearch;