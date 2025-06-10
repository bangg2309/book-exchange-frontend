import {Author} from "@/types";

const BASE_URL = 'http://localhost:8081';

export const authorService = {
  async getAuthors(): Promise<Author[]> {
    try {
      const response = await fetch(`${BASE_URL}/authors`);
      const data = await response.json();

      if (data?.code === 1000 && Array.isArray(data.result)) {
        return data.result;
      }
      console.warn('Phản hồi API không đúng định dạng khi lấy danh sách tác giả');
      return [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tác giả:', error);
      return [];
    }
  },

  async searchAuthors(query: string): Promise<Author[]> {
    try {
      const authors = await this.getAuthors();
      const normalizedQuery = query.toLowerCase().trim();
      return authors.filter(author =>
          author.name.toLowerCase().includes(normalizedQuery)
      );
    } catch (error) {
      console.error('Lỗi khi tìm kiếm tác giả:', error);
      return [];
    }
  },

  async getAuthorById(id: string): Promise<Author | null> {
    try {
      const response = await fetch(`${BASE_URL}/authors/${id}`);
      const data = await response.json();

      if (data?.code === 1000 && data.result) {
        return data.result;
      }
      console.warn('Phản hồi API không đúng định dạng khi lấy tác giả theo ID');
      return null;
    } catch (error) {
      console.error(`Lỗi khi lấy tác giả với ID ${id}:`, error);
      return null;
    }
  },

  async createAuthor(data: Partial<Author>): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/authors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const resData = await response.json();
      return resData?.code === 1000;
    } catch (error) {
      console.error('Lỗi khi tạo tác giả:', error);
      return false;
    }
  },

  async updateAuthor(id: string, data: Partial<Omit<Author, 'id'>>): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/authors/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const resData = await response.json();
      return resData?.code === 1000;
    } catch (error) {
      console.error(`Lỗi khi cập nhật tác giả ID ${id}:`, error);
      return false;
    }
  },

  async deleteAuthor(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/authors/${id}`, {
        method: 'DELETE',
      });
      const resData = await response.json();
      return resData?.code === 1000;
    } catch (error) {
      console.error(`Lỗi khi xoá tác giả ID ${id}:`, error);
      return false;
    }
  },
};

