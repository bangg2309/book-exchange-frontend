import { Author } from "@/types";
import api, { apiService } from "@/services/api";
import {ApiResponse} from "@/types/apiResponse";
import {SlidePage} from "@/types/silde";
import {AuthorPage} from "@/types/author";
const handleApiError = (error: any, defaultMessage: string, context: string = ''): never => {
  if (error.response && error.response.data) {
    const errorData = error.response.data;
    const errorMessage = errorData.message || defaultMessage;

    console.error(`Backend error ${context}:`, errorMessage, 'Code:', errorData.code);
    throw new Error(errorMessage);
  }

  console.error(`Error ${context}:`, error);
  throw error;
};

// Helper for consistent response handling
const processApiResponse = <T>(response: ApiResponse<T> | undefined, errorMessage: string): T => {
  if (!response || !response.result) {
    throw new Error(errorMessage);
  }
  return response.result;
};
export const authorService = {

    getAuthors: async (page: number = 0, size: number = 5): Promise<AuthorPage> => {
      try {
        const { data } = await api.get<ApiResponse<AuthorPage>>(`/authors?page=${page}&size=${size}`);
        return processApiResponse(data, 'Failed to fetch authors');
      } catch (error: any) {
        return handleApiError(error, 'An error occurred while fetching authors', 'fetching authors');
      }
    },

  async searchAuthors(query: string): Promise<Author[]> {
    try {
      const authorsPage = await this.getAuthors();
      const normalizedQuery = query.toLowerCase().trim();
      return authorsPage.content.filter((author) =>
          author.name.toLowerCase().includes(normalizedQuery)
      );
    } catch (error) {
      console.error("Lỗi khi tìm kiếm tác giả:", error);
      return [];
    }
  },

  async getAuthorById(id: string): Promise<Author | null> {
    try {
      const data = await apiService.get<{ code: number; result: Author }>(`/authors/${id}`);
      if (data?.code === 1000 && data.result) {
        return data.result;
      }
      console.warn("Phản hồi API không đúng định dạng khi lấy tác giả theo ID");
      return null;
    } catch (error) {
      console.error(`Lỗi khi lấy tác giả với ID ${id}:`, error);
      return null;
    }
  },

  async createAuthor(data: Partial<Author>): Promise<boolean> {
    try {
      const resData = await apiService.post<{ code: number }>("/authors", data);
      return resData?.code === 1000;
    } catch (error) {
      console.error("Lỗi khi tạo tác giả:", error);
      return false;
    }
  },

  async updateAuthor(id: string, data: Partial<Omit<Author, "id">>): Promise<boolean> {
    try {
      const resData = await apiService.put<{ code: number }>(`/authors/${id}`, data);
      return resData?.code === 1000;
    } catch (error) {
      console.error(`Lỗi khi cập nhật tác giả ID ${id}:`, error);
      return false;
    }
  },

  async deleteAuthor(id: string): Promise<boolean> {
    try {
      const resData = await apiService.delete<{ code: number }>(`/authors/${id}`);
      return resData?.code === 1000;
    } catch (error) {
      console.error(`Lỗi khi xoá tác giả ID ${id}:`, error);
      return false;
    }
  },
};
