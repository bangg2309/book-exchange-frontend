import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface AuthorInputProps {
  authors: string[];
  onChange: (authors: string[]) => void;
  error?: string;
}

const AuthorInput: React.FC<AuthorInputProps> = ({ authors, onChange, error }) => {
  const [newAuthor, setNewAuthor] = useState('');

  const handleAddAuthor = () => {
    const trimmedAuthor = newAuthor.trim();
    if (trimmedAuthor && !authors.includes(trimmedAuthor)) {
      onChange([...authors, trimmedAuthor]);
      setNewAuthor('');
    }
  };

  const handleRemoveAuthor = (index: number) => {
    const updatedAuthors = [...authors];
    updatedAuthors.splice(index, 1);
    onChange(updatedAuthors);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAuthor();
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="authors" className="block text-sm font-medium text-gray-700">
        Tác giả <span className="text-red-500">*</span>
      </label>
      
      <div className="flex items-center">
        <input
          type="text"
          value={newAuthor}
          onChange={(e) => setNewAuthor(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 p-2 border rounded-l-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Nhập tên tác giả"
        />
        <button
          type="button"
          onClick={handleAddAuthor}
          className="p-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
          aria-label="Add author"
        >
          <Plus size={20} />
        </button>
      </div>
      
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      
      {authors.length > 0 && (
        <div className="mt-3">
          <p className="text-sm text-gray-600 mb-2">Tác giả đã thêm:</p>
          <div className="flex flex-wrap gap-2">
            {authors.map((author, index) => (
              <div 
                key={index} 
                className="flex items-center bg-blue-100 px-3 py-1 rounded-full"
              >
                <span className="text-sm text-blue-800">{author}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAuthor(index)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  aria-label={`Remove ${author}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorInput; 