import api from './api';

export interface AuthorType {
  id: number;
  name: string;
}

/**
 * Service for handling author-related operations
 */
const authorService = {
  /**
   * Fetches all authors from the API
   * @returns {Promise<AuthorType[]>} Promise that resolves to an array of authors
   */
  async getAuthors(): Promise<AuthorType[]> {
    try {
      const response = await api.get('/authors');
      if (response.data && response.data.code === 1000 && Array.isArray(response.data.result)) {
        console.log('Fetched authors successfully:', response.data.result.length);
        return response.data.result;
      }
      console.warn('Invalid API response format for authors');
      return [];
    } catch (error) {
      console.error('Error fetching authors:', error);
      return [];
    }
  },

  /**
   * Searches for authors by name
   * @param {string} query Search query
   * @returns {Promise<AuthorType[]>} Filtered authors
   */
  async searchAuthors(query: string): Promise<AuthorType[]> {
    try {
      const authors = await this.getAuthors();
      if (!query || query.trim() === '') {
        return authors;
      }
      
      const normalizedQuery = query.toLowerCase().trim();
      return authors.filter(author => 
        author.name.toLowerCase().includes(normalizedQuery)
      );
    } catch (error) {
      console.error('Error searching authors:', error);
      return [];
    }
  }
};

export default authorService; 