import api from './api';
import { ApiResponse } from '@/types/apiResponse';
import { User, UserPage, Role, CreateUserRequest } from '@/types/user';

// Helper for consistent error handling
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

export const userService = {
  getUsers: async (page: number = 0, size: number = 5): Promise<UserPage> => {
    try {
      const { data } = await api.get<ApiResponse<UserPage>>(`/users?page=${page}&size=${size}`);
      return processApiResponse(data, 'Invalid users response from server');
    } catch (error: any) {
      return handleApiError(error, 'An error occurred while fetching users', 'fetching users');
    }
  },
  
  getUserById: async (id: string): Promise<User> => {
    try {
      const { data } = await api.get<ApiResponse<User>>(`/users/${id}`);
      return processApiResponse(data, `Invalid user response for ID ${id}`);
    } catch (error: any) {
      return handleApiError(error, `An error occurred while fetching user ${id}`, `fetching user ${id}`);
    }
  },
  
  createUser: async (userData: Partial<CreateUserRequest>): Promise<User> => {
    try {
      // Đảm bảo dữ liệu gửi đi đúng định dạng mà API yêu cầu
      const formattedData: any = {
        username: userData.username || "",
        email: userData.email || null,
        avatar: userData.avatar || "",
        phone: userData.phone || null,
        status: userData.status !== undefined ? userData.status : 1
      };
      
      // Thêm mật khẩu (bắt buộc cho tạo mới)
      if (userData.password) {
        formattedData.password = userData.password;
      }
      
      // Chuyển đổi vai trò thành mảng chuỗi
      if (userData.roles && Array.isArray(userData.roles)) {
        formattedData.roles = userData.roles.map((role: any) => 
          typeof role === 'string' ? role : role.name
        );
      } else {
        formattedData.roles = [];
      }
      
      console.log(`[createUser] Calling POST to /users with data:`, formattedData);
      
      const { data } = await api.post<ApiResponse<User>>('/users', formattedData);
      
      console.log(`[createUser] Response:`, data);
      
      return processApiResponse(data, 'Invalid response when creating user');
    } catch (error: any) {
      console.error(`[createUser] Error:`, error.response?.data || error.message);
      return handleApiError(error, 'An error occurred while creating the user', 'creating user');
    }
  },
  
  updateUser: async (id: string, userData: Partial<User> & { password?: string }): Promise<User> => {
    try {
      // Đảm bảo dữ liệu gửi đi đúng định dạng mà API yêu cầu
      const formattedData: any = {
        email: userData.email || null,
        avatar: userData.avatar || "",
        phone: userData.phone || null,
        status: userData.status !== undefined ? userData.status : 1
      };
      
      // Chỉ gửi mật khẩu nếu không rỗng
      if (userData.password && userData.password.trim() !== "") {
        formattedData.password = userData.password;
      }
      
      // Chuyển đổi vai trò thành mảng chuỗi
      if (userData.roles && Array.isArray(userData.roles)) {
        formattedData.roles = userData.roles.map((role: any) => 
          typeof role === 'string' ? role : role.name
        );
      } else {
        formattedData.roles = [];
      }
      
      console.log(`[updateUser] Calling PUT to /users/${id} with data:`, formattedData);
      
      const { data } = await api.put<ApiResponse<User>>(`/users/${id}`, formattedData);
      
      console.log(`[updateUser] Response:`, data);
      
      return processApiResponse(data, `Invalid response when updating user ${id}`);
    } catch (error: any) {
      console.error(`[updateUser] Error:`, error.response?.data || error.message);
      return handleApiError(error, `An error occurred while updating user ${id}`, `updating user ${id}`);
    }
  },
  
  deleteUser: async (id: string): Promise<void> => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error: any) {
      handleApiError(error, `An error occurred while deleting user ${id}`, `deleting user ${id}`);
    }
  },
  
  getRoles: async (): Promise<Role[]> => {
    try {
      const { data } = await api.get<ApiResponse<Role[]>>('/roles');
      
      if (!data || !data.result) {
        return getDefaultRoles();
      }
      
      return data.result;
    } catch (error: any) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const errorMessage = errorData.message || 'Failed to fetch roles';
        console.error('Backend error fetching roles:', errorMessage, 'Code:', errorData.code);
      } else {
        console.error('Error fetching roles:', error);
      }
      
      // For roles, we return defaults instead of throwing
      return getDefaultRoles();
    }
  }
};

// Default roles utility
const getDefaultRoles = (): Role[] => [
  { name: 'ADMIN', description: 'Quản trị viên', permissions: [] },
  { name: 'USER', description: 'Người dùng', permissions: [] }
]; 