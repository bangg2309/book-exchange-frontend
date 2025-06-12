'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import { Plus, X, Search } from 'lucide-react';
// import authorService, { AuthorType } from '@/services/authorService';
import { toastService } from '@/services/toastService';
import { authorService } from '@/services/authorService';
import {Author, AuthorPage} from '@/types/author';

interface AuthorSectionProps {
  authors: { id: string; name: string }[];
  onAuthorsChange: (authors: { id: string; name: string }[]) => void;
  error?: string;
}

const AuthorSection: React.FC<AuthorSectionProps> = ({ authors, onAuthorsChange, error }) => {
  const [authorSearchTerm, setAuthorSearchTerm] = useState('');
  const [authorOptions, setAuthorOptions] = useState<Author[]>([]);
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(false);
  const [filteredAuthors, setFilteredAuthors] = useState<Author[]>([]);
  const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false);
  const [showAddNewAuthorOption, setShowAddNewAuthorOption] = useState(false);
  const [currentAuthorIndex, setCurrentAuthorIndex] = useState(0);
  const [isAddingAuthor, setIsAddingAuthor] = useState(false);
  
  const authorDropdownRef = useRef<HTMLDivElement>(null);
  const authorSearchRef = useRef<HTMLInputElement>(null);

  // Add useEffect to fetch authors
  useEffect(() => {
    const loadAuthors = async () => {
      setIsLoadingAuthors(true);
      try {
        const authors = await authorService.getAuthors();
        setAuthorOptions(authors.content);
        // setFilteredAuthors(authors.slice(0, 20));
      } catch (error) {
        console.error('Failed to load authors:', error);
      } finally {
        setIsLoadingAuthors(false);
      }
    };
    
    loadAuthors();
  }, []);

  // Update search results when search term changes
  useEffect(() => {
    // Only perform search when there is author data
    if (authorOptions.length === 0) return;
    
    // If search box is empty, show all authors (limited to 20 for UI)
    if (authorSearchTerm.trim() === '') {
      setFilteredAuthors(authorOptions.slice(0, 20));
      setShowAddNewAuthorOption(false);
      return;
    }
    
    // Search directly on client for immediate response
    const lowercasedTerm = authorSearchTerm.toLowerCase().trim();
    const filtered = authorOptions.filter(author => 
      author.name.toLowerCase().includes(lowercasedTerm)
    ).slice(0, 20); // Limit results to avoid long list
    
    setFilteredAuthors(filtered);
    
    // Show add new option if search has content and no exact match
    const exactMatch = filtered.some(author => 
      author.name.toLowerCase() === lowercasedTerm
    );
    
    setShowAddNewAuthorOption(!exactMatch && authorSearchTerm.trim().length > 0);
  }, [authorSearchTerm, authorOptions]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (authorDropdownRef.current && !authorDropdownRef.current.contains(event.target as Node)) {
        setIsAuthorDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const openAuthorDropdown = (index: number) => {
    // Save the current author index
    setCurrentAuthorIndex(index);
    
    // Reset search each time dropdown opens
    setAuthorSearchTerm('');
    
    // Show first 20 authors
    if (authorOptions.length > 0) {
      setFilteredAuthors(authorOptions.slice(0, 20));
    }
    
    // Open dropdown and focus search box
    setIsAuthorDropdownOpen(true);
    setTimeout(() => {
      if (authorSearchRef.current) {
        authorSearchRef.current.focus();
      }
    }, 100);
  };

  const handleAuthorChange = (index: number, value: string) => {
    const newAuthors = [...authors];
    newAuthors[index] = { id: '', name: value };
    onAuthorsChange(newAuthors);
  };

  const handleSelectAuthor = (authorId: string, authorName: string) => {
    const newAuthors = [...authors];
    newAuthors[currentAuthorIndex] = { id: authorId, name: authorName };
    
    onAuthorsChange(newAuthors);
    
    // Close dropdown and reset search
    setIsAuthorDropdownOpen(false);
    setAuthorSearchTerm('');
  };

  const handleAddNewAuthor = (name: string) => {
    // Prevent multiple processing
    if (isAddingAuthor) return;
    setIsAddingAuthor(true);
    
    try {
      // Validate author name
      if (!name || name.trim() === '') {
        toastService.error('Vui lòng nhập tên tác giả');
        return;
      }

      // Create copy of current authors array
      const newAuthors = [...authors];
      
      // Update author at current index
      newAuthors[currentAuthorIndex] = { id: '', name: name.trim() };
      
      // Update state
      onAuthorsChange(newAuthors);
      
      // Close dropdown and reset search
      setIsAuthorDropdownOpen(false);
      setAuthorSearchTerm('');
      
      // Show confirmation
      toastService.success(`Đã thêm tác giả "${name.trim()}"`);
    } finally {
      // Ensure flag is reset
      setTimeout(() => {
        setIsAddingAuthor(false);
      }, 300);
    }
  };

  const addAuthor = () => {
    onAuthorsChange([...authors, { id: '', name: '' }]);
  };

  const removeAuthor = (index: number) => {
    if (authors.length === 1) return;
    
    const newAuthors = [...authors];
    newAuthors.splice(index, 1);
    onAuthorsChange(newAuthors);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Tác giả <span className="text-red-500">*</span>
      </label>
      {authors.map((author, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <div className="flex-1 relative" ref={index === currentAuthorIndex ? authorDropdownRef : null}>
            <input
              type="text"
              value={author.name}
              onChange={(e) => handleAuthorChange(index, e.target.value)}
              onFocus={() => openAuthorDropdown(index)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập tên tác giả"
            />
            {isAuthorDropdownOpen && index === currentAuthorIndex && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                <div className="p-2 border-b">
                  <input
                    type="text"
                    ref={authorSearchRef}
                    value={authorSearchTerm}
                    onChange={(e) => setAuthorSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tìm kiếm tác giả..."
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {isLoadingAuthors ? (
                    <div className="p-3 text-center text-gray-500">Đang tải tác giả...</div>
                  ) : filteredAuthors.length === 0 && !showAddNewAuthorOption ? (
                    <div className="p-3 text-center text-gray-500">Không tìm thấy tác giả</div>
                  ) : (
                    <>
                      {filteredAuthors.map((authorOption) => (
                        <div
                          key={authorOption.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSelectAuthor(authorOption.id.toString(), authorOption.name)}
                        >
                          {authorOption.name}
                        </div>
                      ))}
                      
                      {showAddNewAuthorOption && (
                        <div
                          className="px-4 py-2 mt-1 border-t border-gray-200 bg-blue-50 hover:bg-blue-100 cursor-pointer text-blue-700 font-medium flex items-center gap-2"
                          onClick={() => handleAddNewAuthor(authorSearchTerm)}
                        >
                          <Plus size={16} className="flex-shrink-0" />
                          <span className="flex-1 truncate">Thêm tác giả mới: <span className="font-semibold">"{authorSearchTerm.trim()}"</span></span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          {authors.length > 1 && (
            <button
              type="button"
              onClick={() => removeAuthor(index)}
              className="p-2 text-red-500 hover:text-red-700"
            >
              <X size={20} />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addAuthor}
        className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
      >
        <Plus size={16} />
        Thêm tác giả
      </button>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default AuthorSection; 